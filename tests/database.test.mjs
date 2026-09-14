import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
test('PostgreSQL migration enforces seats, RLS, write permissions, versions and room caps', async () => {
 const db = new PGlite()
 try {
 await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
 create schema auth; create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;
 create publication supabase_realtime;`)
 await db.exec(await fs.readFile(new URL('../supabase/migrations/202609140001_games.sql',import.meta.url),'utf8'))
 const w='00000000-0000-4000-8000-000000000001', b='00000000-0000-4000-8000-000000000002', x='00000000-0000-4000-8000-000000000003'
 await db.query('insert into auth.users values ($1),($2),($3)',[w,b,x])
 const g=(await db.query('select * from public.create_game($1)',[w])).rows[0]
 assert.equal(g.status,'waiting')
 await db.query('select * from public.join_game($1,$2)',[g.id,b])
 await assert.rejects(db.query('select * from public.join_game($1,$2)',[g.id,x]),/seats/)
 await assert.rejects(db.query('select * from public.commit_move($1,$2,1,$3,$4,null)',[g.id,b,'e7e5','fen']),/not your turn/)
 await db.query('select * from public.commit_move($1,$2,1,$3,$4,null)',[g.id,w,'e2e4','fen'])
 await assert.rejects(db.query('select * from public.commit_move($1,$2,1,$3,$4,null)',[g.id,w,'e2e4','fen']),/board changed/)
 await db.exec('set role authenticated')
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[x])
 assert.equal((await db.query('select * from public.games')).rows.length,0)
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[w])
 assert.equal((await db.query('select * from public.games')).rows.length,1)
 await assert.rejects(db.query("update public.games set fen='forged'"),/permission denied/)
 await assert.rejects(db.query('select * from public.create_game($1)',[w]),/permission denied/)
 await assert.rejects(db.query('select * from public.commit_move($1,$2,2,$3,$4,null)',[g.id,w,'e2e4','forged']),/permission denied/)
 await db.exec('reset role')
 for(let i=0;i<9;i++) await db.query('select * from public.create_game($1)',[w])
 await assert.rejects(db.query('select * from public.create_game($1)',[w]),/Room limit/)
 await db.query("update public.games set expires_at=now()-interval '1 day' where id=$1",[g.id])
 await assert.rejects(db.query('select * from public.join_game($1,$2)',[g.id,b]),/expired/)
 } finally { await db.close() }
})
