// Kelly teaching calculator for both language pages. Hand results arrive from app.js as events and are
// used only when the reader presses the import button.
const KT={
en:{
 err:{bankroll:'Enter a poker bankroll greater than zero.',P_RANGE:'Enter a win probability from 0% to 100%.',PUSH_RANGE:'Enter a push probability from 0% to 100%.',
  P_PUSH_SUM:'Win and push probabilities cannot add up to more than 100%.',B_RANGE:'Enter net winnings per 1 risked (b) greater than zero.',cap:'The table-stack cap must be zero or more, or left blank.',
  payout:'This hand’s pot after rake is zero or less, so there is no positive payout to use.'},
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
 hintNone:'Analyze a hand where you face a bet first.',
 hintNoCall:'Kelly needs a fixed price. With no bet to call, the size you choose changes how opponents respond, so there is no fixed b to use.',
 note:{
  head:'Loaded from your hand analysis. You can edit p and b.',
  outcomes:(n,range,w,t,e)=>`Result against ${n} ${n===1?'opponent':'opponents'} holding ${range}: outright win ${w} · tie ${t} · showdown equity ${e}. These are three different numbers.`,
  p:(w,t)=>`p = outright win ${w}. Ties (${t}) are counted as losses here: a split pot returns only a share of the pot, which a win-or-lose bet cannot represent. Equity is not used as p because it adds split-pot shares and assumes the hand reaches showdown.`,
  b:(pot,rk,call,b)=>rk?`b = (pot − rake) ÷ call = (${pot} − ${rk}) ÷ ${call} = ${b}. Assumes a win collects the pot already there after this rake, and a loss costs exactly the call.`:`b = pot ÷ call = ${pot} ÷ ${call} = ${b} (no rake entered). Assumes a win collects the pot already there, and a loss costs exactly the call.`,
  allIn:'Calling puts you all-in, so no later bet changes this payout. Side pots, if any, are not modelled.',
  notAllIn:'You are not all-in: later bets would change both the amount at risk and the payout, so this fixed-odds picture is rougher still.',
  multi:'With several opponents, their actions, side pots and multi-way splits are not modelled.',
  sim:m=>`p comes from a simulation (about ±${m} sampling error) and from the range you assumed; the real probability is uncertain.`,
  exact:'p is exact for the range you assumed, but the range itself is only an assumption.',
  fixed:c=>`You cannot call part of a bet: the real choice is call ${c} or fold. Kelly only shows how much of your bankroll that fixed call exposes.`,
  stale:'The hand inputs have changed since this example was loaded; it still describes the earlier analysis.',
  remove:'Remove example'},
 exposure:{
  base:(c,r,bk)=>`This call risks ${c} = ${r} of your ${bk} poker bankroll.`,
  over:'The call is larger than the bankroll you entered.',
  none:c=>` The simplified bet shows no edge, so Kelly would risk nothing. In the hand the choice is still only call ${c} or fold.`,
  above:(f,c)=>` That is more than full Kelly (${f}) for the simplified bet: the stake is large for this bankroll. It does not mean you can call a smaller amount—the choice is call ${c} or fold.`,
  within:f=>` That is within full Kelly (${f}) for the simplified bet. This describes bankroll exposure only; it is not a reason to call.`,
  current:' (Uses the p and b now entered above.)'},
},
zh:{
 err:{bankroll:'撲克資金必須大於零。',P_RANGE:'勝出機率請輸入 0% 至 100%。',PUSH_RANGE:'退回注碼機率請輸入 0% 至 100%。',
  P_PUSH_SUM:'勝出機率與退回注碼機率相加不可超過 100%。',B_RANGE:'每投入 1 的淨贏額 (b) 必須大於零。',cap:'牌桌籌碼上限必須是零或以上，或留空。',
  payout:'這手牌扣除抽水後的底池是零或以下，沒有正數賠付可用。'},
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
 hintNone:'請先分析一手需要跟注的牌。',
 hintNoCall:'凱利需要固定的價錢。沒有需要跟注的注碼時，你選擇的下注額會改變對手的反應，所以沒有固定的 b 可用。',
 note:{
  head:'已按你的要求從牌局分析載入。你可以修改 p 和 b。',
  outcomes:(n,range,w,t,e)=>`對 ${n} 位持${range}的對手：獨贏 ${w} · 平手 ${t} · 攤牌權益 ${e}。這是三個不同的數字。`,
  p:(w,t)=>`p = 獨贏率 ${w}。平手（${t}）在這裏當作輸：平分底池只會取回底池的一部分，這是「贏或輸」的注項無法表示的。權益不會用作 p，因為它加入了平分底池的份額，並假設牌局會去到攤牌。`,
  b:(pot,rk,call,b)=>rk?`b =（底池 − 抽水）÷ 跟注額 =（${pot} − ${rk}）÷ ${call} = ${b}。假設贏時取得扣除這筆抽水後已在底池的籌碼，輸時剛好輸掉跟注額。`:`b = 底池 ÷ 跟注額 = ${pot} ÷ ${call} = ${b}（未輸入抽水）。假設贏時取得已在底池的籌碼，輸時剛好輸掉跟注額。`,
  allIn:'跟注後你已全押，之後的下注不會改變這個賠付。如有邊池，則未有計算在內。',
  notAllIn:'你未全押：之後的下注會同時改變冒險金額及賠付，所以這個固定賠率的描述更加粗略。',
  multi:'對手多於一位時，他們的行動、邊池及多人平分底池均未有計算在內。',
  sim:m=>`p 來自模擬（抽樣誤差約 ±${m}）及你假設的對手範圍；真實機率並不確定。`,
  exact:'對你假設的範圍而言 p 是精確的，但範圍本身只是假設。',
  fixed:c=>`你不能只跟注一部分：實際選擇只有跟注 ${c} 或棄牌。凱利只顯示這個固定跟注令你的資金承受多少風險。`,
  stale:'載入這個例子後，牌局資料已經改變；它仍然描述之前的分析。',
  remove:'移除例子'},
 exposure:{
  base:(c,r,bk)=>`這次跟注冒 ${c} 的風險，即你 ${bk} 撲克資金的 ${r}。`,
  over:'這次跟注比你輸入的資金還要大。',
  none:c=>`簡化後的注項沒有優勢，所以凱利不會冒任何風險。在牌局中，選擇仍然只有跟注 ${c} 或棄牌。`,
  above:(f,c)=>`這高於簡化注項的完整凱利（${f}）：以這筆資金而言注碼偏大。這並不表示你可以跟注較少的金額——選擇只有跟注 ${c} 或棄牌。`,
  within:f=>`這在簡化注項的完整凱利（${f}）之內。這只描述資金承受的風險，並不是跟注的理由。`,
  current:'（使用上面目前輸入的 p 和 b。）'},
}}[LANG];

const kNum=id=>{const v=$(id).value.trim();return v===''?NaN:Number(v)};
const kFix=x=>String(Number(x.toPrecision(8)));
const kPct=x=>(x*100).toFixed(x>0&&x<.001?3:x>0&&x<.1?2:1)+'%';
const kGrowth=g=>g===-Infinity?KT.ruin:(g>=0?'+':'')+(g*100).toFixed(3)+'%';
let lastHand=null,kHand=null;

function kClear(){['kFull','kFullNote','kVerdict','kFormula','kWorked','kSensitivity'].forEach(id=>$(id).textContent='');$('kTable').replaceChildren();$('kTable').hidden=true;$('kExposure').hidden=true}
function kRender(){
 $('kError').textContent='';
 const bankroll=kNum('kBankroll'),capText=$('kCap').value.trim(),cap=capText===''?null:Number(capText),push=$('kPush').value.trim()===''?0:kNum('kPush');
 const k=Kelly.analyzeKelly({p:kNum('kP')/100,b:kNum('kB'),push:push/100}),errs=[];
 if(!(bankroll>0&&Number.isFinite(bankroll)))errs.push(KT.err.bankroll);
 if(cap!==null&&!(cap>=0&&Number.isFinite(cap)))errs.push(KT.err.cap);
 if(k.error)errs.push(KT.err[k.error]);
 if(errs.length){$('kError').textContent=errs.join(TEXT.sep);kClear();return null}
 const positive=k.kind==='edge'||k.kind==='noLoss';
 $('kFull').textContent=k.kind==='allPush'?'—':kPct(k.full);$('kFullNote').textContent=positive?KT.fullNote(money(k.full*bankroll)):KT.stakeNothing;
 $('kVerdict').textContent=k.kind==='edge'?KT.verdict.edge(kFix(k.edge),kPct(k.full)):k.kind==='noEdge'?KT.verdict.noEdge(kFix(k.edge),kPct(k.breakEven)):KT.verdict[k.kind];
 const tbl=$('kTable');tbl.replaceChildren();tbl.hidden=!positive;
 if(positive){
  const hr=tbl.insertRow();KT.head.forEach(h=>{const th=document.createElement('th');th.textContent=h;hr.appendChild(th)});
  Kelly.kellyRows(k,bankroll,cap).forEach((row,i)=>{const tr=tbl.insertRow();if(row.multiplier===1)tr.className='full';
   [KT.rows[i],kPct(row.fraction),money(row.finalStake)+(row.capped?` (${KT.capped(money(cap))})`:''),kGrowth(row.growth),row.growthShare===null?'—':kPct(row.growthShare)].forEach(v=>{const td=tr.insertCell();td.textContent=v})});
  const cap2=tbl.createCaption();cap2.textContent=KT.tableNote;cap2.style.captionSide='bottom';
 }
 // Formula: classical when there are no pushes, the push-aware form otherwise.
 const p=k.p,b=k.b,l=k.loss,hasPush=k.push>0;
 $('kFormula').textContent=hasPush?KT.formulaPush:KT.formulaClassic;
 const expr=hasPush?`(${kFix(b)} × ${kFix(p)} − ${kFix(l)}) ÷ (${kFix(b)} × (${kFix(p)} + ${kFix(l)}))`:`(${kFix(b)} × ${kFix(p)} − ${kFix(l)}) ÷ ${kFix(b)}`;
 const raw=k.kind==='allPush'?0:(b*p-l)/(b*(p+l));
 const tail=k.kind==='noLoss'?KT.tailAll:raw<=1e-12?KT.tailNone:KT.tailStake(kPct(k.full),money(bankroll),money(k.full*bankroll));
 $('kWorked').textContent=k.kind==='allPush'?KT.allPushFormula:KT.edgeLine(kFix(b),kFix(p),kFix(l),kFix(k.edge))+TEXT.sep+KT.worked(expr,kFix(raw),tail);
 const lower=positive&&p>=.05?Kelly.analyzeKelly({p:p-.05,b,push:k.push}):null;
 $('kSensitivity').textContent=lower&&!lower.error?KT.sens(kPct(p-.05),kPct(lower.full)):'';
 kRenderExposure(k,bankroll);
 return k;
}
function kRenderExposure(k,bankroll){
 const el=$('kExposure');if(!kHand){el.hidden=true;return}
 const E=KT.exposure,c=money(kHand.call),ratio=kHand.call/bankroll;
 let text=E.base(c,kPct(ratio),money(bankroll))+(kHand.call>bankroll?TEXT.sep+E.over:'');
 text+=k.full<=0?E.none(c):ratio>k.full?E.above(kPct(k.full),c):E.within(kPct(k.full));
 el.textContent=text+E.current;el.hidden=false;
}
function kRenderNote(){
 const box=$('kImportNote');if(!kHand){box.hidden=true;box.replaceChildren();return}
 const N=KT.note,{r,x,rake,b}=kHand,items=[N.outcomes(x.opponents,TEXT.rangeName(x.range),pct(r.wins),pct(r.ties),pct(r.equity)),N.p(pct(r.wins),pct(r.ties)),N.b(money(x.pot),rake?money(rake):'',money(x.call),kFix(b)),x.call>=x.stack-1e-9?N.allIn:N.notAllIn];
 if(x.opponents>1)items.push(N.multi);items.push(r.exact?N.exact:N.sim(pct(Math.max(1.96*Math.sqrt(r.wins*(1-r.wins)/r.trials),.001))));items.push(N.fixed(money(x.call)));
 box.replaceChildren();if(kHand.stale){const s=document.createElement('p');s.className='stale';s.textContent=N.stale;box.appendChild(s)}
 const h=document.createElement('p');h.className='note-head';h.textContent=N.head;box.appendChild(h);
 const ul=document.createElement('ul');items.forEach(t=>{const li=document.createElement('li');li.textContent=t;ul.appendChild(li)});box.appendChild(ul);
 const rm=document.createElement('button');rm.type='button';rm.className='text-button left';rm.id='kRemove';rm.textContent=N.remove;rm.addEventListener('click',()=>{kHand=null;kRenderNote();kRender()});box.appendChild(rm);
 box.hidden=false;
}
function kSetImport(){const can=!!lastHand&&lastHand.x.call>0;$('kImport').disabled=!can;$('kImportHint').textContent=can?'':lastHand?KT.hintNoCall:KT.hintNone}

document.addEventListener('pokerlantern:result',e=>{lastHand=e.detail;kSetImport()});
document.addEventListener('pokerlantern:invalidate',()=>{lastHand=null;kSetImport();if(kHand&&!kHand.stale){kHand.stale=true;kRenderNote()}});
$('kImport').addEventListener('click',()=>{
 if(!lastHand||!(lastHand.x.call>0))return;
 const {r,x}=lastHand,final=x.pot+x.call,rake=x.rake>0?Math.min(x.rakeCap>0?x.rakeCap:Infinity,x.rake/100*final):0,b=Kelly.callPayout(x.pot,x.call,rake);
 if(!(b>0)){$('kError').textContent=KT.err.payout;return}
 $('kP').value=String(Number((r.wins*100).toPrecision(8)));$('kB').value=kFix(b);$('kPush').value='0';
 kHand={r,x,rake,b,call:x.call,stale:false};kRenderNote();kRender();
});
['kBankroll','kP','kB','kPush','kCap'].forEach(id=>['input','change'].forEach(ev=>$(id).addEventListener(ev,kRender)));
kSetImport();kRender();
