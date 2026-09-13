(function(){
 'use strict';
 var toggle=document.getElementById('menuToggle'),nav=document.getElementById('nav');
 if(toggle&&nav)toggle.addEventListener('click',function(){var open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});
 // Categories are ordinary links to static archives; navigation works without JavaScript.
 document.querySelectorAll('[data-archive-intro]').forEach(function(intro){
  var button=intro.querySelector('.archive-intro-toggle');
  if(!button)return;
  intro.classList.add('is-collapsed');
  button.hidden=false;
  button.setAttribute('aria-expanded','false');
  button.addEventListener('click',function(){
   var collapsed=intro.classList.toggle('is-collapsed');
   button.setAttribute('aria-expanded',String(!collapsed));
   button.textContent=collapsed?'قراءة المزيد':'عرض أقل';
  });
 });
})();
