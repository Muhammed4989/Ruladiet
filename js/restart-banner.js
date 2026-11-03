// Midnight on 23 November in Istanbul (UTC+03:00).
(() => {
  const countdown = document.querySelector('.restart-banner__countdown');
  if (!countdown) return;

  const startAt = Date.parse('2026-11-23T00:00:00+03:00');
  const units = ['days', 'hours', 'minutes', 'seconds'];
  const values = Object.fromEntries(units.map(unit => [unit, countdown.querySelector(`[data-restart-${unit}]`)]));
  if (units.some(unit => !values[unit])) return;

  let timer;
  function update() {
    let remaining = Math.max(0, Math.floor((startAt - Date.now()) / 1000));
    if (remaining === 0) {
      countdown.textContent = 'بدأ تحدّي Restart';
      countdown.setAttribute('aria-label', 'بدأ تحدّي Restart');
      window.clearInterval(timer);
      return;
    }

    const days = Math.floor(remaining / 86400);
    remaining %= 86400;
    const hours = Math.floor(remaining / 3600);
    remaining %= 3600;
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    for (const [unit, value] of Object.entries({days, hours, minutes, seconds})) {
      values[unit].textContent = String(value).padStart(2, '0');
    }
    countdown.setAttribute('aria-label', `باقي للبداية ${days} يوم و${hours} ساعة و${minutes} دقيقة و${seconds} ثانية`);
  }

  update();
  if (Date.now() < startAt) timer = window.setInterval(update, 1000);
})();
