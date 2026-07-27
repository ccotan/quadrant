// Splash Screen
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('splashScreen').classList.add('hidden');
        setTimeout(() => {
            document.getElementById('mainContent').classList.add('visible');
            document.getElementById('navbar').classList.add('visible');
            const scrollIndicator = document.getElementById('scrollIndicator');
            if (scrollIndicator) {
                scrollIndicator.classList.add('visible');
                setTimeout(() => positionDrop(0), 100);
            }
        }, 400);
    }, 2200);
});

function handleApplyClick() {
    alert('Форма подачи заявки будет доступна soon');
}

const mainContent = document.getElementById('mainContent');
const scrollDots = document.querySelectorAll('.scroll-dot');
const liquidDrop = document.getElementById('liquidDrop');
const scrollDotsContainer = document.getElementById('scrollDots');

let currentSubsection = 0;
let isAnimating = false;

function getDotCenter(index) {
    if (!scrollDots[index] || !scrollDotsContainer) return 0;
    const dot = scrollDots[index];
    const containerRect = scrollDotsContainer.getBoundingClientRect();
    const dotRect = dot.getBoundingClientRect();
    return dotRect.top - containerRect.top + dotRect.height / 2 - 4.5;
}

function positionDrop(index) {
    if (!liquidDrop) return;
    liquidDrop.style.top = getDotCenter(index) + 'px';
}

function moveDropTo(index) {
    if (isAnimating || index === currentSubsection) return;
    isAnimating = true;

    const direction = index > currentSubsection ? 'down' : 'up';
    liquidDrop.classList.remove('moving-down', 'moving-up');
    void liquidDrop.offsetWidth;
    liquidDrop.classList.add(`moving-${direction}`);

    positionDrop(index);

    setTimeout(() => {
        liquidDrop.classList.remove('moving-down', 'moving-up');
        isAnimating = false;
    }, 300);

    currentSubsection = index;
}

// Для Wiki страницы - скролл к секциям + автопереключение капель
if (document.documentElement.classList.contains('wiki-page')) {
    const subsections = document.querySelectorAll('[id^="subsection-"]');

    // Клик по капле — скролл к секции
    if (scrollDots.length > 0) {
        scrollDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const index = parseInt(dot.dataset.section);
                const target = subsections[index];
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // Автопереключение капель при скролле
    let scrollTimeout;
    mainContent.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            requestAnimationFrame(() => {
                const containerRect = scrollDotsContainer.getBoundingClientRect();
                const containerCenter = containerRect.top + containerRect.height / 2;

                let activeIndex = 0;
                subsections.forEach((sub, index) => {
                    const subRect = sub.getBoundingClientRect();
                    if (subRect.top <= containerCenter + 100) {
                        activeIndex = index;
                    }
                });

                if (activeIndex !== currentSubsection) {
                    moveDropTo(activeIndex);
                }
            });
        }, 50);
    });
}

// Навигация
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

window.addEventListener('resize', () => positionDrop(currentSubsection));
setTimeout(() => positionDrop(0), 100);
