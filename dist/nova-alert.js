/*!
 * Nova Alert v1.0.0
 * A modern, spring-animated alert/toast/confirm library — SweetAlert-style API.
 * https://github.com/abhinandanachary/nova-alert
 * MIT License
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.NovaAlert = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ICONS = {
    success: '<svg viewBox="0 0 52 52" fill="none"><path class="nv-check-path" d="M14 27l8 8 16-18" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    error: '<svg viewBox="0 0 52 52" fill="none"><path class="nv-cross-path" d="M17 17l18 18M35 17L17 35" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>',
    warning: '<svg viewBox="0 0 52 52" fill="none"><path d="M26 16v14" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><circle cx="26" cy="36" r="2.4" fill="currentColor"/></svg>',
    info: '<svg viewBox="0 0 52 52" fill="none"><path d="M26 23v13" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><circle cx="26" cy="16" r="2.4" fill="currentColor"/></svg>'
  };

  var THEME = {
    success: { icon: '#3ee68b', ring: '#3ee68b', bg: 'rgba(62,230,139,0.14)', glow: '#3ee68b', btnA: '#3ee68b', btnB: '#3ee6d8', animClass: '' },
    error:   { icon: '#ff5c72', ring: '#ff5c72', bg: 'rgba(255,92,114,0.14)', glow: '#ff5c72', btnA: '#ff5c72', btnB: '#ff8f5d', animClass: 'shake' },
    warning: { icon: '#ffb648', ring: '#ffb648', bg: 'rgba(255,182,72,0.14)', glow: '#ffb648', btnA: '#ffb648', btnB: '#ffe066', animClass: 'bounce' },
    info:    { icon: '#7c6cff', ring: '#7c6cff', bg: 'rgba(124,108,255,0.16)', glow: '#7c6cff', btnA: '#7c6cff', btnB: '#3ee6d8', animClass: '' }
  };

  var activeModalCount = 0;
  var lockState = null;

  function ensureToastWrap() {
    var wrap = document.getElementById('nv-toast-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'nv-toast-wrap';
      wrap.className = 'nv-toast-wrap';
      document.body.appendChild(wrap);
    }
    return wrap;
  }

  function normalizeOptions(opts) {
    opts = opts || {};
    return {
      type: opts.type || 'info',
      title: opts.title || '',
      text: opts.text || '',
      confirmLabel: opts.confirmLabel || 'Got it',
      cancelLabel: opts.cancelLabel || 'Cancel',
      timer: typeof opts.timer === 'number' ? opts.timer : null,
      allowOutsideClick: opts.allowOutsideClick === true,
      allowEscapeKey: opts.allowEscapeKey === true,
      allowScroll: opts.allowScroll === true,
      allowKeyboard: opts.allowKeyboard === true,
      focusConfirm: opts.focusConfirm !== false,
      allowTimer: opts.allowTimer !== false
    };
  }

  function setBodyLock(shouldLock) {
    if (!document.body || !document.documentElement) return;
    if (shouldLock) {
      if (activeModalCount === 0) {
        lockState = {
          overflow: document.body.style.overflow,
          htmlOverflow: document.documentElement.style.overflow,
          paddingRight: document.body.style.paddingRight
        };
        document.body.classList.add('nv-body-lock');
        document.documentElement.classList.add('nv-body-lock');
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        var scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        if (scrollbarWidth > 0) {
          document.body.style.paddingRight = scrollbarWidth + 'px';
        }
      }
      activeModalCount += 1;
    } else if (activeModalCount > 0) {
      activeModalCount -= 1;
      if (activeModalCount === 0) {
        document.body.classList.remove('nv-body-lock');
        document.documentElement.classList.remove('nv-body-lock');
        document.body.style.overflow = lockState && lockState.overflow !== undefined ? lockState.overflow : '';
        document.documentElement.style.overflow = lockState && lockState.htmlOverflow !== undefined ? lockState.htmlOverflow : '';
        document.body.style.paddingRight = lockState && lockState.paddingRight !== undefined ? lockState.paddingRight : '';
        lockState = null;
      }
    }
  }

  function buildCard(opts) {
    var t = THEME[opts.type] || THEME.info;
    var card = document.createElement('div');
    card.className = 'nv-card';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-label', opts.title || 'Alert');
    card.setAttribute('tabindex', '-1');
    card.style.setProperty('--glow', t.glow);
    card.style.setProperty('--icon-bg', t.bg);
    card.style.setProperty('--icon-ring', t.ring);
    card.style.setProperty('--btn-a', t.btnA);
    card.style.setProperty('--btn-b', t.btnB);

    card.innerHTML =
      '<div class="nv-icon-wrap ' + t.animClass + '" style="color:' + t.icon + '">' + (ICONS[opts.type] || ICONS.info) + '</div>' +
      '<h3 class="nv-title"></h3>' +
      '<p class="nv-text"></p>' +
      '<div class="nv-actions"></div>';

    card.querySelector('.nv-title').textContent = opts.title || '';
    card.querySelector('.nv-text').textContent = opts.text || '';
    return card;
  }

  function attachModalBehavior(overlay, card, opts, close) {
    var activeElementBeforeOpen = document.activeElement;

    function getFocusable() {
      return Array.prototype.filter.call(card.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'), function (el) {
        return !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true' && el.offsetParent !== null;
      });
    }

    function focusInitialControl() {
      if (opts.focusConfirm !== true) {
        card.focus();
        return;
      }
      var target = card.querySelector('.nv-btn.primary') || card.querySelector('.nv-btn') || card;
      if (target && typeof target.focus === 'function') {
        target.focus();
      } else {
        card.focus();
      }
    }

    function trapTab(event) {
      if (opts.allowKeyboard === true) return;
      var focusable = getFocusable();
      if (!focusable.length) {
        event.preventDefault();
        card.focus();
        return;
      }
      var index = focusable.indexOf(document.activeElement);
      if (event.shiftKey) {
        if (index <= 0) {
          event.preventDefault();
          focusable[focusable.length - 1].focus();
        }
      } else if (index === focusable.length - 1) {
        event.preventDefault();
        focusable[0].focus();
      }
    }

    function handleKeydown(event) {
      if (opts.allowKeyboard === true) {
        if (event.key === 'Escape' && opts.allowEscapeKey !== true) {
          event.preventDefault();
          event.stopPropagation();
        }
        return;
      }

      if (event.key === 'Escape') {
        if (opts.allowEscapeKey === true) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (event.key === 'Tab') {
        trapTab(event);
        return;
      }

      event.preventDefault();
      event.stopPropagation();
    }

    overlay.addEventListener('click', function (event) {
      if (event.target === overlay && opts.allowOutsideClick === true) {
        close(false);
      }
    });

    document.addEventListener('keydown', handleKeydown, true);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.classList.add('show');
        focusInitialControl();
      });
    });

    return function cleanup() {
      document.removeEventListener('keydown', handleKeydown, true);
      if (activeElementBeforeOpen && typeof activeElementBeforeOpen.focus === 'function') {
        activeElementBeforeOpen.focus();
      }
    };
  }

  var NovaAlert = {
    fire: function (opts) {
      opts = normalizeOptions(opts);
      return new Promise(function (resolve) {
        var overlay = document.createElement('div');
        overlay.className = 'nv-overlay';
        var card = buildCard(opts);
        var actions = card.querySelector('.nv-actions');
        var closed = false;
        var cleanup = null;

        var okBtn = document.createElement('button');
        okBtn.className = 'nv-btn primary';
        okBtn.textContent = opts.confirmLabel || 'Got it';
        actions.appendChild(okBtn);

        overlay.appendChild(card);
        document.body.appendChild(overlay);
        setBodyLock(!opts.allowScroll);
        cleanup = attachModalBehavior(overlay, card, opts, function (val) { close(val); });

        function close(val) {
          if (closed) return;
          closed = true;
          overlay.classList.remove('show');
          overlay.classList.add('hide');
          setBodyLock(false);
          if (cleanup) cleanup();
          setTimeout(function () { overlay.remove(); resolve(val); }, 320);
        }

        okBtn.addEventListener('click', function () { close(true); });

        if (opts.timer && opts.allowTimer !== false) {
          var bar = document.createElement('div');
          bar.className = 'nv-progress';
          card.appendChild(bar);
          bar.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: opts.timer, easing: 'linear', fill: 'forwards' });
          setTimeout(function () { close(false); }, opts.timer);
        }
      });
    },

    confirm: function (opts) {
      opts = normalizeOptions(Object.assign({ type: 'warning' }, opts));
      return new Promise(function (resolve) {
        var overlay = document.createElement('div');
        overlay.className = 'nv-overlay';
        var card = buildCard(opts);
        var actions = card.querySelector('.nv-actions');
        var closed = false;
        var cleanup = null;

        var cancelBtn = document.createElement('button');
        cancelBtn.className = 'nv-btn ghost';
        cancelBtn.textContent = opts.cancelLabel || 'Cancel';

        var okBtn = document.createElement('button');
        okBtn.className = 'nv-btn primary';
        okBtn.textContent = opts.confirmLabel || 'Confirm';

        actions.appendChild(cancelBtn);
        actions.appendChild(okBtn);

        overlay.appendChild(card);
        document.body.appendChild(overlay);
        setBodyLock(!opts.allowScroll);
        cleanup = attachModalBehavior(overlay, card, opts, function (val) { close(val); });

        function close(val) {
          if (closed) return;
          closed = true;
          overlay.classList.remove('show');
          overlay.classList.add('hide');
          setBodyLock(false);
          if (cleanup) cleanup();
          setTimeout(function () { overlay.remove(); resolve(val); }, 320);
        }

        okBtn.addEventListener('click', function () { close(true); });
        cancelBtn.addEventListener('click', function () { close(false); });
      });
    },

    toast: function (opts) {
      opts = opts || {};
      var wrap = ensureToastWrap();
      var t = THEME[opts.type] || THEME.info;
      var el = document.createElement('div');
      el.className = 'nv-toast';
      el.innerHTML =
        '<div class="nv-toast-icon" style="background:' + t.bg + '; color:' + t.icon + '">' + (ICONS[opts.type] || ICONS.info) + '</div>' +
        '<div class="nv-toast-body">' +
        '<p class="nv-toast-title"></p>' +
        (opts.text ? '<p class="nv-toast-text"></p>' : '') +
        '</div>';

      el.querySelector('.nv-toast-title').textContent = opts.title || '';
      if (opts.text) el.querySelector('.nv-toast-text').textContent = opts.text;

      wrap.appendChild(el);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { el.classList.add('show'); });
      });
      var life = opts.timer || 3200;
      setTimeout(function () {
        el.classList.remove('show');
        el.classList.add('hide');
        setTimeout(function () { el.remove(); }, 450);
      }, life);
    }
  };

  return NovaAlert;
}));
