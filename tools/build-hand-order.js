// Rebuilds HAND_ORDER in poker.js: all-in equity of each starting-hand class against one random hand.
// Usage: node tools/build-hand-order.js [trials]   (prints the space-separated order)
const {simulate}=require('../poker.js');
const trials=+process.argv[2]||200000,R='23456789TJQKA';
let seed=20261101;const rng=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const rows=[];
for(let i=12;i>=0;i--)for(let j=i;j>=0;j--){
 if(i===j)rows.push([R[i]+R[j],[i,13+j]]);else{rows.push([R[i]+R[j]+'s',[i,j]]);rows.push([R[i]+R[j]+'o',[i,13+j]])}
}
const out=rows.map(([k,h])=>[k,simulate(h,[],1,trials,rng).equity]).sort((a,b)=>b[1]-a[1]);
if(process.argv.includes('--verbose'))out.forEach(([k,e],i)=>console.error(i+1,k,e.toFixed(4)));
console.log(out.map(x=>x[0]).join(' '));
