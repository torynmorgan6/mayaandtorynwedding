/* ============================================
   MAIN JAVASCRIPT — Maya & Toryn's Wedding Website
   public/js/main.js

   CONTENTS:
   1. Countdown Timer
   2. Navigation (mobile toggle + hide-on-scroll)
   3. Scroll Animations (IntersectionObserver)
   4. RSVP Page: beforeunload + exit intent modal
   5. Registry: AJAX claim system
   6. Gallery: Filter buttons + lightbox
   7. Utilities
   ============================================ */

(function () {
  'use strict';

  /* ============================================
     1. COUNTDOWN TIMER
     Reads data-wedding-date from #countdown element
     Updates every second
     WHAT TO CHANGE: Update data-wedding-date in views/index.ejs
     ============================================ */
  function initCountdown() {
    const el = document.getElementById('countdown');
    if (!el) return;

    const weddingDateStr = el.getAttribute('data-wedding-date');
    if (!weddingDateStr) return;

    const weddingDate = new Date(weddingDateStr);
    if (isNaN(weddingDate.getTime())) {
      console.warn('Countdown: invalid data-wedding-date attribute');
      return;
    }

    const daysEl    = document.getElementById('days');
    const hoursEl   = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    function update() {
      const now  = new Date().getTime();
      const diff = weddingDate.getTime() - now;

      if (diff <= 0) {
        // Wedding has passed — show a celebratory message
        daysEl.textContent    = '0';
        hoursEl.textContent   = '0';
        minutesEl.textContent = '0';
        secondsEl.textContent = '0';
        const labelEl = document.querySelector('.countdown-label');
        if (labelEl) labelEl.textContent = '✦ We Are Married! ✦';
        return;
      }

      const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      daysEl.textContent    = days;
      hoursEl.textContent   = String(hours).padStart(2, '0');
      minutesEl.textContent = String(minutes).padStart(2, '0');
      secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  /* ============================================
     2. NAVIGATION
     - Mobile hamburger toggle
     - Hide nav on scroll down, show on scroll up
     ============================================ */
  function initNav() {
    const nav       = document.getElementById('site-nav');
    const toggle    = document.getElementById('nav-toggle');
    const navLinks  = document.getElementById('nav-links');

    if (!nav || !toggle || !navLinks) return;

    // Mobile toggle
    toggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('is-open');
      toggle.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close nav when a link is clicked (mobile)
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close nav when clicking outside
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && navLinks.classList.contains('is-open')) {
        navLinks.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Hide/show nav on scroll
    let lastScrollY = window.scrollY;
    let ticking = false;

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          const currentY = window.scrollY;

          if (currentY > 80) {
            nav.classList.add('nav-scrolled');
          } else {
            nav.classList.remove('nav-scrolled');
          }

          // Only hide on scroll down if mobile nav is not open
          if (!navLinks.classList.contains('is-open')) {
            if (currentY > lastScrollY && currentY > 200) {
              nav.classList.add('nav-hidden');
            } else {
              nav.classList.remove('nav-hidden');
            }
          }

          lastScrollY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ============================================
     3. SCROLL ANIMATIONS
     Adds .visible class to .fade-in-section elements
     when they enter the viewport
     ============================================ */
  function initScrollAnimations() {
    const sections = document.querySelectorAll('.fade-in-section');
    if (!sections.length) return;

    if (!('IntersectionObserver' in window)) {
      // Fallback: show all immediately
      sections.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    sections.forEach(function (el) { observer.observe(el); });
  }

  /* ============================================
     4. RSVP PAGE
     - Dirty-form detection (warn before leaving)
     - Exit intent modal
     ============================================ */
  function initRsvpPage() {
    const form = document.getElementById('rsvp-form');
    if (!form) return;

    const exitModal     = document.getElementById('exit-modal');
    const btnStay       = document.getElementById('modal-stay');
    const btnLeave      = document.getElementById('modal-leave');

    let formDirty    = false;
    let submitted    = false;
    let exitShown    = false;
    let pendingHref  = null;

    // Mark form dirty when user interacts
    form.addEventListener('input', function () { formDirty = true; }, { passive: true });
    form.addEventListener('change', function () { formDirty = true; }, { passive: true });

    form.addEventListener('submit', function () {
      submitted = true;
      formDirty = false;
    });

    // Native beforeunload (browser dialog on tab close / refresh)
    window.addEventListener('beforeunload', function (e) {
      if (formDirty && !submitted) {
        e.preventDefault();
        e.returnValue = '';
      }
    });

    // Exit intent modal for in-page navigation
    if (exitModal && btnStay && btnLeave) {
      // Intercept nav link clicks
      document.querySelectorAll('a[href]').forEach(function (link) {
        const href = link.getAttribute('href');
        // Only intercept internal links (not RSVP page itself)
        if (href && !href.startsWith('#') && href !== '/rsvp') {
          link.addEventListener('click', function (e) {
            if (formDirty && !submitted && !exitShown) {
              e.preventDefault();
              pendingHref = href;
              showExitModal();
            }
          });
        }
      });

      // Mouse-leave exit intent (desktop)
      document.addEventListener('mouseleave', function (e) {
        if (e.clientY < 10 && formDirty && !submitted && !exitShown) {
          showExitModal();
        }
      });

      btnStay.addEventListener('click', function () {
        hideExitModal();
        exitShown = false;
        pendingHref = null;
      });

      btnLeave.addEventListener('click', function () {
        formDirty = false;
        hideExitModal();
        if (pendingHref) {
          window.location.href = pendingHref;
        }
      });

      // Close on overlay click
      exitModal.addEventListener('click', function (e) {
        if (e.target === exitModal) {
          hideExitModal();
          exitShown = false;
          pendingHref = null;
        }
      });

      // Close on Escape
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && exitModal && !exitModal.hidden) {
          hideExitModal();
          exitShown = false;
          pendingHref = null;
        }
      });
    }

    function showExitModal() {
      if (!exitModal) return;
      exitShown = true;
      exitModal.hidden = false;
      document.body.style.overflow = 'hidden';
      if (btnStay) btnStay.focus();
    }

    function hideExitModal() {
      if (!exitModal) return;
      exitModal.hidden = true;
      document.body.style.overflow = '';
    }

    // Hide guests group when declining
    const guestsGroup   = document.getElementById('guests-group');
    const attendingRadios = form.querySelectorAll('input[name="attending"]');
    attendingRadios.forEach(function (radio) {
      radio.addEventListener('change', function () {
        if (guestsGroup) {
          guestsGroup.style.display = this.value === 'no' ? 'none' : '';
        }
      });
    });
  }

  /* ============================================
     5. REGISTRY CLAIM SYSTEM
     AJAX POST to /registry/claim/:itemId
     ============================================ */
  function initRegistry() {
    const claimModal    = document.getElementById('claim-modal');
    const claimerInput  = document.getElementById('claimer-name');
    const confirmBtn    = document.getElementById('confirm-claim-btn');
    const cancelBtn     = document.getElementById('cancel-claim-btn');
    const claimItemName = document.getElementById('claim-modal-item-name');
    const claimError    = document.getElementById('claim-error');
    const toast         = document.getElementById('claim-toast');
    const toastMsg      = document.getElementById('toast-message');

    if (!claimModal) return;

    let activeItemId   = null;
    let activeItemName = null;

    // Open modal when claim button clicked
    document.querySelectorAll('.claim-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeItemId   = this.getAttribute('data-item-id');
        activeItemName = this.getAttribute('data-item-name');
        if (claimItemName) claimItemName.textContent = '"' + activeItemName + '"';
        if (claimerInput) claimerInput.value = '';
        if (claimError)   { claimError.textContent = ''; claimError.hidden = true; }
        openModal(claimModal);
        if (claimerInput) claimerInput.focus();
      });
    });

    // Cancel
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function () {
        closeModal(claimModal);
        activeItemId = null;
      });
    }

    // Click outside
    if (claimModal) {
      claimModal.addEventListener('click', function (e) {
        if (e.target === claimModal) {
          closeModal(claimModal);
          activeItemId = null;
        }
      });
    }

    // Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && claimModal && !claimModal.hidden) {
        closeModal(claimModal);
        activeItemId = null;
      }
    });

    // Allow pressing Enter in input to confirm
    if (claimerInput) {
      claimerInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (confirmBtn) confirmBtn.click();
        }
      });
    }

    // Confirm claim
    if (confirmBtn) {
      confirmBtn.addEventListener('click', function () {
        if (!activeItemId || !claimerInput) return;

        const name = claimerInput.value.trim();
        if (!name) {
          if (claimError) {
            claimError.textContent = 'Please enter your name.';
            claimError.hidden = false;
          }
          claimerInput.focus();
          return;
        }

        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Claiming…';

        fetch('/registry/claim/' + activeItemId, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ claimerName: name })
        })
          .then(function (res) { return res.json(); })
          .then(function (data) {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm Claim';

            if (data.success) {
              closeModal(claimModal);
              // Update the card UI in-place
              updateCardClaimed(activeItemId, name);
              showToast(data.message || 'Gift claimed successfully!');
              activeItemId = null;
            } else {
              if (claimError) {
                claimError.textContent = data.message || 'Something went wrong.';
                claimError.hidden = false;
              }
            }
          })
          .catch(function () {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm Claim';
            if (claimError) {
              claimError.textContent = 'Network error. Please try again.';
              claimError.hidden = false;
            }
          });
      });
    }

    function updateCardClaimed(itemId, name) {
      const card = document.querySelector('[data-item-id="' + itemId + '"]');
      if (!card) return;
      card.classList.add('registry-card--claimed');
      const claimArea = card.querySelector('.registry-claim-area');
      if (claimArea) {
        claimArea.innerHTML = '<div class="claimed-badge"><span aria-hidden="true">✓</span> Claimed by ' + escapeHtml(name) + '</div>';
      }
    }

    function showToast(message) {
      if (!toast || !toastMsg) return;
      toastMsg.textContent = message;
      toast.hidden = false;
      setTimeout(function () { toast.hidden = true; }, 5000);
    }
  }

  /* ============================================
     6. GALLERY
     - Category filter buttons
     - Lightbox
     ============================================ */
  function initGallery() {
    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (filterBtns.length && galleryItems.length) {
      filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          filterBtns.forEach(function (b) { b.classList.remove('active'); });
          this.classList.add('active');

          const filter = this.getAttribute('data-filter');
          galleryItems.forEach(function (item) {
            if (filter === 'all' || item.getAttribute('data-category') === filter) {
              item.classList.remove('gallery-hidden');
            } else {
              item.classList.add('gallery-hidden');
            }
          });
        });
      });
    }

    // Lightbox
    const lightbox      = document.getElementById('lightbox');
    const closeBtn      = document.getElementById('lightbox-close');
    const prevBtn       = document.getElementById('lightbox-prev');
    const nextBtn       = document.getElementById('lightbox-next');
    const imageWrap     = document.getElementById('lightbox-image-wrap');
    const captionEl     = document.getElementById('lightbox-caption');

    if (!lightbox) return;

    let currentIndex = 0;
    let visibleItems = [];

    function getVisibleItems() {
      return Array.from(galleryItems).filter(function (item) {
        return !item.classList.contains('gallery-hidden');
      });
    }

    // Open lightbox on item click
    galleryItems.forEach(function (item) {
      item.addEventListener('click', function () {
        if (item.classList.contains('gallery-hidden')) return;
        visibleItems = getVisibleItems();
        currentIndex = visibleItems.indexOf(item);
        showLightboxItem(currentIndex);
        lightbox.hidden = false;
        document.body.style.overflow = 'hidden';
        if (closeBtn) closeBtn.focus();
      });
    });

    function showLightboxItem(index) {
      if (!imageWrap || !captionEl) return;
      const item = visibleItems[index];
      if (!item) return;

      // Clone the visual content of the item
      const placeholder = item.querySelector('.gallery-placeholder');
      const img         = item.querySelector('img');
      const caption     = item.getAttribute('data-caption') || '';

      imageWrap.innerHTML = '';

      if (img) {
        const clone = img.cloneNode(true);
        clone.style.maxHeight = '75vh';
        clone.style.width = 'auto';
        imageWrap.appendChild(clone);
      } else if (placeholder) {
        const clone = placeholder.cloneNode(true);
        clone.style.width = '400px';
        clone.style.height = '300px';
        clone.style.maxWidth = '100%';
        imageWrap.appendChild(clone);
      }

      captionEl.textContent = caption;

      // Show/hide prev/next
      if (prevBtn) prevBtn.style.display = visibleItems.length > 1 ? '' : 'none';
      if (nextBtn) nextBtn.style.display = visibleItems.length > 1 ? '' : 'none';
    }

    function closeLightbox() {
      lightbox.hidden = true;
      document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
        showLightboxItem(currentIndex);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        currentIndex = (currentIndex + 1) % visibleItems.length;
        showLightboxItem(currentIndex);
      });
    }

    // Close on overlay click
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard nav
    document.addEventListener('keydown', function (e) {
      if (!lightbox || lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft' && prevBtn)  prevBtn.click();
      if (e.key === 'ArrowRight' && nextBtn) nextBtn.click();
    });
  }

  /* ============================================
     7. UTILITIES
     ============================================ */
  function openModal(modal) {
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ============================================
     INIT — Run everything when DOM is ready
     ============================================ */
  function init() {
    initCountdown();
    initNav();
    initScrollAnimations();
    initRsvpPage();
    initRegistry();
    initGallery();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
