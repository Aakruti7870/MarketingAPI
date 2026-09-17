// GOLD-e AI growth interactions: keeps the existing React/API architecture and makes intent-based actions actually navigate.
const routeByLabel={
  'AI Studio':'AI Studio','Campaigns':'Campaigns','Social':'Social','Leads':'Leads',
  'Automation':'Automation','Analytics':'Analytics','Inbox':'Inbox','Overview':'Overview'
};
function clickNav(label){
  const buttons=[...document.querySelectorAll('.workspace aside nav button')];
  const target=buttons.find(b=>b.textContent.trim().replace(/\s+/g,' ')===(routeByLabel[label]||label));
  if(target){target.click();return true}
  return false;
}
function focusCommand(){
  const input=document.querySelector('.command-wrap input');
  if(input){input.focus();input.select();return true}
  return false;
}
function bindGrowthActions(){
  if(window.__goldeGrowthBound)return;
  window.__goldeGrowthBound=true;
  document.addEventListener('click',event=>{
    const action=event.target.closest('[data-growth-nav]');
    if(action){event.preventDefault();clickNav(action.getAttribute('data-growth-nav'));return}
    const card=event.target.closest('.action-card');
    if(card && event.target.closest('button')){
      const title=card.querySelector('b')?.textContent?.trim();
      if(title)clickNav(title);
    }
    const quick=event.target.closest('.quick');
    if(quick){
      const text=quick.textContent.toLowerCase();
      if(text.includes('generate')) clickNav('AI Studio');
      else if(text.includes('lead')) clickNav('Leads');
      else if(text.includes('automation')) clickNav('Automation');
    }
  },{passive:false});
  document.addEventListener('keydown',event=>{
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){
      event.preventDefault();focusCommand();
    }
  });
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bindGrowthActions,{once:true});
else bindGrowthActions();
