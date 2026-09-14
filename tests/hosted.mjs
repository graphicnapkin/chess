import assert from 'node:assert/strict'
import { createClient } from '@supabase/supabase-js'
import { chromium } from '@playwright/test'
let input='';for await(const chunk of process.stdin) input+=chunk
const keys=JSON.parse(input)
const publicKey=keys.find(k=>k.type==='publishable').api_key
const serviceKey=keys.find(k=>k.name==='service_role').api_key
const url='https://mtcibrvwekegkvcjqlwf.supabase.co'
const admin=createClient(url,serviceKey,{auth:{persistSession:false}})
const clients=[],ids=[]
let browser
try {
 for(let i=0;i<3;i++) {
  const email=`chess-verification-${crypto.randomUUID()}@example.com`, password=crypto.randomUUID()+'aA!'
  const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true})
  if(error) throw new Error('Test account creation failed: '+error.message)
  ids.push(data.user.id)
  const client=createClient(url,publicKey,{auth:{persistSession:false}})
  const signed=await client.auth.signInWithPassword({email,password})
  if(signed.error) throw new Error('Test sign-in failed: '+signed.error.message)
  clients.push({client,session:signed.data.session})
 }
 const missing=await fetch(url+'/functions/v1/game',{method:'POST',headers:{'Content-Type':'application/json'},body:'{"action":"create"}'})
 assert.equal(missing.status,401)
 const invalid=await fetch(url+'/functions/v1/game',{method:'POST',headers:{Authorization:'Bearer invalid','Content-Type':'application/json'},body:'{"action":"create"}'})
 assert.equal(invalid.status,401)
 console.log('PASS: unauthenticated and invalid-token requests rejected')
 browser=await chromium.launch()
 const contexts=[]
 for(const {session} of clients) {
  const context=await browser.newContext(); context.setDefaultTimeout(15000)
  await context.addInitScript(({session})=>localStorage.setItem('sb-mtcibrvwekegkvcjqlwf-auth-token',JSON.stringify(session)),{session})
  contexts.push(context)
 }
 const first=await contexts[0].newPage(), second=await contexts[1].newPage(), third=await contexts[2].newPage()
  await first.goto('http://127.0.0.1:9001')
 await first.getByRole('button',{name:'Invite a friend',exact:true}).click()
 await first.waitForURL('**/?game=*',{timeout:15000})
 const invite=first.url(),id=new URL(invite).searchParams.get('game')
 await second.goto(invite)
 await second.getByRole('button',{name:'Join / resume invited game'}).click()
 await second.getByText('You · Black',{exact:true}).waitFor()
  await first.getByLabel('Enter a move').fill('e4')
 await first.getByRole('button',{name:'Move',exact:true}).click()
 await second.locator('.move-list').filter({hasText:'e4'}).waitFor({timeout:20000})
 await second.getByLabel('Enter a move').fill('e5')
 await second.getByRole('button',{name:'Move',exact:true}).click()
 await first.locator('.move-list').filter({hasText:'e5'}).waitFor({timeout:20000})
 console.log('PASS: two authenticated browsers create, join, and exchange moves through hosted Realtime')
 await first.reload()
 await first.getByRole('button',{name:'Join / resume invited game'}).click()
 await first.locator('.move-list').filter({hasText:'e5'}).waitFor()
 await third.goto(invite)
 await third.getByRole('button',{name:'Join / resume invited game'}).click()
 await third.getByRole('alert').filter({hasText:'Both seats'}).waitFor()
 const hidden=await clients[2].client.from('games').select('*').eq('id',id)
 assert.deepEqual(hidden.data,[])
 const forged=await clients[0].client.from('games').update({fen:'forged'}).eq('id',id)
 assert.ok(forged.error)
 const bypass=await clients[0].client.rpc('commit_move',{p_id:id,p_user:ids[0],p_version:3,p_move:'e2e4',p_fen:'forged',p_result:null})
 assert.ok(bypass.error)
 const bad=await clients[0].client.functions.invoke('game',{body:{action:'move',id,version:3,from:'e4',to:'e6'}})
 assert.ok(bad.error)
 console.log('PASS: refresh recovery, seat protection, outsider RLS, direct-write/RPC denial and illegal-move rejection')
 await contexts[1].setOffline(true)
 const simultaneous=await Promise.all([0,1].map(()=>clients[0].client.functions.invoke('game',{body:{action:'move',id,version:3,from:'g1',to:'f3'}})))
 assert.equal(simultaneous.filter(result=>!result.error).length,1)
 await contexts[1].setOffline(false)
 await second.locator('.move-list').filter({hasText:'Nf3'}).waitFor({timeout:20000})
 console.log('PASS: concurrent duplicate submissions commit once; offline opponent recovers on reconnect')
 await first.screenshot({path:'artifacts/hosted-multiplayer.png',fullPage:true})
} finally {
 await browser?.close()
 for(const {client} of clients) await client.removeAllChannels()
 for(const id of ids) { const {error}=await admin.auth.admin.deleteUser(id); if(error) console.error('Test account cleanup failed') }
 console.log('Temporary test accounts and their games cleaned up')
}
