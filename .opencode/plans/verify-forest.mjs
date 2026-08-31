// Measures the forest palette in bb-kit-foundation-r7.md §5.1 against §4.6.
// The hex values are the source of truth (see §5.1); this script only checks them.
const lin=c=>c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4);
const L=h=>{h=h.replace('#','');const[r,g,b]=[0,2,4].map(i=>lin(parseInt(h.slice(i,i+2),16)/255));return 0.2126*r+0.7152*g+0.0722*b;};
const cr=(a,b)=>{const[x,y]=[L(a),L(b)].sort((p,q)=>q-p);return Math.round(((x+0.05)/(y+0.05))*1000)/1000;};

const light={page:'#E7EDEA',card:'#FFFFFF',text:'#0C110F',quiet:'#4F5854',muted:'#D2D9D6',
 primary:'#03614B',onPrimary:'#FFFFFF',highlight:'#B4E4D2',onHighlight:'#034937',
 border:'#B8C0BD',input:'#4F5854',ring:'#007C60',disabled:'#D2D9D6',disabledText:'#7F8985',
 danger:'#AC1A1C',onDanger:'#FFFFFF'};
const dark={page:'#0C110F',card:'#1F2623',text:'#F2F6F4',quiet:'#B8C0BD',muted:'#353D39',
 primary:'#57BA9A',onPrimary:'#00160F',highlight:'#035541',onHighlight:'#E1F4EC',
 border:'#474F4C',input:'#6D7773',ring:'#C2E8D9',disabled:'#353D39',disabledText:'#6D7773',
 danger:'#F47C70',onDanger:'#00160F'};

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
for(const [n,p] of [['FOREST LIGHT',light],['FOREST DARK',dark]]){
  console.log('\n'+n);
  for(const [t,a,b,min] of rules(p)){const v=cr(a,b);const ok=v>=min;if(!ok)bad++;
    console.log('  '+t.padEnd(28),String(v).padStart(7),ok?'ok':`FAIL need ${min}`);}
}
console.log(bad===0?'\nALL PASS':`\n${bad} FAILURES`);
