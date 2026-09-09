(function(){
 'use strict';
 var toggle=document.getElementById('menuToggle'),nav=document.getElementById('nav');
 if(toggle&&nav)toggle.addEventListener('click',function(){var open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});
 var cards=Array.from(document.querySelectorAll('.blog-item'));
 var filters=Array.from(document.querySelectorAll('.sidebar-categories a[data-category]'));
 function apply(){
  var selected=filters.find(function(a){return a.hash===location.hash;})||filters[0];
  if(!selected)return;
  var category=selected.dataset.category;
  cards.forEach(function(card){var label=card.querySelector('.blog-item-cat');card.hidden=!!category&&(!label||label.textContent.trim()!==category);card.style.display=card.hidden?'none':'';});
  filters.forEach(function(a){var active=a===selected;a.style.fontWeight=active?'700':'';if(active)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});
 }
 window.addEventListener('hashchange',apply);apply();
})();
