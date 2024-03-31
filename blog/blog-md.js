start();

function start() {
  if (window.disableMarkdownProcessing) {
    setTimeout(function () {
      // preload blog.css for subsequent pages to be faster
      loadCSS();
    }, 4000);
    return;
  }

  loadCSS();
  loadMarkedScript();
  document.write('<!--');
  window.onload = processMarkdown;

  function loadMarkedScript() {
    var markedScriptElem = document.createElement('script');
    markedScriptElem.src =
      (/http/i.test(location.protocol || '') ? '//' : 'http://') +
      'unpkg.com/marked';

    var latestScript = document.scripts[document.scripts.length - 1];
    latestScript.parentElement.appendChild(markedScriptElem);
  }

  function loadCSS() {
    var prefix = '';
    for (var i = 0; i < document.scripts.length; i++) {
      var scr = document.scripts[i];
      if (/md\.js/i.test(scr.src || '')) {
        prefix = scr.src.replace(/blog\-md\.js[\s\S]*$/i, '');
      }
    }

    var siteLink = document.createElement('link');
    siteLink.rel = 'stylesheet';
    siteLink.href = prefix + 'blog.css';
    var latestScript = document.scripts[document.scripts.length - 1];
    latestScript.parentElement.appendChild(siteLink);
  }
}

function processMarkdown() {
  if (typeof marked === 'undefined' || !marked) {
    return failedToLoadMarked();
  }

  var toHTML = typeof marked === 'function' ? marked : marked.marked;
  var markdown = extractCommentContent();
  var html = toHTML(markdown, { smartypants: true });

  injectHead();

  var container = document.createElement('div');
  container.id = 'container';
  container.className = 'path-' +
    (location.pathname
      .replace(/^\/+/, '').replace(/\/+$/, '')
      || 'index.html'
    )
      .replace(/\.[a-z0-9]+$/, '').replace(/\.+/g, '-')
      .replace(/\/+/g, '-');
  container.className += ' document-' + container.className.split('-').reverse()[0];
  container.innerHTML = html;

  document.body.appendChild(container);

  var header = document.body.querySelector &&
    (document.body.querySelector('h1') || document.body.querySelector('h2'));

  if (header) {
    document.title = (header.textContent || header.innerText) + ' - \uD835\uDD46\ud835\udd50\ud835\udd40\u2115.\ud835\udd39\ud835\udd46';
  }

  function extractCommentContent() {
    var wholeHTML = document.body.parentElement.outerHTML;
    var commentOpen = wholeHTML.indexOf('<' + '!--');
    var commentClose = wholeHTML.lastIndexOf('--' + '>');
    var inner = wholeHTML.slice(commentOpen + 4, commentClose);
    return inner;
  }

  function failedToLoadMarked() {
    var el = document.createElement('h2');
    el.textContent = el.innerText = 'Marked library code failed to load: ' + typeof marked;
    document.body.appendChild(el);
  }

  function injectHead() {
    var head = document.createElement('div');
    head.id = 'head';
    var linkHome = document.createElement('a');
    linkHome.className = 'logo';
    var logoIMG = document.createElement('img');
    logoIMG.src = 'data:image/png;base64,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';
    linkHome.appendChild(logoIMG);
    var linkHomeLabel = document.createElement('label');
    linkHomeLabel.textContent = linkHomeLabel.innerText = 'Blog home';
    linkHome.appendChild(linkHomeLabel);
    linkHome.href = /file/i.test(location.protocol || '') ? './index.html' : './';
    head.appendChild(linkHome);
    document.body.appendChild(head);
  }

}