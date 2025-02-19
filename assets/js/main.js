// Initialize Swiper
const heroSwiper = new Swiper('.hero-slider', {
    loop: true,
    speed: 800,
    preloadImages: false,
    lazy: {
        loadPrevNext: true,
        loadPrevNextAmount: 2,
    },
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
});

// Lazy Loading için IntersectionObserver
const lazyLoadImages = () => {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    const tempImage = new Image();
                    tempImage.onload = () => {
                        img.src = tempImage.src;
                        img.classList.add('loaded');
                    };
                    tempImage.src = img.dataset.src;
                    delete img.dataset.src;
                    observer.unobserve(img);
                }
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.1,
        root: null
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        if (!img.classList.contains('lazy-image')) {
            img.classList.add('lazy-image');
            imageObserver.observe(img);
        }
    });
};

// Sayfa yüklendiğinde ve DOM içeriği değiştiğinde lazyLoadImages fonksiyonunu çalıştır
document.addEventListener('DOMContentLoaded', lazyLoadImages);
document.addEventListener('load', lazyLoadImages);

// Dinamik içerik değişikliklerini izle
const observer = new MutationObserver(() => {
    lazyLoadImages();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Header scroll class
function scrollHeader() {
    const header = document.querySelector('.header');
    if (header) {
        if (this.scrollY >= 50) {
            header.classList.add('scroll-header');
        } else {
            header.classList.remove('scroll-header');
        }
    }
}

// Layout yükleme fonksiyonu
async function loadLayout() {
    try {
        // Header'ı yükle
        const headerResponse = await fetch('./layouts/header.html');
        if (!headerResponse.ok) throw new Error('Header yüklenemedi');
        const headerContent = await headerResponse.text();
        document.getElementById('header-container').innerHTML = headerContent;

        // Footer'ı yükle
        const footerResponse = await fetch('./layouts/footer.html');
        if (!footerResponse.ok) throw new Error('Footer yüklenemedi');
        const footerContent = await footerResponse.text();
        document.getElementById('footer-container').innerHTML = footerContent;

        // Layout yüklendikten sonra gerekli işlevleri başlat
        initializeMobileMenu();
        initializeSmoothScroll();
        lazyLoadImages();
        
        // Header scroll event listener'ı ekle
        window.addEventListener('scroll', scrollHeader);

    } catch (error) {
        console.error('Layout yükleme hatası:', error);
    }
}

// Mobile menu işlevleri
function initializeMobileMenu() {
    const navToggle = document.querySelector('.nav__toggle');
    const navList = document.querySelector('.nav__list');

    if (navToggle && navList) {
        // Mobile menu toggle
        navToggle.addEventListener('click', () => {
            navList.classList.toggle('show-menu');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav') && !e.target.closest('.nav__toggle')) {
                navList.classList.remove('show-menu');
            }
        });

        // Remove mobile menu when clicking nav links
        const navLinks = document.querySelectorAll('.nav__link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navList.classList.remove('show-menu');
            });
        });
    }
}

// Smooth scroll for anchor links
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll up button
function scrollUp() {
    const scrollUp = document.getElementById('scroll-up');
    if (scrollUp) {
        if (this.scrollY >= 350) {
            scrollUp.classList.add('show-scroll');
        } else {
            scrollUp.classList.remove('show-scroll');
        }
    }
}
window.addEventListener('scroll', scrollUp);

// Sayfa yüklendiğinde layout'u yükle
document.addEventListener('DOMContentLoaded', loadLayout); 