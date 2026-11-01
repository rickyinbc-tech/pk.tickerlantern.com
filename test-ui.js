// Browser UI tests: serves public/ plus tools/ui-harness.html on localhost, runs them in headless Chrome
// and reads the results over the DevTools protocol. Usage: node test-ui.js
// (set CHROME=/path/to/chrome if Chrome is not in a default location).
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawn}=require('node:child_process');
const chrome=process.env.CHROME||['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/usr/bin/google-chrome','/usr/bin/chromium'].find(p=>fs.existsSync(p));
if(!chrome){console.error('Chrome not found; set CHROME to run the UI tests.');process.exit(2)}
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const root=path.join(__dirname,'public'),harness=path.join(__dirname,'tools','ui-harness.html');
const server=http.createServer((req,res)=>{
 const url=decodeURIComponent(req.url.split('?')[0]),file=url==='/__ui__/harness.html'?harness:path.join(root,path.normalize(url));
 if(file!==harness&&!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end()}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data)});
});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function main(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const port=server.address().port,profile=fs.mkdtempSync(path.join(os.tmpdir(),'pl-ui-'));
 const proc=spawn(chrome,['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check',`--user-data-dir=${profile}`,'--remote-debugging-port=0',`http://127.0.0.1:${port}/__ui__/harness.html`],{stdio:['ignore','ignore','pipe']});
 const cleanup=()=>{proc.kill();server.close();try{fs.rmSync(profile,{recursive:true,force:true})}catch{}};
 try{
  let wsBase='';for(let i=0;i<100&&!wsBase;i++){await sleep(100);try{wsBase=fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0]}catch{}}
  if(!wsBase)throw Error('Chrome did not start');
  let target;for(let i=0;i<100&&!target;i++){await sleep(100);try{target=(await (await fetch(`http://127.0.0.1:${wsBase}/json/list`)).json()).find(t=>t.type==='page'&&t.url.includes('harness'))}catch{}}
  if(!target)throw Error('Harness page not found');
  const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});
  let id=0;const pending=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id)}};
  const evaluate=expr=>new Promise(r=>{const n=++id;pending.set(n,r);ws.send(JSON.stringify({id:n,method:'Runtime.evaluate',params:{expression:expr,returnByValue:true}}))});
  let text='';for(let i=0;i<1800;i++){const m=await evaluate("(document.getElementById('result')||{}).textContent||''");text=m.result&&m.result.result?m.result.result.value:'';if(text.startsWith('RESULTS:'))break;await sleep(100)}
  ws.close();if(!text.startsWith('RESULTS:'))throw Error('Timed out waiting for UI results');
  const results=JSON.parse(text.slice(8)),failed=results.filter(r=>!r.ok);
  results.forEach(r=>console.log(`${r.ok?'✓':'✗'} ${r.name}${r.ok?'':' — '+r.info}`));
  console.log(`${results.length-failed.length}/${results.length} UI checks passed`);cleanup();process.exit(failed.length||!results.length?1:0);
 }catch(err){console.error(err.message);cleanup();process.exit(1)}
}
main();
