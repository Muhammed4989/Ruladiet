(function(){
 'use strict';
 var toggle=document.getElementById('menuToggle'),nav=document.getElementById('nav');
 if(toggle&&nav)toggle.addEventListener('click',function(){var open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});
 // Categories are ordinary links to static archives; navigation works without JavaScript.
})();
