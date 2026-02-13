// ==========================================
// CONFIGURATION
// ==========================================
const CONFIG = {
  defaultLanguage: 'es',
  langPath: 'lang/',
  storageKey: 'preferredLanguage'
};

// ==========================================
// STATE MANAGEMENT
// ==========================================
const state = {
  currentLanguage: null,
  translations: {},
  isLoading: false
};

// ==========================================
// LANGUAGE MANAGEMENT
// ==========================================
/**
 * Load language translations from JSON file
 * @param {string} lang - Language code (es/en)
 */
async function loadLanguage(lang) {
  if (state.isLoading) return;
  
  try {
    state.isLoading = true;
    
    // Fetch translation file
    const response = await fetch(`${CONFIG.langPath}${lang}.json`);
    
    if (!response.ok) {
      throw new Error(`Failed to load language: ${lang}`);
    }
    
    state.translations = await response.json();
    state.currentLanguage = lang;
    
    // Update DOM
    updateTranslations();
    updateLanguageButtons(lang);
    updateHTMLLang(lang);
    
    // Save preference
    saveLanguagePreference(lang);
    
  } catch (error) {
    console.error('Error loading language:', error);
    
    // Fallback to default language if available
    if (lang !== CONFIG.defaultLanguage) {
      console.log('Falling back to default language');
      loadLanguage(CONFIG.defaultLanguage);
    }
  } finally {
    state.isLoading = false;
  }
}

/**
 * Update all elements with data-i18n attributes
 */
function updateTranslations() {
  const elements = document.querySelectorAll('[data-i18n]');
  
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = getNestedTranslation(key);
    
    if (translation) {
      element.textContent = translation;
    } else {
      console.warn(`Translation not found for key: ${key}`);
    }
  });
}

/**
 * Get nested translation value from object using dot notation
 * @param {string} key - Translation key (e.g., "hero.title")
 * @returns {string|null} Translation value
 */
function getNestedTranslation(key) {
  return key.split('.').reduce((obj, prop) => {
    return obj && obj[prop] !== undefined ? obj[prop] : null;
  }, state.translations);
}

/**
 * Update active state of language buttons
 * @param {string} lang - Active language code
 */
function updateLanguageButtons(lang) {
  const buttons = document.querySelectorAll('.lang-btn');
  
  buttons.forEach(button => {
    const buttonLang = button.id.replace('btn-', '');
    
    if (buttonLang === lang) {
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');
    } else {
      button.classList.remove('active');
      button.setAttribute('aria-pressed', 'false');
    }
  });
}

/**
 * Update HTML lang attribute for accessibility
 * @param {string} lang - Language code
 */
function updateHTMLLang(lang) {
  document.documentElement.setAttribute('lang', lang);
}

/**
 * Save language preference to localStorage
 * @param {string} lang - Language code
 */
function saveLanguagePreference(lang) {
  try {
    localStorage.setItem(CONFIG.storageKey, lang);
  } catch (error) {
    console.warn('Could not save language preference:', error);
  }
}

/**
 * Get saved language preference from localStorage
 * @returns {string|null} Saved language code or null
 */
function getSavedLanguagePreference() {
  try {
    return localStorage.getItem(CONFIG.storageKey);
  } catch (error) {
    console.warn('Could not retrieve language preference:', error);
    return null;
  }
}

/**
 * Detect browser language preference
 * @returns {string} Language code
 */
function detectBrowserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  return browserLang.startsWith('es') ? 'es' : 'en';
}

// ==========================================
// MODAL MANAGEMENT
// ==========================================
class Modal {
  constructor(modalId) {
    this.modal = document.getElementById(modalId);
    this.overlay = document.getElementById('modalOverlay');
    this.closeBtn = document.getElementById('closeModal');
    this.isOpen = false;
    
    this.init();
  }
  
  init() {
    if (!this.modal) return;
    
    // Close button click
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    
    // Overlay click
    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.close());
    }
    
    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }
  
  open() {
    if (!this.modal) return;
    
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
    this.isOpen = true;
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Focus trap
    this.closeBtn?.focus();
  }
  
  close() {
    if (!this.modal) return;
    
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    this.isOpen = false;
    
    // Restore body scroll
    document.body.style.overflow = '';
  }
}

// ==========================================
// SMOOTH SCROLL
// ==========================================
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      
      // Skip if it's just "#"
      if (href === '#') return;
      
      const target = document.querySelector(href);
      
      if (target) {
        e.preventDefault();
        
        const navHeight = document.querySelector('.main-nav')?.offsetHeight || 0;
        const targetPosition = target.offsetTop - navHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ==========================================
// NAVBAR SCROLL EFFECT
// ==========================================
function initNavbarScroll() {
  const nav = document.querySelector('.main-nav');
  if (!nav) return;
  
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Hide navbar on scroll down, show on scroll up
    if (currentScroll > lastScroll && currentScroll > 100) {
      nav.style.transform = 'translateY(-100%)';
    } else {
      nav.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
  });
}

// ==========================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ==========================================
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe sections
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });
}

// ==========================================
// CURRENT YEAR IN FOOTER
// ==========================================
function updateCurrentYear() {
  const yearElement = document.getElementById('currentYear');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

// ==========================================
// INITIALIZATION
// ==========================================
function init() {
  // Set initial language
  const savedLang = getSavedLanguagePreference();
  const browserLang = detectBrowserLanguage();
  const initialLang = savedLang || browserLang || CONFIG.defaultLanguage;
  
  loadLanguage(initialLang);
  
  // Language buttons
  const btnEs = document.getElementById('btn-es');
  const btnEn = document.getElementById('btn-en');
  
  if (btnEs) {
    btnEs.addEventListener('click', () => loadLanguage('es'));
  }
  
  if (btnEn) {
    btnEn.addEventListener('click', () => loadLanguage('en'));
  }
  
  // Philosophy modal
  const philosophyBtn = document.getElementById('philosophyBtn');
  const philosophyModal = new Modal('philosophyModal');
  
  if (philosophyBtn) {
    philosophyBtn.addEventListener('click', () => philosophyModal.open());
  }
  
  // Initialize features
  initSmoothScroll();
  initNavbarScroll();
  initScrollAnimations();
  updateCurrentYear();
  
  // Active nav link highlighting
  highlightActiveNavLink();
}

// ==========================================
// ACTIVE NAV LINK HIGHLIGHTING
// ==========================================
function highlightActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  
  window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      if (pageYOffset >= sectionTop - 200) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

// ==========================================
// PERFORMANCE OPTIMIZATION
// ==========================================
// Debounce function for scroll events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ==========================================
// ERROR HANDLING
// ==========================================
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// ==========================================
// START APPLICATION
// ==========================================
// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { loadLanguage, state };
}



  