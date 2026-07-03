// Toggle expand/collapse for long reviews (called from inline onclick)
window.toggleReview = function(index, btn, fullText, shortText) {
    var p = document.getElementById('review-' + index);
    if (!p) return;
    var isExpanded = p.getAttribute('data-expanded') === 'true';
    if (isExpanded) {
        p.innerHTML = shortText + '...';
        p.setAttribute('data-expanded', 'false');
        btn.textContent = 'عرض المزيد';
    } else {
        p.innerHTML = fullText;
        p.setAttribute('data-expanded', 'true');
        btn.textContent = 'عرض أقل';
    }
};

document.addEventListener('DOMContentLoaded', function() {
    var sliderTrack = document.getElementById('sliderTrack');
    var slideRight  = document.getElementById('slideRight');
    var slideLeft   = document.getElementById('slideLeft');
    var sliderEl    = document.getElementById('testimonialsSlider');

    if (!sliderTrack || !sliderEl) return;

    var currentIndex     = 0;
    var cardsPerView     = 3;
    var autoplayInterval = null;

    function totalCards() {
        return sliderTrack.querySelectorAll('.testimonial-card').length;
    }

    function updateCardsPerView() {
        var w = window.innerWidth;
        if (w <= 600) cardsPerView = 1;
        else if (w <= 900) cardsPerView = 2;
        else cardsPerView = 3;
    }

    function goToSlide(index) {
        var total = totalCards();
        if (total === 0) return;
        var maxIndex = Math.max(0, total - cardsPerView);
        if (index > maxIndex) index = maxIndex;
        if (index < 0) index = 0;
        currentIndex = index;

        var card = sliderTrack.querySelector('.testimonial-card');
        if (!card) return;
        var cardWidth = card.offsetWidth + 24;
        sliderTrack.style.transform = 'translateX(' + (-(currentIndex * cardWidth)) + 'px)';
        updateDots();
    }

    function updateDots() {
        var dotsContainer = sliderEl.querySelector('.slider-dots');
        if (!dotsContainer) {
            dotsContainer = document.createElement('div');
            dotsContainer.className = 'slider-dots';
            sliderEl.appendChild(dotsContainer);
        }
        var maxIndex = Math.max(0, totalCards() - cardsPerView);
        dotsContainer.innerHTML = '';
        for (var i = 0; i <= maxIndex; i++) {
            (function(i) {
                var dot = document.createElement('button');
                dot.className = 'slider-dot' + (i === currentIndex ? ' active' : '');
                dot.setAttribute('aria-label', 'شريحة ' + (i + 1));
                dot.addEventListener('click', function() { goToSlide(i); resetAutoplay(); });
                dotsContainer.appendChild(dot);
            })(i);
        }
    }

    function startAutoplay() {
        if (autoplayInterval) clearInterval(autoplayInterval);
        autoplayInterval = setInterval(function() {
            var maxIndex = Math.max(0, totalCards() - cardsPerView);
            goToSlide(currentIndex >= maxIndex ? 0 : currentIndex + 1);
        }, 5000);
    }

    function resetAutoplay() {
        clearInterval(autoplayInterval);
        startAutoplay();
    }

    // Initialise
    updateCardsPerView();
    goToSlide(0);
    startAutoplay();

    // Arrow buttons
    if (slideRight) {
        slideRight.addEventListener('click', function() {
            var maxIndex = Math.max(0, totalCards() - cardsPerView);
            goToSlide(currentIndex >= maxIndex ? 0 : currentIndex + 1);
            resetAutoplay();
        });
    }
    if (slideLeft) {
        slideLeft.addEventListener('click', function() {
            var maxIndex = Math.max(0, totalCards() - cardsPerView);
            goToSlide(currentIndex <= 0 ? maxIndex : currentIndex - 1);
            resetAutoplay();
        });
    }

    // Resize
    window.addEventListener('resize', function() {
        updateCardsPerView();
        goToSlide(Math.min(currentIndex, Math.max(0, totalCards() - cardsPerView)));
    });

    // Touch swipe
    sliderEl.addEventListener('touchstart', function(e) {
        window._touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    sliderEl.addEventListener('touchend', function(e) {
        var diff = window._touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
            goToSlide(diff > 0 ? currentIndex + 1 : currentIndex - 1);
            resetAutoplay();
        }
    }, { passive: true });

    // Pause on hover
    sliderEl.addEventListener('mouseenter', function() { clearInterval(autoplayInterval); });
    sliderEl.addEventListener('mouseleave', startAutoplay);

    // ── Newsletter form → Systeme.io ──────────────────────────────────
    var newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var btn   = document.getElementById('nl-submit');
            var msgEl = document.getElementById('nl-msg');
            btn.disabled = true;
            btn.innerHTML = '<span>جاري الإرسال...</span>';
            if (msgEl) msgEl.style.display = 'none';

            fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email:     document.getElementById('nl-email').value,
                    firstName: document.getElementById('nl-first').value,
                    lastName:  document.getElementById('nl-last').value
                })
            })
            .then(function(r) { return r.json(); })
            .then(function(data) {
                if (data.success) {
                    newsletterForm.style.display = 'none';
                    var successEl = document.getElementById('nl-success');
                    if (successEl) successEl.style.display = 'block';
                } else {
                    btn.disabled = false;
                    btn.innerHTML = '<span>اشترك</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
                    if (msgEl) { msgEl.textContent = data.message; msgEl.style.display = 'block'; }
                }
            })
            .catch(function() {
                btn.disabled = false;
                btn.innerHTML = '<span>اشترك</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
                if (msgEl) { msgEl.textContent = 'حدث خطأ. حاول مرة أخرى لاحقاً.'; msgEl.style.display = 'block'; }
            });
        });
    }
});
