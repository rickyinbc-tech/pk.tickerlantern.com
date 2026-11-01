const assert=require('node:assert/strict');const {score,simulate}=require('./poker.js');
const c=(r,s)=>s*13+r-2;
const royal=[c(10,0),c(11,0),c(12,0),c(13,0),c(14,0),c(2,1),c(3,2)];
const quads=[c(14,0),c(14,1),c(14,2),c(14,3),c(13,0),c(2,0),c(3,0)];
assert(score(royal)>score(quads));
assert(score([c(14,0),c(2,1),c(3,2),c(4,3),c(5,0),c(9,0),c(10,1)])>score([c(14,0),c(14,1),c(3,2),c(4,3),c(5,0),c(9,0),c(10,1)]));
const board=[c(10,0),c(11,0),c(12,0),c(13,0),c(14,0)];const result=simulate([c(2,1),c(3,1)],board,2,100);assert(Math.abs(result.equity-1/3)<1e-12);assert.equal(result.ties,1);
const jj=simulate([c(11,0),c(11,1)],[],1,12000);assert(jj.equity>.74&&jj.equity<.80,`JJ equity ${jj.equity}`);console.log('Poker evaluator, shared-board tie, and JJ vs random: passed',jj.equity.toFixed(3));
