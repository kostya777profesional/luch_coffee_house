/* Кофейня «Луч» — шапка, меню, появление секций, сегодняшний день в часах. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js-ready');

  var nav = document.getElementById('site-nav');
  var toggle = nav ? nav.querySelector('.nav__toggle') : null;
  var links = document.getElementById('nav-links');
  var desktop = window.matchMedia('(min-width: 1024px)');

  /* шапка уплотняется после первых 24px прокрутки */
  var ticking = false;
  function readScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      nav.classList.toggle('is-compact', window.scrollY > 24);
      ticking = false;
    });
  }
  if (nav) {
    window.addEventListener('scroll', readScroll, { passive: true });
    readScroll();
  }

  /* меню на телефоне и планшете */
  function setMenu(open) {
    if (!nav || !toggle || !links) return;
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      var first = links.querySelector('a');
      if (first) first.focus();
    }
  }

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    links.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        toggle.focus();
        return;
      }
      if (event.key !== 'Tab' || !nav.classList.contains('is-open')) return;

      var focusable = [toggle].concat(
        Array.prototype.slice.call(links.querySelectorAll('a'))
      );
      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    var onDesktop = function () {
      if (desktop.matches) setMenu(false);
    };
    if (desktop.addEventListener) desktop.addEventListener('change', onDesktop);
    else if (desktop.addListener) desktop.addListener(onDesktop);
  }

  /* секции появляются один раз, мягко и без рывков */
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

  function revealAll() {
    items.forEach(function (item) {
      item.classList.add('is-in');
    });
  }

  if (!items.length) return;

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -18% 0px', threshold: 0.18 });

    items.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    revealAll();
  }

  /* сегодняшний день в часах работы: пояс кофейни, не гостя */
  var rows = Array.prototype.slice.call(document.querySelectorAll('.hours__row[data-day]'));
  if (rows.length) {
    try {
      var weekday = new Intl.DateTimeFormat('en-GB', {
        weekday: 'short',
        timeZone: 'Asia/Yekaterinburg'
      }).format(new Date());
      var weekend = weekday === 'Sat' || weekday === 'Sun';
      rows.forEach(function (row) {
        var isWeekend = row.getAttribute('data-day') === 'weekend';
        row.classList.toggle('is-today', isWeekend === weekend);
      });
    } catch (error) {
      /* без Intl часы просто остаются без отметки */
    }
  }
})();
