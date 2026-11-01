/* Kelly criterion (J. L. Kelly Jr., Bell System Technical Journal 35(4), 1956).
   A wager is a list of outcomes {p, r}: probability p and net result r per unit staked (r ≥ −1).
   The stake fraction f maximizes expected log growth G(f) = Σ p·ln(1 + r·f), a concave function of f.
   Classical binary case: win +b with probability p, lose −1 with q = 1 − p, giving f* = (b·p − q) / b.
   With pushes (r = 0, probability t) it is f* = (b·p − l) / (b·(p + l)), l = 1 − p − t. */
(function(root){
const EPS=1e-12;
const expectation=outcomes=>outcomes.reduce((s,o)=>s+o.p*o.r,0);
// Expected log growth per bet at bankroll fraction f; −Infinity means a possible total loss.
function growth(f,k){
 if(f<=0)return 0;let g=0;
 for(const {p,r} of k.outcomes){if(p<=0)continue;const x=1+r*f;if(x<=0)return -Infinity;g+=p*Math.log1p(r*f)}
 return g;
}
/* General solver over bankroll fractions 0 ≤ f ≤ 1. kind:
   'edge'     interior optimum 0 < f* < 1 where G′(f*) = 0;
   'noEdge'   E[r] ≤ 0, so G′(0) ≤ 0 and f* = 0;
   'noLoss'   E[r] > 0 and no outcome is negative: G rises all the way, f* = 1;
   'boundary' some outcomes are negative but none loses the whole stake (r > −1), and G′(1) ≥ 0 — G is still
              rising at f = 1, so the constrained optimum is the boundary f* = 1, not a root of G′. */
function analyzeOutcomes(outcomes){
 if(!Array.isArray(outcomes)||!outcomes.length)return {error:'OUTCOMES'};
 for(const {p,r} of outcomes)if(!Number.isFinite(p)||p<0||p>1+EPS||!Number.isFinite(r)||r<-1-EPS)return {error:'OUTCOMES'};
 const total=outcomes.reduce((s,o)=>s+o.p,0);if(Math.abs(total-1)>1e-9)return {error:'P_SUM'};
 const edge=expectation(outcomes),live=outcomes.filter(o=>o.p>EPS),worst=Math.min(...live.map(o=>o.r));
 if(edge<=EPS)return {outcomes,edge,kind:'noEdge',full:0,total};
 if(worst>=-EPS)return {outcomes,edge,kind:'noLoss',full:1,total};
 const slope=f=>live.reduce((s,o)=>s+o.p*o.r/(1+o.r*f),0);
 if(worst>-1+EPS){const atMax=slope(1);if(atMax>=0)return {outcomes,edge,kind:'boundary',full:1,slopeAtMax:atMax,total}}
 // G′(f) = Σ p·r / (1 + r·f) is decreasing; it starts at E[r] > 0 and is negative before f = min(1, 1/|worst|). Bisect.
 const fMax=Math.min(1,1/-worst);
 let lo=0,hi=fMax*(1-1e-12);for(let i=0;i<200;i++){const mid=(lo+hi)/2;if(slope(mid)>0)lo=mid;else hi=mid}
 return {outcomes,edge,kind:'edge',full:(lo+hi)/2,total};
}
// Classical inputs: probability p of winning b per unit, optional push probability.
function analyzeKelly({p,b,push=0}){
 if(!Number.isFinite(p)||p<0||p>1)return {error:'P_RANGE'};
 if(!Number.isFinite(push)||push<0||push>1)return {error:'PUSH_RANGE'};
 if(p+push>1+EPS)return {error:'P_PUSH_SUM'};
 if(!Number.isFinite(b)||b<=0)return {error:'B_RANGE'};
 const loss=Math.max(0,1-p-push),edge=b*p-loss,breakEven=(1-push)/(1+b),outcomes=[{p,r:b},{p:push,r:0},{p:loss,r:-1}];
 let kind,full;
 if(p+loss<EPS){kind='allPush';full=0}            // nothing can be won or lost
 else if(edge<=EPS){kind='noEdge';full=0}         // zero or negative expectation: stake nothing
 else if(loss<EPS){kind='noLoss';full=1}          // no chance of losing: the formula stakes everything
 else{kind='edge';full=edge/(b*(p+loss))}         // closed form; equals (b·p − q)/b when push = 0
 return {p,b,push,loss,edge,breakEven,kind,full,outcomes};
}
/* Outcomes of a fixed call that goes to showdown, per chip called. The final pot (pot + call) loses the rake;
   an outright win collects it all, a split among n winners collects 1/n of it, a loss forfeits the call.
   E[r] × call therefore equals the hand's showdown EV: equity × (pot + call − rake) − call. */
function handOutcomes({wins,splits=[],losses},pot,call,rake=0){
 if(!(call>0)||!(pot>=0)||!(rake>=0))return {error:'PAYOUT'};
 const net=pot+call-rake,out=[{kind:'win',n:1,p:wins,r:(net-call)/call}];
 splits.forEach((p,n)=>{if(n>=2&&p>0)out.push({kind:'split',n,p,r:(net/n-call)/call})});
 out.push({kind:'loss',n:0,p:Math.max(0,losses),r:-1});
 return {outcomes:out,net};
}
// Rows for fractional Kelly strategies. The optional cap limits the stake only, never the Kelly fraction.
function kellyRows(k,bankroll,cap=null,multipliers=[0.25,0.5,1,2]){
 const fullGrowth=growth(k.full,k);
 return multipliers.map(m=>{
  const fraction=Math.min(1,m*k.full),stake=fraction*bankroll,capped=cap!==null&&cap>=0&&stake>cap,finalStake=capped?cap:stake,actual=bankroll>0?finalStake/bankroll:0,g=growth(actual,k);
  return {multiplier:m,fraction,stake,capped,finalStake,actualFraction:actual,growth:g,growthShare:fullGrowth>0&&Number.isFinite(g)?g/fullGrowth:null,expectedProfit:finalStake*k.edge};
 });
}
// Net winnings per chip risked for a fixed call that goes to showdown and wins outright.
function callPayout(pot,call,rake=0){if(!(call>0)||!(pot>=0)||!(rake>=0))return NaN;return (pot-rake)/call}
const api={analyzeKelly,analyzeOutcomes,handOutcomes,expectation,growth,kellyRows,callPayout};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Kelly=api;
})(typeof globalThis==='undefined'?this:globalThis);
