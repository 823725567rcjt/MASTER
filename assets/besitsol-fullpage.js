/**
 * BESITSOL Fullpage Scroll & Hero Banner Interaction
 * ---------------------------------------------------
 * 1. Full-page vertical scroll (wheel + touch + keyboard)
 * 2. Hero banner scene switching (hover/click)
 * 3. FAQ accordion
 */

(function () {
  'use strict';

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    initFullpageScroll();
    initHeroBanner();
    initFaqAccordion();
  }

  /* =============================================
     1. FULLPAGE SCROLL
     ============================================= */
  function initFullpageScroll() {
    const container = document.getElementById('besitsol-scroll-container');
    if (!container) return;

    const sections = container.querySelectorAll('.besitsol-section');
    const totalSections = sections.length;
    let currentIndex = 0;
    let isScrolling = false;
    const scrollDuration = 1200; // matches CSS transition

    // Apply body class to lock scroll
    document.body.classList.add('besitsol-fullpage-body');

    function goToSection(index) {
      if (index < 0 || index >= totalSections || isScrolling) return;
      isScrolling = true;
      currentIndex = index;
      container.style.transform = 'translateY(-' + (currentIndex * 100) + 'vh)';
      setTimeout(function () {
        isScrolling = false;
      }, scrollDuration);
    }

    // Mouse wheel
    window.addEventListener('wheel', function (e) {
      if (isScrolling) return;
      if (e.deltaY > 0 && currentIndex < totalSections - 1) {
        goToSection(currentIndex + 1);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        goToSection(currentIndex - 1);
      }
    }, { passive: true });

    // Touch events
    let touchStartY = 0;
    let touchEndY = 0;

    window.addEventListener('touchstart', function (e) {
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    window.addEventListener('touchend', function (e) {
      touchEndY = e.changedTouches[0].screenY;
      var diff = touchStartY - touchEndY;
      if (Math.abs(diff) < 50) return; // minimum swipe distance
      if (diff > 0) {
        goToSection(currentIndex + 1);
      } else {
        goToSection(currentIndex - 1);
      }
    }, { passive: true });

    // Keyboard arrows
    window.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        goToSection(currentIndex + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goToSection(currentIndex - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToSection(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToSection(totalSections - 1);
      }
    });

    // Expose global navigation for nav links
    window.besitsolGoToSection = goToSection;
  }

  /* =============================================
     2. HERO BANNER — Scene Switching
     ============================================= */
  function initHeroBanner() {
    var heroSection = document.getElementById('s-hero');
    if (!heroSection) return;

    var buttons = heroSection.querySelectorAll('.besitsol-theme-btn');
    var layers = heroSection.querySelectorAll('.besitsol-hero__layer');
    var titleEl = document.getElementById('besitsol-banner-title');
    var descEl = document.getElementById('besitsol-banner-desc');

    if (!buttons.length || !layers.length) return;

    function switchScene(btn) {
      var targetId = btn.getAttribute('data-target');
      var newTitle = btn.getAttribute('data-title');
      var newDesc = btn.getAttribute('data-desc');

      // Switch background layers
      layers.forEach(function (layer) {
        layer.classList.remove('active');
        if (layer.getAttribute('data-scene') === targetId) {
          layer.classList.add('active');
        }
      });

      // Switch active button
      buttons.forEach(function (b) {
        b.classList.remove('active-btn');
      });
      btn.classList.add('active-btn');

      // Animate text change
      if (titleEl && descEl) {
        titleEl.style.opacity = '0';
        descEl.style.opacity = '0';
        setTimeout(function () {
          titleEl.innerHTML = newTitle;
          descEl.textContent = newDesc;
          titleEl.style.opacity = '1';
          descEl.style.opacity = '1';
        }, 700);
      }
    }

    buttons.forEach(function (btn) {
      // Click to switch
      btn.addEventListener('click', function () {
        switchScene(btn);
      });

      // Hover to switch (desktop only)
      btn.addEventListener('mouseenter', function () {
        if (window.innerWidth >= 1024) {
          switchScene(btn);
        }
      });
    });
  }

  /* =============================================
     3. FAQ ACCORDION
     ============================================= */
  function initFaqAccordion() {
    // The FAQ toggle is also handled by inline onclick in the liquid,
    // but we add a global handler as backup for robustness.
    var faqItems = document.querySelectorAll('.besitsol-faq__item');
    if (!faqItems.length) return;

    faqItems.forEach(function (item) {
      var questionBtn = item.querySelector('.besitsol-faq__question');
      if (!questionBtn) return;

      questionBtn.addEventListener('click', function () {
        // Close others
        faqItems.forEach(function (other) {
          if (other !== item) {
            other.classList.remove('active');
          }
        });
        // Toggle current
        item.classList.toggle('active');
      });
    });
  }

  // Global FAQ toggle for inline onclick fallback
  window.besitsolToggleFaq = function (btn) {
    var item = btn.parentElement;
    var allItems = document.querySelectorAll('.besitsol-faq__item');
    allItems.forEach(function (el) {
      if (el !== item) el.classList.remove('active');
    });
    item.classList.toggle('active');
  };

})();
