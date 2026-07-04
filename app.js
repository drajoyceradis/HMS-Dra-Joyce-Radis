const $=id=>document.getElementById(id);

const clean=t=>String(t||'')
  .replace(/[\u201C\u201D]/g,'"')
  .replace(/[\u2018\u2019]/g,"'")
  .replace(/[<>~_\\*#-]/g,' ')
  .replace(/&/g,'E')
  .replace(/https?:\/\/\S+/gi,'')
  .replace(/Chave de acesso:\s*\S+/gi,'')
  .replace(/Resultado completo acesse:\s*\S+/gi,'')
  .replace(/Assinado eletronicamente por[^\n]+/gi,'')
  .replace(/Responsável técnico:[^\n]+/gi,'')
  .replace(/[^\S\n]+/g,' ')
  .replace(/[ \t]+\n/g,'\n')
  .replace(/\n{3,}/g,'\n\n')
  .trim();

const flat=t=>clean(t).replace(/\s+/g,' ').trim();
const up=t=>clean(t).toUpperCase();
const na=v=>clean(v)||'NA';
const isMobile=()=>window.innerWidth<=980;

const fmtLines=x=>{
  x=up(x);
  if(!x) return 'NA';
  return x.split('\n').map(s=>clean(s)).filter(Boolean).join('\n');
};

let state={
  modo:'EVOLUCAO', qp:'', acomp:'DESACOMPANHADO', desc:'', tempo:'', assoc:'', sec:'',
  nega:'', comorb:'', alerg:'', medcont:'', fc:'', fr:'', sat:'', tax:'', pa:'', hgt:'',
  dor:'', geral:'', acv:'', ar:'', abd:'', neuro:'', mmii:'', outros:'', hd:'', prescr:'',
  conduta:'', status:'', emtempo:'', excomp:'', raw:'', red:{}
};

try {
  let savedApp = localStorage.getItem('hms_app_state');
  if (savedApp) state = JSON.parse(savedApp);
} catch(e) {}

const symptomChips=['TOSSE','DOR TORACICA VENTILATORIO DEPENDENTE','DOR TORACICA','DOR DE OUVIDO','ODINOFAGIA','DOR ABDOMINAL','DISURIA','CEFALEIA','LOMBALGIA','NAUSEAS E VOMITOS','FEBRE','TONTURA'];
const redFlags=['SINAIS DE CHOQUE','SINCOPE','DEFICIT FOCAL','REBAIXAMENTO SENSORIO','INSTABILIDADE HEMODINAMICA','SANGRAMENTO ATIVO','VOMITOS INCOERCIVEIS','SINAIS DE IRRITACAO PERITONEAL'];

const quickComorb=['HAS','DM','DLP','DAC','IAM PREVIO','AVC PREVIO','FA','IC','DPOC','ASMA','DRC','NEOPLASIA','IMUNOSSUPRESSAO','GESTACAO','OBESIDADE','TEP PREVIO'];
const quickAlerg=['DIPIRONA','AINE','PENICILINA','CEFALOSPORINA','CONTRASTE','LATEX'];
const quickMedCont=['LOSARTANA 50 MG','ANLODIPINO 5 MG','HIDROCLOROTIAZIDA 25 MG','METFORMINA 850 MG','INSULINA','AAS 100 MG','CLOPIDOGREL 75 MG','RIVAROXABANA','APIXABANA','VARFARINA'];
const quickMeds=['DIPIRONA 1 G EV AGORA','PARACETAMOL 750 MG VO AGORA','ONDANSETRONA 4 MG EV AGORA','BROMOPRIDA 10 MG EV AGORA','HIOSCINA 20 MG EV AGORA','OMEPRAZOL 40 MG EV AGORA','SF 0,9% 500 ML EV'];
const quickCondutas=['SOLICITO LABORATORIO DE RASTREIO INFECCIOSO','SOLICITO EXAMES LABORATORIAIS','SOLICITO EXAMES DE IMAGEM','SOLICITO ECG','SOLICITO TROPONINA','SOLICITO EAS','SOLICITO PARECER ESPECIALIZADO','MANTENHO OBSERVACAO CLINICA','REAVALIAR APOS MEDICACOES','ALTA APOS MELHORA CLINICA','INTERNACAO SOLICITADA'];
const statuses=['ALTA','AGUARDA EXAMES','AGUARDA PARECER','OBSERVACAO CLINICA','SALA VERMELHA','INTERNACAO SOLICITADA'];

let active='nota';
let userEdited=false;

function saveAppState() {
  try { localStorage.setItem('hms_app_state', JSON.stringify(state)); } catch(e) {}
}

function setMobileView(view){
  document.body.setAttribute('data-mobile-view',view);
  const a=$('showForm'), b=$('showOutput');
  if(a&&b){
    a.classList.toggle('on',view==='form');
    b.classList.toggle('on',view==='output');
  }
}

function csvParts(key){ return clean(state[key]).split(/,|;|\n/).map(x=>up(x)).filter(Boolean); }
function csvHas(key,text){ return csvParts(key).includes(up(text)); }
function csvToggle(key,text){
  const val=up(text); let parts=csvParts(key);
  parts=parts.includes(val)?parts.filter(x=>x!==val):[...parts,val];
  state[key]=parts.join(', '); saveAppState();
}
function lineParts(key){ return clean(state[key]).split('\n').map(x=>up(clean(x))).filter(Boolean); }
function lineHas(key,text){ return lineParts(key).includes(up(text)); }
function lineToggle(key,text){
  const val=up(text); let parts=lineParts(key);
  parts=parts.includes(val)?parts.filter(x=>x!==val):[...parts,val];
  state[key]=parts.join('\n'); saveAppState();
}

function medBlock(){ const m=up(state.medcont); if(!m || m==='NA') return 'MEDICACOES DE USO CONTINUO: NA'; return 'MEDICACOES DE USO CONTINUO:\n'+m.split(/\n|;/).map(x=>clean(x)).filter(Boolean).map(x=>up(x)).join('\n'); }
function hda(){ const qp=up(state.qp)||'[QUEIXA PRINCIPAL]'; let p='PACIENTE COMPARECE AO PRONTO SOCORRO '+up(state.acomp||'DESACOMPANHADO')+' COM QUEIXA DE '+qp; if(state.desc) p+=' '+up(state.desc); p+=' HA '+(up(state.tempo)||'[TEMPO]'); if(state.assoc) p+=' E RELATA SINTOMAS ASSOCIADOS COMO '+up(state.assoc); p+='.'; if(state.sec) p+=' REFERE TAMBEM '+up(state.sec).replace(/\.$/,'')+'.'; if(state.nega) p+=' NEGA '+up(state.nega).replace(/^NEGA\s+/,'').replace(/\.$/,'')+'.'; return p; }
function vitals(){ return ['FC '+(state.fc?up(state.fc)+' BPM':'NA'), 'FR '+(state.fr?up(state.fr)+' IRPM':'NA'), 'STO2 '+(state.sat?up(state.sat)+'%':'NA'), 'TAX '+(state.tax?up(state.tax)+' C':'NA'), 'PA '+(state.pa?up(state.pa)+' MMHG':'NA'), state.hgt?'HGT '+up(state.hgt):'', state.dor?'DOR '+up(state.dor)+'/10':''].filter(Boolean).join('\n'); }
function exam(){ return ['GERAL: '+na(up(state.geral)), 'ACV: '+na(up(state.acv)), 'AR: '+na(up(state.ar)), 'ABD: '+na(up(state.abd)), 'NEUROLOGICO: '+na(up(state.neuro)), 'MMII: '+na(up(state.mmii)), 'OUTROS: '+na(up(state.outros))].join('\n'); }
function note(){
  const t=[]; t.push('EVOLUCAO PRONTO SOCORRO HOSPITAL MERIDIONAL SERRA',''); t.push('QUEIXA PRINCIPAL:',(up(state.qp)||'NAO INFORMADA'),''); t.push('HISTORIA DA DOENCA ATUAL:');
  if(state.modo==='REAVALIACAO'){ t.push('HDA DA ADMISSAO: '+hda(),''); t.push('EM TEMPO (REAVALIACAO):'); t.push(na(up(state.emtempo))); } else { t.push(hda()); }
  t.push('','HISTORIA PATOLOGICA PREGRESSA:','COMORBIDADES: '+na(up(state.comorb)),'ALERGIAS: '+na(up(state.alerg)),medBlock(),'','SINAIS VITAIS:',vitals(),'','EXAME FISICO:',exam(),'','HIPOTESES DIAGNOSTICAS:',fmtLines(state.hd));
  if(state.prescr) t.push('','PRESCRICOES E MEDICACOES REALIZADAS:',fmtLines(state.prescr));
  if(state.modo==='REAVALIACAO') t.push('','EXAMES COMPLEMENTARES:',na(up(state.excomp||transformExams(state.raw))));
  t.push('','CONDUTA MEDICA:',fmtLines(state.conduta)); return clean(t.join('\n'));
}

function adc(){ const s=up(state.status)||'EM OBSERVACAO'; let base='PACIENTE REAVALIADO, HEMODINAMICAMENTE ESTAVEL NO MOMENTO, SEM SINAIS DE INSTABILIDADE CLINICA IMEDIATA. '; if(state.emtempo) base+=up(state.emtempo)+' '; if(/ALTA/.test(s)) base+='APRESENTA CONDICOES CLINICAS PARA ALTA NO MOMENTO. ORIENTADOS SINAIS DE ALARME, RETORNO IMEDIATO SE PIORA, ADESAO A PRESCRICAO E SEGUIMENTO AMBULATORIAL. ALTA MEDICA.'; else base+='MANTENHO '+s+' PARA SEGUIMENTO, REAVALIACAO E DEFINICAO DE CONDUTA.'; return clean(base); }
function handoff(){ return clean(['SITUACAO:','PACIENTE EM '+(up(state.status)||'ATENDIMENTO')+' POR '+(up(state.qp)||'SINTOMAS CLINICOS')+'.','','BACKGROUND:',hda(),'COMORBIDADES: '+na(up(state.comorb))+'.','','AVALIACAO:','SINAIS VITAIS: FC '+na(up(state.fc))+' | FR '+na(up(state.fr))+' | STO2 '+na(up(state.sat))+' | PA '+na(up(state.pa))+' | TAX '+na(up(state.tax))+'.','HD PRINCIPAL: '+na(up(state.hd)).replace(/\n/g,' | ')+'.','','RECOMENDACAO:',fmtLines(state.conduta)].join('\n')); }

function pick(re,t){ const m=t.match(re); return m?clean(m[1]):''; }
function pushIf(out,label,parts){ const vals=parts.filter(Boolean); if(vals.length) out.push(label+': '+vals.join(' | ')); }
function summarize(text){ return clean(text).replace(/\s*\.\s*/g,'. ').replace(/\n+/g,' ').trim(); }

function transformExams(raw){
  const source=String(raw||''); if(!source.trim()) return '';
  const t=clean(source), f=flat(source), out=[];
  
  const hb=pick(/Hemoglobina\s*([0-9.,]+)/i,f), ht=pick(/Hemat[óo]crito\s*([0-9.,]+)/i,f), leuco=pick(/Leuc[óo]citos\s*([0-9.,]+)/i,f), plaq=pick(/Contagem de Plaquetas\s*([0-9.,]+)/i,f);
  pushIf(out,'HEMOGRAMA',[hb&&'HB '+hb,ht&&'HT '+ht,leuco&&'LEUCO '+leuco,plaq&&'PLAQ '+plaq]);
  
  const cr=pick(/CREATININA\s+(?:RESULTADO\s*)?([0-9.,]+)/i,f), ureia=pick(/UREIA\s*([0-9.,]+)/i,f);
  pushIf(out,'FUNCAO RENAL',[cr&&'CREATININA '+cr,ureia&&'UREIA '+ureia]);
  
  const pcr=pick(/PROTE[IÍ]NA\s*(?:C\s*)?REATIVA\s+(?:RESULTADO\s*)?([0-9.,]+)/i,f), amilase=pick(/AMILASE\s+(?:SERICA\s+RESULTADO\s*)?([0-9.,]+)/i,f), lipase=pick(/LIPASE\s+(?:RESULTADO\s*)?([0-9.,]+)/i,f);
  pushIf(out,'BIOQUIMICA',[pcr&&'PCR '+pcr+' MG/L',amilase&&'AMILASE '+amilase,lipase&&'LIPASE '+lipase]);
  
  if(/TOMOGRAFIA COMPUTADORIZADA/i.test(f)){
    const imp=pick(/IMPRESS[ÃA]O DIAGN[ÓO]STICA\s*([\s\S]*?)(?=HEMOGRAMA|RX|EAS|$)/i,t);
    if(imp){ const pieces=imp.split('.').map(x=>summarize(x)).filter(Boolean).map(x=>up(x)); out.push('TOMOGRAFIA: '+pieces.join(' | ').slice(0, 200)); }
  }
  return clean(out.join('\n\n')) || 'EXAMES COMPLEMENTARES: '+f.slice(0,120)+'...';
}
