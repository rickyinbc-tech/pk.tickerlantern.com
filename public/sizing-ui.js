// Check-versus-bet comparison for both language pages. Context (pot, effective stack, big blind, equity) comes
// from the latest successful hand analysis; every fold frequency and equity in the comparison is the reader's own
// assumption. Changing the hand clears the comparison until the next analysis.
// Modes: none (no analysis yet), ready, stale, facing (bet to call), multiway, preflop.
const SZ={
en:{
 names:{'33':'⅓ pot','50':'½ pot','75':'¾ pot','100':'Pot-size bet',allin:'All-in',custom:'Custom bet',check:'Check'},
 status:{
  none:'Waiting for a hand analysis. It runs automatically once the hand inputs are complete, and this comparison uses its pot, effective stack and equity as context.',
  ready:'Heads-up, after the flop, no bet to call: compare checking with betting when it is your turn and both actions are legal. Every fold and equity number below is your own assumption.',
  stale:'The hand is changing or incomplete, so the previous comparison was cleared. Numbers you typed are kept; synced equity is refilled from the new analysis, which runs automatically.',
  facing:'You are facing a bet, so this first-bet comparison does not apply. Use the call/fold analysis above. Raising is not modelled here.',
  multiway:'With more than one opponent, who folds and who calls interact in ways this simple model cannot represent, so the comparison is heads-up only. The equity and call/fold numbers above still apply.',
  preflop:'Before the flop, blinds, raises and later streets dominate the decision, so this comparison is for the flop, turn or river only.'},
 context:(pot,stack,min,minNote,eq,how,range)=>`Context from the current analysis: pot ${pot} · effective stack ${stack} · minimum bet ${min}${minNote} · showdown equity ${eq} (${how}) against ${range}.`,
 minDefault:' (assumed = 1 big blind)',exact:'exact',sim:'simulated',
 fold:'Assumed fold %',eqCall:'Equity vs caller %',eqCheck:'Equity if you check %',custom:'Custom bet (chips)',minBet:'Minimum bet (chips)',minBetHint:'Blank = 1 big blind. Check your game’s rules.',
 aria:{fold:n=>`Assumed fold percentage for ${n}`,eq:n=>`Your equity against the hands that call ${n}, percent`},
 chips:a=>`${a} chips`,allInTag:'all-in',
 merged:list=>`Also replaces ${list}, which would be at least your stack.`,shortAllIn:min=>`Short all-in: less than the ${min} minimum bet. Whether it reopens the betting depends on your game’s rules.`,
 belowMin:(a,min)=>`${a} is below the ${min} minimum bet, so this size is not available.`,mergedRow:'Same as all-in for this stack (see the all-in option).',
 err:{CUSTOM_POSITIVE:'Enter a custom bet above zero.',CUSTOM_OVER_STACK:s=>`That is more than your ${s} effective stack. The most you can bet is ${s} (all-in).`,CUSTOM_BELOW_MIN:m=>`That is below the ${m} minimum bet. Bet at least ${m}, or all-in if your stack is smaller.`,
  range:'Enter a percentage from 0 to 100.',min:'Enter a minimum bet above zero, or leave it blank for 1 big blind.'},
 incomplete:'Enter both assumptions for this size to compute its EV.',checkIncomplete:'Enter your equity if you check to compare against checking.',
 checkWorked:(e,p,ev)=>`EV(check) = e_check × P = ${e} × ${p} = ${ev}. Assumes both players check to showdown with no more bets.`,
 betWorked:(f,p,f1,e,p2,b,called,ev)=>`EV = F × P + (1 − F) × [e × (P + 2B) − B] = ${f} × ${p} + ${f1} × [${e} × (${p2}) − ${b}] = ${f} × ${p} + ${f1} × ${called} = ${ev}`,
 vsCheck:d=>`vs check: ${d}`,
 be:{always:'Betting matches or beats checking at every fold rate under these equities.',never:'Checking beats betting at every fold rate under these equities.',
  atLeast:f=>`Betting matches or beats checking once the fold rate is at least ${f}.`,atMost:f=>`Betting matches or beats checking only while the fold rate is at most ${f}: you prefer a call.`},
 slope:d=>`Each +10 points of fold rate changes this EV by ${d} chips.`,
 copied:'synced',copiedNote:'Uses your whole-range showdown equity, synced automatically, as the caller equity. Hands that call are usually stronger, so this is probably optimistic. Type your own value to override it.',
 bestOne:(n,ev)=>`Highest modelled EV among the options you completed: ${n} at ${ev} chips.`,bestTie:(list,ev)=>`Tied highest modelled EV among the options you completed: ${list} at ${ev} chips.`,
 bestCaveat:'That is only the best of these tested options under your assumptions—not an optimal bet, and not a prediction of what will happen.',
 noneComplete:'No bet size has complete assumptions yet: enter a fold rate and caller equity for at least one size to compare it with checking.',excluded:list=>`Not compared (missing or invalid assumptions): ${list}.`,
 robust:(lo,hi)=>`Sensitivity: with every fold assumption 10 points lower, the highest would be ${lo}; 10 points higher, ${hi}.`,
 rakeNote:'Rake is entered above but is not applied here; actual rake may lower these EVs.',
},
zh:{
 names:{'33':'三分一底池','50':'半個底池','75':'四分三底池','100':'一個底池','allin':'全押',custom:'自訂下注',check:'過牌'},
 status:{
  none:'等待牌局分析。資料完整後會自動分析，而這個比較會以分析的底池、有效籌碼及權益作為背景。',
  ready:'單挑、翻牌後、沒有需要跟注的注碼：輪到你行動且過牌和下注均合法時，可以比較兩者。下面所有棄牌率及權益數字都是你自己的假設。',
  stale:'牌局資料正在改變或未完整，所以之前的比較已清除。你輸入的數字會保留；同步的權益會在新的分析（自動進行）完成後重新填上。',
  facing:'你正面對下注，所以這個率先下注的比較並不適用。請使用上面的跟注／棄牌分析。這裏沒有計算加注。',
  multiway:'對手多於一位時，誰棄牌、誰跟注會互相影響，這個簡單模型無法表示，所以比較只適用於單挑。上面的權益及跟注／棄牌數字仍然適用。',
  preflop:'翻牌前的決策主要取決於盲注、加注及之後的回合，所以這個比較只適用於翻牌、轉牌或河牌。'},
 context:(pot,stack,min,minNote,eq,how,range)=>`來自目前分析的背景：底池 ${pot} · 有效籌碼 ${stack} · 最低下注 ${min}${minNote} · 對${range}的攤牌權益 ${eq}（${how}）。`,
 minDefault:'（假設 = 1 個大盲注）',exact:'精確計算',sim:'模擬',
 fold:'假設棄牌率 %',eqCall:'對跟注者的權益 %',eqCheck:'過牌時的權益 %',custom:'自訂下注額（籌碼）',minBet:'最低下注額（籌碼）',minBetHint:'留空 = 1 個大盲注。請查閱你所玩牌局的規則。',
 aria:{fold:n=>`${n}的假設棄牌率（百分比）`,eq:n=>`你對會跟注${n}的手牌的權益（百分比）`},
 chips:a=>`${a} 籌碼`,allInTag:'全押',
 merged:list=>`亦取代 ${list}，因為這些下注額已等於或超過你的籌碼。`,shortAllIn:min=>`短碼全押：少於最低下注額 ${min}。它是否重新開放下注，取決於你所玩牌局的規則。`,
 belowMin:(a,min)=>`${a} 少於最低下注額 ${min}，所以不能下這個注碼。`,mergedRow:'以這個籌碼量而言與全押相同（見全押選項）。',
 err:{CUSTOM_POSITIVE:'請輸入大於零的自訂下注額。',CUSTOM_OVER_STACK:s=>`這超過你的有效籌碼 ${s}。你最多可以下注 ${s}（全押）。`,CUSTOM_BELOW_MIN:m=>`這少於最低下注額 ${m}。請最少下注 ${m}；如果籌碼更少，則只能全押。`,
  range:'請輸入 0 至 100 的百分比。',min:'最低下注額必須大於零，或留空代表 1 個大盲注。'},
 incomplete:'請為這個注碼輸入兩項假設，才能計算期望值。',checkIncomplete:'請輸入過牌時的權益，才能與過牌比較。',
 checkWorked:(e,p,ev)=>`EV(過牌) = e_過牌 × P = ${e} × ${p} = ${ev}。假設雙方都過牌直到攤牌，之後沒有再下注。`,
 betWorked:(f,p,f1,e,p2,b,called,ev)=>`EV = F × P + (1 − F) × [e × (P + 2B) − B] = ${f} × ${p} + ${f1} × [${e} × (${p2}) − ${b}] = ${f} × ${p} + ${f1} × ${called} = ${ev}`,
 vsCheck:d=>`與過牌比較：${d}`,
 be:{always:'以這些權益計，任何棄牌率下下注都不遜於過牌。',never:'以這些權益計，任何棄牌率下過牌都勝過下注。',
  atLeast:f=>`棄牌率最少達到 ${f} 時，下注才不遜於過牌。`,atMost:f=>`只有棄牌率不超過 ${f} 時，下注才不遜於過牌：你較希望被跟注。`},
 slope:d=>`棄牌率每增加 10 個百分點，這個期望值改變 ${d} 籌碼。`,
 copied:'同步',copiedNote:'以自動同步的整體攤牌權益作為對跟注者的權益。會跟注的手牌通常較強，所以這可能過於樂觀。輸入你自己的數值即可取代。',
 bestOne:(n,ev)=>`在你已填妥的選項中，模型期望值最高的是：${n}，${ev} 籌碼。`,bestTie:(list,ev)=>`在你已填妥的選項中，模型期望值並列最高的是：${list}，${ev} 籌碼。`,
 bestCaveat:'這只是在你的假設下，這些已測試選項中最好的一個——並非最佳下注，亦不是對結果的預測。',
 noneComplete:'目前沒有任何下注額的假設已填妥：請至少為一個下注額輸入棄牌率及對跟注者的權益，才能與過牌比較。',excluded:list=>`未作比較（假設缺失或無效）：${list}。`,
 robust:(lo,hi)=>`敏感度：若所有棄牌率假設低 10 個百分點，最高的會是${lo}；高 10 個百分點，則是${hi}。`,
 rakeNote:'上面已輸入抽水，但這裏沒有計算；實際抽水可能令這些期望值降低。',
}}[LANG];

const SZ_KEYS=['33','50','75','100','allin','custom'];
let szMode='none',szCtx=null;
const szMoney=x=>Number(x.toPrecision(12)).toLocaleString(TEXT.locale,{maximumFractionDigits:8});
const szSigned=x=>(x>=0?'+':'−')+szMoney(Math.abs(x));
const szFix=x=>String(Number(x.toPrecision(10)));
const szSep=TEXT.sep,szJoin=a=>a.join(LANG==='zh'?'、':', ');
// Read a percentage field: blank → null, invalid → NaN, otherwise a probability 0–1.
function szPct(id){const v=$(id).value.trim();if(v==='')return null;const n=Number(v);return Number.isFinite(n)&&n>=0&&n<=100?n/100:NaN}

/* ---------- Build the option cards once ---------- */
function szBuild(){
 const wrap=$('szCards');
 const card=(key)=>{
  const fs=document.createElement('fieldset');fs.className='sz-card';fs.dataset.key=key;
  const lg=document.createElement('legend');lg.innerHTML='<span class="sz-name"></span> <span class="sz-amt"></span>';lg.querySelector('.sz-name').textContent=SZ.names[key];fs.appendChild(lg);
  const inputs=document.createElement('div');inputs.className='sz-inputs';
  const field=(id,label,aria)=>{const l=document.createElement('label');l.textContent=label;const tag=document.createElement('span');tag.className='src';tag.hidden=true;tag.textContent=SZ.copied;l.appendChild(tag);
   const i=document.createElement('input');i.id=id;i.type='number';i.min='0';i.step='any';i.inputMode='decimal';if(aria)i.setAttribute('aria-label',aria);l.appendChild(i);inputs.appendChild(l);return i};
  if(key==='check'){field('szEqCheck',SZ.eqCheck).max='100'}
  else{if(key==='custom')field('szCustom',SZ.custom);field('szF-'+key,SZ.fold,SZ.aria.fold(SZ.names[key])).max='100';field('szE-'+key,SZ.eqCall,SZ.aria.eq(SZ.names[key])).max='100'}
  fs.appendChild(inputs);
  const note=document.createElement('p');note.className='sz-note';note.hidden=true;fs.appendChild(note);
  const out=document.createElement('div');out.className='sz-out';fs.appendChild(out);
  wrap.appendChild(fs);
 };
 card('check');SZ_KEYS.forEach(card);
 // Anything the reader types (even clearing a field) belongs to the reader from then on.
 wrap.querySelectorAll('input').forEach(i=>i.addEventListener('input',()=>{szSetOrigin(i,'user');szRender()}));
}
function szSetOrigin(input,origin){if(origin)input.dataset.origin=origin;else delete input.dataset.origin;const tag=input.parentElement.querySelector('.src');if(tag)tag.hidden=origin!=='auto'}
// Synced starting assumption: fill an equity field the reader has not taken over with the current whole-range equity.
function szAutoFill(input,usable){if(input.dataset.origin==='user')return;if(usable&&$('szAuto').checked&&szCtx){input.value=String(Number((szCtx.equity*100).toFixed(1)));szSetOrigin(input,'auto')}else if(input.dataset.origin==='auto'){input.value='';szSetOrigin(input,null)}}
const szCard=key=>$('szCards').querySelector(`.sz-card[data-key="${key}"]`);

/* ---------- Rendering ---------- */
function szContext(){
 const minText=$('szMin').value.trim(),min=minText===''?szCtx.bb:Number(minText);
 return {pot:szCtx.pot,stack:szCtx.stack,minBet:min,minDefault:minText==='',minValid:min>0&&Number.isFinite(min)};
}
function szRender(){
 const status=$('szStatus');status.textContent=SZ.status[szMode];status.dataset.mode=szMode;
 $('szBody').hidden=szMode!=='ready';if(szMode!=='ready')return;
 const c=szContext(),errs=[];
 $('szMinError').textContent=c.minValid?'':SZ.err.min;
 $('szContext').textContent=SZ.context(szMoney(c.pot),szMoney(c.stack),c.minValid?szMoney(c.minBet):'—',c.minDefault?SZ.minDefault:'',pct(szCtx.equity),szCtx.exact?SZ.exact:SZ.sim,TEXT.rangeName(szCtx.range));
 $('szRake').hidden=!(szCtx.rake>0);
 if(!c.minValid){SZ_KEYS.concat('check').forEach(k=>{szCard(k).querySelector('.sz-out').textContent=''});$('szResult').textContent='';return}
 szAutoFill($('szEqCheck'),true);
 const cand=Sizing.candidates(c).rows,options=[],labels={};
 for(const k of SZ_KEYS){
  const el=szCard(k),amt=el.querySelector('.sz-amt'),note=el.querySelector('.sz-note'),out=el.querySelector('.sz-out'),inputs=el.querySelectorAll('input:not(#szCustom)');
  let row=k==='custom'?null:cand.find(r=>r.key===k),bet=null,notes=[],blocked='';
  if(k==='custom'){
   const raw=$('szCustom').value.trim();
   if(raw===''){amt.textContent='';blocked=' '}
   else{const cb=Sizing.customBet(Number(raw),c);if(cb.error){const m=SZ.err[cb.error];blocked=typeof m==='function'?m(szMoney(cb.error==='CUSTOM_BELOW_MIN'?c.minBet:c.stack)):m;amt.textContent=''}
    else{bet=cb.bet;amt.textContent=SZ.chips(szMoney(bet))+(cb.allIn?` · ${SZ.allInTag}`:'');if(cb.shortAllIn)notes.push(SZ.shortAllIn(szMoney(c.minBet)))}}
  }else if(row.status==='merged'){amt.textContent='';blocked=SZ.mergedRow}
  else if(row.status==='belowMin'){amt.textContent=SZ.chips(szMoney(row.bet));blocked=SZ.belowMin(szMoney(row.bet),szMoney(c.minBet))}
  else{bet=row.bet;amt.textContent=SZ.chips(szMoney(bet))+(row.allIn?` · ${SZ.allInTag}`:'');
   if(row.mergedFrom&&row.mergedFrom.length)notes.push(SZ.merged(szJoin(row.mergedFrom.map(m=>SZ.names[m]))));
   if(row.shortAllIn)notes.push(SZ.shortAllIn(szMoney(c.minBet)))}
  el.classList.toggle('blocked',!!blocked.trim());inputs.forEach(i=>i.disabled=!!blocked.trim());szAutoFill($('szE-'+k),bet!==null&&!blocked.trim());
  note.hidden=!(notes.length||blocked.trim());note.textContent=blocked.trim()?blocked:notes.join(szSep);
  out.textContent='';labels[k]=SZ.names[k]+(bet!==null?` (${szMoney(bet)})`:'');
  if(bet!==null)options.push({key:k,bet,fold:szPct('szF-'+k),eqCall:szPct('szE-'+k)});
 }
 // Invalid percentages are reported on the card and left out of the comparison.
 const clean=options.map(o=>({...o,bad:Number.isNaN(o.fold)||Number.isNaN(o.eqCall),fold:o.fold===null?NaN:o.fold,eqCall:o.eqCall===null?NaN:o.eqCall}));
 const eqCheck=szPct('szEqCheck'),res=Sizing.compare({pot:c.pot,eqCheck:eqCheck===null?NaN:eqCheck,options:clean.map(o=>o.bad?{...o,fold:NaN}:o)});
 const checkOut=szCard('check').querySelector('.sz-out');
 if(Number.isNaN(eqCheck))checkOut.textContent=SZ.err.range;
 else if(eqCheck===null)checkOut.textContent=SZ.checkIncomplete;
 else checkOut.textContent=SZ.checkWorked(szFix(eqCheck),szMoney(c.pot),szSigned(res.check));
 for(const r of res.rows){
  const out=szCard(r.key).querySelector('.sz-out'),o=clean.find(x=>x.key===r.key),lines=[];
  if(o.bad){out.textContent=SZ.err.range;continue}
  if(!r.complete){out.textContent=SZ.incomplete;continue}
  const called=Sizing.calledEV(c.pot,r.bet,r.eqCall);
  lines.push(SZ.betWorked(szFix(r.fold),szMoney(c.pot),szFix(1-r.fold),szFix(r.eqCall),`${szMoney(c.pot)} + 2 × ${szMoney(r.bet)}`,szMoney(r.bet),szSigned(called),szSigned(r.ev)));
  if(Number.isFinite(r.vsCheck)){lines.push(SZ.vsCheck(szSigned(r.vsCheck)));const be=r.breakEven;lines.push(be.kind==='atLeast'||be.kind==='atMost'?SZ.be[be.kind](pct(be.fold)):SZ.be[be.kind])}
  lines.push(SZ.slope(szSigned(r.slope)));
  if($('szE-'+r.key).dataset.origin==='auto')lines.push(SZ.copiedNote);
  out.replaceChildren(...lines.map((t,i)=>{const p=document.createElement('p');p.textContent=t;if(i===0)p.className='formula';return p}));
 }
 // Summary: best among completed options only, plus how the answer moves if every fold guess shifts by 10 points.
 const name=k=>k==='check'?SZ.names.check:labels[k];
 const summary=[];
 if(!res.rows.some(r=>r.complete))summary.push(SZ.noneComplete);// checking alone is not a comparison
 else{summary.push(res.best.length===1?SZ.bestOne(name(res.best[0]),szSigned(res.top)):SZ.bestTie(szJoin(res.best.map(name)),szSigned(res.top)),SZ.bestCaveat);
  const shifted=d=>{const s=Sizing.compare({pot:c.pot,eqCheck:eqCheck===null?NaN:eqCheck,options:clean.filter(o=>!o.bad).map(o=>({...o,fold:Number.isFinite(o.fold)?Math.min(1,Math.max(0,o.fold+d)):NaN}))});return szJoin(s.best.map(name))};
  if(res.rows.some(r=>r.complete))summary.push(SZ.robust(shifted(-.1),shifted(.1)))}
 const missing=[...(eqCheck===null||Number.isNaN(eqCheck)?['check']:[]),...clean.filter(o=>o.bad||!Number.isFinite(o.fold)||!Number.isFinite(o.eqCall)).map(o=>o.key)];
 if(missing.length&&res.best.length)summary.push(SZ.excluded(szJoin(missing.map(name))));
 $('szResult').replaceChildren(...summary.map(t=>{const p=document.createElement('p');p.textContent=t;return p}));
}
function szSetMode(mode){szMode=mode;szRender()}

/* ---------- Sync with the hand analysis ---------- */
const szSection=()=>$('bet-comparison');
function szPending(on){szSection().classList.toggle('pending',on);szSection().setAttribute('aria-busy',on?'true':'false')}
document.addEventListener('pokerlantern:pending',()=>szPending(true));
document.addEventListener('pokerlantern:result',e=>{
 const {r,x}=e.detail;szPending(false);szCtx={pot:x.pot,stack:x.stack,bb:x.bb,range:x.range,rake:x.rake,equity:r.equity,exact:r.exact};
 szSetMode(x.call>0?'facing':x.opponents>1?'multiway':x.board.length<3?'preflop':'ready');// synced equity fields refresh during render
});
document.addEventListener('pokerlantern:invalidate',()=>{
 szPending(false);
 // Synced equity belongs to the analysis that produced it: clear it now; it is refilled from the next analysis.
 $('szCards').querySelectorAll('input[data-origin="auto"]').forEach(i=>{i.value=''});
 if(szMode==='none'||szMode==='stale')return;szCtx=null;szSetMode('stale');
});
$('szAuto').addEventListener('change',()=>{if(!$('szAuto').checked)$('szCards').querySelectorAll('input[data-origin="auto"]').forEach(i=>{i.value='';szSetOrigin(i,null)});szRender()});
$('szMin').addEventListener('input',szRender);
// Used by language.js: carry the reader's own entries and the sync choice; synced equities come from the next analysis.
window.SizingSync={
 snapshot:()=>{const values={},user=[];document.querySelectorAll('#szMin,#szCards input').forEach(i=>{if(i.dataset.origin!=='auto')values[i.id]=i.value;if(i.dataset.origin==='user')user.push(i.id)});return {values,user,auto:$('szAuto').checked}},
 restore(v){if(!v)return;const values=v.values||v;for(const [id,val] of Object.entries(values)){const i=document.getElementById(id);if(i){i.value=val;szSetOrigin(i,(v.user||[]).includes(id)?'user':null)}}if(v.auto!==undefined)$('szAuto').checked=v.auto;szSetMode('none')},
};
szBuild();szSetMode('none');
