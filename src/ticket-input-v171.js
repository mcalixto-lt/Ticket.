'use strict';
function ticketCpfDisplay(raw){
  return raw.split('').map((digit,index)=>(index===3||index===6?'.':index===9?'-':'')+digit).join('');
}
function ticketProtectCpf(input){
  let raw='';
  const logical=position=>input.value.slice(0,position).replace(/\D/g,'').length;
  function paint(position){
    input.dataset.rawCpf=raw;input.value=ticketCpfDisplay(raw);
    const caret=ticketCpfDisplay(raw.slice(0,position)).length;input.setSelectionRange(caret,caret);
  }
  function replace(text){const start=logical(input.selectionStart),end=logical(input.selectionEnd);const digits=String(text||'').replace(/\D/g,'');raw=(raw.slice(0,start)+digits+raw.slice(end)).slice(0,11);paint(Math.min(start+digits.length,raw.length));}
  input.addEventListener('beforeinput',event=>{
    if(!event.cancelable)return;
    if(event.inputType.startsWith('insert')&&event.data!=null){event.preventDefault();replace(event.data);}
    else if(event.inputType.startsWith('delete')){
      event.preventDefault();let start=logical(input.selectionStart),end=logical(input.selectionEnd);
      if(start===end){if(event.inputType.includes('Backward'))start=Math.max(0,start-1);else end=Math.min(raw.length,end+1);}
      raw=raw.slice(0,start)+raw.slice(end);paint(start);
    }
  });
  input.addEventListener('paste',event=>{event.preventDefault();replace(event.clipboardData.getData('text'));});
  input.addEventListener('drop',event=>event.preventDefault());
  input.addEventListener('input',()=>{raw=input.value.replace(/\D/g,'').slice(0,11);paint(raw.length);});
  input.addEventListener('blur',()=>paint(raw.length));
}
// One reminder clock for all screens, including while settings are open.
setInterval(()=>{if(state.profile)updateNotificationBell({announce:true});},1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&state.profile)updateNotificationBell({announce:true});});
// A base entry also keeps browser Back inside the access screen before login.
history.replaceState({ticketAuthBase171:true},'',location.pathname+location.search+'#access');
history.pushState({ticketAuth171:true},'',location.pathname+location.search+'#access');
window.addEventListener('popstate',event=>{
  if(!state.profile&&event.state?.ticketAuthBase171){history.pushState({ticketAuth171:true},'',location.pathname+location.search+'#access');}
});
