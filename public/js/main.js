/* ============================================
   MAIN JAVASCRIPT — Maya & Toryn's Wedding Website
   public/js/main.js

   CONTENTS:
   1. Countdown Timer
   2. Navigation (mobile toggle + hide-on-scroll)
   3. Scroll Animations (IntersectionObserver)
   4. RSVP Page: beforeunload + exit intent modal
   5. Registry: AJAX claim system
  6. Utilities
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
    const guestsGroup     = document.getElementById('guests-group');
    const dietaryGroup    = document.getElementById('dietary-group');
    const songGroup       = document.getElementById('song-group');
    const potluckGroup    = document.getElementById('potluck-group');
    const potluckDetails  = document.getElementById('potluck-details');
    const dietaryInput    = document.getElementById('dietary_restrictions');
    const songInput       = document.getElementById('song_request');
    const potluckOptIn    = document.getElementById('potluck_opt_in');
    const potluckCategory = document.getElementById('potluck_category');
    const potluckInput    = document.getElementById('potluck_dish');
    const guestsInput     = document.getElementById('num_guests');
    const attendingRadios = form.querySelectorAll('input[name="attending"]');

    function syncPotluckDetails() {
      if (!potluckDetails) return;
      const shouldShow = !!(potluckOptIn && potluckOptIn.checked);
      potluckDetails.style.display = shouldShow ? '' : 'none';

      if (!shouldShow) {
        if (potluckCategory) potluckCategory.value = '';
        if (potluckInput) potluckInput.value = '';
      }
    }

    function syncAttendingFields(attendingValue) {
      const isNotAttending = attendingValue === 'no';

      if (guestsGroup) {
        guestsGroup.style.display = isNotAttending ? 'none' : '';
      }
      if (dietaryGroup) {
        dietaryGroup.style.display = isNotAttending ? 'none' : '';
      }
      if (songGroup) {
        songGroup.style.display = isNotAttending ? 'none' : '';
      }
      if (potluckGroup) {
        potluckGroup.style.display = isNotAttending ? 'none' : '';
      }

      if (isNotAttending) {
        if (dietaryInput) dietaryInput.value = '';
        if (songInput) songInput.value = '';
        if (potluckOptIn) potluckOptIn.checked = false;
        if (potluckCategory) potluckCategory.value = '';
        if (potluckInput) potluckInput.value = '';
        if (guestsInput) guestsInput.value = '1';
      }

      syncPotluckDetails();
    }

    attendingRadios.forEach(function (radio) {
      radio.addEventListener('change', function () {
        syncAttendingFields(this.value);
      });
    });

    const selectedAttending = form.querySelector('input[name="attending"]:checked');
    if (selectedAttending) {
      syncAttendingFields(selectedAttending.value);
    }

    // NEW: Progressive reveal for potluck details
    if (potluckOptIn) {
      potluckOptIn.addEventListener('change', syncPotluckDetails);
      syncPotluckDetails();
    }
  }

  /* ============================================
     5. REGISTRY CLAIM SYSTEM
     AJAX POST to /registry/claim/:itemId
     ============================================ */
  function initRegistry() {
    const toast         = document.getElementById('claim-toast');
    const toastMsg      = document.getElementById('toast-message');
    const clickedLinkedItems = new Set();

    // Track external item link clicks for linked gifts
    document.querySelectorAll('.js-registry-link[data-item-id]').forEach(function (link) {
      link.addEventListener('click', function () {
        const itemId = this.getAttribute('data-item-id');
        if (!itemId) return;

        clickedLinkedItems.add(itemId);

        const claimBtn = document.querySelector('.claim-btn[data-item-id="' + itemId + '"]');
        if (claimBtn) {
          const confirmLabel = claimBtn.getAttribute('data-confirm-label') || 'I BOUGHT THIS GIFT';
          claimBtn.textContent = confirmLabel;
        }

        fetch('/registry/link-click/' + encodeURIComponent(itemId), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }).catch(function () {
          // No-op: server check will provide final enforcement on claim
        });
      });
    });

    // Direct claim when button clicked (no name modal)
    document.querySelectorAll('.claim-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const itemId = this.getAttribute('data-item-id');
        const requiresLink = this.getAttribute('data-requires-link') === 'true';
        const defaultLabel = this.getAttribute('data-default-label') || 'CLAIM THIS GIFT';
        const confirmLabel = this.getAttribute('data-confirm-label') || 'I BOUGHT THIS GIFT';

        if (requiresLink && clickedLinkedItems.has(itemId)) {
          this.textContent = confirmLabel;
        } else {
          this.textContent = defaultLabel;
        }

        if (requiresLink && !clickedLinkedItems.has(itemId)) {
          showToast('Please click "View Item" first, then come back to mark this gift as purchased.');
          return;
        }

        this.disabled = true;
        this.textContent = 'Claiming…';

        fetch('/registry/claim/' + itemId, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ claimerName: 'Anonymous Guest' })
        })
          .then(function (res) { return res.json(); })
          .then(function (data) {
            if (data.success) {
              updateCardClaimed(itemId);
              showToast(data.message || 'Gift claimed successfully!');
            } else {
              this.disabled = false;
              this.textContent = defaultLabel;
              showToast(data.message || 'Something went wrong.');
            }
          }.bind(this))
          .catch(function () {
            this.disabled = false;
            this.textContent = defaultLabel;
            showToast('Network error. Please try again.');
          }.bind(this));
      });
    });

    function updateCardClaimed(itemId) {
      const card = document.querySelector('[data-item-id="' + itemId + '"]');
      if (!card) return;
      card.classList.add('registry-card--claimed');
      const claimArea = card.querySelector('.registry-claim-area');
      if (claimArea) {
        claimArea.innerHTML = '<div class="claimed-badge" role="status" aria-label="Purchased"><span aria-hidden="true">✓</span> PURCHASED</div>';
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
     6. UTILITIES
     ============================================ */
  /* ============================================
     INIT — Run everything when DOM is ready
     ============================================ */
  function init() {
    initCountdown();
    initNav();
    initScrollAnimations();
    initRsvpPage();
    initRegistry();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
