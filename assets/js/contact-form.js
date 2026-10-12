/*
  Test request form (contact.html).

  The site has no server-side code, so the form opens the visitor's email
  app with the request already written, addressed to WDACT. Nothing is sent
  to any other service. Without JavaScript, the form's mailto: action is
  used instead.
*/

(function () {
  'use strict';

  var TO = 'info@wdatesting.com.au';
  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function init() {
    var form = document.getElementById('request');
    if (!form) return;

    var email = form.querySelector('#email');
    var consent = form.querySelector('#consent');
    var status = form.querySelector('#form-status');

    function setError(field, message) {
      var error = document.getElementById(field.id + '-error');
      error.textContent = message;
      if (message) {
        field.setAttribute('aria-invalid', 'true');
      } else {
        field.removeAttribute('aria-invalid');
      }
    }

    function validate() {
      var firstInvalid = null;

      if (!email.value.trim()) {
        setError(email, 'Enter your email address so we can reply.');
        firstInvalid = email;
      } else if (!EMAIL_PATTERN.test(email.value.trim())) {
        setError(email, 'Enter an email address like name@example.com.');
        firstInvalid = email;
      } else {
        setError(email, '');
      }

      if (!consent.checked) {
        setError(consent, 'Tick the box to agree, so we can use your details to reply.');
        firstInvalid = firstInvalid || consent;
      } else {
        setError(consent, '');
      }

      return firstInvalid;
    }

    // One line per filled-in field, grouped under each section heading.
    function composeBody() {
      var lines = [];
      Array.prototype.forEach.call(form.querySelectorAll('fieldset'), function (fieldset) {
        var section = [];
        var seen = {};
        Array.prototype.forEach.call(fieldset.querySelectorAll('input, select, textarea'), function (field) {
          if (seen[field.name]) return;
          var value = '';
          if (field.type === 'radio') {
            seen[field.name] = true;
            var checked = form.querySelector('input[name="' + field.name + '"]:checked');
            value = checked ? checked.value : '';
          } else if (field.type === 'date' && field.value) {
            // Show dates the Australian way: day/month/year.
            value = field.value.split('-').reverse().join('/');
          } else {
            value = field.value.trim();
          }
          if (value) section.push(field.name + ': ' + value);
        });
        if (section.length) {
          lines.push(fieldset.querySelector('legend').textContent.toUpperCase());
          lines = lines.concat(section, '');
        }
      });
      lines.push('Consent to collect and use these details to reply: Yes');
      return lines.join('\r\n');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      status.textContent = '';

      var firstInvalid = validate();
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      var name = [form.querySelector('#given-name').value, form.querySelector('#last-name').value]
        .join(' ').trim();
      var subject = 'Test request' + (name ? ' from ' + name : '');

      window.location.href = 'mailto:' + TO +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(composeBody());

      status.textContent = 'Your email app should now be open with your request. ' +
        'Press send there to finish. If nothing opened, email ' + TO + ' or call 0457 838 378.';
    });

    // Clear an error as soon as it is fixed.
    email.addEventListener('input', function () {
      if (email.getAttribute('aria-invalid') && EMAIL_PATTERN.test(email.value.trim())) setError(email, '');
    });
    consent.addEventListener('change', function () {
      if (consent.checked) setError(consent, '');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
