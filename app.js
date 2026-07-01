
const $=id=>document.getElementById(id);

const clean=t=>String(t||'')
  .replace(/[\u201C\u201D]/g,'"')
  .replace(/[\u2018\u2019]/g,"'")
  .replace(/[\u2013\u2014]/g,'-')
  .replace(/[•●▪‣⁃*]/g,'-')
  .replace(/[<>]/g,'')
  .replace(/&/g,'E')
  .replace(/https?:\/\/\S+/gi,'')
  .replace(/Chave de acesso:\s*\S+/gi,'')
  .replace(/Resultado completo acesse:\s*\S+/gi,'')
  .replace(/Assinado eletronicamente por[^\n]+/gi,'')
  .replace(/Responsável técnico:[^\n]+/gi,'')
  .replace(/[^\S\r\n]+/g,' ')
  .replace(/[ \t]+\n/g,'\n')
  .replace(/\n{3,}/g,'\n\n')
  .trim();

const flat=t=>clean(t).replace(/\s+/g,' ').trim();
const up=t=>clean(t).toUpperCase();
const na=v=>clean(v)||'NA';
const fmtLines=x=>{
  x=up(x);
  if(!x) return '- NA';
  return x.split('\n').map(s=>clean(s)).filter(Boolean).map(s=>s.startsWith('-')?s:'- '+s).join('\n');
};
const isMobile=()=>window.innerWidth<=980;

const state={
  modo:'EVOLUÇÃO',
  qp:'',
  acomp:'DESACOMPANHADO(A)',
  desc:'',
  tempo:'',
  assoc:'',
  sec:'',
  nega:'',
  comorb:'',
  alerg:'',
  medcont:'',
  fc:'',
  fr:'',
  sat:'',
  tax:'',
  pa:'',
  hgt:'',
  dor:'',
  geral:'',
  acv:'',
  ar:'',
  abd:'',
  neuro:'',
  mmii:'',
  outros:'',
  hd:'',
  prescr:'',
  conduta:'',
  status:'',
  emtempo:'',
  excomp:'',
  raw:'',
  red:{}
};

const symptomChips=[
  'DOR ABDOMINAL','DOR EPIGÁSTRICA','NÁUSEAS','VÔMITOS','DIARREIA','FEBRE','CEFALEIA',
  'TONTURA','DOR TORÁCICA','DISPNEIA','TOSSE','ODINOFAGIA','DISÚRIA','LOMBALGIA',
  'PALPITAÇÕES','SUDORESE','IRRADIAÇÃO','PARESTESIA'
];

const redFlags=[
  'DOR TORÁCICA','DISPNEIA','SÍNCOPE','DÉFICIT FOCAL','REBAIXAMENTO',
  'INSTABILIDADE HEMODINÂMICA','FEBRE PERSISTENTE','SANGRAMENTO',
  'VÔMITOS INCOERCÍVEIS','DEFESA/RIGIDEZ/BLUMBERG','GESTAÇÃO','IMUNOSSUPRESSÃO'
];

const quickMeds=[
  'DIPIRONA 1 G EV AGORA',
  'PARACETAMOL 750 MG VO AGORA',
  'ONDANSETRONA 4 MG EV AGORA',
  'BROMOPRIDA 10 MG EV AGORA',
  'HIOSCINA 20 MG EV AGORA',
  'OMEPRAZOL 40 MG EV AGORA',
  'SF 0,9% 500 ML EV',
  'SF 0,9% 1000 ML EV'
];

const quickCondutas=[
  'SOLICITO LABORATÓRIO DE RASTREIO INFECCIOSO',
  'SOLICITO EXAMES LABORATORIAIS',
  'SOLICITO EXAMES DE IMAGEM',
  'SOLICITO ECG',
  'SOLICITO TROPONINA',
  'SOLICITO EAS',
  'SOLICITO PARECER ESPECIALIZADO',
  'MANTENHO OBSERVAÇÃO CLÍNICA',
  'REAVALIAR APÓS',
  'ALTA APÓS MELHORA CLÍNICA',
  'INTERNAÇÃO SOLICITADA'
];

const statuses=[
  'ALTA',
  'AGUARDA EXAMES',
  'AGUARDA PARECER',
  'OBSERVAÇÃO CLÍNICA',
  'SALA VERMELHA',
  'INTERNAÇÃO SOLICITADA'
];

let active='nota';
let userEdited=false;

function setMobileView(view){
  document.body.setAttribute('data-mobile-view',view);
  const a=$('showForm'), b=$('showOutput');
  if(a&&b){
    a.classList.toggle('on',view==='form');
    b.classList.toggle('on',view==='output');
  }
}

function card(title,open,build){
  const c=document.createElement('div');
  c.className='card'+(open?'':' closed');
  const h=document.createElement('div');
  h.className='head';
  h.innerHTML='<h2>'+title+'</h2><span class="chev">▼</span>';
  h.onclick=()=>c.classList.toggle('closed');
  const b=document.createElement('div');
  b.className='body';
  build(b);
  c.append(h,b);
  return c;
}

function labelInput(label,key,placeholder=''){
  const l=document.createElement('label');
  l.className='fld';
  l.innerHTML='<span>'+label+'</span>';
  const i=document.createElement('input');
  i.type='text';
  i.placeholder=placeholder;
  i.value=state[key]||'';
  i.oninput=()=>{state[key]=i.value;refresh();};
  l.append(i);
  return l;
}

function labelArea(label,key,placeholder=''){
  const l=document.createElement('label');
  l.className='fld';
  l.innerHTML='<span>'+label+'</span>';
  const i=document.createElement('textarea');
  i.placeholder=placeholder;
  i.value=state[key]||'';
  i.oninput=()=>{state[key]=i.value;refresh();};
  l.append(i);
  return l;
}

function chip(text,on,cb,rf=false){
  const s=document.createElement('span');
  s.className='chip'+(rf?' rf':'')+(on?' on':'');
  s.textContent=text;
  s.onclick=()=>{cb(!s.classList.contains('on')); render(); refresh();};
  return s;
}

function group(title){
  const d=document.createElement('div');
  d.className='group';
  d.textContent=title;
  return d;
}

function appendLine(key,text){
  const line='- '+up(text);
  const current=clean(state[key]||'');
  state[key]=current ? current+'\n'+line : line;
}

function render(){
  const form=$('form');
  form.innerHTML='';

  form.append(card('1 · MODO DE NOTA',true,b=>{
    const box=document.createElement('div');
    box.className='mode';
    ['EVOLUÇÃO','REAVALIAÇÃO'].forEach(mode=>{
      const bt=document.createElement('button');
      bt.textContent=mode;
      bt.className=state.modo===mode?'on':'';
      bt.onclick=()=>{state.modo=mode; render(); refresh();};
      box.append(bt);
    });
    b.append(box);
  }));

  form.append(card('2 · QUEIXAS PRINCIPAIS E HDA',true,b=>{
    b.append(
      labelInput('QUEIXAS PRINCIPAIS (LINHA ÚNICA)','qp','EX.: DOR ABDOMINAL, NÁUSEAS E VÔMITOS'),
      labelInput('ACOMPANHAMENTO','acomp','ACOMPANHADO(A) / DESACOMPANHADO(A)'),
      labelArea('DESCRIÇÃO DA QUEIXA','desc','EX.: DOR EM FLANCO ESQUERDO, PROGRESSIVA, SEM IRRADIAÇÃO'),
      labelInput('TEMPO','tempo','EX.: 2 DIAS / 6 HORAS'),
      labelArea('SINTOMAS ASSOCIADOS','assoc','EX.: NÁUSEAS, VÔMITOS, FEBRE'),
      labelArea('QUEIXAS SECUNDÁRIAS / REFERE TAMBÉM','sec','EX.: REFERE TAMBÉM...'),
      labelArea('NEGA / RED FLAGS NEGATIVAS','nega','EX.: NEGA FEBRE, VÔMITOS, DISÚRIA, SANGRAMENTO, DISPNEIA'),
      group('ATALHOS DE SINTOMAS')
    );
    const g=document.createElement('div');
    g.className='chips';
    symptomChips.forEach(x=>g.append(chip(x,false,()=>{ state.assoc=clean((state.assoc?state.assoc+', ':'')+x); })));
    b.append(g,group('RED FLAGS'));
    const r=document.createElement('div');
    r.className='chips';
    redFlags.forEach(x=>r.append(chip(x,!!state.red[x],v=>{state.red[x]=v;},true)));
    b.append(r);
  }));

  form.append(card('3 · HPP E MEDICAÇÕES DE USO CONTÍNUO',false,b=>{
    b.append(
      labelArea('COMORBIDADES','comorb','NA SE AUSENTE'),
      labelArea('ALERGIAS','alerg','NA SE AUSENTE'),
      labelArea('MEDICAÇÕES DE USO CONTÍNUO','medcont','EX.: LOSARTANA 50 MG 1-0-0; METFORMINA 850 MG 1-0-1')
    );
  }));

  form.append(card('4 · SINAIS VITAIS',false,b=>{
    const r1=document.createElement('div'); r1.className='row';
    r1.append(labelInput('FC','fc'),labelInput('FR','fr'),labelInput('STO2','sat'));
    const r2=document.createElement('div'); r2.className='row';
    r2.append(labelInput('TAX','tax'),labelInput('PA','pa','120/80'),labelInput('HGT','hgt'),labelInput('DOR 0-10','dor'));
    b.append(r1,r2);
  }));

  form.append(card('5 · EXAME FÍSICO',false,b=>{
    b.append(
      labelArea('GERAL','geral','BEG, LOTE, HIDRATADO(A), EUPNEICO(A)...'),
      labelArea('ACV','acv','RCR 2T, BNF, SEM SOPROS'),
      labelArea('AR','ar','MV PRESENTE BILATERALMENTE, SEM RA'),
      labelArea('ABD','abd','ABD FLÁCIDO, DOLOROSO/INDOLOR À PALPAÇÃO, SEM IRRITAÇÃO PERITONEAL'),
      labelArea('NEUROLÓGICO','neuro','GLASGOW 15, SEM DÉFICIT FOCAL, PUPILAS...'),
      labelArea('MMII - PESQUISA DE TVP','mmii','SEM EDEMA, PANTURRILHAS LIVRES, SEM EMPASTAMENTO, PULSOS...'),
      labelArea('OUTROS - PSIQ / TEGUMENTAR / ORO / OTO','outros','NA OU ACHADOS ESPECÍFICOS')
    );
  }));

  form.append(card('6 · HIPÓTESE DIAGNÓSTICA',false,b=>{
    b.append(labelArea('HIPÓTESE DIAGNÓSTICA - MÚLTIPLAS LINHAS','hd','- DOR ABDOMINAL A ESCLARECER\n- ...'));
  }));

  form.append(card('7 · PRESCRIÇÕES / MEDICAÇÕES COM DOSE',false,b=>{
    b.append(labelArea('PRESCRIÇÕES / MEDICAÇÕES','prescr','- DIPIRONA 1 G EV AGORA\n- ONDANSETRONA 4 MG EV AGORA'));
    b.append(group('ATALHOS DE MEDICAÇÕES'));
    const g=document.createElement('div'); g.className='chips';
    quickMeds.forEach(x=>g.append(chip(x,false,()=>appendLine('prescr',x))));
    b.append(g);
  }));

  form.append(card('8 · CONDUTA / SOLICITAÇÕES',false,b=>{
    b.append(labelArea('CONDUTA - MÚLTIPLAS LINHAS','conduta','- SOLICITO LABORATÓRIO DE RASTREIO INFECCIOSO\n- SOLICITO EXAMES DE IMAGEM\n- REAVALIAR APÓS'));
    b.append(group('CONDUTAS RÁPIDAS'));
    const g=document.createElement('div'); g.className='chips';
    quickCondutas.forEach(x=>g.append(chip(x,false,()=>appendLine('conduta',x))));
    b.append(g);
  }));

  form.append(card('9 · REAVALIAÇÃO / EM TEMPO / STATUS',false,b=>{
    b.append(
      labelArea('EM TEMPO DA REAVALIAÇÃO','emtempo','EX.: PACIENTE REAVALIADO APÓS MEDICAÇÃO, REFERE MELHORA...'),
      labelArea('EXAMES COMPLEMENTARES JÁ FORMATADOS','excomp','COLE AQUI O RESULTADO DO TRANSFORMADOR, SE DESEJAR'),
      group('STATUS DO ATENDIMENTO')
    );
    const s=document.createElement('div'); s.className='status';
    statuses.forEach(x=>{
      const bt=document.createElement('button');
      bt.textContent=x;
      bt.className=state.status===x?'on':'';
      bt.onclick=()=>{state.status=state.status===x?'':x; render(); refresh();};
      s.append(bt);
    });
    b.append(s);
  }));

  form.append(card('10 · TRANSFORMADOR DE EXAMES',true,b=>{
    b.append(labelArea('COLE O EXAME CRU AQUI','raw','LABORATÓRIO, TC, RX, ECG / LAUDO...'));
    const bt=document.createElement('button');
    bt.className='btn coral';
    bt.textContent='TRANSFORMAR EXAMES';
    bt.onclick=()=>{
      active='exames';
      document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on',t.dataset.tab===active));
      userEdited=false;
      refresh();
      if(isMobile()) setMobileView('output');
    };
    b.append(bt);
  }));
}

function medBlock(){
  const m=up(state.medcont);
  if(!m || m==='NA') return '- MEDICAÇÕES DE USO CONTÍNUO:\n  - NA';
  return '- MEDICAÇÕES DE USO CONTÍNUO:\n'+m.split(/\n|;/).map(x=>clean(x)).filter(Boolean).map(x=>'  - '+up(x)).join('\n');
}

function hda(){
  const qp=up(state.qp)||'[QUEIXAS PRINCIPAIS]';
  let p='PACIENTE COMPARECE AO PS, '+up(state.acomp||'DESACOMPANHADO(A)')+', COM QUEIXAS DE '+qp;
  if(state.desc) p+=', DESCRITAS COMO '+up(state.desc);
  p+=' HÁ '+(up(state.tempo)||'[TEMPO]');
  if(state.assoc) p+=', ASSOCIADO A '+up(state.assoc);
  p+='.';
  if(state.sec) p+=' REFERE TAMBÉM '+up(state.sec).replace(/\.$/,'')+'.';
  if(state.nega) p+=' NEGA '+up(state.nega).replace(/^NEGA\s+/,'').replace(/\.$/,'')+'.';
  else p+=' NEGA DEMAIS QUEIXAS.';
  return p;
}

function vitals(){
  return [
    '- FC: '+(state.fc?up(state.fc)+' BPM':'NA'),
    '- FR: '+(state.fr?up(state.fr)+' IRPM':'NA'),
    '- STO2: '+(state.sat?up(state.sat)+'%':'NA'),
    '- TAX: '+(state.tax?up(state.tax)+' C':'NA'),
    '- PA: '+(state.pa?up(state.pa)+' MMHG':'NA'),
    state.hgt?'- HGT: '+up(state.hgt):'',
    state.dor?'- DOR: '+up(state.dor)+'/10':''
  ].filter(Boolean).join('\n');
}

function exam(){
  return [
    '- GERAL: '+na(up(state.geral)),
    '- ACV: '+na(up(state.acv)),
    '- AR: '+na(up(state.ar)),
    '- ABD: '+na(up(state.abd)),
    '- NEUROLÓGICO: '+na(up(state.neuro)),
    '- MMII: '+na(up(state.mmii)),
    '- OUTROS: '+na(up(state.outros))
  ].join('\n');
}

function note(){
  const t=[];
  t.push('## '+state.modo+' PRONTO SOCORRO - HOSPITAL MERIDIONAL SERRA ##','');
  t.push('# QP: "'+(up(state.qp)||'[QUEIXAS PRINCIPAIS]')+'"','');
  t.push('# HDA:');
  if(state.modo==='REAVALIAÇÃO'){
    t.push('HDA DA ADMISSÃO: '+hda(),'');
    t.push('# EM TEMPO:');
    t.push(na(up(state.emtempo)));
  }else{
    t.push(hda());
  }
  t.push('','# HPP:');
  t.push('- COMORBIDADES: '+na(up(state.comorb)));
  t.push('- ALERGIAS: '+na(up(state.alerg)));
  t.push(medBlock());
  t.push('','# SINAIS VITAIS:',vitals(),'','# EXAME FÍSICO:',exam(),'','# HIPÓTESE DIAGNÓSTICA:',fmtLines(state.hd));
  if(state.prescr){
    t.push('','# PRESCRIÇÕES:',fmtLines(state.prescr));
  }
  if(state.modo==='REAVALIAÇÃO'){
    t.push('','# EXAMES COMPLEMENTARES:',na(up(state.excomp||transformExams(state.raw))));
  }
  t.push('','# CONDUTA:',fmtLines(state.conduta));
  return clean(t.join('\n'));
}

function adc(){
  const s=up(state.status)||'[STATUS]';
  let base='PACIENTE REAVALIADO(A), HEMODINAMICAMENTE ESTÁVEL NO MOMENTO, SEM SINAIS DE INSTABILIDADE CLÍNICA IMEDIATA. ';
  if(state.emtempo) base+=up(state.emtempo)+' ';
  if(/ALTA/.test(s)){
    base+='APRESENTA CONDIÇÕES CLÍNICAS PARA ALTA NO MOMENTO. ORIENTADOS SINAIS DE ALARME, RETORNO IMEDIATO SE PIORA, ADESÃO À PRESCRIÇÃO E SEGUIMENTO AMBULATORIAL. ALTA MÉDICA.';
  }else{
    base+='MANTENHO '+s+' PARA SEGUIMENTO, REAVALIAÇÃO E DEFINIÇÃO DE CONDUTA.';
  }
  return clean(base);
}

function handoff(){
  return clean([
    'SITUAÇÃO:',
    '- PACIENTE EM '+(up(state.status)||'ATENDIMENTO')+' POR '+(up(state.qp)||'[QUEIXAS PRINCIPAIS]')+'.',
    '',
    'BACKGROUND:',
    '- '+hda(),
    '- COMORBIDADES: '+na(up(state.comorb))+'.',
    '',
    'AVALIAÇÃO:',
    '- SINAIS VITAIS: FC '+na(up(state.fc))+' / FR '+na(up(state.fr))+' / STO2 '+na(up(state.sat))+' / PA '+na(up(state.pa))+' / TAX '+na(up(state.tax))+'.',
    '- HD: '+na(up(state.hd)).replace(/\n/g,'; ')+'.',
    '',
    'RECOMENDAÇÃO:',
    fmtLines(state.conduta)
  ].join('\n'));
}

function pick(re,t){
  const m=t.match(re);
  return m?clean(m[1]):'';
}

function pushIf(out,label,parts){
  const vals=parts.filter(Boolean);
  if(vals.length) out.push('- '+label+': '+vals.join(' / ')+'.');
}

function summarize(text){
  return clean(text).replace(/\s*\.\s*/g,'. ').replace(/\n+/g,' ').trim();
}

function transformExams(raw){
  const source=String(raw||'');
  if(!source.trim()) return '';
  const t=clean(source);
  const f=flat(source);
  const out=[];

  const hb=pick(/Hemoglobina\s*([0-9.,]+)/i,f);
  const ht=pick(/Hematócrito\s*([0-9.,]+)/i,f);
  const leuco=pick(/Leucócitos\s*([0-9.]+)/i,f);
  const bast=pick(/Bastonetes\s*([0-9.,]+)/i,f);
  const seg=pick(/Segmentados\s*([0-9.,]+)/i,f);
  const eos=pick(/Eosinófilos\s*([0-9.,]+)/i,f);
  const baso=pick(/Basófilos\s*([0-9.,]+)/i,f);
  const linf=pick(/Linfócitos Típicos\s*([0-9.,]+)/i,f);
  const mono=pick(/Monócitos\s*([0-9.,]+)/i,f);
  const plaq=pick(/Contagem de Plaquetas\s*([0-9.]+)/i,f);
  pushIf(out,'HEMOGRAMA',[hb&&'HB '+hb,ht&&'HT '+ht,leuco&&'LEUCO '+leuco,plaq&&'PLAQ '+plaq,bast&&'BAST '+bast+'%',seg&&'SEG '+seg+'%',linf&&'LINF '+linf+'%',mono&&'MONO '+mono+'%',eos&&'EOS '+eos+'%',baso&&'BASO '+baso+'%']);

  const cr=pick(/CREATININA\s+RESULTADO\s*([0-9.,]+)/i,f);
  const rfg=pick(/TAXA FILTRAÇÃO GLOMERULAR\s*([^\.\n]+(?:mL\/min\/1[.,]73m2)?)/i,f);
  const ureia=pick(/UREIA\s*([0-9.,]+)\s*mg\/dL/i,f);
  const bun=pick(/NITROGENIO UREICO\s*([0-9.,]+)/i,f);
  pushIf(out,'FUNÇÃO RENAL',[cr&&'CREATININA '+cr,ureia&&'UREIA '+ureia,bun&&'NU '+bun,rfg&&'RFG '+up(rfg)]);

  const tgp=pick(/TRANSAMINASE GLUTAMICO PIRUVICA\s+RESULTADO\s*([0-9.,]+)/i,f);
  const tgo=pick(/TRANSAMINASE GLUTAMICO OXALACETICA\s+RESULTADO\s*([0-9.,]+)/i,f);
  const pcr=pick(/PROTEINA\s+"?C"?\s+REATIVA\s+RESULTADO\s*([0-9.,]+)/i,f);
  const amilase=pick(/AMILASE SERICA\s+RESULTADO\s*([0-9.,]+)/i,f);
  const lipase=pick(/LIPASE\s+RESULTADO\s*([0-9.,]+)/i,f);
  pushIf(out,'BIOQUÍMICA',[tgo&&'TGO '+tgo,tgp&&'TGP '+tgp,pcr&&'PCR '+pcr+' MG/L',amilase&&'AMILASE '+amilase,lipase&&'LIPASE '+lipase]);

  const ph=pick(/pH\s*([0-9.,]+)/i,f);
  const dens=pick(/DENSIDADE\s*([0-9.]+)/i,f);
  const prot=pick(/PROTEINA\s*(\+\+\+|\+\+|\+|NÃO DETECTADO|NORMAL)/i,f);
  const nit=pick(/NITRITO\s*(NÃO DETECTADO|DETECTADO|NORMAL)/i,f);
  const leucUr=pick(/LEUCOCITO\s*(NÃO DETECTADO|DETECTADO|NORMAL)/i,f);
  const hemac=pick(/HEMACIAS\s*(AUSENTE\(S\)|[0-9.,]+)/i,f);
  const pioc=pick(/PIOCITOS\s*([0-9.,]+)/i,f);
  const muco=pick(/MUCO\s*(\+\+\+|\+\+|\+|AUSENTE)/i,f);
  const flora=pick(/FLORA BACTERIANA\s*([A-ZÀ-Úa-zà-ú ]+?)(?= CRISTAIS| CILINDROS| FUNGOS| PROTOZOARIO| Observações gerais| Método)/i,f);
  pushIf(out,'EAS',[ph&&'PH '+ph,dens&&'DENS '+dens,prot&&'PROT '+up(prot),nit&&'NITRITO '+up(nit),leucUr&&'LEUC '+up(leucUr),hemac&&'HEMÁCIAS '+up(hemac),pioc&&'PIÓCITOS '+pioc,muco&&'MUCO '+up(muco),flora&&'FLORA '+up(flora)]);

  if(/TOMOGRAFIA COMPUTADORIZADA/i.test(f)){
    const title=pick(/(TOMOGRAFIA COMPUTADORIZADA DE [A-ZÀ-Úa-zà-ú ]+? COM CONTRASTE)/i,f) || 'TOMOGRAFIA COMPUTADORIZADA';
    const imp=pick(/IMPRESSÃO DIAGNÓSTICA\s*([\s\S]*?)(?=HEMOGRAMA|RX DO TÓRAX|$)/i,t);
    if(imp){
      const pieces=imp.split('.').map(x=>summarize(x)).filter(Boolean).map(x=>up(x));
      out.push('- '+up(title)+': '+pieces.join(' / ')+'.');
    }
  }

  if(/RX DO TÓRAX|RX DE TÓRAX|RAIO-X DO TÓRAX/i.test(f)){
    const inter=pick(/INTERPRETAÇ(?:ÃO|AO):\s*([\s\S]*?)$/i,t) || pick(/RX DO TÓRAX PA:\s*([\s\S]*?)INTERPRETAÇ(?:ÃO|AO)/i,t);
    if(inter) out.push('- RX DE TÓRAX: '+up(summarize(inter))+'.');
  }

  if(/ECG|ELETROCARDIOGRAMA/i.test(f)){
    const ecg=pick(/(?:CONCLUSÃO|CONCLUSAO|INTERPRETAÇÃO|INTERPRETACAO|LAUDO)[:\s]+([\s\S]*?)$/i,t);
    if(ecg) out.push('- ECG: '+up(summarize(ecg))+'.');
  }

  return clean(out.join('\n')) || '- EXAMES COMPLEMENTARES: NÃO FOI POSSÍVEL TRANSFORMAR AUTOMATICAMENTE. REVISAR TEXTO CRU.';
}

function refresh(){
  let txt='';
  if(active==='nota') txt=note();
  else if(active==='exames') txt=transformExams(state.raw);
  else if(active==='adc') txt=adc();
  else txt=handoff();

  if(!userEdited) $('out').value=txt;
  $('alert').classList.toggle('show',!!Object.values(state.red).find(Boolean)&&/ALTA/i.test(state.status));
  $('hint').textContent=active==='exames'
    ? 'Cole exames crus do sistema. O parser resume TC, hemograma, função renal, bioquímica, EAS e RX em formato compacto.'
    : 'Texto editável antes de copiar.';
}

document.querySelectorAll('.tab').forEach(tab=>{
  tab.onclick=()=>{
    active=tab.dataset.tab;
    document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x===tab));
    userEdited=false;
    refresh();
    if(isMobile()) setMobileView('output');
  };
});

$('out').oninput=()=>userEdited=true;

$('regen').onclick=()=>{
  userEdited=false;
  refresh();
  if(isMobile()) setMobileView('output');
};

$('copy').onclick=async()=>{
  try{
    await navigator.clipboard.writeText($('out').value);
  }catch(e){
    $('out').select();
    document.execCommand('copy');
  }
  const b=$('copy');
  const old=b.textContent;
  b.textContent='Copiado';
  b.classList.add('ok');
  setTimeout(()=>{b.textContent=old;b.classList.remove('ok')},1200);
};

$('reset').onclick=()=>{
  if(!confirm('Resetar tudo?')) return;
  Object.keys(state).forEach(k=>{
    if(k==='modo') state[k]='EVOLUÇÃO';
    else if(k==='acomp') state[k]='DESACOMPANHADO(A)';
    else if(k==='red') state[k]={};
    else state[k]='';
  });
  render();
  refresh();
  setMobileView('form');
};

$('expand').onclick=()=>document.querySelectorAll('.card').forEach(c=>c.classList.remove('closed'));
$('collapse').onclick=()=>document.querySelectorAll('#form .card').forEach(c=>c.classList.add('closed'));

if($('showForm')) $('showForm').onclick=()=>setMobileView('form');
if($('showOutput')) $('showOutput').onclick=()=>setMobileView('output');

window.addEventListener('resize',()=>{
  if(!isMobile()) setMobileView('form');
});

render();
refresh();
setMobileView('form');
