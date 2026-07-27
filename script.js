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
    positionDrop(index);
    setTimeout(() => { isAnimating = false; }, 300);
    currentSubsection = index;
}

// Для Wiki страницы - скролл к секциям
if (document.body.classList.contains('wiki-page')) {
    const subsections = document.querySelectorAll('[id^="subsection-"]');
    
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
    
    // Обновление позиции капли при скролле
    mainContent.addEventListener('scroll', () => {
        const scrollTop = mainContent.scrollTop;
        const containerRect = scrollDotsContainer.getBoundingClientRect();
        
        let activeIndex = 0;
        subsections.forEach((sub, index) => {
            const subRect = sub.getBoundingClientRect();
            if (subRect.top <= containerRect.top + 150) {
                activeIndex = index;
            }
        });
        
        if (activeIndex !== currentSubsection) {
            moveDropTo(activeIndex);
        }
    });
} else {
    // Для index.html - просто переключение капель
    if (scrollDots.length > 0) {
        scrollDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const index = parseInt(dot.dataset.section);
                moveDropTo(index);
            });
        });
    }
}

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

window.addEventListener('resize', () => positionDrop(currentSubsection));
setTimeout(() => positionDrop(0), 100);
