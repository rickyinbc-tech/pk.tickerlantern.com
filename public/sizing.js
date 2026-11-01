/* Heads-up first-bet comparison: check versus betting B into pot P, under assumptions the reader enters.
   Model: the opponent either folds (probability F) or calls the same B; no raises, no later betting, no rake.
   EVs are incremental chips from this decision (the pot already in the middle counts when you win it).
     EV(bet)   = F × P + (1 − F) × [e_call × (P + 2B) − B]
     EV(check) = e_check × P            (check, check through to showdown)
   e_call is your showdown equity against the hands that CALL this size, which is usually lower than your
   equity against the whole range; ties are already inside equity. Nothing here is solved or optimal. */
(function(root){
const FRACTIONS=[['33',1/3],['50',1/2],['75',3/4],['100',1]];
const prob=x=>Number.isFinite(x)&&x>=0&&x<=1;
// EV when called, i.e. the bracketed term: win the pot and the matched bet with probability e_call, lose B otherwise.
function calledEV(pot,bet,eqCall){return eqCall*(pot+2*bet)-bet}
function betEV({pot,bet,fold,eqCall}){
 if(!(pot>0)||!(bet>0)||!prob(fold)||!prob(eqCall))return NaN;
 return fold*pot+(1-fold)*calledEV(pot,bet,eqCall);
}
function checkEV({pot,eqCheck}){if(!(pot>0)||!prob(eqCheck))return NaN;return eqCheck*pot}
/* EV(bet) is linear in F: X at F = 0 (always called) and P at F = 1 (always folds).
   Returns where betting and checking are equal: 'always' / 'never' (bet ≥ check for every / no F in [0, 1]),
   'atLeast' (bet ≥ check once F ≥ f) or 'atMost' (bet ≥ check while F ≤ f: you prefer being called). */
function breakEvenFold({pot,bet,eqCall,check}){
 const X=calledEV(pot,bet,eqCall),tol=1e-9;
 if(X>=check-tol&&pot>=check-tol)return {kind:'always',called:X};
 if(X<check-tol&&pot<check-tol)return {kind:'never',called:X};
 const f=(check-X)/(pot-X);
 return {kind:pot>X?'atLeast':'atMost',fold:f,called:X};
}
// Change in EV(bet) per +10 percentage points of fold frequency.
const foldSlope=(pot,bet,eqCall)=>.1*(pot-calledEV(pot,bet,eqCall));

/* Bet amounts for ⅓, ½, ¾ and 1× pot plus all-in, checked against the effective stack and a minimum bet.
   A size at or above the stack becomes the all-in row (merged, with the sizes it replaced listed).
   A size below the minimum bet is not legal unless it is all-in (a short all-in). */
function candidates({pot,stack,minBet}){
 if(!(pot>0)||!(stack>0)||!(minBet>0))return {error:'CONTEXT'};
 const rows=[],merged=[];
 for(const [key,frac] of FRACTIONS){
  const raw=pot*frac;
  const bet=Math.round(raw*100)/100;// the amount shown is the amount computed
  // A rounded amount must not exceed the effective stack either.
  if(raw>=stack-1e-9||bet>=stack-1e-9){merged.push(key);rows.push({key,raw,status:'merged'});continue}
  rows.push({key,raw,bet,status:bet<minBet-1e-9?'belowMin':'ok'});
 }
 rows.push({key:'allin',bet:stack,allIn:true,status:'ok',shortAllIn:stack<minBet-1e-9,mergedFrom:merged});
 return {rows};
}
// A custom amount is never silently changed: too large or too small is an error the reader must fix.
function customBet(amount,{stack,minBet}){
 if(!Number.isFinite(amount)||amount<=0)return {error:'CUSTOM_POSITIVE'};
 if(amount>stack+1e-9)return {error:'CUSTOM_OVER_STACK'};
 if(amount>=stack-1e-9)return {bet:stack,allIn:true,status:'ok',shortAllIn:stack<minBet-1e-9};
 if(amount<minBet-1e-9)return {error:'CUSTOM_BELOW_MIN'};
 return {bet:amount,status:'ok'};
}
/* Compare check with every bet row that has complete, valid assumptions.
   options: [{key, bet, fold, eqCall}]; returns rows with EV and the best option(s) among those compared. */
function compare({pot,eqCheck,options}){
 const check=prob(eqCheck)?checkEV({pot,eqCheck}):NaN,rows=options.map(o=>{
  const ev=betEV({pot,bet:o.bet,fold:o.fold,eqCall:o.eqCall});
  return {...o,ev,complete:Number.isFinite(ev),vsCheck:Number.isFinite(ev)&&Number.isFinite(check)?ev-check:NaN,
   breakEven:Number.isFinite(ev)&&Number.isFinite(check)?breakEvenFold({pot,bet:o.bet,eqCall:o.eqCall,check}):null,
   slope:Number.isFinite(ev)?foldSlope(pot,o.bet,o.eqCall):NaN};
 });
 const pool=[...(Number.isFinite(check)?[{key:'check',ev:check}]:[]),...rows.filter(r=>r.complete)];
 if(!pool.length)return {check,rows,best:[]};
 const top=Math.max(...pool.map(r=>r.ev)),best=pool.filter(r=>r.ev>=top-1e-9).map(r=>r.key);// numerical ties only
 return {check,rows,best,top};
}
const api={FRACTIONS,calledEV,betEV,checkEV,breakEvenFold,foldSlope,candidates,customBet,compare};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Sizing=api;
})(typeof globalThis==='undefined'?this:globalThis);
