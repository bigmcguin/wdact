/*
  Shared navigation menu.

  Every page includes this script and an empty <header data-site-nav>
  placeholder (see nav.html). The script builds the menu from the config
  below, so menu items live in one place only.
*/

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     MENU CONFIG: the only place menu items are defined.
     To add a page, add one line here. Links are relative to the site
     root (the folder that holds index.html), so they keep working when
     the site is served from public_html or a subfolder.
     To link to a section of a page, add its id after a #, for example
     { label: 'Contact', href: 'index.html#contact' }.
     ------------------------------------------------------------------ */
  var NAV_CONFIG = {
    siteName: 'WDACT: Workplace Drug & Alcohol Compliance Testing',
    // Optional logo shown instead of the site name (the name becomes its alt text).
    logo: { src: 'assets/images/wdact-logo.webp', width: 190, height: 105 },
    menuLabel: 'Main',
    items: [
      { label: 'Home', href: 'index.html' },
      { label: 'Services', href: 'services.html' },
      { label: 'Contact', href: 'contact.html' }
    ],
    // Optional button that stays in the bar at every width, beside the menu.
    action: { label: 'Call 0457 838 378', shortLabel: 'Call', href: 'tel:+61457838378' }
  };
  /* ------------------------------------------------------------------ */

  // Must match the breakpoint in nav.css: the mobile menu applies under 768 px.
  var DESKTOP_QUERY = '(min-width: 768px)';
  var MENU_ID = 'site-nav-menu';

  // Work out the site root from this script's own address
  // (assets/components/nav/nav.js sits three folders below the root).
  var script = document.currentScript;
  var siteRoot = new URL('../../../', script ? script.src : document.baseURI);

  function resolve(href) {
    return new URL(href, siteRoot);
  }

  // Treat /, /index.html, /about and /about.html as the same page.
  function normalisePath(pathname) {
    return pathname
      .replace(/index\.html?$/i, '')
      .replace(/\.html?$/i, '')
      .replace(/\/+$/, '') || '/';
  }

  function isSamePage(url) {
    return url.origin === location.origin &&
      normalisePath(url.pathname) === normalisePath(location.pathname) &&
      url.search === location.search;
  }

  // Section links (with a #) are never marked as the current page.
  function isCurrent(url) {
    return !url.hash && isSamePage(url);
  }

  function build(header) {
    var items = NAV_CONFIG.items.map(function (item) {
      var url = resolve(item.href);
      var current = isCurrent(url) ? ' aria-current="page"' : '';
      return '<li><a class="site-nav__link" href="' + url.href + '"' + current + '>' +
        escapeHtml(item.label) + '</a></li>';
    }).join('');

    header.classList.add('site-header');
    header.innerHTML =
      '<a class="site-nav__skip" href="#main">Skip to main content</a>' +
      '<div class="site-nav__bar">' +
        '<a class="site-nav__brand" href="' + resolve('index.html').href + '">' +
          brand() + '</a>' +
        // The menu comes before the action and the toggle so the tab order
        // matches what is on screen at both widths (the mobile panel is fixed
        // below the bar, so its place here does not move anything).
        '<nav class="site-nav__panel" id="' + MENU_ID + '" aria-label="' +
          escapeHtml(NAV_CONFIG.menuLabel) + '">' +
          '<ul class="site-nav__list">' + items + '</ul>' +
        '</nav>' +
        action() +
        '<button class="site-nav__toggle" type="button" aria-expanded="false"' +
          ' aria-controls="' + MENU_ID + '" aria-label="Menu">' +
          '<span class="site-nav__icon" aria-hidden="true"></span>' +
        '</button>' +
      '</div>';
  }

  function brand() {
    var logo = NAV_CONFIG.logo;
    if (!logo) return escapeHtml(NAV_CONFIG.siteName);
    return '<img class="site-nav__logo" src="' + resolve(logo.src).href + '" alt="' +
      escapeHtml(NAV_CONFIG.siteName) + '" width="' + logo.width + '" height="' + logo.height + '">';
  }

  // Links such as tel: and mailto: are used as they are; page links resolve
  // from the site root like the menu items.
  function action() {
    var item = NAV_CONFIG.action;
    if (!item) return '';
    var href = /^[a-z]+:/i.test(item.href) ? item.href : resolve(item.href).href;
    var short = item.shortLabel || item.label;
    return '<a class="site-nav__action" href="' + escapeHtml(href) + '">' +
      '<span class="site-nav__action-short" aria-hidden="true">' + escapeHtml(short) + '</span>' +
      '<span class="site-nav__action-full">' + escapeHtml(item.label) + '</span></a>';
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function init() {
    var header = document.querySelector('[data-site-nav]');
    if (!header || header.dataset.navReady) return;
    header.dataset.navReady = 'true';

    build(header);

    var toggle = header.querySelector('.site-nav__toggle');
    var desktop = window.matchMedia(DESKTOP_QUERY);
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function isOpen() {
      return toggle.getAttribute('aria-expanded') === 'true';
    }

    function open() {
      toggle.setAttribute('aria-expanded', 'true');
      header.classList.add('is-open');
      // Stop the page behind the menu from scrolling.
      document.documentElement.classList.add('site-nav-lock');
    }

    function close(returnFocus) {
      if (!isOpen()) return;
      toggle.setAttribute('aria-expanded', 'false');
      header.classList.remove('is-open');
      document.documentElement.classList.remove('site-nav-lock');
      if (returnFocus) toggle.focus();
    }

    toggle.addEventListener('click', function () {
      if (isOpen()) {
        close(false);
      } else {
        open();
      }
    });

    // Space to leave above a section so the sticky header never covers it.
    // Comes from scroll-margin-top in nav.css.
    function headerOffset(target) {
      var margin = parseFloat(getComputedStyle(target).scrollMarginTop);
      return margin > 0 ? margin : header.offsetHeight;
    }

    // Scroll a same-page link's section (or the top of the page) into view
    // just below the header, and move keyboard focus there.
    function scrollToSection(url) {
      var id = url.hash ? decodeURIComponent(url.hash.slice(1)) : '';
      var target = id ? document.getElementById(id) : null;
      if (id && !target) return false;

      var top = target ? target.getBoundingClientRect().top + window.pageYOffset - headerOffset(target) : 0;
      window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion.matches ? 'auto' : 'smooth' });

      if (url.href !== location.href) history.pushState(null, '', url.href);

      if (target) {
        if (!target.matches('a[href], button, input, select, textarea, [tabindex]')) {
          target.setAttribute('tabindex', '-1');
        }
        target.focus({ preventScroll: true });
      }
      return true;
    }

    // Close when any link in the header is tapped. Links to the page that is
    // already open scroll to their section instead of reloading the page.
    header.addEventListener('click', function (event) {
      var link = event.target.closest('a');
      if (!link) return;
      close(false);

      var newTab = event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
      if (newTab || link.target === '_blank') return;

      var url = new URL(link.href);
      if (isSamePage(url) && scrollToSection(url)) event.preventDefault();
    });

    document.addEventListener('keydown', function (event) {
      if (!isOpen()) return;

      if (event.key === 'Escape' || event.key === 'Esc') {
        event.preventDefault();
        close(true);
        return;
      }

      // Keep keyboard focus inside the header while the mobile menu is open.
      if (event.key === 'Tab') {
        var focusable = Array.prototype.filter.call(
          header.querySelectorAll('a[href], button:not([disabled])'),
          function (el) { return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement; }
        );
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        } else if (!header.contains(document.activeElement)) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    // Reset when the window grows to desktop width.
    function onBreakpointChange(event) {
      if (event.matches) close(false);
    }
    if (desktop.addEventListener) {
      desktop.addEventListener('change', onBreakpointChange);
    } else {
      desktop.addListener(onBreakpointChange);
    }

    // Reset if the page is restored from the back/forward cache with the menu open.
    window.addEventListener('pageshow', function (event) {
      if (event.persisted) close(false);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
