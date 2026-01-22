/**
 * i18n.js - Internationalization Module
 * Handles Arabic/English language switching with RTL support
 */

const I18n = (function() {
    let currentLang = 'ar';
    let translations = {};

    // Initialize the i18n module
    async function init() {
        // Load saved language preference
        const savedLang = localStorage.getItem('elsahaba_lang');
        if (savedLang) {
            currentLang = savedLang;
        }

        // Load translations
        try {
            const response = await fetch('data/translations.json');
            translations = await response.json();
        } catch (error) {
            console.error('Failed to load translations:', error);
            translations = { ar: {}, en: {} };
        }

        // Apply current language
        applyLanguage();
        setupEventListeners();
    }

    // Get current language
    function getLang() {
        return currentLang;
    }

    // Set language
    function setLang(lang) {
        if (lang !== 'ar' && lang !== 'en') return;
        currentLang = lang;
        localStorage.setItem('elsahaba_lang', lang);
        applyLanguage();
    }

    // Toggle language
    function toggle() {
        setLang(currentLang === 'ar' ? 'en' : 'ar');
    }

    // Apply language to the page
    function applyLanguage() {
        const html = document.documentElement;
        
        // Set direction and lang attribute
        html.setAttribute('lang', currentLang);
        html.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');

        // Update language toggle button text
        const langToggle = document.getElementById('currentLang');
        if (langToggle) {
            langToggle.textContent = currentLang === 'ar' ? 'EN' : 'AR';
        }

        // Translate all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const text = translate(key);
            if (text) {
                el.textContent = text;
            }
        });

        // Translate placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const text = translate(key);
            if (text) {
                el.placeholder = text;
            }
        });

        // Dispatch event for other modules
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: currentLang } }));
    }

    // Get translation by key path (e.g., 'nav.products')
    function translate(keyPath) {
        const keys = keyPath.split('.');
        let value = translations[currentLang];
        
        for (const key of keys) {
            if (value && typeof value === 'object') {
                value = value[key];
            } else {
                return null;
            }
        }
        
        return value;
    }

    // Get localized product text
    function getProductText(product, field) {
        if (!product || !product[field]) return '';
        
        if (typeof product[field] === 'object') {
            return product[field][currentLang] || product[field].en || '';
        }
        
        return product[field];
    }

    // Format price with currency
    function formatPrice(price) {
        const currency = translate('product.currency') || 'جنيه';
        
        if (currentLang === 'ar') {
            return `${price} ${currency}`;
        }
        return `${price} ${currency}`;
    }

    // Setup event listeners
    function setupEventListeners() {
        const langToggle = document.getElementById('langToggle');
        const langToggleMobile = document.getElementById('langToggleMobile');

        if (langToggle) {
            langToggle.addEventListener('click', toggle);
        }

        if (langToggleMobile) {
            langToggleMobile.addEventListener('click', toggle);
        }
    }

    return {
        init,
        getLang,
        setLang,
        toggle,
        translate,
        getProductText,
        formatPrice
    };
})();

// Export for use in other modules
window.I18n = I18n;
