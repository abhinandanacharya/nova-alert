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

  function buildCard(opts) {
    var t = THEME[opts.type] || THEME.info;
    var card = document.createElement('div');
    card.className = 'nv-card';
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

  var NovaAlert = {
    fire: function (opts) {
      opts = opts || {};
      return new Promise(function (resolve) {
        var overlay = document.createElement('div');
        overlay.className = 'nv-overlay';
        var card = buildCard(opts);
        var actions = card.querySelector('.nv-actions');

        var okBtn = document.createElement('button');
        okBtn.className = 'nv-btn primary';
        okBtn.textContent = opts.confirmLabel || 'Got it';
        actions.appendChild(okBtn);

        overlay.appendChild(card);
        document.body.appendChild(overlay);
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { overlay.classList.add('show'); });
        });

        function close(val) {
          overlay.classList.remove('show');
          overlay.classList.add('hide');
          setTimeout(function () { overlay.remove(); resolve(val); }, 320);
        }
        okBtn.addEventListener('click', function () { close(true); });
        overlay.addEventListener('click', function (e) { if (e.target === overlay) close(false); });

        if (opts.timer) {
          var bar = document.createElement('div');
          bar.className = 'nv-progress';
          card.appendChild(bar);
          bar.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: opts.timer, easing: 'linear', fill: 'forwards' });
          setTimeout(function () { close(false); }, opts.timer);
        }
      });
    },

    confirm: function (opts) {
      opts = opts || {};
      return new Promise(function (resolve) {
        var overlay = document.createElement('div');
        overlay.className = 'nv-overlay';
        var card = buildCard(Object.assign({ type: 'warning' }, opts));
        var actions = card.querySelector('.nv-actions');

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
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { overlay.classList.add('show'); });
        });

        function close(val) {
          overlay.classList.remove('show');
          overlay.classList.add('hide');
          setTimeout(function () { overlay.remove(); resolve(val); }, 320);
        }
        okBtn.addEventListener('click', function () { close(true); });
        cancelBtn.addEventListener('click', function () { close(false); });
        overlay.addEventListener('click', function (e) { if (e.target === overlay) close(false); });
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
