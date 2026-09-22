/* Ticket. 1.0.6 — análise real de qualidade, captura refinada, marca d'água e configurações compactas */
'use strict';

state.photoQuality = state.photoQuality || null;
state.receiptOriginalFile = state.receiptOriginalFile || null;
state.environmentNote = state.environmentNote || '';
state.environmentWatermarkAt = state.environmentWatermarkAt || '';

function v106BlobUrlReplace(key, blob){
  if(state[key]){ try{URL.revokeObjectURL(state[key]);}catch{} }
  state[key]=blob?URL.createObjectURL(blob):'';
}

async function v106BitmapFromBlob(blob){
  if(!blob) return null;
  return await createImageBitmap(blob);
}

async function v106AnalyzeImageQuality(blob){
  try{
    const bitmap=await v106BitmapFromBlob(blob);
    if(!bitmap) throw new Error('Imagem inválida');
    const maxSide=560;
    const scale=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height));
    const w=Math.max(1,Math.round(bitmap.width*scale));
    const h=Math.max(1,Math.round(bitmap.height*scale));
    const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(bitmap,0,0,w,h);
    const img=ctx.getImageData(0,0,w,h).data;
    let sum=0,sumSq=0,edge=0,count=0;
    const gray=new Float32Array(w*h);
    for(let i=0,p=0;i<img.length;i+=4,p++){
      const g=.299*img[i]+.587*img[i+1]+.114*img[i+2];
      gray[p]=g; sum+=g; sumSq+=g*g; count++;
    }
    const mean=sum/Math.max(1,count);
    const std=Math.sqrt(Math.max(0,sumSq/Math.max(1,count)-mean*mean));
    for(let y=1;y<h;y+=2){
      for(let x=1;x<w;x+=2){
        const i=y*w+x;
        edge+=Math.abs(gray[i]-gray[i-1])+Math.abs(gray[i]-gray[i-w]);
      }
    }
    const sharp=edge/Math.max(1,Math.floor((w-1)*(h-1)/4)*2);
    bitmap.close?.();
    let score=100;
    const issues=[];
    if(mean<55){score-=34;issues.push('Imagem escura');}
    else if(mean<82){score-=16;issues.push('Pouca iluminação');}
    else if(mean>225){score-=25;issues.push('Imagem muito clara');}
    else if(mean>205){score-=10;issues.push('Excesso de luz');}
    if(std<24){score-=28;issues.push('Baixo contraste');}
    else if(std<34){score-=12;issues.push('Contraste reduzido');}
    if(sharp<7){score-=30;issues.push('Possível desfoque');}
    else if(sharp<11){score-=13;issues.push('Nitidez moderada');}
    const minDimension=Math.min(bitmap?.width||w,bitmap?.height||h);
    if(Math.min(w,h)<260){score-=12;issues.push('Resolução reduzida');}
    score=Math.max(0,Math.min(100,Math.round(score)));
    let label='Baixa',tone='bad';
    if(score>=86){label='Excelente';tone='excellent';}
    else if(score>=70){label='Boa';tone='good';}
    else if(score>=52){label='Regular';tone='regular';}
    if(!issues.length) issues.push('Boa iluminação','Bom contraste','Nitidez adequada');
    return {score,label,tone,issues,brightness:Math.round(mean),contrast:Math.round(std),sharpness:Number(sharp.toFixed(1))};
  }catch(error){
    console.warn('Ticket: falha ao analisar qualidade da foto',error);
    return {score:0,label:'Não analisada',tone:'idle',issues:['Não foi possível analisar esta imagem']};
  }
}

async function v106ContrastBlob(blob){
  if(!blob) return blob;
  try{
    const bitmap=await v106BitmapFromBlob(blob);
    const max=1900;
    const scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(bitmap.width*scale));
    canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
    const id=ctx.getImageData(0,0,canvas.width,canvas.height);
    const d=id.data;
    for(let i=0;i<d.length;i+=4){
      const gray=.299*d[i]+.587*d[i+1]+.114*d[i+2];
      let out=(gray-128)*1.85+128;
      out=out<82?out*.82:out>178?190+(out-178)*1.25:out;
      out=Math.max(0,Math.min(255,out));
      d[i]=d[i+1]=d[i+2]=out;
    }
    ctx.putImageData(id,0,0);
    bitmap.close?.();
    return await new Promise(resolve=>canvas.toBlob(b=>resolve(b||blob),'image/jpeg',.94));
  }catch(error){console.warn('Ticket: alto contraste indisponível',error);return blob;}
}

function v106WatermarkText(date=new Date()){
  const stamp=date.toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'});
  return {stamp,line:`Ticket. • ${stamp}`};
}

async function v106WatermarkEnvironment(blob){
  if(!blob) return {blob,at:''};
  try{
    const now=new Date();
    const bitmap=await v106BitmapFromBlob(blob);
    const max=1900;
    const scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(bitmap.width*scale));
    canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    const ctx=canvas.getContext('2d');
    ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
    const h=Math.max(72,Math.round(canvas.height*.105));
    const gradient=ctx.createLinearGradient(0,canvas.height-h,0,canvas.height);
    gradient.addColorStop(0,'rgba(6,12,22,0)');
    gradient.addColorStop(.32,'rgba(6,12,22,.58)');
    gradient.addColorStop(1,'rgba(6,12,22,.88)');
    ctx.fillStyle=gradient;ctx.fillRect(0,canvas.height-h,canvas.width,h);
    const pad=Math.max(18,Math.round(canvas.width*.025));
    const mainSize=Math.max(18,Math.round(canvas.width*.030));
    const subSize=Math.max(13,Math.round(canvas.width*.021));
    ctx.fillStyle='#fff';ctx.textBaseline='bottom';ctx.font=`700 ${mainSize}px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif`;
    const wm=v106WatermarkText(now);ctx.fillText(wm.line,pad,canvas.height-pad-subSize-5);
    ctx.fillStyle='rgba(255,255,255,.82)';ctx.font=`500 ${subSize}px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif`;
    ctx.fillText('Registro de ambiente • data e hora inseridas automaticamente',pad,canvas.height-pad);
    bitmap.close?.();
    const result=await new Promise(resolve=>canvas.toBlob(b=>resolve(b||blob),'image/jpeg',.93));
    return {blob:result,at:now.toISOString()};
  }catch(error){console.warn('Ticket: marca d’água não aplicada',error);return {blob,at:new Date().toISOString()};}
}

async function v106ApplyReceiptMode(mode,rerender=true){
  state.captureAppearance=mode==='contrast'?'contrast':'color';
  if(!state.receiptOriginalFile){if(rerender)renderView();return;}
  const current=state.captureAppearance==='contrast'?await v106ContrastBlob(state.receiptOriginalFile):state.receiptOriginalFile;
  state.receiptFile=current;
  v106BlobUrlReplace('receiptUrl',current);
  if(rerender)renderView();
}

setFile=async function(kind,file){
  if(!file)return;
  stopCamera();
  if(kind==='receipt'){
    state.receiptOriginalFile=file;
    state.photoQuality=await v106AnalyzeImageQuality(file);
    const current=state.captureAppearance==='contrast'?await v106ContrastBlob(file):file;
    state.receiptFile=current;
    v106BlobUrlReplace('receiptUrl',current);
  }else{
    const marked=await v106WatermarkEnvironment(file);
    state.environmentFile=marked.blob;
    state.environmentWatermarkAt=marked.at;
    v106BlobUrlReplace('environmentUrl',marked.blob);
  }
  if(state.view==='capture')renderView();
};

function v106QualityMarkup(){
  const q=state.photoQuality;
  if(!state.receiptFile||!q)return `<div class="v105-quality idle"><i></i><strong>Qualidade: Aguardando</strong><span>A análise será feita automaticamente após a foto.</span></div>`;
  const detail=(q.issues||[]).slice(0,3).join(' • ');
  return `<div class="v105-quality ${esc(q.tone||'idle')}" title="Pontuação de qualidade: ${Number(q.score||0)}/100"><i></i><strong>Qualidade: ${esc(q.label)} · ${Number(q.score||0)}%</strong><span>${esc(detail)}</span></div>`;
}

captureView=function(){
  const hasPhoto=Boolean(state.receiptFile);
  const environmentTime=state.environmentWatermarkAt?new Date(state.environmentWatermarkAt).toLocaleString('pt-BR'):'';
  return `${head('Registrar ponto','Fotografe o comprovante por inteiro e depois informe a DATA e a HORA exibidas nele.')}
  <div class="v105-capture-page v106-capture-page">
    <article class="panel v105-capture-card">
      <div class="v105-capture-title"><div><span class="v105-kicker">CAPTURAR COMPROVANTE</span><h3>Fotografe o comprovante</h3><p>Enquadre todo o documento. A qualidade será avaliada automaticamente.</p></div><span class="v105-camera-icon">${v105CameraGlyph(24)}</span></div>
      <div class="v105-camera-frame" id="cameraStage"><video id="cameraVideo" class="hidden" playsinline muted></video>${state.receiptUrl?`<img src="${state.receiptUrl}" alt="Comprovante capturado" draggable="false">`:`<div class="v105-camera-empty">${v105CameraGlyph(42)}<strong>Câmera pronta</strong><span>Use a galeria ou a câmera.</span></div>`}<i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i></div>
      ${v106QualityMarkup()}
      <div class="v105-camera-toolbar v106-camera-toolbar">
        <label class="v105-round-action v106-gallery-action" title="Abrir galeria" aria-label="Abrir galeria">${v105ImageGlyph(22)}<input id="receiptPicker" type="file" accept="image/*" hidden></label>
        <button id="startCamera" type="button" class="v106-camera-capture" title="Abrir câmera" aria-label="Abrir câmera">${v105CameraGlyph(25)}</button>
      </div>
      <div class="v105-appearance"><span>Como deseja salvar a fotografia?</span><div class="v105-appearance-switch"><button type="button" data-photo-mode="color" class="${state.captureAppearance==='color'?'active':''}">Em cores</button><button type="button" data-photo-mode="contrast" class="${state.captureAppearance==='contrast'?'active':''}">Alto contraste</button></div></div>
      <button id="informDateTimeV105" type="button" class="v105-date-time-btn" ${hasPhoto?'':'disabled'}>${v105EditGlyph(19)} Informar DATA e HORA</button>
    </article>
    ${v105CaptureInformationCard()}
    <article class="panel v105-environment-card v106-environment-card">
      <div class="v106-environment-top"><div><strong>Foto do ambiente</strong><p>Opcional — a imagem recebe automaticamente marca d'água com data e hora.</p></div><label class="secondary v105-env-action">${v105CameraGlyph(18)} ${state.environmentFile?'Trocar foto':'Registrar ambiente'}<input id="environmentPicker" type="file" accept="image/*" capture="environment" hidden></label></div>
      ${state.environmentUrl?`<div class="v106-environment-preview"><img src="${state.environmentUrl}" alt="Foto do ambiente com marca d'água" draggable="false"><small>Marca d'água: ${esc(environmentTime)}</small></div>`:''}
      <label class="field v106-environment-note"><span>Observação do ambiente</span><textarea id="environmentNoteV106" placeholder="Opcional — descreva alguma ocorrência ou informação importante.">${esc(state.environmentNote||'')}</textarea></label>
    </article>
  </div>`;
};

startCamera=async function(){
  try{
    if(state.stream){await takePhoto();return;}
    stopCamera();
    state.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}},audio:false});
    const video=document.querySelector('#cameraVideo');
    if(!video)return;
    video.srcObject=state.stream;video.classList.remove('hidden');await video.play();
    const btn=document.querySelector('#startCamera');
    if(btn){btn.classList.add('armed');btn.title='Capturar comprovante';btn.setAttribute('aria-label','Capturar comprovante');if(!btn.classList.contains('v156-capture-action'))btn.innerHTML='<span class="v106-shutter-core"></span>';}
  }catch(error){console.warn(error);toast('Não foi possível abrir a câmera. Verifique a permissão do dispositivo e tente novamente.');}
};

takePhoto=async function(){
  const video=document.querySelector('#cameraVideo');
  if(!video?.videoWidth){toast('A câmera ainda não está pronta.');return;}
  const canvas=document.createElement('canvas');canvas.width=video.videoWidth;canvas.height=video.videoHeight;
  canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.94));
  stopCamera();
  if(blob)await setFile('receipt',blob);
};

bindCapture=function(){
  document.querySelector('#receiptPicker')?.addEventListener('change',async e=>{const file=e.target.files?.[0];if(file)await setFile('receipt',file);});
  document.querySelector('#environmentPicker')?.addEventListener('change',async e=>{const file=e.target.files?.[0];if(file)await setFile('environment',file);});
  document.querySelector('#startCamera')?.addEventListener('click',startCamera);
  document.querySelectorAll('[data-photo-mode]').forEach(btn=>btn.addEventListener('click',async()=>{await v106ApplyReceiptMode(btn.dataset.photoMode,true);}));
  document.querySelector('#environmentNoteV106')?.addEventListener('input',e=>{state.environmentNote=e.target.value;});
  document.querySelector('#informDateTimeV105')?.addEventListener('click',()=>{document.querySelector('#captureInfoV105')?.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>document.querySelector('#captureDateV105')?.focus({preventScroll:true}),350);});
  const form=document.querySelector('#captureForm');
  if(form){
    form.addEventListener('submit',submitCapture);
    document.querySelector('#captureDateV105')?.addEventListener('change',v105RefreshClassification);
    document.querySelector('#cancelCaptureV105')?.addEventListener('click',()=>{clearUrls();state.receiptFile=null;state.receiptOriginalFile=null;state.photoQuality=null;state.environmentFile=null;state.environmentNote='';state.environmentWatermarkAt='';renderView();});
    v105RefreshClassification();
  }
};

submitCapture=async function(event){
  event.preventDefault();
  if(!state.receiptFile){toast('Capture ou escolha a foto do comprovante.');return;}
  if(!document.querySelector('#recordLockConfirm')?.checked){toast('Confirme a revisão e o bloqueio definitivo do registro.');return;}
  const d=Object.fromEntries(new FormData(event.currentTarget));
  const info=v105NextPunchInfo(d.date);d.type=info.type;
  if(!d.type){toast('Essa data já possui todas as batidas previstas.');return;}
  if(!d.time){toast('Informe o horário exibido no comprovante.');return;}
  const existing=await getRecord(state.profile.cpf,d.date);
  const snapshot=existing?.scheduleSnapshot||scheduleForDate(d.date,state.schedule);
  if(!snapshot.active&&!confirm('Este dia está configurado como folga. Deseja continuar?'))return;
  const record=existing?{...existing,punches:[...(existing.punches||[])],evidenceIds:[...(existing.evidenceIds||[])],environmentIds:[...(existing.environmentIds||[])]}:{id:`${state.profile.cpf}:${d.date}`,profileCpf:state.profile.cpf,date:d.date,punches:[],evidenceIds:[],environmentIds:[],scheduleSnapshot:snapshot,createdAt:new Date().toISOString(),lockPolicy:'append-only',immutablePunches:true};
  if(record.punches.some(p=>p.type===d.type)){toast('Essa batida já foi registrada e está bloqueada.');return;}
  const now=new Date().toISOString();
  const receiptId=uuid();
  const receiptBlob=await fileToBlob(state.receiptFile);
  await saveEvidence({id:receiptId,profileCpf:state.profile.cpf,date:d.date,type:'receipt',blob:receiptBlob,createdAt:now,lockedAt:now,immutable:true,appearance:state.captureAppearance,quality:state.photoQuality||null,integrityHash:await evidenceHash(receiptBlob)});
  record.evidenceIds.push(receiptId);
  if(state.environmentFile){
    const envId=uuid();const envBlob=await fileToBlob(state.environmentFile);
    await saveEvidence({id:envId,profileCpf:state.profile.cpf,date:d.date,type:'environment',blob:envBlob,createdAt:now,lockedAt:now,immutable:true,watermarkAt:state.environmentWatermarkAt||now,note:String(state.environmentNote||'').trim(),integrityHash:await evidenceHash(envBlob)});
    record.environmentIds.push(envId);
  }
  record.punches.push({id:uuid(),type:d.type,time:d.time,note:'',evidenceId:receiptId,createdAt:now,lockedAt:now,immutable:true});
  record.punches.sort((a,b)=>toMinutes(a.time)-toMinutes(b.time));record.immutablePunches=true;record.lockPolicy='append-only';record.updatedAt=now;
  await saveRecord(record);
  clearUrls();state.receiptFile=null;state.receiptOriginalFile=null;state.photoQuality=null;state.environmentFile=null;state.environmentNote='';state.environmentWatermarkAt='';
  state.records=await listRecords(state.profile.cpf);
  const success=document.createElement('div');
  success.className='receipt-success-v158';
  success.setAttribute('role','status');
  success.innerHTML='<div><span aria-hidden="true">✓</span><h2>Comprovante Registrado</h2></div>';
  document.body.append(success);
  await new Promise(resolve=>setTimeout(resolve,1500));
  success.remove();
  navigate('dashboard');
};

maskCpf=function(cpf=''){
  const d=cpfDigits(cpf);
  return `***.***.***-${d.slice(-2).padStart(2,'*')}`;
};

function v106HowToSettingsCard(){
  return `<article class="settings-section-card v106-how-settings"><div class="settings-card-head"><div><h3>Como usar</h3><p>Fluxo essencial para registrar o ponto corretamente.</p></div><span class="settings-card-icon violet">${v105HelpGlyph(22)}</span></div><div class="v106-how-flow"><span><b>1</b>Fotografe</span><i>→</i><span><b>2</b>Informe data/hora</span><i>→</i><span><b>3</b>Confirme</span><i>→</i><span><b>4</b>Confira em Registros</span></div><button type="button" class="secondary full-action" data-resource-view="help">Abrir guia completo</button></article>`;
}

v105ResourcesCard=function(){
  return `<article class="settings-section-card v105-resources-card"><div class="settings-card-head"><div><h3>Recursos do Ticket.</h3><p>Gerencie as cópias, o backup e o local onde as imagens são preservadas.</p></div><span class="settings-card-icon blue">${v105DatabaseGlyph(22)}</span></div><div class="v105-resource-grid v106-resource-single"><button type="button" data-resource-view="storage"><span class="resource-icon blue">${v105DatabaseGlyph(21)}</span><strong>Armazenamento</strong><small>Cópias das imagens, backup local e futura sincronização em nuvem.</small></button></div></article>`;
};

settingsView=function(){
  return `<section class="settings-full"><div class="settings-page-intro"><span class="settings-kicker">PREFERÊNCIAS</span><h2>Configurações</h2><p>Defina a jornada, o saldo anterior e o período mensal de fechamento. Registros já confirmados permanecem bloqueados.</p></div><div class="settings-stack">${identificationCard()}${v106HowToSettingsCard()}${balanceCard()}${closingCard()}${weeklyScheduleCard()}${v105ResourcesCard()}${deviceCards()}</div></section>`;
};

const v106BindSettingsBefore=bindSettings;
bindSettings=function(){
  v106BindSettingsBefore();
  document.querySelectorAll('[data-resource-view]').forEach(btn=>{
    const clone=btn.cloneNode(true);btn.replaceWith(clone);clone.addEventListener('click',()=>navigate(clone.dataset.resourceView));
  });
};
