const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const P=require('./poker.js'),{best}=require('./tools/reference-evaluator.js');const {score,simulate,enumerateHeadsUp}=P;
const c=(r,s)=>s*13+r-2;// rank 2–14, suit 0 ♠ 1 ♥ 2 ♦ 3 ♣
let seed=1;const rng=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};

// Evaluator: hand-picked edge cases.
assert(score([c(10,0),c(11,0),c(12,0),c(13,0),c(14,0),c(2,1),c(3,2)])>score([c(14,0),c(14,1),c(14,2),c(14,3),c(13,0),c(2,0),c(3,0)]),'royal beats quads');
assert(score([c(14,0),c(2,1),c(3,2),c(4,3),c(5,0),c(9,0),c(10,1)])>score([c(14,0),c(14,1),c(3,2),c(4,3),c(5,0),c(9,0),c(10,1)]),'wheel beats a pair');
assert(score([c(6,1),c(2,1),c(3,1),c(4,1),c(5,1)])>score([c(14,1),c(2,1),c(3,1),c(4,1),c(5,1)]),'6-high straight flush beats steel wheel');
const quadBoard=[c(9,0),c(9,1),c(9,2),c(9,3),c(13,0)];
assert.equal(score([c(2,1),c(2,2),...quadBoard]),score([c(3,1),c(4,2),...quadBoard]),'quads play the king kicker, not a lower pair');
assert(score([c(14,1),c(2,2),...quadBoard])>score([c(2,1),c(2,2),...quadBoard]),'ace kicker beats king on a quads board');
assert(score([c(8,0),c(8,1),c(8,2),c(7,0),c(7,1),c(7,2),c(2,3)])>score([c(8,0),c(8,1),c(8,2),c(6,0),c(6,1),c(2,2),c(3,3)]),'two trips make the best full house');
assert(score([c(10,0),c(10,1),c(5,0),c(5,1),c(3,0),c(3,1),c(14,2)])>score([c(10,0),c(10,1),c(5,0),c(5,1),c(3,0),c(3,1),c(13,2)]),'three pairs keep the best kicker');
// Evaluator: randomized comparison with a brute-force reference.
for(let t=0;t<40000;t++){const d=[...Array(52).keys()];for(let i=0;i<7;i++){const j=i+Math.floor(rng()*(52-i));[d[i],d[j]]=[d[j],d[i]]}for(const n of [5,6,7]){const h=d.slice(0,n);assert.equal(score(h),best(h),`hand ${h}`)}}

// Ranges and hand order.
assert.equal(P.HAND_ORDER.length,169);assert.equal(new Set(P.HAND_ORDER).size,169);
assert.equal(P.HAND_ORDER.reduce((s,k)=>s+P.combosOf(k),0),1326);
assert.deepEqual(P.HAND_ORDER.slice(0,3),['AA','KK','QQ']);assert.equal(P.HAND_ORDER[168],'32o');
assert.equal(P.topRange(100).combos,1326);assert.deepEqual(P.topRange(0.5).classes,['AA']);
for(const x of [3,6,12,15,20,30,50])assert(Math.abs(P.topRange(x).share-x/100)<=.0046,`top ${x}%`);// within half of the largest class (12 combos)
assert.equal(P.classOf(c(14,0),c(13,0)),'AKs');assert.equal(P.classOf(c(2,1),c(7,2)),'72o');assert.equal(P.classOf(c(9,3),c(9,0)),'99');

// Exact enumeration and sampling.
const royal=[c(10,0),c(11,0),c(12,0),c(13,0),c(14,0)];
const split=simulate([c(2,1),c(3,1)],royal,2,200,rng);assert(Math.abs(split.equity-1/3)<1e-12);assert.equal(split.ties,1);
const riverSplit=enumerateHeadsUp([c(2,1),c(3,1)],royal);assert.equal(riverSplit.trials,990);assert.equal(riverSplit.equity,.5);
const nuts=enumerateHeadsUp([c(14,0),c(14,1)],[c(14,2),c(14,3),c(13,0),c(7,1),c(2,2)]);assert.equal(nuts.equity,1);
// AhKh vs random on Qh 7s 2d: exact enumeration and a large seeded simulation must agree.
const hole=[c(14,1),c(13,1)],flop=[c(12,1),c(7,0),c(2,2)],ex=enumerateHeadsUp(hole,flop);assert.equal(ex.trials,1081*990);
const mc=simulate(hole,flop,1,60000,rng);assert(Math.abs(mc.equity-ex.equity)<4*mc.se+1e-3,`flop ${mc.equity} vs ${ex.equity}`);
const exR=enumerateHeadsUp(hole,flop,{range:15}),mcR=simulate(hole,flop,1,60000,rng,{range:15});assert(Math.abs(mcR.equity-exR.equity)<4*mcR.se+1e-3,`range ${mcR.equity} vs ${exR.equity}`);
assert(exR.equity<ex.equity,'a tight range has more equity against you than random cards');
assert(Math.abs(ex.categories.reduce((a,b)=>a+b,0)-1)<1e-9);
// Well-known preflop all-in values: AA vs random ≈ 85.2%, JJ vs random ≈ 77.5%, AA vs KK ≈ 81.9%.
const aa=simulate([c(14,0),c(14,1)],[],1,30000,rng);assert(Math.abs(aa.equity-.852)<.01,`AA ${aa.equity}`);
const jj=simulate([c(11,0),c(11,1)],[],1,30000,rng);assert(Math.abs(jj.equity-.775)<.01,`JJ ${jj.equity}`);
// Top 0.9% = AA + KK. Holding AA leaves 1 AA combo (≈50%) and 6 KK combos (≈81.9%): (0.5 + 6 × 0.819) ÷ 7 ≈ 0.773.
assert.deepEqual(P.topRange(.9).classes,['AA','KK']);const aaKK=simulate([c(14,0),c(14,1)],[],1,30000,rng,{range:.9});
assert(Math.abs(aaKK.equity-.773)<.012,`AA vs AA/KK ${aaKK.equity}`);
assert.throws(()=>simulate([c(14,0),c(14,1)],[],2,10,rng,{range:.5}),/RANGE_IMPOSSIBLE/);
assert.throws(()=>simulate([c(14,0),c(14,0)],[],1,10,rng),/DUPLICATE_CARDS/);

// Deployment copy must match the source files.
for(const f of ['index.html','zh.html','app.js','poker.js','language.js','style.css'])assert.equal(fs.readFileSync(path.join(__dirname,'public',f),'utf8'),fs.readFileSync(path.join(__dirname,f),'utf8'),`public/${f} is out of date`);
assert.deepEqual(fs.readdirSync(path.join(__dirname,'public')).sort(),['app.js','index.html','language.js','poker.js','style.css','zh.html']);
console.log('Evaluator, ranges, exact enumeration and sampling checks: passed',{flopExact:ex.equity.toFixed(4),flopTop15:exR.equity.toFixed(4),AA:aa.equity.toFixed(3),JJ:jj.equity.toFixed(3)});
