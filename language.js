// Preserve the current hand, the Kelly inputs and the bet-sizing assumptions when moving between language versions in this tab.
// A completed probability result is reused for the same hand, avoiding sampling jitter across languages.
// Incomplete inputs never carry a result; all sections re-render from the restored inputs.
const languageKey='poker-lantern-hand';
document.querySelectorAll('.languages a').forEach(link=>link.addEventListener('click',()=>{
 const values={};document.querySelectorAll('.setup input[id]:not(.quick),.setup select[id]').forEach(el=>values[el.id]=el.value);
 values.hole=[...document.querySelectorAll('#hole select')].map(el=>el.value);
 values.board=[...document.querySelectorAll('#board select')].map(el=>el.value);
 // The visible typed text too, even unfinished or invalid, so the other page never falls back to older cards.
 values.typed={holeText:document.getElementById('holeText').value,boardText:document.getElementById('boardText').value};
 values.kelly=window.KellySync?window.KellySync.snapshot():null;
 values.sizing=window.SizingSync?window.SizingSync.snapshot():null;
 values.probability=window.PokerLanternState?window.PokerLanternState.probabilitySnapshot():null;
 try{sessionStorage.setItem(languageKey,JSON.stringify(values))}catch{}
}));
try{const saved=JSON.parse(sessionStorage.getItem(languageKey)||'null');if(saved){sessionStorage.removeItem(languageKey);
 const {kelly,sizing,typed,probability,...fields}=saved;
 for(const [id,value] of Object.entries(fields)){if(id==='hole'||id==='board'){document.querySelectorAll(`#${id} select`).forEach((el,i)=>{el.value=value[i]??'';el.dispatchEvent(new Event('change'))})}else{const el=document.getElementById(id);if(el){el.value=value;el.dispatchEvent(new Event('change'))}}}
 // Re-apply the exact typed text after the selects, through input events, so its complete / unfinished / invalid state is rebuilt.
 if(typed)for(const [id,text] of Object.entries(typed)){const el=document.getElementById(id);if(el&&el.value!==text){el.value=text;el.dispatchEvent(new Event('input'))}}
 if(window.KellySync)window.KellySync.restore(kelly);
 if(window.SizingSync)window.SizingSync.restore(sizing);
 if(window.PokerLanternState)window.PokerLanternState.restoreProbability(probability);
}}catch{}
