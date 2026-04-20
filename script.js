/**
 * PhysicsLab 3D - Documentacion Tecnica
 * Version Mejorada con optimizaciones de rendimiento y accesibilidad
 */

(function() {
    'use strict';

    // ============================================
    // UTILIDADES
    // ============================================

    /**
     * Debounce para limitar la frecuencia de ejecucion de funciones
     */
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

    /**
     * Throttle para limitar la frecuencia de ejecucion en eventos como scroll
     */
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ============================================
    // NAVEGACION
    // ============================================

    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    /**
     * Cambio de estilo de navbar al hacer scroll
     */
    function handleNavbarScroll() {
        const scrollY = window.scrollY;
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', throttle(handleNavbarScroll, 100));

    /**
     * Smooth scroll para enlaces de navegacion
     */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);

            if (target) {
                // Cerrar menu mobile si esta abierto
                if (navLinks.classList.contains('is-open')) {
                    navLinks.classList.remove('is-open');
                    navToggle.setAttribute('aria-expanded', 'false');
                }

                const navHeight = navbar.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    /**
     * Menu hamburguesa para mobile
     */
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.contains('is-open');
            navLinks.classList.toggle('is-open');
            navToggle.setAttribute('aria-expanded', !isOpen);
        });

        // Cerrar menu al hacer click en un enlace
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ============================================
    // ANIMACIONES DE ENTRADA (Intersection Observer)
    // ============================================

    const animateElements = document.querySelectorAll('[data-animate]');

    const animateObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('is-visible');
                }, parseInt(delay));
                animateObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    animateElements.forEach(el => {
        animateObserver.observe(el);
    });

    // ============================================
    // CONTADORES ANIMADOS
    // ============================================

    /**
     * Anima un contador desde 0 hasta el valor objetivo
     */
    function animateCounter(element, target, duration = 2000) {
        const startTime = performance.now();
        const startValue = 0;

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(startValue + (target - startValue) * eased);

            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = target;
            }
        }

        requestAnimationFrame(update);
    }

    const statNumbers = document.querySelectorAll('.stat-number[data-value]');

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                const value = entry.target.dataset.value;

                if (value === 'infinity') {
                    entry.target.innerHTML = '&infin;';
                } else {
                    const numValue = parseInt(value, 10);
                    if (!isNaN(numValue)) {
                        animateCounter(entry.target, numValue);
                    }
                }
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => statsObserver.observe(stat));

    // ============================================
    // EFECTO TYPING (Hero Code)
    // ============================================

    const codeElement = document.getElementById('typewriter-code');

    if (codeElement && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const originalHTML = codeElement.innerHTML;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = originalHTML;
        const fullText = tempDiv.textContent;

        // Extraer tokens con sus colores del HTML original
        const tokens = [];
        const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
        let node;
        while (node = walker.nextNode()) {
            if (node.nodeType === Node.TEXT_NODE) {
                tokens.push({ text: node.textContent, className: null });
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                tokens.push({ text: node.textContent, className: node.className });
            }
        }

        codeElement.innerHTML = '';
        let tokenIndex = 0;
        let charIndex = 0;
        let currentSpan = null;

        function typeNextChar() {
            if (tokenIndex >= tokens.length) return;

            const token = tokens[tokenIndex];

            if (!currentSpan && token.className) {
                currentSpan = document.createElement('span');
                currentSpan.className = token.className;
                codeElement.appendChild(currentSpan);
            }

            const target = currentSpan || codeElement;
            const char = token.text[charIndex];

            if (char === '\n') {
                target.appendChild(document.createTextNode('\n'));
            } else {
                target.appendChild(document.createTextNode(char));
            }

            charIndex++;

            if (charIndex >= token.text.length) {
                tokenIndex++;
                charIndex = 0;
                currentSpan = null;
            }

            // Velocidad de typing variable para efecto natural
            const speed = Math.random() * 30 + 20;
            setTimeout(typeNextChar, speed);
        }

        // Iniciar typing despues de un delay
        setTimeout(typeNextChar, 800);
    }

    // ============================================
    // PARALLAX SUAVE (Hero Visual)
    // ============================================

    const heroVisual = document.querySelector('.hero-visual');

    if (heroVisual && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        let ticking = false;

        window.addEventListener('scroll', throttle(() => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    heroVisual.style.transform = `translateY(${scrolled * 0.15}px)`;
                    ticking = false;
                });
                ticking = true;
            }
        }, 50));
    }

    // ============================================
    // NAVBAR ACTIVE STATE
    // ============================================

    const sections = document.querySelectorAll('section[id]');
    const navLinkElements = document.querySelectorAll('.nav-links a');

    function updateActiveNav() {
        const scrollPos = window.scrollY + navbar.offsetHeight + 100;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinkElements.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', throttle(updateActiveNav, 150));

    // ============================================
    // EASTER EGG EN CONSOLA
    // ============================================

    console.log(
        '%c%s',
        'font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; color: #3b82f6;',
        'PhysicsLab 3D'
    );
    console.log(
        '%cDesarrollado por Francisco Garcia (CI: 30.626.299) y Franklin Herrera (CI: 31.585.389)',
        'font-size: 13px; color: #64748b;'
    );
    console.log(
        '%cProyecto de Programacion II - UNERG 2025',
        'font-size: 11px; color: #94a3b8;'
    );

    // ============================================
    // API GLOBAL
    // ============================================

    window.PhysicsLabDocs = {
        version: '2.0.0',
        scrollToSection: (id) => {
            const element = document.querySelector(id);
            if (element) {
                const navHeight = navbar.offsetHeight;
                const position = element.getBoundingClientRect().top + window.pageYOffset - navHeight;
                window.scrollTo({ top: position, behavior: 'smooth' });
            }
        },
        getProjectInfo: () => ({
            title: 'Simulador de Fisica 3D',
            version: '2.0.0',
            authors: [
                { name: 'Francisco Garcia', ci: '30.626.299' },
                { name: 'Franklin Herrera', ci: '31.585.389' }
            ],
            subject: 'Programacion II',
            institution: 'UNERG',
            year: 2025,
            semester: '2026-5'
        })
    };

})();
