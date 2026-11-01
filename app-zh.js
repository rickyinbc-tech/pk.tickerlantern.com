const $=id=>document.getElementById(id), suits=['♠','♥','♦','♣'], ranks=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
function makeCards(id,count){const container=$(id);for(let i=0;i<count;i++){const s=document.createElement('select');s.className='card-select';s.setAttribute('aria-label',`${id==='hole'?'底牌':'公共牌'} ${i+1}`);s.add(new Option('—',''));for(let suit=0;suit<4;suit++)for(let r=12;r>=0;r--)s.add(new Option(ranks[r]+suits[suit],String(suit*13+r)));s.addEventListener('change',()=>{s.classList.toggle('red',Math.floor(Number(s.value)/13)===1||Math.floor(Number(s.value)/13)===2);updateStreet()});container.appendChild(s)}}
makeCards('hole',2);makeCards('board',5);
function cards(id){return [...$(id).querySelectorAll('select')].map(s=>s.value===''?null:Number(s.value))}
function updateStreet(){let n=cards('board').filter(v=>v!==null).length;$('street').textContent=({0:'翻牌前',3:'翻牌圈',4:'轉牌圈',5:'河牌圈'})[n]||'公共牌未完整'}
function example(){const h=$('hole').querySelectorAll('select');h[0].value='9';h[1].value='22';[...$('board').querySelectorAll('select')].forEach(s=>s.value='');$('position').value='button';$('opponents').value='1';$('bb').value=2;$('stack').value=200;$('pot').value=3;$('call').value=0;document.querySelectorAll('.card-select').forEach(s=>s.dispatchEvent(new Event('change')));$('output').hidden=true;$('empty').hidden=false;$('error').textContent=''}
$('example').addEventListener('click',example);example();
const pct=x=>(x*100).toFixed(1)+'%';const money=x=>Number(x.toFixed(2)).toLocaleString(undefined,{maximumFractionDigits:2});
let worker;
$('calculate').addEventListener('click',()=>{
 const hole=cards('hole'),raw=cards('board'),board=raw.filter(v=>v!==null),bb=+$('bb').value,stack=+$('stack').value,pot=+$('pot').value,call=+$('call').value,opponents=+$('opponents').value;
 const position=$('position').value;
 const fail=msg=>{$('error').textContent=msg};$('error').textContent='';
 if(hole.includes(null))return fail('請選擇兩張底牌。');if(![0,3,4,5].includes(board.length))return fail('公共牌請選擇 0、3、4 或 5 張。');if(new Set([...hole,...board]).size!==2+board.length)return fail('每張牌只可使用一次。');
 if(!Number.isFinite(bb)||bb<=0||!Number.isFinite(stack)||stack<=0||!Number.isFinite(pot)||pot<0||!Number.isFinite(call)||call<0)return fail('大盲注和剩餘籌碼必須大於零；底池和跟注金額不可為負數。');
 if(call>stack)return fail('跟注金額不能超過你的剩餘籌碼，請輸入你的全押金額。');if(call>pot)return fail('目前底池必須包括對手已下注的金額，因此不能少於你需要跟注的金額。');
 $('calculate').disabled=true;$('calculate').firstElementChild.textContent='正在模擬牌局…';if(worker)worker.terminate();worker=new Worker('poker.js');
 worker.onmessage=e=>{ $('calculate').disabled=false;$('calculate').firstElementChild.textContent='分析這手牌';if(e.data.error)return fail(e.data.error);show(e.data.result,{hole,board,bb,stack,pot,call,opponents,position});worker.terminate()};worker.onerror=()=>{$('calculate').disabled=false;$('calculate').firstElementChild.textContent='分析這手牌';fail('無法執行模擬，請再試一次。')};worker.postMessage([hole,board,opponents,10000]);
});
function show(r,x){
 const {equity:e,wins,ties,se,trials}=r,{hole,board,bb,stack,pot,call,opponents,position}=x;const threshold=call?call/(pot+call):0,ceiling=e<1?Math.min(stack,e*pot/(1-e)):stack;const pre=board.length===0;let title,why,size,tech;
 if(call>0){const margin=e-threshold;if(Math.abs(margin)<.03){title='這是一個接近的決定';why='模擬攤牌權益接近即時底池賠率所需門檻。對手範圍或往後下注稍有改變，決策也可能不同。'}else if(margin>0){title='可以考慮跟注';why='對隨機手牌的模擬攤牌權益高於即時底池賠率門檻。若跟注後全押，這個比較最直接。'}else{title='可以考慮棄牌';why='對隨機手牌的模擬攤牌權益低於即時底池賠率門檻。真實對手的手牌範圍可能令差距擴大或收窄。'}
 size=`估計全押跟注上限：${money(ceiling)} 籌碼 · 不超過你的剩餘籌碼`;tech='把跟注成本與對手在這情況下實際會下注的手牌範圍比較。如果之後仍有下注回合，位置、隱含賠率及未來面對下注的機會都很重要；攤牌權益不等於保證能實現的收益。';
 }else if(pre){const pair=hole[0]%13===hole[1]%13,high=Math.max(...hole.map(c=>c%13+2)),strong=(pair&&high>=10)||(high===14&&Math.min(...hole.map(c=>c%13+2))>=9);if(stack/bb<8){title='考慮短碼策略';why='少於 8 個大盲注時，一般加注會用去大量籌碼。棄牌或全押的選擇非常取決於對手及錦標賽情況。';size='單靠籌碼量無法計算適用於所有情況的最大下注額。'}else if(strong){title='可以考慮率先加注';why='這是較強的起手牌。加注可以建立底池，並避免盲位免費看牌；最佳選擇仍取決於之前的行動及對手。';size=`若之前所有人都棄牌：常見的起始加注額是總共 ${money(Math.min(stack,2.5*bb))} 籌碼（2.5 個大盲注），可按牌桌情況調整。`}else{title='考慮你的率先入池範圍';why='位置和後面仍要行動的人數都很重要。單憑對隨機手牌的權益，無法判斷率先入池是否有利可圖。';size=`若選擇率先加注，2 至 3 個大盲注是常見起始範圍：總共 ${money(Math.min(stack,2*bb))}–${money(Math.min(stack,3*bb))} 籌碼，最多不超過你的剩餘籌碼。`}
 tech=position==='button'?'莊位在翻牌後最後行動，因此能掌握更多資訊。你可以比前面位置用較多手牌率先入池，但若後面有進取型對手，應收緊範圍。':'前面位置後面有較多玩家未行動，應採用較緊的範圍。盲位在翻牌後較早行動，實現手牌權益較困難。';
 }else{title='過牌或下注前先想清楚';why='目前毋須跟注。對隨機手牌的權益可幫助了解攤牌強度，但若不知道對手範圍及可能的反應，就無法確定最佳下注額。';size=`半個底池的下注額為 ${money(Math.min(stack,pot*.5))} 籌碼，不超過你的剩餘籌碼。這只是示例，並非最佳上限。`;tech='下注前先想清楚，是希望較差的牌跟注，還是希望較好的牌棄牌。亦要考慮公共牌結構、位置、剩餘籌碼，以及對手範圍與牌面的關係。'}
 $('empty').hidden=true;$('output').hidden=false;$('action').textContent=title;$('reason').textContent=why;$('sizing').textContent=size;$('equity').textContent=pct(e);$('equityNote').textContent=`${trials.toLocaleString()} 次模擬 · 抽樣誤差約 ±${pct(1.96*se)}`;$('winTie').textContent=`${pct(wins)} / ${pct(ties)}`;$('potOdds').textContent=call?pct(threshold):'毋須跟注';$('oddsNote').textContent=call?'全押跟注所需最低權益':'目前沒有需要跟注的金額';
 $('math').textContent=call?`目前底池為 ${money(pot)}，跟注 ${money(call)} 後底池為 ${money(pot+call)}。未計抽水的收支平衡權益為 ${money(call)} ÷ ${money(pot+call)} = ${pct(threshold)}。按模擬權益計算，簡化攤牌跟注期望值為 ${money(e*(pot+call)-call)} 籌碼。`:`目前毋須跟注。當面對下注時，收支平衡權益等於跟注金額除以跟注後的底池。`;
 $('detail').textContent=`對 ${opponents} 位持隨機手牌的對手，模擬中有 ${pct(wins)} 獨贏，${pct(ties)} 平手。權益會計入你在平分底池時所得的份額，所以可能不同於獨贏率加平手率。 ${call?`全押跟注上限 = 權益 × 目前底池 ÷（1 − 權益），並以你的剩餘籌碼為上限；假設底池不變、沒有抽水及沒有後續下注。`:'底池和籌碼以你輸入的相同單位計算。'}`;
 $('technique').textContent=tech;updateStreet();
}

// A result applies only to the exact inputs used in its simulation.
document.querySelectorAll('.setup input, .setup select').forEach(el=>el.addEventListener('change',()=>{if(worker){worker.terminate();worker=null} $('calculate').disabled=false;$('calculate').firstElementChild.textContent='分析這手牌';$('output').hidden=true;$('empty').hidden=false;$('error').textContent=''}));
