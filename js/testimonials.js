document.addEventListener('DOMContentLoaded', function() {
    var sliderTrack = document.getElementById('sliderTrack');
    var slideRight = document.getElementById('slideRight');
    var slideLeft = document.getElementById('slideLeft');
    var testimonialsSection = document.getElementById('testimonials');
    var currentIndex = 0;
    var cardsPerView = 3;
    var totalCards = 0;
    var autoplayInterval = null;

    var reviews = [
        {
            initials: "ب.ج",
            name: "بسميلة جمال",
            text: "المكان جيد جدا والدكتورة متعاونه ولطيفه جدا جدا والأبر كانت تجربتي معها في خلال شهر واحد خسرت بفضل الله 6 كيلو بدون اعراض مزعجه، و شعرت معهم بأنهم مثل العائله في عدم التعامل برسميه وعدم الحرص على الناحيه الماديه فقط بل اهتمامهم بإستفادتي من الإبر اهم شئ، جزاهم الله خيرا"
        },
        {
            initials: "ن",
            name: "nesrin",
            text: "الحمد لله اني اخترت عياده رلا كانت تجربه ناجحه مميزه انسانه بتعطي من كل قلبها فريق رائع متعاون مجتهدين روحهم حلوه بيساعدوا بكل حب نتائج تجربتنا كانت وصول للوزن المثالي بالاضافه لكورس التعافي من ادمان الطعام"
        },
        {
            initials: "أ",
            name: "Alaa Khalil",
            text: "أحب أشارككم تجربتي مع عيادة التغذية المتخصصة رولا دايت وفريقها، تجربة فعلاً تستحق الشكر والمدح. من أول زيارة حسّيت بالاهتمام والمتابعة الدقيقة، أسلوب راقٍ في التعامل، واستماع حقيقي لكل التفاصيل بدون أي استعجال. الخطة الغذائية كانت مناسبة لأسلوبي وحياتي اليومية، مو مجرد نظام جاهز، بل خطة مخصصة وواقعية. النتائج كانت واضحة تدريجياً وبشكل صحي بدون حرمان أو تعب، والأجمل من ذلك الدعم المستمر والتحفيز في كل خطوة. كل الشكر والتقدير لفريق العيادة رولا دايت وفريقها على المصداقية والاحترافية، أنصح أي شخص يبحث عن تغيير صحي حقيقي إنه يزوره"
        },
        {
            initials: "آ",
            name: "آسيا ثابت",
            text: "مكان يقطر لطافة ومحبة.. تستقبلك الوجوه الباشة المرحبة والقلوب المعطاءة وتجربتي كانت مليئة بالمعرفة والفايدة.. شكرا لكن فتيات المركز وخاصة البديعة رولى.."
        },
        {
            initials: "إ",
            name: "Enaya Naksho",
            text: "تجربتي فعلياً ممنونة منها و جدا من الأخصائية رولا علوش و الأخصائية ياسمين سعدات جدا بالاشتراك بكورس ادمان الطعام كان من أروع التجارب قيمة المعلومات الي فيه و كل ما يتعلق فيه رائع رائع.. حالياً ضمن المتابعة بالعيادة و صرت نازلة عشرة كيلو مع ابر المتجاور و مستمرين باذن الله"
        },
        {
            initials: "و",
            name: "Wasela Toume",
            text: "تجربتي مع أخصائية التغذية رولا وفريقها أكثر من رائعة. الحمد لله النتائج ممتازة، وخلال شهرين ونص زرتها مرة واحدة فقط وكانت المتابعة ناجحة. الأجواء في العيادة مليئة بالطاقة الإيجابية، والأخصائية رولا كانت بالنسبة إلي ملهمة فعلًا، أسلوبها في التغذية علاجي وواعي، وراعت وضعي الصحي والأدوية التي أستخدمها، وهذا فرق معي كثير. كمان المتابعة أونلاين كل أسبوعين كانت ممتازة، كأني بالعيادة تمامًا، وبتعطيني الوقت الكافي وبتهتم بكل التفاصيل. مستمرة معها بإذن الله لحد ما أوصل للوزن المثالي. شكرًا من القلب لرولا وفريقها"
        }
    ];

    function renderReviews() {
        totalCards = reviews.length;
        sliderTrack.innerHTML = '';

        reviews.forEach(function(review, index) {
            var card = document.createElement('div');
            card.className = 'testimonial-card';

            var starsHtml = '';
            for (var i = 0; i < 5; i++) {
                starsHtml += '<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
            }

            var shortText = review.text.substring(0, 180);
            var needsMore = review.text.length > 180;

            card.innerHTML = 
                '<div class="testimonial-avatar">' +
                    '<div class="avatar-initials">' + review.initials + '</div>' +
                    '<div class="google-badge">' +
                        '<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>' +
                    '</div>' +
                '</div>' +
                '<div class="testimonial-name">' + review.name + '</div>' +
                '<div class="testimonial-stars">' + starsHtml + '</div>' +
                '<div class="testimonial-text-wrapper">' +
                    '<p class="testimonial-text" id="review-' + index + '">' + shortText + (needsMore ? '...' : '') + '</p>' +
                    (needsMore ? '<button class="expand-btn" onclick="toggleReview(' + index + ', \'' + escapeText(review.text) + '\', \'' + escapeText(shortText) + '\')">عرض المزيد</button>' : '') +
                '</div>';

            sliderTrack.appendChild(card);
        });

        updateCardsPerView();
        goToSlide(0);
        startAutoplay();
    }

    function escapeText(text) {
        return text.replace(/'/g, "\\'").replace(/"/g, "'");
    }

    window.toggleReview = function(index, fullText, shortText) {
        var p = document.getElementById('review-' + index);
        var btn = p.nextElementSibling;
        var isExpanded = p.getAttribute('data-expanded') === 'true';
        
        if (isExpanded) {
            p.textContent = shortText + '...';
            p.setAttribute('data-expanded', 'false');
            btn.textContent = 'عرض المزيد';
        } else {
            p.textContent = fullText;
            p.setAttribute('data-expanded', 'true');
            btn.textContent = 'عرض أقل';
        }
    };

    function updateCardsPerView() {
        var w = window.innerWidth;
        if (w <= 600) cardsPerView = 1;
        else if (w <= 900) cardsPerView = 2;
        else cardsPerView = 3;
    }

    function goToSlide(index) {
        if (totalCards === 0) return;
        var maxIndex = Math.max(0, totalCards - cardsPerView);
        if (index > maxIndex) index = maxIndex;
        if (index < 0) index = 0;
        currentIndex = index;

        var card = sliderTrack.querySelector('.testimonial-card');
        if (!card) return;

        var cardWidth = card.offsetWidth + 24;
        var offset = -(currentIndex * cardWidth);
        sliderTrack.style.transform = 'translateX(' + offset + 'px)';

        updateDots();
    }

    function updateDots() {
        var sliderEl = document.getElementById('testimonialsSlider');
        var dotsContainer = sliderEl.querySelector('.slider-dots');
        if (!dotsContainer) {
            dotsContainer = document.createElement('div');
            dotsContainer.className = 'slider-dots';
            sliderEl.appendChild(dotsContainer);
        }

        var maxIndex = Math.max(0, totalCards - cardsPerView);
        var totalDots = maxIndex + 1;
        dotsContainer.innerHTML = '';

        for (var i = 0; i < totalDots; i++) {
            var dot = document.createElement('button');
            dot.className = 'slider-dot' + (i === currentIndex ? ' active' : '');
            dot.setAttribute('aria-label', 'شريحة ' + (i + 1));
            dot.addEventListener('click', function() {
                var idx = parseInt(this.getAttribute('aria-label').split(' ')[1]) - 1;
                goToSlide(idx);
                resetAutoplay();
            });
            dotsContainer.appendChild(dot);
        }
    }

    function startAutoplay() {
        if (autoplayInterval) clearInterval(autoplayInterval);
        autoplayInterval = setInterval(function() {
            var maxIndex = Math.max(0, totalCards - cardsPerView);
            if (currentIndex >= maxIndex) goToSlide(0);
            else goToSlide(currentIndex + 1);
        }, 5000);
    }

    function resetAutoplay() {
        if (autoplayInterval) clearInterval(autoplayInterval);
        startAutoplay();
    }

    if (slideRight) {
        slideRight.addEventListener('click', function() {
            var maxIndex = Math.max(0, totalCards - cardsPerView);
            if (currentIndex >= maxIndex) goToSlide(0);
            else goToSlide(currentIndex + 1);
            resetAutoplay();
        });
    }

    if (slideLeft) {
        slideLeft.addEventListener('click', function() {
            var maxIndex = Math.max(0, totalCards - cardsPerView);
            if (currentIndex <= 0) goToSlide(maxIndex);
            else goToSlide(currentIndex - 1);
            resetAutoplay();
        });
    }

    window.addEventListener('resize', function() {
        updateCardsPerView();
        goToSlide(Math.min(currentIndex, Math.max(0, totalCards - cardsPerView)));
    });

    var sliderEl = document.getElementById('testimonialsSlider');
    sliderEl.addEventListener('touchstart', function(e) {
        window.touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    sliderEl.addEventListener('touchend', function(e) {
        var diff = window.touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) goToSlide(currentIndex + 1);
            else goToSlide(currentIndex - 1);
            resetAutoplay();
        }
    }, { passive: true });

    sliderEl.addEventListener('mouseenter', function() {
        if (autoplayInterval) clearInterval(autoplayInterval);
    });

    sliderEl.addEventListener('mouseleave', function() {
        startAutoplay();
    });

    var newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var btn = this.querySelector('.btn-subscribe');
            btn.innerHTML = '<span>جاري الإرسال...</span>';
            btn.disabled = true;

            setTimeout(function() {
                btn.innerHTML = '<span>تم الاشتراك ✓</span>';
                btn.style.background = '#A8E6CF';
                newsletterForm.reset();

                setTimeout(function() {
                    btn.innerHTML = '<span>اشترك</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
                    btn.style.background = '';
                    btn.disabled = false;
                }, 3000);
            }, 1500);
        });
    }

    renderReviews();
});