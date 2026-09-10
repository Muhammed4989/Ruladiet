const descriptions = {
 weight:'طبق متوازن من السمك والحبوب والخضار على مائدة هادئة',
 emotional:'دفتر للملاحظات مع كوب شاي وفاكهة وقطعة شوكولاتة',
 insulin:'جهاز قياس سكر توضيحي بجانب دفتر وتفاحة، دون قراءة طبية',
 carbs:'أوعية شوفان وعدس وأرز وحمص وخبز توضح تنوع مصادر الكربوهيدرات',
 pcos:'لبن وفاكهة ومكسرات وخبز وخضار بجانب دفتر لتنظيم الوجبات',
 thyroid:'مجسم توضيحي بشكل فراشة وسماعة طبية على مكتب',
 sleep:'غرفة نوم هادئة مع إضاءة خافتة وكتاب وساعة بجانب السرير',
 water:'إبريق وكوب ماء بجانب نبات وشرائح خيار',
 fasting:'ساعة بجانب وجبة إفطار من اللبن والخبز',
 calories:'وجبة محضرة في علبة مع ماء ولبن على مكتب عمل',
 lunchbox:'علبة طعام مدرسية تحتوي ساندويشاً وخضاراً وفاكهة مع زجاجة ماء',
 habits:'دفتر تخطيط وحذاء مشي وزجاجة ماء على مقعد في الهواء الطلق',
 ramadan:'فانوس مع ماء وتمر وشوربة على مائدة الإفطار',
 injections:'قلمان للحقن بشكل توضيحي مع سماعة طبية وملف متابعة',
 mounjaro:'قلم حقن توضيحي غير تجاري بجانب دفتر متابعة أسبوعية',
 'mounjaro-diet':'حصص صغيرة من الشوربة واللبن والبيض والخضار المطبوخة',
 'injection-diet':'علب وجبات متنوعة تضم الدجاج والعدس والسمك والخضار'
};
const icons = {
 plate:'<circle cx="32" cy="32" r="24"/><circle cx="32" cy="32" r="16"/><path d="M32 16v32M32 32h16"/>',
 heart:'<path d="M32 54 10 32C-5 10 22 0 32 19 43 0 69 10 54 32Z"/>',
 medical:'<rect x="8" y="8" width="48" height="48" rx="10"/><path d="M32 19v26M19 32h26"/>',
 grain:'<path d="M32 57V9M32 24Q12 22 13 8q18 0 19 16ZM32 39Q12 37 13 23q18 0 19 16ZM32 31Q52 29 51 15q-18 0-19 16ZM32 47Q52 45 51 31q-18 0-19 16Z"/>',
 leaf:'<path d="M11 53Q-1 10 54 9q4 50-43 44ZM11 53l32-32"/>',
 moon:'<path d="M47 7A25 25 0 1 0 57 44 27 27 0 0 1 47 7Z"/>',
 drop:'<path d="M32 5C25 17 10 29 10 40a22 22 0 0 0 44 0C54 29 39 17 32 5Z"/>',
 clock:'<circle cx="32" cy="32" r="26"/><path d="M32 13v19l14 8"/>',
 box:'<rect x="6" y="12" width="52" height="42" rx="8"/><path d="M6 27h52M32 27v27"/>',
 check:'<rect x="8" y="6" width="48" height="52" rx="8"/><path d="m19 32 9 9 18-20"/>'
};
function escape(value){return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');}
function diagram(post) {
  const rows = post.steps.map((step,i)=>`<rect x="26" y="${110+i*98}" width="688" height="80" rx="16" fill="white"/><circle cx="663" cy="${150+i*98}" r="24" fill="#2d5240"/><text x="663" y="${160+i*98}" text-anchor="middle" fill="white" font-size="28">${['١','٢','٣'][i]}</text><text x="608" y="${161+i*98}" direction="rtl" text-anchor="start" fill="#213e31" font-size="${post.workflow==='daily'?40:32}">${escape(step)}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="740" height="420" viewBox="0 0 740 420" role="img" aria-labelledby="title desc"><title id="title">${escape(post.title)}</title><desc id="desc">${post.steps.map(escape).join('، ')}</desc><rect width="740" height="420" rx="24" fill="#eef3ed"/><g transform="translate(38 23) scale(.85)" fill="none" stroke="#2d5240" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${icons[post.icon]}</g><text x="688" y="64" direction="rtl" text-anchor="start" font-family="Tajawal,Arial,sans-serif" font-size="${post.workflow==='daily'?36:32}" font-weight="bold" fill="#213e31">${escape(post.visualHeading || 'ثلاث نقاط للتطبيق')}</text><g font-family="Tajawal,Arial,sans-serif">${rows}</g></svg>`;
}
module.exports={descriptions,diagram,escape};
