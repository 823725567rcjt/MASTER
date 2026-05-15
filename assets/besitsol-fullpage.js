/**
 * BESITSOL Fullpage Scroll & Hero Banner Interaction
 * ---------------------------------------------------
 * 1. Full-page vertical scroll (wheel + touch + keyboard)
 * 2. Hero banner scene switching (hover/click)
 * 3. FAQ accordion
 *
 * Compatible with Shopify Theme Editor (preview mode) and live storefront.
 */

(function () {
  'use strict';

  // Retry-based initialization to handle Shopify async section loading
  var maxRetries = 20;
  var retryCount = 0;

  function tryInit() {
    var heroFound = document.querySelector('.besitsol-hero');
    var containerFound = document.getElementById('besitsol-scroll-container');

    if (heroFound || containerFound || retryCount >= maxRetries) {
      init();
    } else {
      retryCount++;
      setTimeout(tryInit, 200);
    }
  }

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(tryInit, 100);
    });
  } else {
    setTimeout(tryInit, 100);
  }

  function init() {
    console.log('[BESITSOL] Initializing...');
    initFullpageScroll();
    initHeroBanner();
    initFaqAccordion();
  }

  /* =============================================
     1. FULLPAGE SCROLL
     ============================================= */
  function initFullpageScroll() {
    var container = document.getElementById('besitsol-scroll-container');
    if (!container) {
      console.log('[BESITSOL] No scroll container found');
      return;
    }

    // Shopify wraps each section in .shopify-section divs
    var sections = container.querySelectorAll(':scope > .shopify-section');
    if (!sections.length) {
      // Fallback: maybe sections are direct children
      sections = container.querySelectorAll('.besitsol-section');
    }
    var totalSections = sections.length;
    console.log('[BESITSOL] Scroll init — sections found:', totalSections);
    if (totalSections === 0) return;

    var currentIndex = 0;
    var isScrolling = false;
    var scrollDuration = 1200;

    // Lock body scroll
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
    var touchStartY = 0;
    window.addEventListener('touchstart', function (e) {
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    window.addEventListener('touchend', function (e) {
      var touchEndY = e.changedTouches[0].screenY;
      var diff = touchStartY - touchEndY;
      if (Math.abs(diff) < 50) return;
      if (diff > 0) {
        goToSection(currentIndex + 1);
      } else {
        goToSection(currentIndex - 1);
      }
    }, { passive: true });

    // Keyboard
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

    window.besitsolGoToSection = goToSection;
  }

  /* =============================================
     2. HERO BANNER — Scene Switching
     ============================================= */
  function initHeroBanner() {
    // Search the entire document for hero elements (works regardless of nesting)
    var allButtons = document.querySelectorAll('.besitsol-theme-btn');
    var allLayers = document.querySelectorAll('.besitsol-hero__layer');
    var titleEl = document.getElementById('besitsol-banner-title');
    var descEl = document.getElementById('besitsol-banner-desc');

    console.log('[BESITSOL] Hero init — buttons:', allButtons.length, 'layers:', allLayers.length, 'title:', !!titleEl, 'desc:', !!descEl);

    if (!allButtons.length || !allLayers.length) {
      console.log('[BESITSOL] Hero elements not found, skipping banner init');
      return;
    }

    var buttonArray = [];
    var layerArray = [];
    for (var i = 0; i < allButtons.length; i++) { buttonArray.push(allButtons[i]); }
    for (var j = 0; j < allLayers.length; j++) { layerArray.push(allLayers[j]); }

    function switchScene(btn) {
      var targetId = btn.getAttribute('data-target');
      var newTitle = btn.getAttribute('data-title');
      var newDesc = btn.getAttribute('data-desc');
      var btnIndex = buttonArray.indexOf(btn);

      console.log('[BESITSOL] Switching to scene:', btnIndex, 'target:', targetId);

      // Remove active from all layers
      for (var k = 0; k < layerArray.length; k++) {
        layerArray[k].classList.remove('active');
      }

      // Try to match by data-scene attribute
      var matched = false;
      for (var m = 0; m < layerArray.length; m++) {
        if (layerArray[m].getAttribute('data-scene') === targetId) {
          layerArray[m].classList.add('active');
          matched = true;
          break;
        }
      }

      // Fallback: match by index position
      if (!matched && btnIndex >= 0 && btnIndex < layerArray.length) {
        layerArray[btnIndex].classList.add('active');
        console.log('[BESITSOL] Used index fallback for layer', btnIndex);
      }

      // Update active button state
      for (var n = 0; n < buttonArray.length; n++) {
        buttonArray[n].classList.remove('active-btn');
      }
      btn.classList.add('active-btn');

      // Animate text
      if (titleEl && descEl && newTitle && newDesc) {
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

    // Attach event listeners to each button
    for (var p = 0; p < buttonArray.length; p++) {
      (function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          switchScene(btn);
        });

        btn.addEventListener('mouseenter', function () {
          if (window.innerWidth >= 1024) {
            switchScene(btn);
          }
        });
      })(buttonArray[p]);
    }

    console.log('[BESITSOL] Hero banner initialized successfully');
  }

  /* =============================================
     3. FAQ ACCORDION
     ============================================= */
  function initFaqAccordion() {
    var faqItems = document.querySelectorAll('.besitsol-faq__item');
    if (!faqItems.length) return;

    for (var i = 0; i < faqItems.length; i++) {
      (function (item) {
        var questionBtn = item.querySelector('.besitsol-faq__question');
        if (!questionBtn) return;

        questionBtn.addEventListener('click', function () {
          for (var j = 0; j < faqItems.length; j++) {
            if (faqItems[j] !== item) {
              faqItems[j].classList.remove('active');
            }
          }
          item.classList.toggle('active');
        });
      })(faqItems[i]);
    }
  }

  // Global FAQ toggle for inline onclick fallback
  window.besitsolToggleFaq = function (btn) {
    var item = btn.parentElement;
    var allItems = document.querySelectorAll('.besitsol-faq__item');
    for (var i = 0; i < allItems.length; i++) {
      if (allItems[i] !== item) allItems[i].classList.remove('active');
    }
    item.classList.toggle('active');
  };

})();
