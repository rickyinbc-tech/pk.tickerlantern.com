// Shared calculator logic for index.html (English) and zh.html (Traditional Chinese). Visible text lives in TEXT.
const $=id=>document.getElementById(id),P=window.PokerLantern,LANG=document.documentElement.lang.startsWith('zh')?'zh':'en';
const SUITS=['♠','♥','♦','♣'],RANK_LABELS=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
// Rough opening widths (% of combinations) for a 6-handed 100bb cash game when everyone before you folded. Rules of thumb, not solver output.
const OPEN_WIDTH={early:15,middle:20,cutoff:27,button:43,small:40};
const LATE=new Set(['cutoff','button','small']);

const TEXT={
en:{
 locale:'en-US',sep:' ',holeLabel:i=>`Hole card ${i}`,boardLabel:i=>`Community card ${i}`,
 streets:{0:'Preflop',3:'Flop',4:'Turn',5:'River'},incomplete:'Incomplete board',
 analyze:'Analyze this hand',running:p=>`Calculating… ${Math.round(p*100)}%`,exactTag:'EXACT',simTag:'SIMULATION',
 err:{hole:'Choose both hole cards.',board:'Choose no community cards, or exactly 3, 4, or 5.',dup:'Each card can only be used once.',
  numbers:'Enter a positive big blind, effective stack and pot, and a non-negative call amount.',
  stack:'The amount to call cannot exceed your effective stack. If the bet is larger, enter the all-in amount you would actually call.',
  pot:'The current pot must include the outstanding bet, so it cannot be less than the amount to call.',
  rake:'Rake must be between 0% and 25%, and the cap cannot be negative.',range:'Enter an opponent range between 0.5% and 100%.',
  impossible:'Could not deal this range to all opponents with the cards shown. The range may be too narrow; widen it or reduce the number of opponents.',
  sim:'The calculation could not run. Please try again.',
  parse:t=>`“${t}” is not a card. Use rank + suit, e.g. As, Td, 10h or 7♣.`,count:(n,max)=>`Enter at most ${max} cards here (found ${n}).`},
 cats:['High card','One pair','Two pair','Three of a kind','Straight','Flush','Full house','Four of a kind','Straight flush'],
 rangeAll:'Any two cards: all 1,326 starting combinations are treated as equally likely.',
 rangeTop:(pct,r)=>`Top ${pct}% → ${r.classes.length} hand types, ${r.combos} of 1,326 combinations (${(r.share*100).toFixed(1)}%). Weakest included: ${r.classes[r.classes.length-1]}. Ordered by all-in equity against a random hand.`,
 rangeName:pct=>pct>=100?'random hands':`a top-${pct}% range`,
 heroRank:(k,p)=>`${k} is in the top ${p} of starting combinations by all-in equity against a random hand.`,
 nowHave:c=>`Right now you have: ${c}.`,
 methodExact:n=>`Exact: all ${n.toLocaleString('en-US')} matchups`,methodSim:(n,moe)=>`${n.toLocaleString('en-US')} simulations · approx. ±${moe} (95%)`,
 required:'Break-even equity',requiredNote:r=>r?'Price of the call, after rake':'Price of the call',fair:'Fair share',fairNote:n=>`1 ÷ ${n+1} players`,
 distTitle:(exact,river)=>river?'Your final hand':exact?'How your hand finishes (exact)':'How your hand finishes (estimate)',
 distNote:'How often you end with each hand type by the river. This is not how often you win: a flush can still lose.',
 call:{
  good:'Calling meets the price',bad:'The price is high for this range',close:'A close call',
  goodAllIn:'Your equity against the assumed range is above the break-even line, and calling puts you all-in, so no later bet can push you off the hand. The result is only as good as the range you entered.',
  goodNot:'Your showdown equity is above the break-even line, but you are not all-in. Later bets can force you to fold before showdown, so you may realize less than this equity—especially out of position or with a hand that rarely improves.',
  badAllIn:'Your equity against the assumed range is below the break-even line. If you believe the opponent is betting a wider range than you entered, widen it and recalculate before deciding.',
  badNot:(x,ok)=>`Your equity is below the immediate price. Calling anyway needs implied odds: in the hands you go on to win, you would need to collect about ${x} more chips on later streets${ok?'':'—more than you have left behind'}, while losing nothing extra in the hands you lose. Real hands rarely meet both conditions.`,
  badZero:'You cannot win at showdown against this range on these cards, so no price makes a showdown call profitable.',
  badSample:'No share of the pot appeared in this sample. This does not prove the true chance is zero; increase precision or reconsider the range.',
  close:'Your equity is within about 2 percentage points (plus sampling error) of break-even. Small changes in the opponent’s range, rake or later betting can flip this decision.',
  ev:(ev,bb)=>`Showdown value of calling: ${ev} chips (${bb} big blinds), if the hand were checked down from here.`,
  tech:'Ask which hands would really bet this way. Against a value-heavy range, narrow the range and recalculate; against frequent bluffs, widen it. Without being all-in, position and the chance of facing more bets matter as much as raw equity.',
  techPre:'Against a preflop raise, “random hands” overstates your equity: raisers usually hold stronger hands. Set the range to something like the top 10–25% to test the call.',
  math:(c,p,f,rk,net,req,ev)=>`Calling ${c} into a pot of ${p} makes a ${f} pot${rk?`; after ${rk} rake you would win ${net}`:''}. Break-even equity = ${c} ÷ ${net} = ${req}. Expected showdown value = equity × ${net} − ${c} = ${ev} chips.`,
 },
 pre:{
  bigTitle:'You can check your option',bigWhy:'No one has raised, so the big blind can see the flop for free. Raising is mainly for hands near the top of your range or to punish weak limps.',
  bigSize:(a,b)=>`If you raise over limpers, about 3–4 big blinds plus 1 per limper is common: ${a}–${b} chips before limpers are added.`,
  shortTitle:'Short stack: all-in or fold',shortWhy:bb=>`With about ${bb} big blinds, a normal raise commits much of your stack, so players often simplify to moving all-in or folding. Profit depends on how often opponents fold and what they call with; the equity above is what you have if called by the range you entered.`,
  shortSize:(c,bb)=>`An all-in would be ${c} chips (${bb} big blinds). No universal shove limit follows from stack size alone.`,
  inTitle:'Usually an open from this seat',borderTitle:'A borderline open',outTitle:'Usually a fold if no one has entered',
  inWhy:(p,w)=>`Your hand ranks around the top ${p} of combinations; a common opening width from this seat is about ${w}%. The best play still depends on the players behind you.`,
  borderWhy:(p,w,spec)=>`Your hand ranks around the top ${p}, just outside a common width of about ${w}% from this seat.${spec?' Pairs and suited connected hands play better than this raw ranking suggests, because they can make sets, straights and flushes.':''} Open more often against passive blinds; fold more against aggressive ones.`,
  outWhy:(p,w)=>`Your hand ranks around the top ${p}, well outside a common opening width of about ${w}% from this seat. Folding is the usual choice when no one has entered the pot.`,
  openSize:(lo,mid,hi,sb)=>sb?`From the small blind, about 3 big blinds is common: ${mid} chips (range ${lo}–${hi}). Add about 1 big blind per limper.`:`If everyone has folded to you: about 2.5 big blinds = ${mid} chips (common range ${lo}–${hi}). Add about 1 big blind per limper.`,
  tech:{button:'The button acts last on every later street, so it can open the widest range. Tighten up if the blinds re-raise often.',
   cutoff:'The cutoff can open fairly wide, but the button still acts after you; prefer hands that play well in position.',
   middle:'With several players still to act, keep the range moderate and favour high cards and pairs.',
   early:'Many players remain behind you, so the chance someone holds a strong hand is high. Use your tightest range.',
   small:'The small blind is out of position after the flop against the big blind; many players raise or fold rather than just completing.',
   big:'The big blind closes the preflop action and already has a blind in the pot, so it can defend many hands—but it plays out of position after the flop.'},
  widthNote:'Opening widths are rough rules of thumb for a 6-handed 100bb cash game, not a solver chart. Full-ring tables, antes, tournaments and opponents change them.',
 },
 post:{
  strongTitle:'Strong against this range: consider value',midTitle:'Mixed equity: plan before betting',weakTitle:'Behind most of this range',
  strongWhy:'You are well ahead of the assumed range as a whole. A bet makes sense when enough worse hands will call; if only better hands continue, betting gains little.',
  midWhy:'You beat part of the range and lose to part of it. A bet tends to fold out worse hands and get called by better ones, so checking to control the pot is often reasonable—position and board texture decide.',
  weakWhy:'Most of the assumed range is ahead of you. Checking is the default; a bet works only as a bluff if the fold frequency below is realistic for this opponent.',
  sizeHead:['Bet','Chips','Bluff needs folds','Caller needs equity'],pot:p=>`${p}% pot`,allIn:'all-in',
  math:'A pure bluff of B into pot P risks B to win P, so it breaks even when the opponent folds more than B ÷ (P + B). An opponent facing that bet needs B ÷ (P + 2B) equity to call. Larger bets need more folds but give callers a worse price.',
  multi:' With several opponents, the fold percentage is how often all of them must fold together, which is much harder to achieve.',
  tech:'Before betting, name the worse hands you expect to call and the better hands you expect to fold. If you cannot name either, checking is often the simpler choice.',
  techRiver:'On the river no more cards come: your equity against the hands that call is all that matters for a value bet.',
 },
 detail:(n,name,w,t,f)=>`Against ${n} ${n===1?'opponent':'opponents'} holding ${name}, you won ${w} outright and tied ${t}. Equity counts your share of split pots, so it can differ from win plus tie. With ${n+1} players, an equal share would be ${f}.`,
 rangeCaveat:'The range model gives every opponent the same preflop top-X% range and does not narrow it for postflop betting; players who keep betting usually hold hands that connect with the board. Multiway range deals are sampled sequentially, which can introduce bias.',
},
zh:{
 locale:'zh-HK',sep:'',holeLabel:i=>`底牌 ${i}`,boardLabel:i=>`公共牌 ${i}`,
 streets:{0:'翻牌前',3:'翻牌圈',4:'轉牌圈',5:'河牌圈'},incomplete:'公共牌未完整',
 analyze:'分析這手牌',running:p=>`計算中… ${Math.round(p*100)}%`,exactTag:'精確計算',simTag:'模擬結果',
 err:{hole:'請選擇兩張底牌。',board:'公共牌請選擇 0、3、4 或 5 張。',dup:'每張牌只可使用一次。',
  numbers:'大盲注、有效籌碼及底池必須大於零；跟注金額不可為負數。',
  stack:'跟注金額不能超過你的有效籌碼。如果對手下注更多，請輸入你實際能全押跟注的金額。',
  pot:'目前底池必須包括對手已下注的金額，因此不能少於你需要跟注的金額。',
  rake:'抽水比率須介乎 0% 至 25%，抽水上限不可為負數。',range:'對手範圍請輸入 0.5% 至 100%。',
  impossible:'無法以目前已知的牌，向所有對手派發此範圍的手牌。範圍可能太窄；請放寬範圍或減少對手人數。',
  sim:'無法執行計算，請再試一次。',
  parse:t=>`「${t}」不是有效的牌。請以點數加花色輸入，例如 As、Td、10h 或 7♣。`,count:(n,max)=>`這裏最多輸入 ${max} 張牌（現有 ${n} 張）。`},
 cats:['高牌','一對','兩對','三條','順子','同花','葫蘆','四條','同花順'],
 rangeAll:'任何兩張牌：全部 1,326 種起手組合的機會均等。',
 rangeTop:(pct,r)=>`前 ${pct}% → ${r.classes.length} 種手牌類型，共 ${r.combos} / 1,326 個組合（${(r.share*100).toFixed(1)}%）。包括的最弱手牌：${r.classes[r.classes.length-1]}。按對隨機手牌的全押權益排序。`,
 rangeName:pct=>pct>=100?'隨機手牌':`前 ${pct}% 範圍內手牌`,
 heroRank:(k,p)=>`按對隨機手牌的全押權益排序，${k} 屬於起手組合的前 ${p}。`,
 nowHave:c=>`你目前的牌型：${c}。`,
 methodExact:n=>`精確計算：全部 ${n.toLocaleString('zh-HK')} 個對局`,methodSim:(n,moe)=>`${n.toLocaleString('zh-HK')} 次模擬 · 誤差約 ±${moe}（95%）`,
 required:'收支平衡權益',requiredNote:r=>r?'跟注價錢（已計抽水）':'跟注價錢',fair:'平均份額',fairNote:n=>`1 ÷ ${n+1} 位玩家`,
 distTitle:(exact,river)=>river?'你的最終牌型':exact?'最終牌型分佈（精確）':'最終牌型分佈（估算）',
 distNote:'到河牌時得到各種牌型的機會，並不等於勝率：同花也可能輸。',
 call:{
  good:'跟注價錢合理',bad:'以這個範圍計，跟注價錢偏高',close:'這是一個接近的決定',
  goodAllIn:'你對假設範圍的權益高於收支平衡線，而且跟注後已全押，之後的下注不能逼你棄牌。結果是否可靠，取決於你輸入的範圍是否貼近真實對手。',
  goodNot:'你的攤牌權益高於收支平衡線，但你未全押。之後的下注可能迫你在攤牌前棄牌，所以實際能實現的權益可能較低，尤其是不利位置或難以改進的手牌。',
  badAllIn:'你對假設範圍的權益低於收支平衡線。如果你認為對手的下注範圍比輸入的更寬，請放寬範圍再計算一次。',
  badNot:(x,ok)=>`你的權益低於即時跟注價錢。若仍要跟注，便需要隱含賠率：在你最終贏的牌局中，之後的回合平均要多贏約 ${x} 籌碼${ok?'':'，這已超過你餘下的籌碼'}，而在你輸的牌局中不能再多輸。實戰中很少同時符合這兩個條件。`,
  badZero:'以目前的牌，你對這個範圍在攤牌時不可能贏，所以任何價錢的攤牌跟注都無利可圖。',
  badSample:'這次模擬沒有出現你分得底池的情況，但不代表真實機率一定是零；請提高模擬精確度或重新考慮對手範圍。',
  close:'你的權益與收支平衡線相差約 2 個百分點以內（另加抽樣誤差）。對手範圍、抽水或之後的下注稍有改變，決定都可能不同。',
  ev:(ev,bb)=>`跟注的攤牌價值：${ev} 籌碼（${bb} 個大盲注），假設之後無人再下注直到攤牌。`,
  tech:'先問自己：對手實際會用哪些手牌這樣下注？若對手多數是價值下注，請收緊範圍再計算；若對手經常詐唬，則放寬範圍。未全押時，位置及之後再面對下注的機會，與原始權益同樣重要。',
  techPre:'面對翻牌前加注時，「隨機手牌」會高估你的權益，因為加注者通常持較強的牌。可把範圍設為前 10–25% 左右再測試跟注。',
  math:(c,p,f,rk,net,req,ev)=>`在 ${p} 的底池跟注 ${c}，底池變成 ${f}${rk?`；扣除 ${rk} 抽水後你可贏 ${net}`:''}。收支平衡權益 = ${c} ÷ ${net} = ${req}。攤牌期望值 = 權益 × ${net} − ${c} = ${ev} 籌碼。`,
 },
 pre:{
  bigTitle:'你可以過牌看翻牌',bigWhy:'沒有人加注，大盲位可以免費看翻牌。加注主要用於範圍中較強的手牌，或懲罰較弱的平跟。',
  bigSize:(a,b)=>`若要在平跟玩家之後加注，常見做法是 3–4 個大盲注，每多一位平跟者再加 1 個大盲注：未計平跟者為 ${a}–${b} 籌碼。`,
  shortTitle:'短碼：全押或棄牌',shortWhy:bb=>`只有約 ${bb} 個大盲注時，一般加注已投入大量籌碼，所以玩家通常簡化為全押或棄牌。是否有利可圖，取決於對手棄牌的頻率及跟注的手牌；上面的權益是被你輸入的範圍跟注時的權益。`,
  shortSize:(c,bb)=>`全押金額為 ${c} 籌碼（${bb} 個大盲注）。單靠籌碼量無法得出適用於所有情況的全押上限。`,
  inTitle:'這個位置通常會率先加注',borderTitle:'邊緣的率先加注',outTitle:'若無人入池，通常會棄牌',
  inWhy:(p,w)=>`你的手牌約屬於所有組合的前 ${p}；這個位置常見的率先加注範圍約為 ${w}%。最佳打法仍取決於後面的玩家。`,
  borderWhy:(p,w,spec)=>`你的手牌約屬於前 ${p}，略超出這個位置約 ${w}% 的常見範圍。${spec?'對子及同花連張的實際價值高於這個排名，因為它們可以組成三條、順子及同花。':''}對手被動時可多加注，對手進取時應多棄牌。`,
  outWhy:(p,w)=>`你的手牌約屬於前 ${p}，遠超出這個位置約 ${w}% 的常見率先加注範圍。若無人入池，通常會選擇棄牌。`,
  openSize:(lo,mid,hi,sb)=>sb?`在小盲位常見加注約 3 個大盲注：${mid} 籌碼（範圍 ${lo}–${hi}）。每多一位平跟者約加 1 個大盲注。`:`若前面所有人都棄牌：約 2.5 個大盲注 = ${mid} 籌碼（常見範圍 ${lo}–${hi}）。每多一位平跟者約加 1 個大盲注。`,
  tech:{button:'莊位在之後每條街都最後行動，所以可以用最寬的範圍率先加注。若盲位經常再加注，應收緊範圍。',
   cutoff:'莊位右手邊（Cutoff）可以用較寬的範圍，但莊位仍在你之後行動；宜選擇有位置時容易打的手牌。',
   middle:'後面仍有多位玩家未行動，範圍宜適中，並偏重高牌和對子。',
   early:'後面還有很多玩家，有人持強牌的機會較高，應使用最緊的範圍。',
   small:'翻牌後小盲位對大盲位處於不利位置；很多玩家會選擇加注或棄牌，而不是只補齊盲注。',
   big:'大盲位在翻牌前最後行動，並已投入盲注，所以可以防守較多手牌，但翻牌後處於不利位置。'},
  widthNote:'率先加注範圍只是 6 人桌、100 個大盲注現金局的粗略經驗法則，並非求解器圖表。9 人桌、前注、錦標賽及對手類型都會改變它。',
 },
 post:{
  strongTitle:'對這個範圍佔優：考慮價值下注',midTitle:'權益參半：下注前先計劃',weakTitle:'落後於大部分範圍',
  strongWhy:'整體而言，你明顯領先假設範圍。若有足夠較差的手牌會跟注，下注便合理；若只有較強的手牌會繼續，下注的得益不大。',
  midWhy:'你贏範圍中的一部分，也輸給另一部分。下注往往令較差的手牌棄牌、較強的手牌跟注，所以過牌控制底池通常合理；位置和牌面結構是關鍵。',
  weakWhy:'假設範圍中大部分手牌領先你。預設做法是過牌；下注只有在下表的棄牌頻率對這位對手切實可行時，才可作為詐唬。',
  sizeHead:['下注','籌碼','詐唬所需棄牌率','跟注者所需權益'],pot:p=>`${p}% 底池`,allIn:'全押',
  math:'在底池 P 下注 B 純詐唬，是冒 B 的風險去贏 P，所以對手棄牌率高於 B ÷ (P + B) 便能打和。面對這注的對手需要 B ÷ (P + 2B) 的權益才值得跟注。下注越大，需要越多棄牌，但跟注者的價錢也越差。',
  multi:'對手多於一位時，所需棄牌率是指全部對手同時棄牌的頻率，要達到會困難得多。',
  tech:'下注前，先說出你預期會跟注的較差手牌，以及會棄牌的較強手牌。如果兩者都說不出，過牌通常是較簡單的選擇。',
  techRiver:'河牌之後不會再有牌：價值下注只取決於你對會跟注的手牌的權益。',
 },
 detail:(n,name,w,t,f)=>`對 ${n} 位持${name}的對手，你獨贏 ${w}，平手 ${t}。權益會計入你在平分底池時所得的份額，所以可能不同於獨贏率加平手率。${n+1} 位玩家平分時，每人份額為 ${f}。`,
 rangeCaveat:'範圍模型讓每位對手使用相同的翻牌前「前 X%」範圍，並不會因翻牌後的下注而收窄；持續下注的玩家通常持有與公共牌配合的手牌。多位對手的範圍手牌按順序抽樣，可能產生偏差。',
}}[LANG];

const pct=x=>(x*100).toFixed(1)+'%';
const money=x=>Number(x.toFixed(2)).toLocaleString(TEXT.locale,{maximumFractionDigits:2});
const cardText=c=>RANK_LABELS[c%13]+SUITS[Math.floor(c/13)];

/* ---------- Card inputs ---------- */
function makeCards(id,count){const container=$(id);for(let i=0;i<count;i++){const s=document.createElement('select');s.className='card-select';s.setAttribute('aria-label',id==='hole'?TEXT.holeLabel(i+1):TEXT.boardLabel(i+1));s.add(new Option('—',''));for(let suit=0;suit<4;suit++)for(let r=12;r>=0;r--)s.add(new Option(RANK_LABELS[r]+SUITS[suit],String(suit*13+r)));s.addEventListener('change',cardsChanged);container.appendChild(s)}}
makeCards('hole',2);makeCards('board',5);
const selects=()=>[...document.querySelectorAll('.card-select')];
function cards(id){return [...$(id).querySelectorAll('select')].map(s=>s.value===''?null:Number(s.value))}
function cardsChanged(){
 const used=new Map();selects().forEach(s=>{if(s.value!=='')used.set(s.value,s)});
 // Grey out cards already chosen elsewhere so each card can be picked only once.
 selects().forEach(s=>{const suit=Math.floor(Number(s.value)/13);s.classList.toggle('red',s.value!==''&&(suit===1||suit===2));for(const o of s.options)o.disabled=o.value!==''&&used.has(o.value)&&used.get(o.value)!==s});
 for(const id of ['hole','board'])$(id+'Text').value=cards(id).filter(c=>c!==null).map(cardText).join(' ');
 updateStreet();drawRange();
}
function parseCards(text,max){
 const out=[];
 for(const token of text.split(/[\s,;/|]+/).filter(Boolean)){const s=token.toUpperCase();let i=0;// a token may hold several cards, e.g. "AsKd"
  while(i<s.length){const m=/^(10|[2-9TJQKA])([SHDC♠♥♦♣♤♡♢♧])/.exec(s.slice(i));if(!m)throw Error(TEXT.err.parse(token));
   const rank='23456789TJQKA'.indexOf(m[1]==='10'?'T':m[1]),suit='S♠♤H♥♡D♦♢C♣♧'.indexOf(m[2]);out.push(Math.floor(suit/3)*13+rank);i+=m[0].length}}
 if(out.length>max)throw Error(TEXT.err.count(out.length,max));if(new Set(out).size!==out.length)throw Error(TEXT.err.dup);return out;
}
for(const [id,max] of [['hole',2],['board',5]])$(id+'Text').addEventListener('change',e=>{
 try{const list=parseCards(e.target.value,max),other=cards(id==='hole'?'board':'hole').filter(c=>c!==null);if(list.some(c=>other.includes(c)))throw Error(TEXT.err.dup);
  [...$(id).querySelectorAll('select')].forEach((s,i)=>{s.value=list[i]===undefined?'':String(list[i])});cardsChanged()}
 catch(err){$('error').textContent=err.message}
});
$('clearBoard').addEventListener('click',()=>{$('board').querySelectorAll('select').forEach(s=>s.value='');cardsChanged();invalidate()});
function updateStreet(){const n=cards('board').filter(v=>v!==null).length;$('street').textContent=TEXT.streets[n]||TEXT.incomplete}

/* ---------- Opponent range ---------- */
function rangePct(){return $('range').value==='custom'?Number($('rangeCustom').value):Number($('range').value)}
function drawRange(){
 const custom=$('range').value==='custom';$('rangeCustomWrap').hidden=!custom;
 const p=rangePct(),grid=$('rangeGrid'),hole=cards('hole');
 if(!(p>=0.5&&p<=100)){$('rangeSummary').textContent=TEXT.err.range;grid.hidden=true;return}
 const r=P.topRange(p),set=new Set(r.classes),hero=hole.includes(null)?'':P.classOf(hole[0],hole[1]);
 $('rangeSummary').textContent=p>=100?TEXT.rangeAll:TEXT.rangeTop(p,r);grid.hidden=false;
 if(!grid.childElementCount)for(let i=12;i>=0;i--)for(let j=12;j>=0;j--){const R=P.RANKS,k=i===j?R[i]+R[j]:i>j?R[i]+R[j]+'s':R[j]+R[i]+'o';const cell=document.createElement('span');cell.textContent=k;cell.dataset.k=k;grid.appendChild(cell)}
 for(const cell of grid.children){cell.classList.toggle('in',set.has(cell.dataset.k));cell.classList.toggle('hero',cell.dataset.k===hero)}
}
// Rows are the higher rank; suited hands above the diagonal, offsuit below, pairs on it (standard grid layout).

/* ---------- Example and state ---------- */
function example(){const h=$('hole').querySelectorAll('select');h[0].value='9';h[1].value='22';$('board').querySelectorAll('select').forEach(s=>s.value='');$('position').value='button';$('opponents').value='1';$('bb').value=2;$('stack').value=200;$('pot').value=3;$('call').value=0;$('range').value='100';cardsChanged();invalidate()}
let worker;
// The worker runs the same versioned poker.js the page loaded, so a cached older engine is never paired with this page.
const WORKER_URL=document.querySelector('script[src^="poker.js"]').getAttribute('src');
function resetButton(){$('calculate').disabled=false;$('calculate').firstElementChild.textContent=TEXT.analyze}
function invalidate(){if(worker){worker.terminate();worker=null}resetButton();$('output').hidden=true;$('empty').hidden=false;$('error').textContent='';document.dispatchEvent(new CustomEvent('pokerlantern:invalidate'))}
$('example').addEventListener('click',example);example();
// A result applies only to the exact inputs used in its calculation.
document.querySelectorAll('.setup input, .setup select').forEach(el=>el.addEventListener('change',()=>{const msg=$('error').textContent;invalidate();if(el.classList.contains('quick'))$('error').textContent=msg;if(el.id==='range'||el.id==='rangeCustom')drawRange()}));
// Clear old hand and Kelly results immediately while text or numeric inputs are being edited.
document.querySelectorAll('.setup input').forEach(el=>el.addEventListener('input',()=>{invalidate();if(el.id==='rangeCustom')drawRange()}));

/* ---------- Calculation ---------- */
$('calculate').addEventListener('click',()=>{
 // Re-parse the visible quick-entry fields so an invalid edit can never silently
 // calculate with the previous selection. This also handles keyboard submission.
 try {
  const h=parseCards($('holeText').value,2),b=parseCards($('boardText').value,5);
  if(new Set([...h,...b]).size!==h.length+b.length)throw Error(TEXT.err.dup);
  for(const [id,list] of [['hole',h],['board',b]])$(id).querySelectorAll('select').forEach((el,i)=>el.value=list[i]===undefined?'':String(list[i]));
  cardsChanged();
 } catch(err) {$('error').textContent=err.message;return}
 const hole=cards('hole'),board=cards('board').filter(v=>v!==null),num=id=>$(id).value.trim()===''?0:+$(id).value;
 const x={hole,board,bb:+$('bb').value,stack:+$('stack').value,pot:num('pot'),call:num('call'),opponents:+$('opponents').value,position:$('position').value,range:rangePct(),rake:num('rake'),rakeCap:num('rakeCap'),trials:+$('precision').value};
 const fail=msg=>{$('error').textContent=msg};$('error').textContent='';const E=TEXT.err;
 if(hole.includes(null))return fail(E.hole);if(![0,3,4,5].includes(board.length))return fail(E.board);if(new Set([...hole,...board]).size!==2+board.length)return fail(E.dup);
 if(![x.bb,x.stack,x.pot,x.call].every(Number.isFinite)||x.bb<=0||x.stack<=0||x.pot<=0||x.call<0)return fail(E.numbers);
 if(x.call>x.stack)return fail(E.stack);if(x.call>x.pot)return fail(E.pot);
 if(!(x.rake>=0&&x.rake<=25)||!(x.rakeCap>=0))return fail(E.rake);if(!(x.range>=0.5&&x.range<=100))return fail(E.range);
 $('calculate').disabled=true;$('calculate').firstElementChild.textContent=TEXT.running(0);if(worker)worker.terminate();worker=new Worker(WORKER_URL);
 worker.onmessage=e=>{if(e.data.progress!==undefined){$('calculate').firstElementChild.textContent=TEXT.running(e.data.progress);return}
  resetButton();worker.terminate();worker=null;if(e.data.error)return fail(e.data.error==='RANGE_IMPOSSIBLE'?E.impossible:e.data.error==='DUPLICATE_CARDS'?E.dup:E.sim);show(e.data.result,x)};
 worker.onerror=()=>{resetButton();fail(E.sim)};
 worker.postMessage({hole,board,opponents:x.opponents,trials:x.trials,range:x.range});
});

function show(r,x){
 const {equity:e,wins,ties,se,trials,exact,categories}=r,{hole,board,bb,stack,pot,call,opponents,position,range}=x;
 const pre=board.length===0,river=board.length===5,fair=1/(opponents+1),k=P.classOf(hole[0],hole[1]),rankPct=P.percentileOf(k);
 let title,why,size='',tech,math,table=null;
 if(call>0){
  const C=TEXT.call,final=pot+call,rk=x.rake>0?Math.min(x.rakeCap>0?x.rakeCap:Infinity,x.rake/100*final):0,net=final-rk,req=call/net,ev=e*net-call;
  const allIn=call>=stack-1e-9,margin=e-req,band=.02+1.96*se;
  if(Math.abs(margin)<band){title=C.close;why=C.close}
  else if(margin>0){title=C.good;why=allIn?C.goodAllIn:C.goodNot}
  else{title=C.bad;if(allIn)why=C.badAllIn;else if(e<=0)why=exact?C.badZero:C.badSample;else{const need=call/e-net;why=C.badNot(money(need),need<=stack-call)}}
  size=C.ev((ev>=0?'+':'')+money(ev),(ev>=0?'+':'')+money(ev/bb));
  tech=pre&&range>=100?C.techPre+TEXT.sep+C.tech:C.tech;
  math=C.math(money(call),money(pot),money(final),rk?money(rk):'',money(net),pct(req),(ev>=0?'+':'')+money(ev));
  $('potOddsLabel').textContent=TEXT.required;$('potOdds').textContent=pct(req);$('oddsNote').textContent=TEXT.requiredNote(rk>0);
 }else if(pre){
  const R=TEXT.pre,depth=stack/bb;tech=R.tech[position];
  if(position==='big'){title=R.bigTitle;why=R.bigWhy;size=R.bigSize(money(Math.min(stack,3*bb)),money(Math.min(stack,4*bb)))}
  else if(depth<10){title=R.shortTitle;why=R.shortWhy(money(depth));size=R.shortSize(money(stack),money(depth))}
  else{
   const w=OPEN_WIDTH[position],p=rankPct*100,a=hole[0]%13,b=hole[1]%13,suited=Math.floor(hole[0]/13)===Math.floor(hole[1]/13);
   // Raw equity ranks undervalue hands that win by making strong hands; flag them instead of pretending to rank playability.
   const speculative=a===b||(suited&&(Math.abs(a-b)<=2||Math.max(a,b)===12));
   const ptxt=pct(rankPct);
   if(p<=w){title=R.inTitle;why=R.inWhy(ptxt,w)}
   else if(p<=w+6||(speculative&&(LATE.has(position)||p<=w+10))){title=R.borderTitle;why=R.borderWhy(ptxt,w,speculative)}
   else{title=R.outTitle;why=R.outWhy(ptxt,w)}
   const sb=position==='small',mid=sb?3:2.5;size=R.openSize(money(Math.min(stack,(sb?2.5:2)*bb)),money(Math.min(stack,mid*bb)),money(Math.min(stack,(sb?3.5:3)*bb)),sb);
   tech+=TEXT.sep+R.widthNote;
  }
  math='';$('potOddsLabel').textContent=TEXT.fair;$('potOdds').textContent=pct(fair);$('oddsNote').textContent=TEXT.fairNote(opponents);
 }else{
  const Q=TEXT.post,strong=e>=fair+(1-fair)*.4,weak=e<=fair*.6;
  title=strong?Q.strongTitle:weak?Q.weakTitle:Q.midTitle;why=strong?Q.strongWhy:weak?Q.weakWhy:Q.midWhy;
  tech=river?Q.tech+TEXT.sep+Q.techRiver:Q.tech;math=Q.math+(opponents>1?Q.multi:'');
  table=[Q.sizeHead,...[33,50,75,100].map(f=>{const raw=pot*f/100,bet=Math.min(stack,raw);return [Q.pot(f)+(raw>stack?` (${Q.allIn})`:''),money(bet),pct(bet/(pot+bet)),pct(bet/(pot+2*bet))]})];
  $('potOddsLabel').textContent=TEXT.fair;$('potOdds').textContent=pct(fair);$('oddsNote').textContent=TEXT.fairNote(opponents);
 }
 $('empty').hidden=true;$('output').hidden=false;$('confidence').textContent=exact?TEXT.exactTag:TEXT.simTag;
 $('action').textContent=title;$('reason').textContent=why;$('sizing').textContent=size;
 const tbl=$('sizeTable');tbl.hidden=!table;tbl.replaceChildren();if(table)table.forEach((row,i)=>{const tr=tbl.insertRow();row.forEach(v=>{const c=document.createElement(i?'td':'th');c.textContent=v;tr.appendChild(c)})});
 $('equity').textContent=pct(e);$('equityNote').textContent=exact?TEXT.methodExact(trials):TEXT.methodSim(trials,pct(Math.max(1.96*se,3/trials,.001)));$('winTie').textContent=`${pct(wins)} / ${pct(ties)}`;
 const hand=board.length?TEXT.nowHave(TEXT.cats[P.category(P.score([...hole,...board]))])+TEXT.sep:'';
 $('handInfo').textContent=hand+TEXT.heroRank(k,pct(rankPct));
 $('math').textContent=math;$('math').hidden=!math;
 $('detail').textContent=TEXT.detail(opponents,TEXT.rangeName(range),pct(wins),pct(ties),pct(fair))+(range<100?TEXT.sep+TEXT.rangeCaveat:'');
 $('technique').textContent=tech;
 $('distTitle').textContent=TEXT.distTitle(exact,river);$('distNote').hidden=river;$('distNote').textContent=TEXT.distNote;
 const dist=$('dist');dist.replaceChildren();categories.forEach((v,i)=>{if(v<=0)return;const row=document.createElement('div');row.className='bar';row.innerHTML='<span></span><i><b></b></i><em></em>';row.children[0].textContent=TEXT.cats[i];row.querySelector('b').style.width=(v*100).toFixed(2)+'%';row.children[2].textContent=v>=.9995?'100%':v<.0005?'<0.1%':pct(v);dist.appendChild(row)});
 updateStreet();
 // The Kelly section may use this result, but only when the reader asks it to.
 document.dispatchEvent(new CustomEvent('pokerlantern:result',{detail:{r,x}}));
}
