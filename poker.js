/* Texas Hold'em evaluator, opponent ranges, Monte Carlo sampler and exact heads-up enumeration.
   Cards: 0–51 = suit*13 + rank index (rank index 0 = deuce … 12 = ace). */
(function(root){
const CNT=new Uint8Array(15),SM=new Int32Array(4),SC=new Uint8Array(4),CAT_BASE=759375;// 15^5
let V=0;const put=d=>{V=V*15+d};
function kickers(mask,n){for(let r=14;r>=2&&n>0;r--)if(mask>>r&1){put(r);n--}while(n-->0)put(0)}
function straightHigh(m){if(m&16384)m|=2;for(let h=14;h>=5;h--){const w=31<<(h-4);if((m&w)===w)return h}return 0}
// Higher score = stronger hand. Category (0 high card … 8 straight flush) = Math.floor(score / 15^5).
function score(cards){
 CNT.fill(0);SM.fill(0);SC.fill(0);let all=0;
 for(let i=0;i<cards.length;i++){const c=cards[i],r=c%13+2,s=(c/13)|0;CNT[r]++;SM[s]|=1<<r;SC[s]++;all|=1<<r}
 let fs=-1;for(let s=0;s<4;s++)if(SC[s]>=5)fs=s;
 if(fs>=0){const h=straightHigh(SM[fs]);if(h){V=8;put(h);kickers(0,4);return V}}
 let quad=0,t1=0,t2=0,p1=0,p2=0;
 for(let r=14;r>=2;r--){const n=CNT[r];if(n===4)quad=r;else if(n===3){if(t1){if(!t2)t2=r}else t1=r}else if(n===2){if(p1){if(!p2)p2=r}else p1=r}}
 if(quad){V=7;put(quad);kickers(all&~(1<<quad),1);kickers(0,3);return V}
 if(t1&&(t2||p1)){V=6;put(t1);put(Math.max(t2,p1));kickers(0,3);return V}
 if(fs>=0){V=5;kickers(SM[fs],5);return V}
 const sh=straightHigh(all);if(sh){V=4;put(sh);kickers(0,4);return V}
 if(t1){V=3;put(t1);kickers(all&~(1<<t1),2);kickers(0,2);return V}
 if(p2){V=2;put(p1);put(p2);kickers(all&~(1<<p1)&~(1<<p2),1);kickers(0,2);return V}
 if(p1){V=1;put(p1);kickers(all&~(1<<p1),3);kickers(0,1);return V}
 V=0;kickers(all,5);return V;
}
const category=s=>Math.floor(s/CAT_BASE);

/* Starting-hand classes ordered PokerStove-style: by simulated all-in equity against one random hand
   (tools/build-hand-order.js, 200,000 seeded trials per class). This ranks raw showdown strength,
   not playability, so suited connectors sit lower and weak offsuit aces higher than in typical opening charts. */
const HAND_ORDER='AA KK QQ JJ TT 99 88 AKs 77 AQs AKo AJs AQo ATs KQs AJo 66 ATo KJs A9s KTs A8s KQo A7s A9o KJo QJs 55 K9s A8o A6s A5s QTs KTo A4s A7o K8s QJo A3s A6o K9o Q9s A2s K7s A5o JTs QTo 44 A4o K6s Q8s K8o K5s A3o J9s Q9o K7o JTo K4s A2o K6o Q7s K3s J8s T9s Q6s 33 Q8o K5o K2s J9o Q5s T8s K4o J7s Q4s Q7o T9o J8o K3o Q6o Q3s 98s T7s J6s 22 Q2s K2o Q5o J5s J7o T8o Q4o J4s 97s T6s 98o J3s Q3o 87s T7o J6o 96s Q2o J2s T5s J5o T4s 86s 97o J4o T6o T3s 95s 76s 87o J3o T2s 96o 85s T5o J2o 94s 75s 65s T4o 93s 86o 84s T3o 92s 95o 76o 74s T2o 64s 54s 85o 83s 94o 75o 82s 65o 73s 93o 53s 63s 84o 92o 43s 74o 54o 72s 64o 52s 62s 83o 42s 82o 73o 53o 63o 32s 43o 72o 52o 62o 42o 32o'.split(' ');
const RANKS='23456789TJQKA';
function classOf(a,b){const ra=a%13,rb=b%13,hi=Math.max(ra,rb),lo=Math.min(ra,rb);if(ra===rb)return RANKS[hi]+RANKS[lo];return RANKS[hi]+RANKS[lo]+(((a/13)|0)===((b/13)|0)?'s':'o')}
const combosOf=k=>k.length===2?6:k[2]==='s'?4:12;
// Share of all 1,326 combinations ranked at or above this class (lower = stronger).
function percentileOf(k){let cum=0;for(const h of HAND_ORDER){cum+=combosOf(h);if(h===k)return cum/1326}return 1}
// Top-X% range: whole classes in order, stopping where the combination count is closest to X% of 1,326.
function topRange(pct){const target=Math.min(100,Math.max(0,pct))/100*1326,classes=[];let combos=0;for(const h of HAND_ORDER){const n=combosOf(h);if(classes.length&&Math.abs(combos+n-target)>=Math.abs(combos-target))break;classes.push(h);combos+=n}return {classes,combos,share:combos/1326}}
function rangeMatrix(pct){if(!(pct<100))return null;const set=new Set(topRange(pct).classes),m=new Uint8Array(2704);for(let a=0;a<52;a++)for(let b=0;b<52;b++)if(a!==b&&set.has(classOf(a,b)))m[a*52+b]=1;return m}

function checkCards(hole,board){const known=new Set([...hole,...board]);if(hole.length!==2||known.size!==hole.length+board.length||[...known].some(c=>!(c>=0&&c<52)))throw Error('DUPLICATE_CARDS');if(board.length>5)throw Error('BOARD');return known}

/* Monte Carlo: each opponent receives a uniformly random legal combination from the assumed range
   (dealt one opponent at a time, the usual equity-calculator approximation), then the board is completed. */
function simulate(hole,board,opponents,trials,random=Math.random,options={}){
 const known=checkCards(hole,board),inRange=rangeMatrix(options.range??100),onProgress=options.onProgress,every=options.progressEvery||2500;
 const pool=[],pos=new Int16Array(52).fill(-1),used=new Uint8Array(52);for(let c=0;c<52;c++)if(!known.has(c)){pos[c]=pool.length;pool.push(c)}
 const len=pool.length,missing=5-board.length;if(2*opponents+missing>len)throw Error('TOO_MANY');
 const rangeCombos=[];if(inRange)for(let i=0;i<len;i++)for(let j=i+1;j<len;j++)if(inRange[pool[i]*52+pool[j]])rangeCombos.push(pool[i],pool[j]);
 if(inRange&&!rangeCombos.length)throw Error('RANGE_IMPOSSIBLE');
 const swap=(i,j)=>{const a=pool[i],b=pool[j];pool[i]=b;pool[j]=a;pos[b]=i;pos[a]=j};
 const hero=new Array(2+5),opp=new Array(7),hands=new Int16Array(2*opponents),cats=new Float64Array(9);
 hero[0]=hole[0];hero[1]=hole[1];for(let i=0;i<board.length;i++)hero[2+i]=board[i];
 let wins=0,ties=0,sum=0,squares=0;
 for(let t=0;t<trials;t++){
  let k=0;
  for(let o=0;o<opponents;o++){
   let ok=false;
   if(inRange){for(let tries=0;tries<40&&!ok;tries++){const i=k+Math.floor(random()*(len-k));let j=k+Math.floor(random()*(len-k-1));if(j>=i)j++;if(inRange[pool[i]*52+pool[j]]){const a=pool[i],b=pool[j];swap(k,pos[a]);swap(k+1,pos[b]);ok=true}}
    if(!ok){const avail=[];for(let x=0;x<rangeCombos.length;x+=2)if(!used[rangeCombos[x]]&&!used[rangeCombos[x+1]])avail.push(x);if(!avail.length)throw Error('RANGE_IMPOSSIBLE');const x=avail[Math.floor(random()*avail.length)],a=rangeCombos[x],b=rangeCombos[x+1];swap(k,pos[a]);swap(k+1,pos[b])}}
   else{for(let d=0;d<2;d++){swap(k+d,k+d+Math.floor(random()*(len-k-d)))}}
   used[pool[k]]=used[pool[k+1]]=1;hands[2*o]=pool[k];hands[2*o+1]=pool[k+1];k+=2;
  }
  for(let d=0;d<missing;d++){swap(k+d,k+d+Math.floor(random()*(len-k-d)));hero[2+board.length+d]=pool[k+d]}
  const h=score(hero);cats[category(h)]++;let best=h,n=1;
  for(let i=0;i<5;i++)opp[2+i]=hero[2+i];
  for(let o=0;o<opponents;o++){opp[0]=hands[2*o];opp[1]=hands[2*o+1];const v=score(opp);if(v>best){best=v;n=1}else if(v===best)n++}
  for(let o=0;o<2*opponents;o++)used[hands[o]]=0;
  let share=0;if(best===h){share=1/n;if(n===1)wins++;else ties++}sum+=share;squares+=share*share;
  if(onProgress&&(t+1)%every===0)onProgress((t+1)/trials);
 }
 const equity=sum/trials,se=Math.sqrt(Math.max(0,squares/trials-equity*equity)/trials);
 return {equity,wins:wins/trials,ties:ties/trials,se,trials,exact:false,categories:[...cats].map(c=>c/trials)};
}

/* Exact heads-up enumeration on the flop, turn or river: every legal (opponent combination, runout) pair
   counts once, which is the same distribution the sampler draws from. */
function enumerateHeadsUp(hole,board,options={}){
 const known=checkCards(hole,board);if(board.length<3)throw Error('BOARD');
 const inRange=rangeMatrix(options.range??100),deck=[];for(let c=0;c<52;c++)if(!known.has(c))deck.push(c);
 const missing=5-board.length,hero=[...hole,...board,0,0].slice(0,7),opp=new Array(7),cats=new Float64Array(9),onProgress=options.onProgress;
 let count=0,wins=0,ties=0,sum=0,runouts=[];
 if(missing===0)runouts=[[]];else if(missing===1)runouts=deck.map(c=>[c]);else for(let i=0;i<deck.length;i++)for(let j=i+1;j<deck.length;j++)runouts.push([deck[i],deck[j]]);
 runouts.forEach((run,ri)=>{
  for(let d=0;d<missing;d++)hero[2+board.length+d]=run[d];
  const h=score(hero);for(let i=0;i<5;i++)opp[2+i]=hero[2+i];
  for(let i=0;i<deck.length;i++){const a=deck[i];if(run.includes(a))continue;for(let j=i+1;j<deck.length;j++){const b=deck[j];if(run.includes(b)||(inRange&&!inRange[a*52+b]))continue;
   opp[0]=a;opp[1]=b;const v=score(opp);count++;cats[category(h)]++;if(h>v){wins++;sum++}else if(h===v){ties++;sum+=.5}}}
  if(onProgress&&ri%50===49)onProgress((ri+1)/runouts.length);
 });
 if(!count)throw Error('RANGE_IMPOSSIBLE');
 return {equity:sum/count,wins:wins/count,ties:ties/count,se:0,trials:count,exact:true,categories:[...cats].map(c=>c/count)};
}

function analyze(d,onProgress){
 return d.opponents===1&&d.board.length>=3?enumerateHeadsUp(d.hole,d.board,{range:d.range,onProgress}):simulate(d.hole,d.board,d.opponents,d.trials,Math.random,{range:d.range,onProgress});
}
const api={score,category,classOf,combosOf,percentileOf,topRange,rangeMatrix,simulate,enumerateHeadsUp,analyze,HAND_ORDER,RANKS};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(typeof self!=='undefined'&&typeof self.document==='undefined'&&typeof module==='undefined')self.onmessage=e=>{try{self.postMessage({result:analyze(e.data,p=>self.postMessage({progress:p}))})}catch(err){self.postMessage({error:err.message})}};
else root.PokerLantern=api;
})(typeof globalThis==='undefined'?this:globalThis);
