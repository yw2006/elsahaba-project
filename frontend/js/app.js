/**
 * app.js - Main Application Controller
 * Initializes all modules and handles global functionality
 */

(function() {
    // Initialize app when DOM is ready
    document.addEventListener('DOMContentLoaded', async () => {
        // Initialize modules in correct order
        await I18n.init();
        await Products.init();
        Cart.init();
        Order.init();
        History.init();

        // Setup global event handlers
        setupMobileMenu();
        setupSmoothScroll();

        console.log('🧴 Al-Sahaba App initialized');
    });

    // Mobile menu toggle
    function setupMobileMenu() {
        const menuBtn = document.getElementById('mobileMenuBtn');
        const mobileNav = document.getElementById('mobileNav');

        if (!menuBtn || !mobileNav) return;

        menuBtn.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
            menuBtn.classList.toggle('active');
        });

        // Close menu when clicking a link
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('active');
                menuBtn.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileNav.contains(e.target) && !menuBtn.contains(e.target)) {
                mobileNav.classList.remove('active');
                menuBtn.classList.remove('active');
            }
        });
    }

    // Smooth scroll for anchor links
    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 70;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
})();
