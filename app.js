/* ==========================================================================
   Visa Capital — Shared JavaScript
   ========================================================================== */

(function () {
  'use strict';

  // ---------- Mobile nav ----------
  function initNav() {
    var header = document.querySelector('.site-header');
    var btn = document.querySelector('.nav-toggle');
    if (!header || !btn) return;
    btn.addEventListener('click', function () {
      header.classList.toggle('nav-open');
    });
    // close when a link is clicked (mobile)
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () { header.classList.remove('nav-open'); });
    });
  }

  // ---------- Funding calculator ----------
  function initCalc() {
    var calc = document.querySelector('[data-calc]');
    if (!calc) return;

    var amountInput = calc.querySelector('[data-calc-amount]');
    var amountVal   = calc.querySelector('[data-calc-amount-val]');
    var termInput   = calc.querySelector('[data-calc-term]');
    var termVal     = calc.querySelector('[data-calc-term-val]');
    var typeButtons = calc.querySelectorAll('[data-calc-type] button');
    var resultPay   = calc.querySelector('[data-calc-payment]');
    var resultTotal = calc.querySelector('[data-calc-total]');
    var resultRate  = calc.querySelector('[data-calc-rate]');
    var resultFreq  = calc.querySelectorAll('[data-calc-frequency]');
    var resultProd  = calc.querySelector('[data-calc-product]');

    // factor rates / APR rough estimates by product (illustrative only)
    var products = {
      term:  { label: 'Term Loan',          apr: 0.18, freq: 'Monthly',  perYear: 12 },
      mca:   { label: 'Merchant Cash Adv.', apr: 0.40, freq: 'Daily',    perYear: 252 },
      loc:   { label: 'Line of Credit',     apr: 0.22, freq: 'Weekly',   perYear: 52 },
      sba:   { label: 'SBA Loan',           apr: 0.115, freq: 'Monthly', perYear: 12 }
    };

    var current = 'term';

    function fmt(n) {
      return '$' + Math.round(n).toLocaleString('en-US');
    }
    function pct(n) {
      return (n * 100).toFixed(1).replace(/\.0$/, '') + '%';
    }

    function recompute() {
      var P = parseInt(amountInput.value, 10);
      var months = parseInt(termInput.value, 10);
      var prod = products[current];
      var r = prod.apr / 12;
      var n = months;
      // standard amortization for term/sba/loc, factor-style for MCA
      var monthlyPayment;
      var totalPaid;
      if (current === 'mca') {
        // simulate factor rate ~ 1.25 over ~6-12 months
        var factor = 1 + Math.min(0.45, prod.apr * (months / 12));
        totalPaid = P * factor;
        monthlyPayment = totalPaid / months;
      } else {
        monthlyPayment = (P * r) / (1 - Math.pow(1 + r, -n));
        totalPaid = monthlyPayment * months;
      }
      var perPayment = monthlyPayment * (12 / prod.perYear);
      amountVal.textContent = fmt(P);
      termVal.textContent = months + ' months';
      resultPay.textContent = fmt(perPayment);
      resultTotal.textContent = fmt(totalPaid);
      resultRate.textContent = pct(prod.apr) + ' est.';
      resultFreq.forEach(function (el) { el.textContent = prod.freq; });
      resultProd.textContent = prod.label;
    }

    amountInput.addEventListener('input', recompute);
    termInput.addEventListener('input', recompute);
    typeButtons.forEach(function (b) {
      b.addEventListener('click', function () {
        typeButtons.forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        current = b.getAttribute('data-product');
        recompute();
      });
    });

    recompute();
  }

  // ---------- FAQ accordion ----------
  function initFaq() {
    document.querySelectorAll('.faq-item').forEach(function (item) {
      var q = item.querySelector('.faq-q');
      if (!q) return;
      q.addEventListener('click', function () {
        item.classList.toggle('open');
      });
    });
  }

  // ---------- Multi-step apply form ----------
  function initApply() {
    var shell = document.querySelector('[data-apply]');
    if (!shell) return;

    var steps = shell.querySelectorAll('.apply-step');
    var pips = shell.querySelectorAll('.apply-progress .step-pip');
    var nextBtns = shell.querySelectorAll('[data-apply-next]');
    var backBtns = shell.querySelectorAll('[data-apply-back]');
    var submitBtn = shell.querySelector('[data-apply-submit]');
    var totalSteps = steps.length;
    var current = 0;

    function show(i) {
      steps.forEach(function (s, idx) { s.classList.toggle('active', idx === i); });
      pips.forEach(function (p, idx) {
        p.classList.toggle('active', idx === i);
        p.classList.toggle('done', idx < i);
      });
      // disable back on first step
      backBtns.forEach(function (b) { b.disabled = (i === 0); });
      window.scrollTo({ top: shell.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' });
    }

    function validateStep(i) {
      var step = steps[i];
      var requiredInputs = step.querySelectorAll('[required]');
      var ok = true;
      requiredInputs.forEach(function (inp) {
        if (!inp.value || (inp.type === 'radio' && !step.querySelector('input[name="'+inp.name+'"]:checked'))) {
          inp.style.borderColor = '#EF4444';
          ok = false;
        } else {
          inp.style.borderColor = '';
        }
      });
      // also validate that any choice-grid with required has a selection
      var choiceGroups = step.querySelectorAll('[data-required-choice]');
      choiceGroups.forEach(function (g) {
        var name = g.getAttribute('data-required-choice');
        var picked = step.querySelector('input[name="'+name+'"]:checked');
        if (!picked) ok = false;
      });
      return ok;
    }

    nextBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!validateStep(current)) return;
        if (current < totalSteps - 1) {
          current++;
          show(current);
        }
      });
    });
    backBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (current > 0) { current--; show(current); }
      });
    });

    // visual selection for .choice
    shell.querySelectorAll('.choice').forEach(function (c) {
      c.addEventListener('click', function () {
        var input = c.querySelector('input');
        if (!input) return;
        if (input.type === 'radio') {
          // unselect siblings
          shell.querySelectorAll('input[name="'+input.name+'"]').forEach(function (i) {
            var parent = i.closest('.choice');
            if (parent) parent.classList.remove('selected');
          });
          input.checked = true;
          c.classList.add('selected');
        } else {
          input.checked = !input.checked;
          c.classList.toggle('selected', input.checked);
        }
      });
    });

    if (submitBtn) {
      submitBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (!validateStep(current)) return;
        // collect values for confirmation
        var name = shell.querySelector('[name="full_name"]');
        shell.querySelector('.apply-body').innerHTML =
          '<div class="apply-success">' +
            '<div class="ok">&#10003;</div>' +
            '<h3>Thanks' + (name && name.value ? ', ' + name.value.split(' ')[0] : '') + '!</h3>' +
            '<p class="sub">Your application has been received. A funding specialist will contact you within one business hour.</p>' +
            '<p class="sub" style="font-size:0.9rem;">Reference: VC-' + Date.now().toString().slice(-8) + '</p>' +
          '</div>';
        // hide progress
        var prog = shell.querySelector('.apply-progress');
        if (prog) prog.style.display = 'none';
      });
    }

    show(0);
  }

  // ---------- Reveal on scroll ----------
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || els.length === 0) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  // ---------- Highlight active nav link ----------
  function initActiveNav() {
    var path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        a.classList.add('active');
      }
    });
  }

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initCalc();
    initFaq();
    initApply();
    initReveal();
    initActiveNav();
  });
})();
