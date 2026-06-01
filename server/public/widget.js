/* ChatBuilder embed widget — vanilla JS, no dependencies.
 *
 * Usage on any third-party site:
 *   <script
 *     src="https://your-api-host/widget.js"
 *     data-chatbot-id="YOUR_BOT_ID"
 *     data-host="https://your-app-host"   (optional; where /chat/:id is served)
 *     async></script>
 *
 * It fetches the bot's public config (accent color + position) from the API
 * the script was served from, then injects a floating launcher button. Clicking
 * it slides open an iframe pointing at the app's /chat/:id page. Everything
 * lives inside a Shadow DOM so the host page's styles can't leak in or out.
 */
(function () {
  'use strict';

  // The <script> that loaded us. document.currentScript is set while an async
  // script executes; fall back to the last matching tag just in case.
  var self =
    document.currentScript ||
    (function () {
      var tags = document.querySelectorAll('script[data-chatbot-id]');
      return tags[tags.length - 1] || null;
    })();
  if (!self) return;

  var chatbotId = self.getAttribute('data-chatbot-id');
  if (!chatbotId) {
    console.error('[ChatBuilder] widget: missing data-chatbot-id attribute');
    return;
  }

  // API origin = wherever this script was served from.
  var apiOrigin;
  try {
    apiOrigin = new URL(self.src).origin;
  } catch (e) {
    apiOrigin = '';
  }
  // App origin = where the chat page (/chat/:id) lives. Defaults to the API
  // origin so a same-origin deployment needs no extra attribute.
  var appOrigin = (self.getAttribute('data-host') || apiOrigin).replace(/\/$/, '');

  // Don't inject the same bot twice if the snippet is included more than once.
  window.__chatbuilder = window.__chatbuilder || {};
  if (window.__chatbuilder[chatbotId]) return;
  window.__chatbuilder[chatbotId] = true;

  function chatIcon() {
    return (
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>' +
      '</svg>'
    );
  }
  function closeIcon() {
    return (
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
      '</svg>'
    );
  }

  function mount(cfg) {
    var accent = cfg.accentColor || '#6366f1';
    var side = cfg.position === 'bottom-left' ? 'left' : 'right';

    var host = document.createElement('div');
    host.setAttribute('id', 'chatbuilder-widget');
    (document.body || document.documentElement).appendChild(host);

    var root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;

    var style = document.createElement('style');
    style.textContent = [
      ':host, *, *::before, *::after { box-sizing: border-box; }',
      '.cb-launcher {',
      '  position: fixed; bottom: 20px; ' + side + ': 20px;',
      '  width: 60px; height: 60px; border-radius: 9999px; border: 0; padding: 0;',
      '  cursor: pointer; color: #fff; display: grid; place-items: center;',
      '  box-shadow: 0 8px 28px rgba(0,0,0,.20); z-index: 2147483646;',
      '  transition: transform .15s ease, box-shadow .15s ease;',
      '  font-family: inherit; -webkit-tap-highlight-color: transparent;',
      '}',
      '.cb-launcher:hover { transform: scale(1.06); box-shadow: 0 10px 32px rgba(0,0,0,.26); }',
      '.cb-launcher:active { transform: scale(.97); }',
      '.cb-launcher svg { width: 28px; height: 28px; }',
      '.cb-panel {',
      '  position: fixed; bottom: 92px; ' + side + ': 20px;',
      '  width: 384px; max-width: calc(100vw - 40px);',
      '  height: 640px; max-height: calc(100vh - 120px);',
      '  background: #fff; border: 0; border-radius: 16px; overflow: hidden;',
      '  box-shadow: 0 18px 60px rgba(0,0,0,.28); z-index: 2147483647;',
      '  opacity: 0; transform: translateY(12px) scale(.98);',
      '  transform-origin: bottom ' + side + ';',
      '  transition: opacity .18s ease, transform .18s ease;',
      '  pointer-events: none;',
      '}',
      '.cb-panel.cb-open { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }',
      '.cb-panel iframe { width: 100%; height: 100%; border: 0; display: block; }',
      '@media (max-width: 480px) {',
      '  .cb-panel { width: 100vw; height: 100dvh; max-width: 100vw; max-height: 100dvh;',
      '    bottom: 0; ' + side + ': 0; border-radius: 0; }',
      '}',
    ].join('\n');
    root.appendChild(style);

    var panel = document.createElement('div');
    panel.className = 'cb-panel';

    var iframe = document.createElement('iframe');
    iframe.title = (cfg.name || 'Chat') + ' chat window';
    iframe.setAttribute('allow', 'clipboard-write');
    panel.appendChild(iframe);

    var launcher = document.createElement('button');
    launcher.className = 'cb-launcher';
    launcher.type = 'button';
    launcher.style.background = accent;
    launcher.setAttribute('aria-label', 'Open chat');
    launcher.innerHTML = chatIcon();

    var open = false;
    var loaded = false;
    function setOpen(next) {
      open = next;
      if (open && !loaded) {
        // Lazy-load the chat page only on first open.
        iframe.src = appOrigin + '/chat/' + encodeURIComponent(chatbotId);
        loaded = true;
      }
      panel.classList.toggle('cb-open', open);
      launcher.innerHTML = open ? closeIcon() : chatIcon();
      launcher.setAttribute('aria-label', open ? 'Close chat' : 'Open chat');
    }

    launcher.addEventListener('click', function () {
      setOpen(!open);
    });
    // Close on Escape for keyboard users.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && open) setOpen(false);
    });

    root.appendChild(panel);
    root.appendChild(launcher);
  }

  function start() {
    var url = apiOrigin + '/api/chatbots/' + encodeURIComponent(chatbotId);
    fetch(url, { credentials: 'omit' })
      .then(function (res) {
        if (!res.ok) throw new Error('status ' + res.status);
        return res.json();
      })
      .then(function (data) {
        mount(data.chatbot || {});
      })
      .catch(function (err) {
        console.warn('[ChatBuilder] widget: could not load chatbot config —', err.message);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
