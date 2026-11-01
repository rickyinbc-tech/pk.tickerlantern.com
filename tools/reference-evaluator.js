// Deliberately simple, independent evaluator for tests: best of all 5-card subsets.
function five(cs){
 const r=cs.map(c=>c%13+2).sort((a,b)=>b-a),flush=cs.every(c=>Math.floor(c/13)===Math.floor(cs[0]/13));
 const u=[...new Set(r)];let straight=0;
 if(u.length===5){if(r[0]-r[4]===4)straight=r[0];else if(r.join()==='14,5,4,3,2')straight=5}
 const cnt={};r.forEach(x=>cnt[x]=(cnt[x]||0)+1);
 const g=Object.entries(cnt).map(([k,v])=>[v,+k]).sort((a,b)=>b[0]-a[0]||b[1]-a[1]),ord=g.map(x=>x[1]);
 let cat;if(straight&&flush)cat=8;else if(g[0][0]===4)cat=7;else if(g[0][0]===3&&g[1][0]===2)cat=6;else if(flush)cat=5;else if(straight)cat=4;else if(g[0][0]===3)cat=3;else if(g[0][0]===2&&g[1][0]===2)cat=2;else if(g[0][0]===2)cat=1;else cat=0;
 const key=straight?[straight]:ord;let v=cat;for(let i=0;i<5;i++)v=v*15+(key[i]||0);return v;
}
function best(cards){let b=-1;const n=cards.length;const rec=(s,pick)=>{if(pick.length===5){b=Math.max(b,five(pick));return}for(let i=s;i<n;i++)rec(i+1,[...pick,cards[i]])};rec(0,[]);return b}
module.exports={best};
