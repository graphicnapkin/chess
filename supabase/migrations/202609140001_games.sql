-- The browser can read only its own games. All writes go through the verified
-- Edge Function; these RPCs are executable only by the backend service role.
create table public.games (
  id uuid primary key default gen_random_uuid(),
  white_id uuid not null references auth.users(id) on delete cascade,
  black_id uuid references auth.users(id) on delete cascade,
  moves jsonb not null default '[]'::jsonb check (jsonb_typeof(moves) = 'array' and jsonb_array_length(moves) <= 1024),
  fen text not null default 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  version integer not null default 0,
  status text not null default 'waiting' check (status in ('waiting','active','finished')),
  result text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  check (black_id is null or black_id <> white_id)
);
create index games_white_created on public.games(white_id, created_at);
create index games_black on public.games(black_id);
create index games_expiry on public.games(expires_at);
alter table public.games enable row level security;
revoke all on public.games from anon, authenticated;
grant select on public.games to authenticated;
grant all on public.games to service_role;
create policy "Players read their games" on public.games for select to authenticated
  using ((select auth.uid()) in (white_id, black_id) and expires_at > now());

create function public.create_game(p_user uuid) returns public.games
language plpgsql security definer set search_path = '' as $$
declare g public.games;
begin
  -- Serialize room allocation so concurrent requests cannot bypass the caps.
  perform pg_advisory_xact_lock(736421);
  delete from public.games where id in (select id from public.games where expires_at < now() limit 100);
  if (select count(*) from public.games) >= 5000 then
    raise exception 'Online rooms are at capacity. Please try later.';
  end if;
  if (select count(*) from public.games where white_id = p_user and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'Room limit reached. Please try again in an hour.';
  end if;
  insert into public.games(white_id) values(p_user) returning * into g;
  return g;
end $$;

create function public.join_game(p_id uuid, p_user uuid) returns public.games
language plpgsql security definer set search_path = '' as $$
declare g public.games;
begin
  select * into g from public.games where id = p_id and expires_at > now() for update;
  if not found then raise exception 'Game unavailable or expired.'; end if;
  if p_user = g.white_id or p_user = g.black_id then return g; end if;
  if g.black_id is not null or g.status <> 'waiting' then raise exception 'Both seats are already taken.'; end if;
  update public.games set black_id = p_user, status = 'active', version = version + 1, updated_at = now()
    where id = p_id returning * into g;
  return g;
end $$;

create function public.commit_move(p_id uuid, p_user uuid, p_version integer, p_move text, p_fen text, p_result text)
returns public.games language plpgsql security definer set search_path = '' as $$
declare g public.games;
begin
  select * into g from public.games where id = p_id and expires_at > now() for update;
  if not found then raise exception 'Game unavailable or expired.'; end if;
  if p_user <> g.white_id and p_user is distinct from g.black_id then raise exception 'You are not a player in this game.'; end if;
  if g.status <> 'active' then raise exception 'This game is not active.'; end if;
  if g.version <> p_version then raise exception 'The board changed. Please try your move again.'; end if;
  if (jsonb_array_length(g.moves) % 2 = 0 and p_user <> g.white_id)
     or (jsonb_array_length(g.moves) % 2 = 1 and p_user <> g.black_id) then raise exception 'It is not your turn.'; end if;
  if jsonb_array_length(g.moves) >= 1024 then raise exception 'Move limit reached.'; end if;
  update public.games set moves = moves || jsonb_build_array(p_move), fen = p_fen,
    result = p_result, status = case when p_result is null then 'active' else 'finished' end,
    version = version + 1, updated_at = now() where id = p_id returning * into g;
  return g;
end $$;
revoke all on function public.create_game(uuid) from public, anon, authenticated;
revoke all on function public.join_game(uuid, uuid) from public, anon, authenticated;
revoke all on function public.commit_move(uuid, uuid, integer, text, text, text) from public, anon, authenticated;
grant execute on function public.create_game(uuid) to service_role;
grant execute on function public.join_game(uuid, uuid) to service_role;
grant execute on function public.commit_move(uuid, uuid, integer, text, text, text) to service_role;
alter publication supabase_realtime add table public.games;
