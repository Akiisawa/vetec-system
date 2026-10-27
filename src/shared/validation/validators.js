function isNonEmptyString(v){return typeof v==='string'&&v.trim().length>0}
function isEmail(v){return typeof v==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)}
function isPositiveNumber(v){return typeof v==='number'&&isFinite(v)&&v>=0}
function isCNPJ(v){
  if(typeof v!=='string')return false;
  const d=v.replace(/\D/g,'');
  if(d.length!==14)return false;
  if(/^(\d)\1{13}$/.test(d))return false;
  const calc=(n)=>{let sum=0,pos=n-7;for(let i=0;i<n;i++){sum+=Number(d[i])*pos--;if(pos<2)pos=9}const r=sum%11;return r<2?0:11-r};
  return Number(d[12])===calc(12)&&Number(d[13])===calc(13);
}
module.exports={isNonEmptyString,isEmail,isPositiveNumber,isCNPJ};