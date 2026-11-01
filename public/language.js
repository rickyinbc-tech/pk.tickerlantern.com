// Preserve the current hand, the Kelly inputs and the bet-sizing assumptions when moving between language versions in this tab.
// A result is never carried over as text: if the page being left showed a current analysis, the new page
// recalculates it, which also resyncs the Kelly section; otherwise the Kelly section starts in manual mode.
const languageKey='poker-lantern-hand';
document.querySelectorAll('.languages a').forEach(link=>link.addEventListener('click',()=>{
 const values={};document.querySelectorAll('.setup input[id]:not(.quick),.setup select[id]').forEach(el=>values[el.id]=el.value);
 values.hole=[...document.querySelectorAll('#hole select')].map(el=>el.value);
 values.board=[...document.querySelectorAll('#board select')].map(el=>el.value);
 values.kelly=window.KellySync?window.KellySync.snapshot():null;
 values.sizing=window.SizingSync?window.SizingSync.snapshot():null;
 values.analyzed=!document.getElementById('output').hidden;
 try{sessionStorage.setItem(languageKey,JSON.stringify(values))}catch{}
}));
try{const saved=JSON.parse(sessionStorage.getItem(languageKey)||'null');if(saved){sessionStorage.removeItem(languageKey);
 const {kelly,sizing,analyzed,...fields}=saved;
 for(const [id,value] of Object.entries(fields)){if(id==='hole'||id==='board'){document.querySelectorAll(`#${id} select`).forEach((el,i)=>{el.value=value[i]??'';el.dispatchEvent(new Event('change'))})}else{const el=document.getElementById(id);if(el){el.value=value;el.dispatchEvent(new Event('change'))}}}
 if(window.KellySync)window.KellySync.restore(kelly);
 if(window.SizingSync)window.SizingSync.restore(sizing);
 if(analyzed)document.getElementById('calculate').click();
}}catch{}
