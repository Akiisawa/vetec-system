const formatCNPJ=(v)=>{const d=String(v||'').replace(/\D/g,'').padStart(14,'0').slice(0,14);return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,'$1.$2.$3/$4-$5')};
const formatBRL=(v)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(v)||0);
module.exports={formatCNPJ,formatBRL};