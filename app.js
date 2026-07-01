const $=id=>document.getElementById(id);
const clean=t=>String(t||'').replace(/[\u201C\u201D]/g,'"').replace(/[\u2018\u2019]/g,"'").replace(/[\u2013\u2014]/g,'-').replace(/[•●▪‣⁃*]/g,'-').replace(/[<>]/g,'').replace(/&/g,'E').replace(/https?:\/\/\S+/gi,'').replace(/Chave de acesso:\s*\S+/gi,'').replace(/Resultado completo acesse:\s*\S+/gi,'').replace(/Assinado eletronicamente por[^\n]+/gi,'').replace(/Responsável técnico:[^\n]+/gi,'').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu,'').replace(/[^\S
]+/g,' ').replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
const flat=t=>clean(t).replace(/\s+/g,' ').trim();
const up=t=>clean(t).toUpperCase();
const na=v=>clean(v)||'NA';
const fmtLines=x=>{x=up(x);if(!x)return '- NA';return x.split('\n').map(s=>clean(s)).filter(Boolean).map(s=>s.startsWith('-')?s:'- '+s).join('\n')};
const state={modo:'EVOLUÇÃO',qp:'',acomp:'DESACOMPANHADO(A)',desc:'',tempo:'',assoc:'',sec:'',nega:'',medcont:'',comorb:'',alerg:'',fc:'',fr:'',sat:'',tax:'',pa:'',hgt:'',dor:'',geral:'',acv:'',ar:'',abd:'',neuro:'',mmii:'',outros:'',hd:'',conduta:'',status:'',emtempo:'',excomp:'',raw:'',red:{}};
const redFlags=['DOR TORÁCICA','DISPNEIA','SÍNCOPE','DÉFICIT FOCAL','REBAIXAMENTO','INSTABILIDADE HEMODINÂMICA','FEBRE PERSISTENTE','SANGRAMENTO','VÔMITOS INCOERCÍVEIS','DEFESA/RIGIDEZ/BLUMBERG','GESTAÇÃO','IMUNOSSUPRESSÃO'];
const sx=['DOR ABDOMINAL','DOR EPIGÁSTRICA','NÁUSEAS','VÔMITOS','DIARREIA','FEBRE','CEFALEIA','TONTURA','DOR TORÁCICA','DISPNEIA','TOSSE','ODINOFAGIA','DISÚRIA','LOMBALGIA','PALPITAÇÕES','SUDORESE','IRRADIAÇÃO','PARESTESIA'];
const cond=['MEDICAÇÃO SINTOMÁTICA','ANALGESIA','ANTIEMÉTICO','ANTITÉRMICO','HIDRATAÇÃO EV','HIDRATAÇÃO VO','EXAMES LABORATORIAIS','ECG','TROPONINA','RX','TC','USG','EAS','PARECER ESPECIALISTA','OBSERVAÇÃO CLÍNICA','REAVALIAÇÃO APÓS MEDICAÇÃO','ALTA COM ORIENTAÇÕES','INTERNAÇÃO SOLICITADA'];
const statusList=['ALTA','AGUARDA EXAMES','AGUARDA PARECER','OBSERVAÇÃO CLÍNICA','SALA VERMELHA','INTERNAÇÃO SOLICITADA'];
let active='nota', userEdited=false;
function card(title,open,fn){const c=document.createElement('div');c.className='card'+(open?'':' closed');const h=document.createElement('div');h.className='head';h.innerHTML='<h2>'+title+'</h2><span class="chev">▼</span>';h.onclick=()=>c.classList.toggle('closed');const b=document.createElement('div');b.className='body';fn(b);c.append(h,b);return c}
function inp(label,key,ph=''){const l=document.createElement('label');l.innerHTML='<span>'+label+'</span>';const i=document.createElement('input');i.value=state[key]||'';i.placeholder=ph;i.oninput=()=>{state[key]=i.value;refresh()};l.append(i);return l}
function area(label,key,ph=''){const l=document.createElement('label');l.innerHTML='<span>'+label+'</span>';const i=document.createElement('textarea');i.value=state[key]||'';i.placeholder=ph;i.oninput=()=>{state[key]=i.value;refresh()};l.append(i);return l}
function chip(text,on,cb,rf=false){const s=document.createElement('span');s.className='chip '+(rf?'rf ':'')+(on?'on':'');s.textContent=text;s.onclick=()=>{cb(!s.classList.contains('on'));render();refresh()};return s}
function group(t){const d=document.createElement('div');d.className='group';d.textContent=t;return d}
function render(){const f=$('form');f.innerHTML='';f.append(card('1 · Modo de nota',true,b=>{const m=document.createElement('div');m.className='mode';['EVOLUÇÃO','REAVALIAÇÃO'].forEach(x=>{const bt=document.createElement('button');bt.textContent=x;bt.className=state.modo===x?'on':'';bt.onclick=()=>{state.modo=x;render();refresh()};m.append(bt)});b.append(m)}));
f.append(card('2 · QP e HDA',true,b=>{b.append(inp('QP em linha única','qp','ex.: DOR ABDOMINAL'),inp('Acompanhamento','acomp','ACOMPANHADO(A) / DESACOMPANHADO(A)'),area('Descrição da queixa','desc','ex.: dor em flanco esquerdo, progressiva, sem irradiação'),inp('Tempo','tempo','ex.: 2 DIAS / 6 HORAS'),area('Sintomas associados','assoc','ex.: náuseas, vômitos, febre'),area('Queixas secundárias / refere também','sec','ex.: refere também...'),area('Nega / red flags negativas','nega','ex.: nega febre, vômitos, disúria, sangramento, dispneia'),group('Chips rápidos de sintomas'));const g=document.createElement('div');g.className='chips';sx.forEach(x=>g.append(chip(x,false,v=>{state.assoc=clean((state.assoc?state.assoc+', ':'')+x)})));b.append(g,group('Red flags de segurança'));const r=document.createElement('div');r.className='chips';redFlags.forEach(x=>r.append(chip(x,!!state.red[x],v=>state.red[x]=v,true)));b.append(r)}));
f.append(card('3 · HPP e medicações',false,b=>{b.append(area('Comorbidades','comorb','NA se ausente'),area('Alergias','alerg','NA se ausente'),area('Medicações de uso contínuo','medcont','Pode deixar linhas em branco para completar à mão'))}));
f.append(card('4 · Sinais vitais',false,b=>{const r1=document.createElement('div');r1.className='row';r1.append(inp('FC','fc'),inp('FR','fr'),inp('STO2','sat'));const r2=document.createElement('div');r2.className='row';r2.append(inp('TAX','tax'),inp('PA','pa','120/80'),inp('HGT','hgt'),inp('DOR 0-10','dor'));b.append(r1,r2)}));
f.append(card('5 · Exame físico',false,b=>{b.append(area('GERAL','geral','BEG, LOTE, HIDRATADO(A), EUPNEICO(A)...'),area('ACV','acv','RCR 2T, BNF, SEM SOPROS'),area('AR','ar','MV PRESENTE BILATERALMENTE, SEM RA'),area('ABD','abd','ABD FLÁCIDO, DOLOROSO/INDOLOR À PALPAÇÃO, SEM IRRITAÇÃO PERITONEAL'),area('NEUROLÓGICO','neuro','GLASGOW 15, SEM DÉFICIT FOCAL, PUPILAS...'),area('MMII - pesquisa de TVP','mmii','SEM EDEMA, PANTURRILHAS LIVRES, SEM EMPASTAMENTO, PULSOS...'),area('OUTROS - PSIQ/TEGUMENTAR/ORO/OTO','outros','NA ou achados específicos'))}));
f.append(card('6 · Hipótese e conduta',false,b=>{b.append(area('Hipótese diagnóstica - múltiplas linhas','hd','- DOR ABDOMINAL A ESCLARECER\n- ...'),area('Conduta - múltiplas linhas','conduta','- EXAMES LABORATORIAIS\n- MEDICAÇÃO SINTOMÁTICA'));const g=document.createElement('div');g.className='chips';cond.forEach(x=>g.append(chip(x,false,v=>{state.conduta=clean((state.conduta?state.conduta+'\n':'')+'- '+x)})));b.append(group('Condutas rápidas'),g)}));
f.append(card('7 · Reavaliação / EM TEMPO / Status',false,b=>{b.append(area('EM TEMPO da reavaliação','emtempo','ex.: paciente reavaliado após medicação, refere melhora...'),area('Exames complementares já formatados','excomp','Cole aqui o resultado do transformador, se desejar'),group('Status do atendimento'));const s=document.createElement('div');s.className='status';statusList.forEach(x=>{const bt=document.createElement('button');bt.textContent=x;bt.className=state.status===x?'on':'';bt.onclick=()=>{state.status=state.status===x?'':x;render();refresh()};s.append(bt)});b.append(s)}));
f.append(card('8 · Transformador de exames',true,b=>{b.append(area('Cole o exame cru aqui','raw','Laboratório, TC, RX, ECG/laudo...'));const bt=document.createElement('button');bt.className='btn coral';bt.textContent='Transformar exames';bt.onclick=()=>{active='exames';document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on',t.dataset.tab===active));userEdited=false;refresh()};b.append(bt)}));}
function medBlock(){let m=up(state.medcont);if(!m||m==='NA')return '- MEDICAÇÕES DE USO CONTÍNUO:\n  - NA\n  - \n  - ';return '- MEDICAÇÕES DE USO CONTÍNUO:\n'+m.split(/\n|;/).filter(Boolean).map(x=>'  - '+up(x)).join('\n')+'\n  - \n  - '}
function hda(){let qp=up(state.qp)||'[QUEIXA]';let p='PACIENTE COMPARECE AO PS, '+up(state.acomp||'DESACOMPANHADO(A)')+' COM QUEIXA DE '+qp;if(state.desc)p+=' DE '+up(state.desc);p+=' HÁ '+(up(state.tempo)||'[TEMPO]');if(state.assoc)p+=', ASSOCIADO A '+up(state.assoc);p+='.';if(state.sec)p+=' REFERE TAMBÉM '+up(state.sec).replace(/\.$/,'')+'.';if(state.nega)p+=' NEGA '+up(state.nega).replace(/^NEGA\s+/,'').replace(/\.$/,'')+'.';else p+=' NEGA DEMAIS QUEIXAS.';return p}
function vit(){return ['- FC: '+(state.fc?up(state.fc)+' BPM':'NA'),'- FR: '+(state.fr?up(state.fr)+' IRPM':'NA'),'- STO2: '+(state.sat?up(state.sat)+'%':'NA'),'- TAX: '+(state.tax?up(state.tax)+' C':'NA'),'- PA: '+(state.pa?up(state.pa)+' MMHG':'NA'), state.hgt?'- HGT: '+up(state.hgt):'', state.dor?'- DOR: '+up(state.dor)+'/10':''].filter(Boolean).join('\n')}
function exam(){return ['- GERAL: '+na(up(state.geral)),'- ACV: '+na(up(state.acv)),'- AR: '+na(up(state.ar)),'- ABD: '+na(up(state.abd)),'- NEUROLÓGICO: '+na(up(state.neuro)),'- MMII: '+na(up(state.mmii)),'- OUTROS: '+na(up(state.outros))].join('\n')}
function nota(){let t=[];t.push('## '+state.modo+' PRONTO SOCORRO - HOSPITAL MERIDIONAL SERRA ##','');t.push('# QP: "'+(up(state.qp)||'[QUEIXA PRINCIPAL]')+'"','');t.push('# HDA:'); if(state.modo==='REAVALIAÇÃO'){t.push('HDA DA ADMISSÃO: '+hda(),'');t.push('# EM TEMPO:');t.push(na(up(state.emtempo)));}else t.push(hda());t.push('','# HPP:','- COMORBIDADES: '+na(up(state.comorb)),'- ALERGIAS: '+na(up(state.alerg)),medBlock(),'','# SINAIS VITAIS:',vit(),'','# EXAME FÍSICO:',exam());if(state.modo==='REAVALIAÇÃO'){t.push('','# EXAMES COMPLEMENTARES:',na(up(state.excomp||transformExams(state.raw))))}t.push('','# HIPÓTESE DIAGNÓSTICA:',fmtLines(state.hd),'','# CONDUTA:',fmtLines(state.conduta));return clean(t.join('\n'))}
function adc(){const s=up(state.status)||'[STATUS]';let base='PACIENTE REAVALIADO(A), HEMODINAMICAMENTE ESTÁVEL NO MOMENTO, SEM SINAIS DE INSTABILIDADE CLÍNICA IMEDIATA. '+(state.emtempo?up(state.emtempo)+' ':'');if(/ALTA/.test(s))base+='APRESENTA CONDIÇÕES CLÍNICAS PARA ALTA NO MOMENTO. ORIENTADOS SINAIS DE ALARME, RETORNO IMEDIATO SE PIORA, ADESÃO À PRESCRIÇÃO E SEGUIMENTO AMBULATORIAL. ALTA MÉDICA.';else base+='MANTIDO(A) EM '+s+' PARA SEGUIMENTO, REAVALIAÇÃO E DEFINIÇÃO DE CONDUTA.';return clean(base)}
function passagem(){return clean(['SITUAÇÃO:','- PACIENTE EM '+(up(state.status)||'ATENDIMENTO')+' POR '+(up(state.qp)||'[QUEIXA]')+'.','','BACKGROUND:','- '+hda(),'- COMORBIDADES: '+na(up(state.comorb))+'.','','AVALIAÇÃO:','- SINAIS VITAIS: FC '+na(up(state.fc))+' / FR '+na(up(state.fr))+' / STO2 '+na(up(state.sat))+' / PA '+na(up(state.pa))+' / TAX '+na(up(state.tax))+'.','- HD: '+na(up(state.hd)).replace(/\n/g,'; ')+'.','','RECOMENDAÇÃO:',fmtLines(state.conduta)].join('\n'))}
function pick(re,t){const m=t.match(re);return m?clean(m[1]):''}
function pushIf(out,label,parts){const vals=parts.filter(Boolean);if(vals.length)out.push('- '+label+': '+vals.join(' / ')+'.')}
function summarize(text){return clean(text).replace(/\s*\.\s*/g,'. ').replace(/\n+/g,' ').trim()}
function transformExams(raw){
  let source=String(raw||'');
  if(!source.trim()) return '';
  let t=clean(source);
  let f=flat(source);
  let out=[];

  let hb=pick(/Hemoglobina\s*([0-9.,]+)/i,f);
  let ht=pick(/Hematócrito\s*([0-9.,]+)/i,f);
  let leuco=pick(/Leucócitos\s*([0-9.]+)/i,f);
  let bast=pick(/Bastonetes\s*([0-9.,]+)/i,f);
  let seg=pick(/Segmentados\s*([0-9.,]+)/i,f);
  let eos=pick(/Eosinófilos\s*([0-9.,]+)/i,f);
  let baso=pick(/Basófilos\s*([0-9.,]+)/i,f);
  let linf=pick(/Linfócitos Típicos\s*([0-9.,]+)/i,f);
  let mono=pick(/Monócitos\s*([0-9.,]+)/i,f);
  let plaq=pick(/Contagem de Plaquetas\s*([0-9.]+)/i,f);
  pushIf(out,'HEMOGRAMA',[hb&&'HB '+hb,ht&&'HT '+ht,leuco&&'LEUCO '+leuco,bast&&'BAST '+bast+'%',seg&&'SEG '+seg+'%',eos&&'EOS '+eos+'%',baso&&'BASO '+baso+'%',linf&&'LINF '+linf+'%',mono&&'MONO '+mono+'%',plaq&&'PLAQ '+plaq]);

  let cr=pick(/CREATININA\s+RESULTADO\s*([0-9.,]+)/i,f);
  let rfg=pick(/TAXA FILTRAÇÃO GLOMERULAR\s*([^\n]+?mL\/min\/1[.,]73m2|SUPERIOR A \d+)/i,f);
  let ureia=pick(/UREIA\s*([0-9.,]+)\s*mg\/dL/i,f);
  let bun=pick(/NITROGENIO UREICO\s*([0-9.,]+)/i,f);
  pushIf(out,'FUNÇÃO RENAL',[cr&&'CREATININA '+cr,ureia&&'UREIA '+ureia,bun&&'NU '+bun,rfg&&'RFG '+rfg.toUpperCase()]);

  let tgp=pick(/TRANSAMINASE GLUTAMICO PIRUVICA\s+RESULTADO\s*([0-9.,]+)/i,f);
  let tgo=pick(/TRANSAMINASE GLUTAMICO OXALACETICA\s+RESULTADO\s*([0-9.,]+)/i,f);
  let pcr=pick(/PROTEINA\s+"?C"?\s+REATIVA\s+RESULTADO\s*([0-9.,]+)/i,f);
  let amilase=pick(/AMILASE SERICA\s+RESULTADO\s*([0-9.,]+)/i,f);
  let lipase=pick(/LIPASE\s+RESULTADO\s*([0-9.,]+)/i,f);
  pushIf(out,'BIOQUÍMICA',[tgo&&'TGO '+tgo,tgp&&'TGP '+tgp,pcr&&'PCR '+pcr+' MG/L',amilase&&'AMILASE '+amilase,lipase&&'LIPASE '+lipase]);

  let ph=pick(/pH\s*([0-9.,]+)/i,f);
  let dens=pick(/DENSIDADE\s*([0-9.]+)/i,f);
  let prot=pick(/PROTEINA\s*(\+\+\+|\+\+|\+|NÃO DETECTADO|NORMAL)/i,f);
  let nit=pick(/NITRITO\s*(NÃO DETECTADO|DETECTADO|NORMAL)/i,f);
  let leucUr=pick(/LEUCOCITO\s*(NÃO DETECTADO|DETECTADO|NORMAL)/i,f);
  let hemac=pick(/HEMACIAS\s*(AUSENTE\(S\)|[0-9.,]+)/i,f);
  let pioc=pick(/PIOCITOS\s*([0-9.,]+)/i,f);
  let muco=pick(/MUCO\s*(\+\+\+|\+\+|\+|AUSENTE)/i,f);
  let flora=pick(/FLORA BACTERIANA\s*([A-ZÀ-Úa-zà-ú ]+?)(?= CRISTAIS| CILINDROS| FUNGOS| PROTOZOARIO| Observações gerais| Método)/i,f);
  pushIf(out,'EAS',[ph&&'PH '+ph,dens&&'DENS '+dens,prot&&'PROT '+prot.toUpperCase(),nit&&'NITRITO '+nit.toUpperCase(),leucUr&&'LEUC '+leucUr.toUpperCase(),hemac&&'HEMÁCIAS '+hemac.toUpperCase(),pioc&&'PIÓCITOS '+pioc,muco&&'MUCO '+muco.toUpperCase(),flora&&'FLORA '+flora.toUpperCase()]);

  if(/TOMOGRAFIA COMPUTADORIZADA/i.test(f)){
    let title=pick(/(TOMOGRAFIA COMPUTADORIZADA DE [A-ZÀ-Úa-zà-ú ]+? COM CONTRASTE)/i,f) || 'TOMOGRAFIA COMPUTADORIZADA';
    let imp=pick(/IMPRESSÃO DIAGNÓSTICA\s*([\s\S]*?)(?=HEMOGRAMA|RX DO TÓRAX|$)/i,t);
    if(imp){
      let pieces=imp.split('.').map(x=>summarize(x)).filter(Boolean).map(x=>x.toUpperCase());
      out.push('- '+title.toUpperCase()+': '+pieces.join(' / ')+'.');
    }else out.push('- '+title.toUpperCase()+': REVISAR IMPRESSÃO DIAGNÓSTICA.');
  }

  if(/RX DO TÓRAX|RX DE TÓRAX|RAIO-X DO TÓRAX/i.test(f)){
    let inter=pick(/INTERPRETAÇ(?:ÃO|AO):\s*([\s\S]*?)$/i,t) || pick(/RX DO TÓRAX PA:\s*([\s\S]*?)INTERPRETAÇ(?:ÃO|AO)/i,t);
    if(inter) out.push('- RX DE TÓRAX: '+summarize(inter).toUpperCase()+'.');
  }

  if(/ECG|ELETROCARDIOGRAMA/i.test(f)){
    let ecg=pick(/(?:CONCLUSÃO|CONCLUSAO|INTERPRETAÇÃO|INTERPRETACAO|LAUDO)[:\s]+([\s\S]*?)$/i,t);
    if(ecg) out.push('- ECG: '+summarize(ecg).toUpperCase()+'.');
  }

  return clean(out.join('\n')) || '- EXAMES COMPLEMENTARES: NÃO FOI POSSÍVEL TRANSFORMAR AUTOMATICAMENTE. REVISAR TEXTO CRU.';
}
function refresh(){let txt=active==='nota'?nota():active==='exames'?transformExams(state.raw):active==='adc'?adc():passagem();if(!userEdited)$('out').value=txt;$('alert').classList.toggle('show',!!Object.values(state.red).find(Boolean)&&/ALTA/i.test(state.status));$('hint').textContent=active==='exames'?'Cole exames crus do sistema. O parser agora tenta resumir TC, hemograma, função renal, bioquímica, EAS e RX em formato compacto.':'Texto editável antes de copiar.'}
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{active=t.dataset.tab;document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x===t));userEdited=false;refresh()});$('out').oninput=()=>userEdited=true;$('regen').onclick=()=>{userEdited=false;refresh()};$('copy').onclick=async()=>{try{await navigator.clipboard.writeText($('out').value)}catch(e){$('out').select();document.execCommand('copy')}const b=$('copy');b.textContent='Copiado';b.classList.add('ok');setTimeout(()=>{b.textContent='Copiar';b.classList.remove('ok')},1300)};$('reset').onclick=()=>{if(confirm('Resetar tudo?')){Object.keys(state).forEach(k=>{if(k==='modo')state[k]='EVOLUÇÃO';else if(k==='acomp')state[k]='DESACOMPANHADO(A)';else if(k==='red')state[k]={};else state[k]=''});render();refresh()}};$('expand').onclick=()=>document.querySelectorAll('.card').forEach(c=>c.classList.remove('closed'));$('collapse').onclick=()=>document.querySelectorAll('#form .card').forEach(c=>c.classList.add('closed'));
render();refresh();