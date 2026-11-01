/* Texas Hold'em showdown evaluator and Monte Carlo sampler. Cards: 0–51. */
(function(root){
function score(cards){
  const counts=Array(15).fill(0), suits=[[],[],[],[]];
  for(const c of cards){const r=c%13+2; counts[r]++; suits[Math.floor(c/13)].push(r)}
  const straightHigh=(ranks)=>{const s=new Set(ranks);if(s.has(14))s.add(1);for(let h=14;h>=5;h--)if([0,1,2,3,4].every(d=>s.has(h-d)))return h;return 0};
  const pack=(cat,arr)=>{let n=cat;for(let i=0;i<5;i++)n=n*15+(arr[i]||0);return n};
  for(const suit of suits)if(suit.length>=5){const h=straightHigh(suit);if(h)return pack(8,[h])}
  const groups=[];for(let r=14;r>=2;r--)if(counts[r])groups.push([counts[r],r]);groups.sort((a,b)=>b[0]-a[0]||b[1]-a[1]);
  if(groups[0][0]===4)return pack(7,[groups[0][1],groups[1][1]]);
  if(groups[0][0]===3&&groups[1]&&groups[1][0]>=2)return pack(6,[groups[0][1],groups[1][1]]);
  for(const suit of suits)if(suit.length>=5)return pack(5,suit.sort((a,b)=>b-a).slice(0,5));
  const sh=straightHigh(groups.map(g=>g[1]));if(sh)return pack(4,[sh]);
  if(groups[0][0]===3)return pack(3,[groups[0][1],...groups.slice(1).map(g=>g[1]).sort((a,b)=>b-a).slice(0,2)]);
  const pairs=groups.filter(g=>g[0]===2).map(g=>g[1]).sort((a,b)=>b-a);
  if(pairs.length>=2)return pack(2,[pairs[0],pairs[1],...groups.filter(g=>g[1]!==pairs[0]&&g[1]!==pairs[1]).map(g=>g[1]).sort((a,b)=>b-a).slice(0,1)]);
  if(pairs.length===1)return pack(1,[pairs[0],...groups.filter(g=>g[1]!==pairs[0]).map(g=>g[1]).sort((a,b)=>b-a).slice(0,3)]);
  return pack(0,groups.map(g=>g[1]).sort((a,b)=>b-a).slice(0,5));
}
function simulate(hole,board,opponents,trials,random=Math.random){
 const known=new Set([...hole,...board]);if(known.size!==hole.length+board.length)throw Error('Duplicate cards');
 const deck=Array.from({length:52},(_,i)=>i).filter(c=>!known.has(c));let wins=0,ties=0,sum=0,squares=0;
 for(let t=0;t<trials;t++){
  const pool=deck.slice(),need=(5-board.length)+2*opponents;
  for(let i=0;i<need;i++){const j=i+Math.floor(random()*(pool.length-i));[pool[i],pool[j]]=[pool[j],pool[i]]}
  let k=0;const community=board.concat(pool.slice(0,5-board.length));k+=5-board.length;
  const hero=score(hole.concat(community));let best=hero,n=1;
  for(let o=0;o<opponents;o++){const v=score([pool[k++],pool[k++],...community]);if(v>best){best=v;n=1}else if(v===best)n++}
  let share=0;if(best===hero){share=1/n;if(n===1)wins++;else ties++}sum+=share;squares+=share*share;
 }
 const equity=sum/trials, se=Math.sqrt(Math.max(0,squares/trials-equity*equity)/trials);return {equity,wins:wins/trials,ties:ties/trials,se,trials};
}
if(typeof module!=='undefined'&&module.exports)module.exports={score,simulate};
if(typeof self!=='undefined'&&typeof self.document==='undefined')self.onmessage=e=>{try{self.postMessage({result:simulate(...e.data)})}catch(err){self.postMessage({error:err.message})}};
})(typeof globalThis==='undefined'?this:globalThis);
