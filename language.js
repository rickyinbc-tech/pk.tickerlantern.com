// Preserve the current hand when moving between language versions in this tab.
const languageKey='poker-lantern-hand';
document.querySelectorAll('.languages a').forEach(link=>link.addEventListener('click',()=>{
 const values={};document.querySelectorAll('.setup input[id],.setup select[id]').forEach(el=>values[el.id]=el.value);
 values.hole=[...document.querySelectorAll('#hole select')].map(el=>el.value);
 values.board=[...document.querySelectorAll('#board select')].map(el=>el.value);
 try{sessionStorage.setItem(languageKey,JSON.stringify(values))}catch{}
}));
try{const saved=JSON.parse(sessionStorage.getItem(languageKey)||'null');if(saved){sessionStorage.removeItem(languageKey);for(const [id,value] of Object.entries(saved)){if(id==='hole'||id==='board'){document.querySelectorAll(`#${id} select`).forEach((el,i)=>{el.value=value[i]??'';el.dispatchEvent(new Event('change'))})}else{const el=document.getElementById(id);if(el){el.value=value;el.dispatchEvent(new Event('change'))}}}}}catch{}
