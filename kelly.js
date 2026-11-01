/* Kelly criterion for a repeatable fixed-odds wager (J. L. Kelly Jr., Bell System Technical Journal 35(4), 1956).
   Outcomes per unit staked: win +b with probability p, push 0 with probability t, lose −1 with probability l = 1 − p − t.
   The stake fraction f maximizes expected log growth G(f) = p·ln(1 + b·f) + l·ln(1 − f).
   With no pushes this is the classical f* = (b·p − q) / b, q = 1 − p. */
(function(root){
const EPS=1e-12;
function analyzeKelly({p,b,push=0}){
 if(!Number.isFinite(p)||p<0||p>1)return {error:'P_RANGE'};
 if(!Number.isFinite(push)||push<0||push>1)return {error:'PUSH_RANGE'};
 if(p+push>1+EPS)return {error:'P_PUSH_SUM'};
 if(!Number.isFinite(b)||b<=0)return {error:'B_RANGE'};
 const loss=Math.max(0,1-p-push),edge=b*p-loss,breakEven=(1-push)/(1+b);
 let kind,full;
 if(p+loss<EPS){kind='allPush';full=0}            // nothing can be won or lost
 else if(edge<=EPS){kind='noEdge';full=0}         // zero or negative expectation: stake nothing
 else if(loss<EPS){kind='noLoss';full=1}          // no chance of losing: the formula stakes everything
 else{kind='edge';full=edge/(b*(p+loss))}         // equals (b·p − q)/b when push = 0
 return {p,b,push,loss,edge,breakEven,kind,full};
}
// Expected log growth per bet at bankroll fraction f; −Infinity means a possible total loss.
function growth(f,{p,b,loss}){
 if(f<=0)return 0;if(f>=1&&loss>EPS)return -Infinity;
 return p*Math.log1p(b*f)+(loss>EPS?loss*Math.log1p(-f):0);
}
// Rows for fractional Kelly strategies. The optional cap limits the stake only, never the Kelly fraction.
function kellyRows(k,bankroll,cap=null,multipliers=[0.25,0.5,1,2]){
 const fullGrowth=growth(k.full,k);
 return multipliers.map(m=>{
  const fraction=Math.min(1,m*k.full),stake=fraction*bankroll,capped=cap!==null&&cap>=0&&stake>cap,finalStake=capped?cap:stake,actual=bankroll>0?finalStake/bankroll:0,g=growth(actual,k);
  return {multiplier:m,fraction,stake,capped,finalStake,actualFraction:actual,growth:g,growthShare:fullGrowth>0&&Number.isFinite(g)?g/fullGrowth:null,expectedProfit:finalStake*k.edge};
 });
}
// Net winnings per chip risked for a fixed call that goes to showdown: win the existing pot after rake, or lose the call.
function callPayout(pot,call,rake=0){if(!(call>0)||!(pot>=0)||!(rake>=0))return NaN;return (pot-rake)/call}
const api={analyzeKelly,growth,kellyRows,callPayout};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Kelly=api;
})(typeof globalThis==='undefined'?this:globalThis);
