// Kelly teaching calculator for both language pages. Every successful hand analysis (an event from app.js) syncs a
// win / split / loss outcome model of the fixed call automatically; any change to the hand inputs clears it, so stale
// hand numbers never stay on screen. The reader's own classical p, b and push are never overwritten by the hand.
// Modes: manual (no analysis yet), synced, noCall, noPayout, stale (hand changed), detached (reader chose own numbers).
const KT={
en:{
 err:{bankroll:'Enter a poker bankroll greater than zero.',P_RANGE:'Enter a win probability from 0% to 100%.',PUSH_RANGE:'Enter a push probability from 0% to 100%.',
  P_PUSH_SUM:'Win and push probabilities cannot add up to more than 100%.',B_RANGE:'Enter net winnings per 1 risked (b) greater than zero.',cap:'The table-stack cap must be zero or more, or left blank.',
  payout:'This hand’s pot after rake is zero or less, so there is no positive payout to use.',model:'The hand’s outcome probabilities could not be used (they must be valid and add up to 100%).'},
 rows:['Quarter Kelly','Half Kelly','Full Kelly','2× Kelly (overbet)'],
 head:['Strategy','Share of bankroll','Stake','Long-run growth per bet','Share of full-Kelly growth'],
 capped:c=>`capped at ${c}`,ruin:'can lose everything',stakeNothing:'Stake nothing',
 fullNote:s=>`= ${s} of this bankroll, before any cap`,
 verdict:{
  edge:(e,f)=>`Positive edge: each 1 staked gains ${e} on average. Full Kelly stakes ${f} of the bankroll; many people who use Kelly stake a half or a quarter of that.`,
  noEdge:(e,be)=>`No edge: the average result per 1 staked is ${e}, so Kelly stakes nothing. In this model a stake only makes sense if p is above ${be}.`,
  noLoss:'Your inputs leave no chance of losing, so the formula stakes the whole bankroll. Real estimates are never certain; one mistake at full stake would be ruinous.',
  allPush:'Every outcome is a push: nothing can be won or lost, so there is nothing to size.'},
 tableNote:'Growth is the expected change in the logarithm of the bankroll per bet—roughly the typical long-run growth rate, not a guaranteed return.',
 formulaClassic:'f* = (b × p − q) ÷ b, where q = 1 − p is the chance of losing the stake. Break-even: p = 1 ÷ (1 + b).',
 formulaPush:'f* = (b × p − l) ÷ (b × (p + l)), where l = 1 − p − push is the chance of losing the stake. With no pushes this is the classical (b × p − q) ÷ b. Break-even: p = (1 − push) ÷ (1 + b).',
 worked:(expr,res,tail)=>`With your numbers: f* = ${expr} = ${res}${tail}`,
 tailStake:(f,bk,s)=>` → ${f} of ${bk} = ${s}.`,tailNone:' ≤ 0, so stake nothing.',tailAll:' → the whole bankroll (no chance of loss entered).',allPushFormula:'Every result returns the stake. Expected growth is zero for every stake; there is no unique Kelly fraction.',
 edgeLine:(b,p,l,e)=>`Edge per 1 staked = b × p − (chance of losing) = ${b} × ${p} − ${l} = ${e}.`,
 sens:(p,f)=>`If the true p were 5 points lower (${p}), full Kelly would be ${f}. Small errors in p move the Kelly fraction a lot.`,
 sync:{
  manual:'Manual example. Analyze a hand where you face a bet and this section will update from it automatically.',
  synced:'Synced with the current hand analysis. The outcome table comes from that hand and updates every time you analyze. It is a hypothetical fixed-outcome teaching model: your real call is fixed, and nothing here recommends a different wager. Your bankroll and cap are never taken from the hand.',
  noCall:'The current hand has no bet to call, so it has no fixed payout b: any bet you choose would change who calls or folds and what they hold. Kelly cannot be derived from this hand, and no bet size is inferred from equity. The numbers below are your own manual example, not the hand’s.',
  noPayout:'After rake this pot pays nothing for the call, so there is no positive payout b to use. The numbers below are your own manual example, not the hand’s.',
  stale:'The hand inputs changed after the last analysis, so its Kelly model is no longer current and has been cleared. Analyze again to resync. The numbers below are your own manual example.',
  detached:'You switched to your own classical numbers, so this section is not using the hand. Analyze the hand again to resync.'},
 sourceHand:c=>`Source: current hand · hypothetical fixed-outcome model · the call is fixed at ${c}`,sourceManual:'Source: your manual example · not from the hand',
 hand:{
  head:['Outcome','Probability','Net per chip called','Chips on this call'],win:'Outright win',split:n=>`Split ${n} ways (1/${n} of the pot)`,loss:'Loss',total:'Total',
  ev:(e,c,ev,hev)=>`Expected result per chip called = ${e}; × call ${c} = ${ev} chips, equal to the hand’s showdown EV of ${hev} chips.`,
  srcExact:n=>`Probabilities from exact enumeration of ${n} matchups.`,srcSim:n=>`Probabilities from ${n} simulated deals.`,
  edge:(e,f)=>`In this hypothetical model each chip called returns ${e} on average—the hand’s showdown EV ÷ call. Its log-optimal fraction is ${f} of the bankroll. That describes a repeatable fixed-outcome bet; the real call stays fixed.`,
  noEdge:e=>`Each chip called returns ${e} on average—the hand’s showdown EV ÷ call—so the model stakes nothing.`,
  noLossAll:'Exact enumeration found no losing outcome against any possible opponent hand on these cards, so the model’s growth keeps rising up to staking 100%. That is a property of this fixed-outcome model, not advice to risk your bankroll.',
  noLossRange:'Exact enumeration found no losing outcome against the range you entered, so within that assumption the model’s growth keeps rising up to staking 100%. A hand outside the range could still win, and this is not advice to risk your bankroll.',
  unproven:(n,eps,f)=>`No losing outcome appeared in ${n} simulated deals, but a simulation cannot prove that a loss is impossible, so no automatic Kelly fraction is shown. For illustration only: if a loss had a ${eps} chance (roughly the 95% upper bound when none is seen in ${n} deals), the model’s fraction would be ${f}.`,
  withheld:'Withheld: no loss was observed, but none was proven impossible',
  boundaryAll:'Exact enumeration found that no outcome loses the whole call against any possible opponent hand, and the model’s growth is still rising at 100%. The optimum is therefore the boundary—staking the whole bankroll—not a balance point. That is a property of this fixed-outcome model, not advice to risk your bankroll.',
  boundaryRange:'Exact enumeration found that no outcome loses the whole call against the range you entered, and the model’s growth is still rising at 100%, so within that assumption the optimum is the boundary at 100%. A hand outside the range could still win, and this is not advice to risk your bankroll.',
  workedBoundary:(e,s1)=>`With this hand: G′(0) = ${e} > 0, and even at 100% G′(1) = ${s1} ≥ 0 because no outcome loses the whole stake. G′ has no root below 100%, so the constrained optimum is the boundary f* = 100%.`,
  formula:'f* maximizes G(f) = Σ πᵢ · ln(1 + rᵢ · f) over the outcomes in the table (πᵢ = probability, rᵢ = net per chip). G is concave: an interior optimum has G′(f) = Σ πᵢ · rᵢ ÷ (1 + rᵢ · f) = 0; otherwise the optimum is at 0% or 100%. With only a win (+b) and a loss (−1) it reduces to the classical (b × p − q) ÷ b.',
  workedEdge:(e,f)=>`With this hand: G′(0) = Σ πᵢ · rᵢ = ${e} > 0, and solving G′(f) = 0 gives f* = ${f}.`,
  workedNone:e=>`With this hand: G′(0) = Σ πᵢ · rᵢ = ${e} ≤ 0, so growth only falls as the stake rises and f* = 0.`,
  workedNoLoss:e=>`In the enumerated outcomes, G′(0) = ${e} > 0 and no outcome is negative, so G′(f) stays positive for every f below 100%.`,
  workedUnproven:'The sample did not include an outright loss. An optimum based only on these observations is withheld because unobserved losses could change it.',
  sens:f=>`If 5 points of the outright-win probability became losses, the model’s fraction would be ${f}. Small errors in the probabilities move Kelly a lot.`},
 note:{
  head:'Values from the current hand, using a fixed-odds win-or-lose simplification:',
  outcomes:(n,range,w,t,e)=>`Result against ${n} ${n===1?'opponent':'opponents'} holding ${range}: outright win ${w} · tie ${t} · showdown equity ${e}. These are three different numbers.`,
  splits:'Splits are modelled by the number of winners: in an n-way split you collect 1/n of the final pot after rake. A split can gain or lose chips depending on the pot and the call.',
  payoffs:(pot,call,rk,net)=>`Final pot = ${pot} + call ${call}${rk?` − rake ${rk}`:''} = ${net}. Per chip called: outright win (${net} − ${call}) ÷ ${call}; n-way split (${net} ÷ n − ${call}) ÷ ${call}; loss −1. Rake is assumed to come off the whole pot before any split.`,
  allIn:'Calling puts you all-in, so no later bet changes this payout. Side pots, if any, are not modelled.',
  notAllIn:'You are not all-in: later bets would change both the amount at risk and the payout, so this fixed-odds picture is rougher still.',
  multi:'With several opponents, multi-way splits are included, but their later actions and side pots are not modelled.',
  sim:m=>`The probabilities come from a simulation (about ±${m} sampling error) and from the range you assumed; the real probabilities are uncertain.`,
  exact:'The probabilities are exact for the range you assumed, but the range itself is only an assumption.',
  fixed:c=>`Hypothetical teaching model: it treats this fixed call as if it could be repeated at any fraction of your bankroll. You cannot call part of a bet—the real choice is call ${c} or fold—so this is not a recommended wager.`,
  bankroll:'Bankroll and table-stack cap: entered by you, not taken from the hand.'},
 exposure:{
  base:(c,r,bk)=>`This call risks ${c} = ${r} of your ${bk} poker bankroll.`,
  over:'The call is larger than the bankroll you entered.',
  none:c=>` The model shows no positive expected result, so it would risk nothing. In the hand the choice is still only call ${c} or fold.`,
  above:(f,c)=>` That is more than the model’s full-Kelly fraction (${f}): the stake is large for this bankroll. It does not mean you can call a smaller amount—the choice is call ${c} or fold.`,
  within:f=>` That is within the model’s full-Kelly fraction (${f}). This describes bankroll exposure only; it is not a reason to call.`,
  withheld:c=>` No Kelly fraction is shown for comparison because a loss was not proven impossible. The choice is still call ${c} or fold.`},
},
zh:{
 err:{bankroll:'撲克資金必須大於零。',P_RANGE:'勝出機率請輸入 0% 至 100%。',PUSH_RANGE:'退回注碼機率請輸入 0% 至 100%。',
  P_PUSH_SUM:'勝出機率與退回注碼機率相加不可超過 100%。',B_RANGE:'每投入 1 的淨贏額 (b) 必須大於零。',cap:'牌桌籌碼上限必須是零或以上，或留空。',
  payout:'這手牌扣除抽水後的底池是零或以下，沒有正數賠付可用。',model:'無法使用這手牌的結果機率（機率必須有效，而且合計為 100%）。'},
 rows:['四分之一凱利','半凱利','完整凱利','兩倍凱利（過度下注）'],
 head:['策略','佔資金比例','注碼','每注長期增長','佔完整凱利增長'],
 capped:c=>`以 ${c} 為上限`,ruin:'可能輸光',stakeNothing:'不下注',
 fullNote:s=>`= 這筆資金中的 ${s}（未計上限）`,
 verdict:{
  edge:(e,f)=>`有正優勢：平均每 1 注碼可賺 ${e}。完整凱利會投入資金的 ${f}；很多使用凱利的人只投入其一半或四分之一。`,
  noEdge:(e,be)=>`沒有優勢：平均每 1 注碼的結果是 ${e}，所以凱利不會下注。在這個模型中，p 必須高於 ${be} 才值得下注。`,
  noLoss:'你輸入的數字表示完全不會輸，所以公式會投入全部資金。真實的估計永遠不會百分百確定；以全部資金下注，一次判斷錯誤便足以輸光。',
  allPush:'每個結果都是退回注碼：既不會贏也不會輸，所以沒有注碼可計算。'},
 tableNote:'增長是指每注令資金對數的期望變化，大約等於典型的長期增長率，並非保證回報。',
 formulaClassic:'f* = (b × p − q) ÷ b，其中 q = 1 − p 是輸掉注碼的機會。收支平衡：p = 1 ÷ (1 + b)。',
 formulaPush:'f* = (b × p − l) ÷ (b × (p + l))，其中 l = 1 − p − 退回機率，是輸掉注碼的機會。沒有退回注碼時，即為經典公式 (b × p − q) ÷ b。收支平衡：p = (1 − 退回機率) ÷ (1 + b)。',
 worked:(expr,res,tail)=>`代入你的數字：f* = ${expr} = ${res}${tail}`,
 tailStake:(f,bk,s)=>` → ${bk} 的 ${f} = ${s}。`,tailNone:' ≤ 0，所以不下注。',tailAll:' → 全部資金（你輸入了不會輸）。',allPushFormula:'每次結果都會退回注碼，任何注碼的期望增長均為零；因此沒有唯一的凱利比例。',
 edgeLine:(b,p,l,e)=>`每 1 注碼的優勢 = b × p − 輸的機會 = ${b} × ${p} − ${l} = ${e}。`,
 sens:(p,f)=>`如果真實的 p 低 5 個百分點（${p}），完整凱利會變成 ${f}。p 的微小誤差會大幅改變凱利比例。`,
 sync:{
  manual:'手動例子。分析一手需要跟注的牌後，這部分會自動按該手牌更新。',
  synced:'已與目前的牌局分析同步。結果表來自該手牌，每次分析都會自動更新。這是一個假設性的固定結果教學模型：你實際的跟注金額是固定的，這裏並不建議任何其他注碼。你的資金及上限永遠不會從牌局取得。',
  noCall:'目前這手牌沒有需要跟注的注碼，所以沒有固定賠付 b：你選擇的任何下注額都會改變誰跟注或棄牌，以及他們持有的手牌。凱利無法從這手牌推算，亦不會從權益推斷下注額。下面的數字是你自己的手動例子，並非來自這手牌。',
  noPayout:'扣除抽水後，這個底池對跟注沒有任何賠付，所以沒有正數的 b 可用。下面的數字是你自己的手動例子，並非來自這手牌。',
  stale:'上次分析後牌局資料已經改變，所以之前的凱利模型已不再是最新，並已清除。請再分析一次以重新同步。下面的數字是你自己的手動例子。',
  detached:'你已改用自己的經典數字，所以這部分沒有使用牌局資料。再分析這手牌即可重新同步。'},
 sourceHand:c=>`來源：目前牌局 · 假設性的固定結果模型 · 跟注固定為 ${c}`,sourceManual:'來源：你的手動例子 · 並非來自牌局',
 hand:{
  head:['結果','機率','每投入 1 籌碼的淨結果','這次跟注的籌碼'],win:'獨贏',split:n=>`${n} 人平分（取得底池的 1/${n}）`,loss:'輸',total:'合計',
  ev:(e,c,ev,hev)=>`每投入 1 籌碼的期望結果 = ${e}；× 跟注 ${c} = ${ev} 籌碼，等於這手牌的攤牌期望值 ${hev} 籌碼。`,
  srcExact:n=>`機率來自精確計算全部 ${n} 個對局。`,srcSim:n=>`機率來自 ${n} 次模擬發牌。`,
  edge:(e,f)=>`在這個假設性模型中，每投入 1 籌碼平均得到 ${e}，即這手牌的攤牌期望值 ÷ 跟注額。它的對數最優比例是資金的 ${f}。這描述的是可重複的固定結果注項；實際跟注金額仍然固定。`,
  noEdge:e=>`每投入 1 籌碼平均得到 ${e}（即這手牌的攤牌期望值 ÷ 跟注額），所以模型不會下注。`,
  noLossAll:'精確計算顯示，以這些牌面對任何可能的對手手牌都不會輸，所以模型的增長會一直上升，直至投入 100%。這只是這個固定結果模型的性質，並不是建議你冒上全部資金。',
  noLossRange:'精確計算顯示，面對你輸入的範圍不會輸，所以在這個假設下，模型的增長會一直上升，直至投入 100%。範圍以外的手牌仍可能贏你，這亦不是建議你冒上全部資金。',
  unproven:(n,eps,f)=>`在 ${n} 次模擬發牌中沒有出現輸的結果，但模擬不能證明不可能輸，所以不會自動顯示凱利比例。僅作說明：如果輸的機會是 ${eps}（在 ${n} 次發牌都沒有出現輸時，約為 95% 的上限），模型的比例會是 ${f}。`,
  withheld:'不顯示：沒有觀察到輸，但未能證明不可能輸',
  boundaryAll:'精確計算顯示，以這些牌面對任何可能的對手手牌，都沒有結果會輸掉整個跟注額，而模型的增長在 100% 時仍在上升。因此最優點是邊界——投入全部資金——而不是一個平衡點。這只是這個固定結果模型的性質，並不是建議你冒上全部資金。',
  boundaryRange:'精確計算顯示，面對你輸入的範圍，沒有結果會輸掉整個跟注額，而模型的增長在 100% 時仍在上升，所以在這個假設下最優點是 100% 的邊界。範圍以外的手牌仍可能贏你，這亦不是建議你冒上全部資金。',
  workedBoundary:(e,s1)=>`這手牌：G′(0) = ${e} > 0，而且即使在 100%，G′(1) = ${s1} ≥ 0，因為沒有結果會輸掉整個注碼。G′ 在 100% 以下沒有根，所以受限下的最優點是邊界 f* = 100%。`,
  formula:'f* 令 G(f) = Σ πᵢ · ln(1 + rᵢ · f) 最大，按表中各結果計算（πᵢ = 機率，rᵢ = 每投入 1 籌碼的淨結果）。G 是凹函數：內部最優點滿足 G′(f) = Σ πᵢ · rᵢ ÷ (1 + rᵢ · f) = 0；否則最優點在 0% 或 100% 的邊界。若只有贏（+b）和輸（−1），即為經典公式 (b × p − q) ÷ b。',
  workedEdge:(e,f)=>`這手牌：G′(0) = Σ πᵢ · rᵢ = ${e} > 0，解 G′(f) = 0 得 f* = ${f}。`,
  workedNone:e=>`這手牌：G′(0) = Σ πᵢ · rᵢ = ${e} ≤ 0，注碼越大增長越低，所以 f* = 0。`,
  workedNoLoss:e=>`在列舉的結果中：G′(0) = ${e} > 0，而且沒有任何結果為負數，所以 f 在 100% 以下時 G′(f) 一直為正。`,
  workedUnproven:'這次模擬沒有出現完全輸掉的結果。由於未觀察到的損失可能改變結果，因此不會只根據這些觀察顯示最優值。',
  sens:f=>`如果獨贏機率中有 5 個百分點變成輸，模型的比例會是 ${f}。機率的微小誤差會大幅改變凱利比例。`},
 note:{
  head:'來自目前牌局的數值，以固定賠率、贏或輸的簡化模型計算：',
  outcomes:(n,range,w,t,e)=>`對 ${n} 位持${range}的對手：獨贏 ${w} · 平手 ${t} · 攤牌權益 ${e}。這是三個不同的數字。`,
  splits:'平分底池按贏家人數計算：n 人平分時，你取得扣除抽水後最終底池的 1/n。視乎底池及跟注額，平分可能賺籌碼，也可能輸籌碼。',
  payoffs:(pot,call,rk,net)=>`最終底池 = ${pot} + 跟注 ${call}${rk?` − 抽水 ${rk}`:''} = ${net}。每投入 1 籌碼：獨贏 (${net} − ${call}) ÷ ${call}；n 人平分 (${net} ÷ n − ${call}) ÷ ${call}；輸 −1。假設抽水在平分前從整個底池扣除。`,
  allIn:'跟注後你已全押，之後的下注不會改變這個賠付。如有邊池，則未有計算在內。',
  notAllIn:'你未全押：之後的下注會同時改變冒險金額及賠付，所以這個固定賠率的描述更加粗略。',
  multi:'對手多於一位時，已計算多人平分底池，但他們之後的行動及邊池未有計算在內。',
  sim:m=>`這些機率來自模擬（抽樣誤差約 ±${m}）及你假設的對手範圍；真實機率並不確定。`,
  exact:'對你假設的範圍而言這些機率是精確的，但範圍本身只是假設。',
  fixed:c=>`假設性教學模型：它把這次固定跟注當作可以按資金任何比例重複的注項。你不能只跟注一部分——實際選擇只有跟注 ${c} 或棄牌——所以這並不是建議的注碼。`,
  bankroll:'資金及牌桌籌碼上限：由你輸入，並非從牌局取得。'},
 exposure:{
  base:(c,r,bk)=>`這次跟注冒 ${c} 的風險，即你 ${bk} 撲克資金的 ${r}。`,
  over:'這次跟注比你輸入的資金還要大。',
  none:c=>`模型沒有正數的期望結果，所以不會冒任何風險。在牌局中，選擇仍然只有跟注 ${c} 或棄牌。`,
  above:(f,c)=>`這高於模型的完整凱利比例（${f}）：以這筆資金而言注碼偏大。這並不表示你可以跟注較少的金額——選擇只有跟注 ${c} 或棄牌。`,
  within:f=>`這在模型的完整凱利比例（${f}）之內。這只描述資金承受的風險，並不是跟注的理由。`,
  withheld:c=>`由於未能證明不可能輸，這裏不顯示凱利比例作比較。選擇仍然只有跟注 ${c} 或棄牌。`},
}}[LANG];

const kNum=id=>{const v=$(id).value.trim();return v===''?NaN:Number(v)};
const kFix=x=>String(Number(x.toPrecision(8)));
const kPct=x=>(x*100).toFixed(x>0&&x<.001?3:x>0&&x<.1?2:1)+'%';
const kGrowth=g=>g===-Infinity?KT.ruin:(g>=0?'+':'')+(g*100).toFixed(3)+'%';
let kMode='manual',kHand=null;
const readHandFields=()=>({p:$('kP').value,b:$('kB').value,push:$('kPush').value});
const kSigned=x=>(x>=0?'+':'−')+kFix(Math.abs(x));

function kClear(){['kFull','kFullNote','kSource','kVerdict','kFormula','kWorked','kSensitivity'].forEach(id=>$(id).textContent='');$('kTable').replaceChildren();$('kTable').hidden=true;$('kExposure').hidden=true}
function kStrategyTable(k,bankroll,cap,show){
 const tbl=$('kTable');tbl.replaceChildren();tbl.hidden=!show;if(!show)return;
 const hr=tbl.insertRow();KT.head.forEach(h=>{const th=document.createElement('th');th.textContent=h;hr.appendChild(th)});
 Kelly.kellyRows(k,bankroll,cap).forEach((row,i)=>{const tr=tbl.insertRow();if(row.multiplier===1)tr.className='full';
  [KT.rows[i],kPct(row.fraction),money(row.finalStake)+(row.capped?` (${KT.capped(money(cap))})`:''),kGrowth(row.growth),row.growthShare===null?'—':kPct(row.growthShare)].forEach(v=>{const td=tr.insertCell();td.textContent=v})});
 const caption=tbl.createCaption();caption.textContent=KT.tableNote;caption.style.captionSide='bottom';
}
function kRender(){
 $('kError').textContent='';
 const bankroll=kNum('kBankroll'),capText=$('kCap').value.trim(),cap=capText===''?null:Number(capText),errs=[];
 if(!(bankroll>0&&Number.isFinite(bankroll)))errs.push(KT.err.bankroll);
 if(cap!==null&&!(cap>=0&&Number.isFinite(cap)))errs.push(KT.err.cap);
 let k;
 if(kMode==='synced'){k=Kelly.analyzeOutcomes(kHand.outcomes);if(k.error)errs.push(KT.err.model)}
 else{const push=$('kPush').value.trim()===''?0:kNum('kPush');k=Kelly.analyzeKelly({p:kNum('kP')/100,b:kNum('kB'),push:push/100});if(k.error)errs.push(KT.err[k.error])}
 if(errs.length){$('kError').textContent=errs.join(TEXT.sep);kClear();return null}
 return kMode==='synced'?kRenderHand(k,bankroll,cap):kRenderManual(k,bankroll,cap);
}
function kRenderManual(k,bankroll,cap){
 const positive=k.kind==='edge'||k.kind==='noLoss';
 $('kSource').textContent=KT.sourceManual;
 $('kFull').textContent=k.kind==='allPush'?'—':kPct(k.full);$('kFullNote').textContent=positive?KT.fullNote(money(k.full*bankroll)):KT.stakeNothing;
 $('kVerdict').textContent=k.kind==='edge'?KT.verdict.edge(kFix(k.edge),kPct(k.full)):k.kind==='noEdge'?KT.verdict.noEdge(kFix(k.edge),kPct(k.breakEven)):KT.verdict[k.kind];
 kStrategyTable(k,bankroll,cap,positive);
 // Formula: classical when there are no pushes, the push-aware form otherwise.
 const p=k.p,b=k.b,l=k.loss,hasPush=k.push>0;
 $('kFormula').textContent=hasPush?KT.formulaPush:KT.formulaClassic;
 const expr=hasPush?`(${kFix(b)} × ${kFix(p)} − ${kFix(l)}) ÷ (${kFix(b)} × (${kFix(p)} + ${kFix(l)}))`:`(${kFix(b)} × ${kFix(p)} − ${kFix(l)}) ÷ ${kFix(b)}`;
 const raw=k.kind==='allPush'?0:(b*p-l)/(b*(p+l));
 const tail=k.kind==='noLoss'?KT.tailAll:raw<=1e-12?KT.tailNone:KT.tailStake(kPct(k.full),money(bankroll),money(k.full*bankroll));
 $('kWorked').textContent=k.kind==='allPush'?KT.allPushFormula:KT.edgeLine(kFix(b),kFix(p),kFix(l),kFix(k.edge))+TEXT.sep+KT.worked(expr,kFix(raw),tail);
 const lower=positive&&p>=.05?Kelly.analyzeKelly({p:p-.05,b,push:k.push}):null;
 $('kSensitivity').textContent=lower&&!lower.error?KT.sens(kPct(p-.05),kPct(lower.full)):'';
 $('kExposure').hidden=true;
 return k;
}
function kRenderHand(k,bankroll,cap){
 const H=KT.hand,{r,x}=kHand,c=money(kHand.call);
 // A simulation that never saw a loss has not proven that a loss is impossible: withhold the automatic 100% conclusion.
 // Any positive result from a sample with no observed outright loss needs exact proof, so it is withheld.
 const unproven=!r.exact&&r.lossCount===0&&k.edge>0,positive=['edge','noLoss','boundary'].includes(k.kind)&&!unproven;
 $('kSource').textContent=KT.sourceHand(c);
 $('kFull').textContent=unproven?'—':kPct(k.full);
 $('kFullNote').textContent=unproven?H.withheld:positive?KT.fullNote(money(k.full*bankroll)):KT.stakeNothing;
 let verdict;
 if(unproven){const eps=3/r.trials,alt=Kelly.analyzeOutcomes([...k.outcomes.map(o=>({p:o.p*(1-eps),r:o.r})),{p:eps,r:-1}]);verdict=H.unproven(r.trials.toLocaleString(TEXT.locale),kPct(eps),alt.error?'—':kPct(alt.full))}
 else if(k.kind==='noLoss')verdict=x.range>=100?H.noLossAll:H.noLossRange;
 else if(k.kind==='boundary')verdict=x.range>=100?H.boundaryAll:H.boundaryRange;
 else verdict=k.kind==='edge'?H.edge(kSigned(k.edge),kPct(k.full)):H.noEdge(kSigned(k.edge));
 $('kVerdict').textContent=verdict;
 kStrategyTable(k,bankroll,cap,positive);
 // Outcome table: every row is from the current hand; probabilities add up to 100% and E[r] × call equals the hand EV.
 const tbl=$('kOutcomes');tbl.replaceChildren();
 const hr=tbl.insertRow();H.head.forEach(h=>{const th=document.createElement('th');th.textContent=h;hr.appendChild(th)});
 kHand.outcomes.forEach(o=>{if(o.p<=0&&o.kind==='split')return;const tr=tbl.insertRow();tr.dataset.kind=o.kind;if(o.n)tr.dataset.n=o.n;
  [o.kind==='win'?H.win:o.kind==='loss'?H.loss:H.split(o.n),pct(o.p),kSigned(o.r),(o.r>=0?'+':'−')+money(Math.abs(o.r*kHand.call))].forEach(v=>{const td=tr.insertCell();td.textContent=v})});
 const total=k.outcomes.reduce((s,o)=>s+o.p,0),tr=tbl.insertRow();tr.className='total';[H.total,pct(total),'',''].forEach(v=>{const td=tr.insertCell();td.textContent=v});
 const handEV=r.equity*kHand.net-kHand.call,cap2=tbl.createCaption();cap2.style.captionSide='bottom';
 cap2.textContent=H.ev(kSigned(k.edge),c,(k.edge>=0?'+':'−')+money(Math.abs(k.edge*kHand.call)),(handEV>=0?'+':'−')+money(Math.abs(handEV)))+TEXT.sep+(r.exact?H.srcExact(r.trials.toLocaleString(TEXT.locale)):H.srcSim(r.trials.toLocaleString(TEXT.locale)));
 $('kFormula').textContent=H.formula;
 $('kWorked').textContent=unproven?H.workedUnproven:k.kind==='edge'?H.workedEdge(kSigned(k.edge),kPct(k.full)):k.kind==='noLoss'?H.workedNoLoss(kSigned(k.edge)):k.kind==='boundary'?H.workedBoundary(kSigned(k.edge),kFix(k.slopeAtMax)):H.workedNone(kSigned(k.edge));
 const win=k.outcomes.find(o=>o.kind==='win');
 const lower=positive&&win.p>=.05?Kelly.analyzeOutcomes(k.outcomes.map(o=>({p:o.kind==='win'?o.p-.05:o.kind==='loss'?o.p+.05:o.p,r:o.r}))):null;
 $('kSensitivity').textContent=lower&&!lower.error?H.sens(kPct(lower.full)):'';
 kRenderExposure(k,bankroll,unproven);
 return k;
}
function kRenderExposure(k,bankroll,unproven){
 const el=$('kExposure'),E=KT.exposure,c=money(kHand.call),ratio=kHand.call/bankroll;
 let text=E.base(c,kPct(ratio),money(bankroll))+(kHand.call>bankroll?TEXT.sep+E.over:'');
 text+=unproven?E.withheld(c):k.full<=0?E.none(c):ratio>k.full?E.above(kPct(k.full),c):E.within(kPct(k.full));
 el.textContent=text;el.hidden=false;
}
function kRenderNote(){
 const box=$('kHandNote');if(kMode!=='synced'){box.hidden=true;box.replaceChildren();return}
 const N=KT.note,{r,x,rake,net}=kHand,items=[N.outcomes(x.opponents,TEXT.rangeName(x.range),pct(r.wins),pct(r.ties),pct(r.equity)),N.splits,N.payoffs(money(x.pot),money(x.call),rake?money(rake):'',money(net)),x.call>=x.stack-1e-9?N.allIn:N.notAllIn];
 if(x.opponents>1)items.push(N.multi);items.push(r.exact?N.exact:N.sim(pct(Math.max(1.96*Math.sqrt(r.wins*(1-r.wins)/r.trials),.001))));items.push(N.fixed(money(x.call)),N.bankroll);
 box.replaceChildren();
 const h=document.createElement('p');h.className='note-head';h.textContent=N.head;box.appendChild(h);
 const ul=document.createElement('ul');items.forEach(t=>{const li=document.createElement('li');li.textContent=t;ul.appendChild(li)});box.appendChild(ul);
 box.hidden=false;
}
function kSetMode(mode){
 kMode=mode;if(mode!=='synced')kHand=null;
 $('kSync').textContent=KT.sync[mode];$('kSync').dataset.mode=mode;
 // The reader's classical fields are hidden (never overwritten) while the hand model is shown.
 $('kManual').hidden=mode==='synced';$('kHandModel').hidden=mode!=='synced';
 kRenderNote();kRender();
}
document.addEventListener('pokerlantern:result',e=>{
 const {r,x}=e.detail;if(!(x.call>0)){kSetMode('noCall');return}
 const final=x.pot+x.call,rake=x.rake>0?Math.min(x.rakeCap>0?x.rakeCap:Infinity,x.rake/100*final):0;
 if(!(Kelly.callPayout(x.pot,x.call,rake)>0)){kSetMode('noPayout');return}
 const model=Kelly.handOutcomes(r,x.pot,x.call,rake);
 kHand={r,x,rake,net:model.net,outcomes:model.outcomes,call:x.call};kSetMode('synced');
});
document.addEventListener('pokerlantern:invalidate',()=>{if(['synced','noCall','noPayout'].includes(kMode))kSetMode('stale')});
$('kUseManual').addEventListener('click',()=>{if(kMode==='synced')kSetMode('detached')});
['kP','kB','kPush','kBankroll','kCap'].forEach(id=>['input','change'].forEach(ev=>$(id).addEventListener(ev,kRender)));
// Used by language.js. The classical fields only ever hold the reader's own numbers, so they can be carried as they are.
window.KellySync={
 snapshot:()=>({bankroll:$('kBankroll').value,cap:$('kCap').value,manual:readHandFields()}),
 restore(s){if(!s)return;$('kBankroll').value=s.bankroll??$('kBankroll').value;$('kCap').value=s.cap??'';if(s.manual)for(const [id,key] of [['kP','p'],['kB','b'],['kPush','push']])if(s.manual[key]!==undefined)$(id).value=s.manual[key];kSetMode('manual')},
};
kSetMode('manual');
