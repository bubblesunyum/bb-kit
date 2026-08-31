function o2r(L,C,H){L/=100;const h=H*Math.PI/180,a=C*Math.cos(h),b=C*Math.sin(h);
 const l_=L+0.3963377774*a+0.2158037573*b,m_=L-0.1055613458*a-0.0638541728*b,s_=L-0.0894841775*a-1.2914855480*b;
 const l=l_**3,m=m_**3,s=s_**3;const g=c=>c<=0.0031308?12.92*c:1.055*Math.pow(c,1/2.4)-0.055;
 return [g(4.0767416621*l-3.3077115913*m+0.2309699292*s),g(-1.2684380046*l+2.6097574011*m-0.3413193965*s),g(-0.0041960863*l-0.7034186147*m+1.7076147010*s)];}
const cl=v=>Math.min(1,Math.max(0,v));
const ing=a=>a.every(v=>v>=-0.002&&v<=1.002);
function fit(L,C,H){let c=C;while(c>0&&!ing(o2r(L,c,H)))c-=0.002;return c;}
const hex=(L,C,H)=>{const c=fit(L,C,H);return '#'+o2r(L,c,H).map(v=>Math.round(cl(v)*255).toString(16).padStart(2,'0')).join('').toUpperCase();};
const lin=c=>c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4);
const h2l=h=>{h=h.replace('#','');const[r,g,b]=[0,2,4].map(i=>lin(parseInt(h.slice(i,i+2),16)/255));return 0.2126*r+0.7152*g+0.0722*b;};
const cr=(a,b)=>{const[x,y]=[h2l(a),h2l(b)].sort((p,q)=>q-p);return Math.round(((x+0.05)/(y+0.05))*1000)/1000;};
const W=35, D=27;   // warm brand hue, danger hue

// [L, C, hue]
const LIGHT={ // inverted: DARK page
 page:[26,.045,W], card:[34,.050,W], text:[97,.012,W], quiet:[76,.030,W], muted:[19,.038,W],
 primary:[86,.135,W], onPrimary:[22,.05,W], highlight:[38,.062,W], onHighlight:[96,.015,W],
 border:[50,.045,W], input:[68,.038,W], ring:[84,.120,W], disabled:[34,.050,W], disabledText:[52,.035,W],
 danger:[72,.150,D], onDanger:[18,.05,D] };
const DARK={ // inverted: LIGHT page
 page:[93,.020,W], card:[99,.006,W], text:[22,.035,W], quiet:[47,.040,W], muted:[86,.030,W],
 primary:[42,.120,W], onPrimary:[98,.008,W], highlight:[88,.055,W], onHighlight:[34,.060,W],
 border:[76,.032,W], input:[47,.040,W], ring:[46,.140,W], disabled:[86,.030,W], disabledText:[66,.035,W],
 danger:[48,.180,D], onDanger:[99,.004,W] };

const H=m=>Object.fromEntries(Object.entries(m).map(([k,[L,C,h]])=>[k,hex(L,C,h)]));
const rules=p=>[
 ['text on page',p.text,p.page,4.5],['text on card',p.text,p.card,4.5],['text on muted',p.text,p.muted,4.5],
 ['quiet on page',p.quiet,p.page,4.5],['quiet on card',p.quiet,p.card,4.5],['quiet on muted',p.quiet,p.muted,4.5],
 ['quiet on highlight',p.quiet,p.highlight,4.5],
 ['on-primary on primary',p.onPrimary,p.primary,4.5],['on-highlight on highlight',p.onHighlight,p.highlight,4.5],
 ['on-danger on danger',p.onDanger,p.danger,4.5],
 ['primary vs page',p.primary,p.page,3.0],['primary vs card',p.primary,p.card,3.0],['primary vs muted',p.primary,p.muted,3.0],
 ['danger vs page',p.danger,p.page,3.0],['danger vs card',p.danger,p.card,3.0],
 ['input vs page',p.input,p.page,3.0],['input vs card',p.input,p.card,3.0],
 ['ring vs page',p.ring,p.page,3.0],['ring vs card',p.ring,p.card,3.0],['ring vs muted',p.ring,p.muted,3.0],
 ['border vs page',p.border,p.page,1.4],['border vs card',p.border,p.card,1.4],['border vs muted',p.border,p.muted,1.25],
 ['highlight vs page',p.highlight,p.page,1.15],['highlight vs card',p.highlight,p.card,1.15],
 ['card vs page',p.card,p.page,1.15],['disabledText vs disabled',p.disabledText,p.disabled,2.0]];
let bad=0;
for(const [n,m] of [['CLASH LIGHT (dark page)',LIGHT],['CLASH DARK (light page)',DARK]]){
 const p=H(m); console.log('\n'+n); console.log(p);
 for(const [t,a,b,min] of rules(p)){const v=cr(a,b);if(v<min){bad++;console.log('  FAIL',t.padEnd(26),v,'need',min);}}
 console.log('  failures so far:',bad);
}
console.log(bad===0?'\nALL PASS':'\n'+bad+' FAILURES');
