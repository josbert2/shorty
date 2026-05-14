/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║   WEB ASSET EXTRACTOR — Pégalo en la consola del navegador   ║
 * ║   Tabs: HTML · CSS · JS · Imágenes + ZIP descargable         ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

(async function WEB_EXTRACTOR() {

  // ──────────────────────────────────────────────
  // 0. UTILIDADES
  // ──────────────────────────────────────────────
  const log      = (m, c='#00e5ff') => console.log(`%c[EXTRACTOR] ${m}`, `color:${c};font-weight:bold`);
  const slug     = s  => (s||'asset').replace(/[^a-z0-9]/gi,'_').toLowerCase().slice(0,60);
  const esc      = s  => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const toBase64 = blob => new Promise((res,rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result.split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(blob);
  });

  function normalizeSelector(raw) {
    const s = raw.trim();
    if (!s) return null;
    if (/^[.#\[a-zA-Z*]/.test(s)) {
      try { document.querySelector(s); return s; } catch(e) {}
    }
    const cls = '.' + s;
    try { document.querySelector(cls); return cls; } catch(e) {}
    return null;
  }

  let _hl = null;
  function highlight(el) {
    if (_hl) _hl.style.outline = _hl.__prev || '';
    if (!el) { _hl = null; return; }
    _hl = el; el.__prev = el.style.outline;
    el.style.outline = '3px solid #00e5ff';
    el.scrollIntoView({ behavior:'smooth', block:'center' });
  }
  function clearHL() {
    if (_hl) { _hl.style.outline = _hl.__prev || ''; _hl = null; }
  }

  // ──────────────────────────────────────────────
  // 1. CARGAR JSZip
  // ──────────────────────────────────────────────
  if (!window.JSZip) {
    await new Promise((res,rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  // ──────────────────────────────────────────────
  // 2. PANEL UI
  // ──────────────────────────────────────────────
  document.getElementById('__extractor_panel__')?.remove();

  const panel = document.createElement('div');
  panel.id = '__extractor_panel__';
  panel.style.cssText = `
    position:fixed; bottom:16px; right:16px; z-index:2147483647;
    background:#0d0d11; color:#e8e8f0; font-family:'Courier New',monospace;
    border:1px solid #252530; border-radius:14px;
    width:480px; max-height:80vh;
    box-shadow:0 12px 48px rgba(0,0,0,.85);
    font-size:12px; line-height:1.5; display:flex; flex-direction:column;
    overflow:hidden;
  `;

  panel.innerHTML = `
  <!-- HEADER -->
  <div id="__ext_header__" style="display:flex;justify-content:space-between;align-items:center;
              padding:12px 16px;border-bottom:1px solid #1e1e28;flex-shrink:0;cursor:pointer;user-select:none"
       title="Clic para minimizar / restaurar">
    <b style="color:#00e5ff;font-size:14px;letter-spacing:.02em;pointer-events:none">⚡ Web Extractor</b>
    <div style="display:flex;gap:10px;align-items:center">
      <span id="__ext_min__" style="color:#555;font-size:20px;line-height:1;pointer-events:none">—</span>
      <span id="__ext_close__" style="cursor:pointer;color:#555;font-size:17px;line-height:1;pointer-events:all" title="Cerrar">✕</span>
    </div>
  </div>

  <!-- SELECTOR INPUT -->
  <div style="padding:12px 18px 10px;border-bottom:1px solid #1e1e28;flex-shrink:0">
    <div style="display:flex;gap:6px;align-items:center">
      <input id="__ext_sel__"
        placeholder="clase / #id / selector CSS  (vacío = toda la página)"
        style="flex:1;padding:7px 10px;background:#151520;border:1px solid #252530;
               border-radius:7px;color:#e8e8f0;font-size:11px;
               font-family:'Courier New',monospace;outline:none;transition:border .2s"
      />
      <button id="__ext_eye__" title="Resaltar en página"
        style="padding:7px 10px;background:#151520;border:1px solid #252530;
               border-radius:7px;cursor:pointer;font-size:14px">👁</button>
      <button id="__ext_scan__"
        style="padding:7px 12px;background:#00e5ff;color:#000;border:none;
               border-radius:7px;cursor:pointer;font-weight:700;font-size:11px;white-space:nowrap">
        Escanear
      </button>
    </div>
    <div id="__ext_info__" style="font-size:10px;color:#555;margin-top:5px;min-height:14px"></div>
  </div>

  <!-- TABS -->
  <div id="__ext_tabs__"
    style="display:flex;gap:2px;padding:8px 18px 0;border-bottom:1px solid #1e1e28;flex-shrink:0">
    <button class="extab" data-tab="html"
      style="padding:5px 12px;border:none;border-radius:6px 6px 0 0;cursor:pointer;
             font-size:11px;font-family:'Courier New',monospace;font-weight:700;
             background:#1a1a2a;color:#00e5ff;border-bottom:2px solid #00e5ff">
      HTML
    </button>
    <button class="extab" data-tab="css"
      style="padding:5px 12px;border:none;border-radius:6px 6px 0 0;cursor:pointer;
             font-size:11px;font-family:'Courier New',monospace;
             background:#111118;color:#555;border-bottom:2px solid transparent">
      CSS
    </button>
    <button class="extab" data-tab="js"
      style="padding:5px 12px;border:none;border-radius:6px 6px 0 0;cursor:pointer;
             font-size:11px;font-family:'Courier New',monospace;
             background:#111118;color:#555;border-bottom:2px solid transparent">
      JS
    </button>
    <button class="extab" data-tab="images"
      style="padding:5px 12px;border:none;border-radius:6px 6px 0 0;cursor:pointer;
             font-size:11px;font-family:'Courier New',monospace;
             background:#111118;color:#555;border-bottom:2px solid transparent">
      Imágenes
    </button>
    <button class="extab" data-tab="tree"
      style="padding:5px 12px;border:none;border-radius:6px 6px 0 0;cursor:pointer;
             font-size:11px;font-family:'Courier New',monospace;
             background:#111118;color:#555;border-bottom:2px solid transparent">
      Árbol
    </button>
    <button class="extab" data-tab="log"
      style="padding:5px 12px;border:none;border-radius:6px 6px 0 0;cursor:pointer;
             font-size:11px;font-family:'Courier New',monospace;
             background:#111118;color:#555;border-bottom:2px solid transparent">
      Log
    </button>
  </div>

  <!-- TAB CONTENTS -->
  <div id="__ext_content__" style="flex:1;overflow:auto;min-height:0">

    <!-- HTML TAB -->
    <div id="__ext_tab_html__" class="extab-content" style="height:100%">
      <div style="display:flex;justify-content:space-between;align-items:center;
                  padding:8px 14px;background:#0a0a0e;border-bottom:1px solid #1e1e28;flex-shrink:0">
        <span style="color:#555;font-size:10px" id="__ext_html_info__">Sin datos — pulsa Escanear</span>
        <div style="display:flex;gap:6px">
          <button id="__ext_copy_html__"
            style="padding:4px 10px;background:#1a1a2a;border:1px solid #252530;
                   border-radius:5px;cursor:pointer;color:#e8e8f0;font-size:10px">
            📋 Copiar
          </button>
          <button id="__ext_open_html__"
            style="padding:4px 10px;background:#1a1a2a;border:1px solid #252530;
                   border-radius:5px;cursor:pointer;color:#e8e8f0;font-size:10px">
            ↗ Abrir
          </button>
        </div>
      </div>
      <pre id="__ext_html_pre__"
        style="margin:0;padding:12px 14px;font-size:10px;color:#69ff47;white-space:pre-wrap;
               word-break:break-all;line-height:1.6;overflow:auto">
Pulsa <b style="color:#00e5ff">Escanear</b> para cargar el HTML…</pre>
    </div>

    <!-- CSS TAB -->
    <div id="__ext_tab_css__" class="extab-content" style="display:none;height:100%">
      <div style="display:flex;justify-content:space-between;align-items:center;
                  padding:8px 14px;background:#0a0a0e;border-bottom:1px solid #1e1e28">
        <span style="color:#555;font-size:10px" id="__ext_css_info__">Sin datos</span>
        <button id="__ext_copy_css__"
          style="padding:4px 10px;background:#1a1a2a;border:1px solid #252530;
                 border-radius:5px;cursor:pointer;color:#e8e8f0;font-size:10px">
          📋 Copiar
        </button>
      </div>
      <div id="__ext_css_tabs__"
        style="display:flex;gap:4px;padding:6px 10px;background:#0f0f15;
               border-bottom:1px solid #1e1e28;overflow-x:auto;flex-shrink:0"></div>
      <pre id="__ext_css_pre__"
        style="margin:0;padding:12px 14px;font-size:10px;color:#c084fc;white-space:pre-wrap;
               word-break:break-all;line-height:1.6;overflow:auto">
Pulsa <b style="color:#00e5ff">Escanear</b> para cargar CSS…</pre>
    </div>

    <!-- JS TAB -->
    <div id="__ext_tab_js__" class="extab-content" style="display:none;height:100%">
      <div style="display:flex;justify-content:space-between;align-items:center;
                  padding:8px 14px;background:#0a0a0e;border-bottom:1px solid #1e1e28">
        <span style="color:#555;font-size:10px" id="__ext_js_info__">Sin datos</span>
        <button id="__ext_copy_js__"
          style="padding:4px 10px;background:#1a1a2a;border:1px solid #252530;
                 border-radius:5px;cursor:pointer;color:#e8e8f0;font-size:10px">
          📋 Copiar
        </button>
      </div>
      <div id="__ext_js_tabs__"
        style="display:flex;gap:4px;padding:6px 10px;background:#0f0f15;
               border-bottom:1px solid #1e1e28;overflow-x:auto;flex-shrink:0"></div>
      <pre id="__ext_js_pre__"
        style="margin:0;padding:12px 14px;font-size:10px;color:#ffd700;white-space:pre-wrap;
               word-break:break-all;line-height:1.6;overflow:auto">
Pulsa <b style="color:#00e5ff">Escanear</b> para cargar JS…</pre>
    </div>

    <!-- IMAGES TAB -->
    <div id="__ext_tab_images__" class="extab-content" style="display:none;padding:10px">
      <div id="__ext_img_grid__"
        style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px">
        <div style="color:#555;font-size:11px;grid-column:1/-1">
          Pulsa <b style="color:#00e5ff">Escanear</b> para cargar imágenes…
        </div>
      </div>
    </div>

    <!-- ÁRBOL TAB -->
    <div id="__ext_tab_tree__" class="extab-content" style="display:none;height:100%">
      <div style="display:flex;justify-content:space-between;align-items:center;
                  padding:8px 14px;background:#0a0a0e;border-bottom:1px solid #1e1e28">
        <span style="color:#555;font-size:10px" id="__ext_tree_info__">Sin datos</span>
        <button id="__ext_copy_tree__"
          style="padding:4px 10px;background:#1a1a2a;border:1px solid #252530;
                 border-radius:5px;cursor:pointer;color:#e8e8f0;font-size:10px">
          📋 Copiar
        </button>
      </div>
      <pre id="__ext_tree_pre__"
        style="margin:0;padding:12px 14px;font-size:10px;color:#e8e8f0;white-space:pre;
               line-height:1.6;overflow:auto">
Pulsa <b style="color:#00e5ff">Escanear</b> para generar árbol…</pre>
    </div>

    <!-- LOG TAB -->
    <div id="__ext_tab_log__" class="extab-content" style="display:none;height:100%">
      <pre id="__ext_log__"
        style="margin:0;padding:12px 14px;font-size:10px;color:#aaa;white-space:pre-wrap;
               line-height:1.6;overflow:auto">En espera…</pre>
    </div>

  </div>

  <!-- FOOTER -->
  <div style="display:flex;gap:8px;padding:10px 16px;
              border-top:1px solid #1e1e28;flex-shrink:0;background:#0a0a0e">
    <button id="__ext_zip__"
      style="flex:1;padding:8px;background:#00e5ff;color:#000;border:none;
             border-radius:7px;cursor:pointer;font-weight:700;font-size:12px">
      ⬇ Descargar ZIP
    </button>
    <div id="__ext_bar_wrap__" style="flex:2;display:flex;align-items:center;gap:8px">
      <div style="flex:1;background:#1a1a2a;border-radius:4px;height:5px;overflow:hidden">
        <div id="__ext_bar__" style="height:100%;background:#00e5ff;width:0%;transition:width .25s"></div>
      </div>
      <span id="__ext_pct__" style="font-size:10px;color:#555;min-width:28px;text-align:right">0%</span>
    </div>
  </div>
  `;

  document.body.appendChild(panel);

  // refs
  const selIn    = document.getElementById('__ext_sel__');
  const infoEl   = document.getElementById('__ext_info__');
  const logEl    = document.getElementById('__ext_log__');
  const bar      = document.getElementById('__ext_bar__');
  const pct      = document.getElementById('__ext_pct__');

  // ── Estado global de extracción ──
  const state = { html:'', cssFiles:{}, jsFiles:{}, images:[], tree:'', computedCSS:'' };

  // ──────────────────────────────────────────────
  // 3. TABS
  // ──────────────────────────────────────────────
  const TAB_COLORS = { html:'#00e5ff', css:'#c084fc', js:'#ffd700', images:'#ff79a8', tree:'#69ff47', log:'#888' };

  function activateTab(name) {
    document.querySelectorAll('.extab').forEach(btn => {
      const active = btn.dataset.tab === name;
      btn.style.background = active ? '#1a1a2a' : '#111118';
      btn.style.color = active ? TAB_COLORS[btn.dataset.tab] : '#555';
      btn.style.borderBottom = active ? `2px solid ${TAB_COLORS[btn.dataset.tab]}` : '2px solid transparent';
    });
    document.querySelectorAll('.extab-content').forEach(el => el.style.display = 'none');
    document.getElementById(`__ext_tab_${name}__`).style.display = '';
  }

  document.querySelectorAll('.extab').forEach(btn => {
    btn.onclick = () => activateTab(btn.dataset.tab);
  });

  // ──────────────────────────────────────────────
  // 4. LOG
  // ──────────────────────────────────────────────
  function uiLog(msg, color='#aaa') {
    logEl.textContent += '\n› ' + msg;
    logEl.scrollTop = logEl.scrollHeight;
    const line = `\n%c› ${msg}`;
    console.log(line, `color:${color}`);
  }
  function uiProgress(n, total) {
    const p = Math.round((n/total)*100);
    bar.style.width = p+'%'; pct.textContent = p+'%';
  }

  // ──────────────────────────────────────────────
  // 5. HELPERS DE SELECTOR
  // ──────────────────────────────────────────────
  function getScope() {
    const raw = selIn.value.trim();
    if (!raw) return { root: document.documentElement, label:'full_page', isElement:false };
    const sel = normalizeSelector(raw);
    if (!sel) return { root: document.documentElement, label:'full_page', isElement:false };
    const el = document.querySelector(sel);
    if (!el) return { root: document.documentElement, label:'full_page', isElement:false };
    return { root:el, label:slug(sel), isElement:true, selector:sel };
  }

  selIn.addEventListener('input', () => {
    clearHL();
    const raw = selIn.value.trim();
    if (!raw) { infoEl.textContent = 'Vacío → página completa'; infoEl.style.color='#555'; selIn.style.borderColor='#252530'; return; }
    const sel = normalizeSelector(raw);
    if (!sel) { infoEl.textContent = '⚠ Selector inválido'; infoEl.style.color='#ff6b6b'; selIn.style.borderColor='#ff6b6b'; return; }
    const m = document.querySelectorAll(sel);
    if (!m.length) { infoEl.textContent = '⚠ Ningún elemento'; infoEl.style.color='#ff6b6b'; selIn.style.borderColor='#ff6b6b'; }
    else { infoEl.textContent = `✓ ${m.length} elemento(s) — se usa el primero`; infoEl.style.color='#69ff47'; selIn.style.borderColor='#69ff47'; }
  });

  document.getElementById('__ext_eye__').onclick = () => {
    const sel = normalizeSelector(selIn.value.trim());
    if (!sel) return;
    const el = document.querySelector(sel);
    el ? highlight(el) : uiLog('No encontrado: '+sel, '#ff6b6b');
  };

  document.getElementById('__ext_close__').onclick = () => { clearHL(); panel.remove(); };

  // ──────────────────────────────────────────────
  // 6. EXTRACCIÓN CORE
  // ──────────────────────────────────────────────
  function getSelector(el) {
    if (el.id) return `#${CSS.escape(el.id)}`;
    const cls = [...el.classList].map(c=>`.${CSS.escape(c)}`).join('');
    const tag = el.tagName.toLowerCase();
    if (cls) return `${tag}${cls}`;
    let path = tag;
    const parent = el.parentElement;
    if (parent) {
      const sibs = [...parent.children].filter(c=>c.tagName===el.tagName);
      if (sibs.length>1) path+=`:nth-of-type(${sibs.indexOf(el)+1})`;
    }
    return path;
  }

  function extractComputedStyles(scope) {
    const seen  = new Set();
    const lines = [`/* === Computed Styles — ${scope.label} === */\n`];
    const PROPS = [
      'display','position','top','left','right','bottom','z-index',
      'width','height','min-width','max-width','min-height','max-height',
      'margin','margin-top','margin-right','margin-bottom','margin-left',
      'padding','padding-top','padding-right','padding-bottom','padding-left',
      'background','background-color','background-image','background-size','background-position',
      'color','font-family','font-size','font-weight','font-style','line-height','letter-spacing','text-align',
      'border','border-radius','border-color','border-width','border-style',
      'box-shadow','opacity','transform','transition','animation',
      'flex','flex-direction','flex-wrap','justify-content','align-items','gap',
      'grid-template-columns','grid-template-rows','grid-gap',
      'overflow','overflow-x','overflow-y','pointer-events','cursor',
      'text-decoration','text-transform','white-space','word-break',
      'object-fit','object-position','aspect-ratio','clip-path','filter','visibility'
    ];
    scope.root.querySelectorAll('*').forEach(el => {
      const cs = window.getComputedStyle(el);
      const s  = getSelector(el);
      if (seen.has(s)) return; seen.add(s);
      const decls = PROPS
        .map(p=>[p, cs.getPropertyValue(p)])
        .filter(([,v])=>v&&v!=='none'&&v!=='normal'&&v!=='auto'&&v!=='0px'&&v!=='rgba(0, 0, 0, 0)')
        .map(([p,v]) => `  ${p}: ${v};`);
      if (decls.length) lines.push(`${s} {\n${decls.join('\n')}\n}\n`);
    });
    return lines.join('\n');
  }

  function buildHTML(scope, computedCSS) {
    const clone = scope.root.cloneNode(true);
    if (scope.isElement) {
      return `<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width,initial-scale=1">\n  <title>Extracted · ${scope.selector}</title>\n  <style>*{box-sizing:border-box}body{margin:0;padding:20px;font-family:sans-serif}\n${computedCSS}</style>\n</head>\n<body>\n${clone.outerHTML}\n</body>\n</html>`;
    }
    const full = document.documentElement.cloneNode(true);
    const st = document.createElement('style');
    st.textContent = computedCSS;
    (full.querySelector('head')||full).appendChild(st);
    return '<!DOCTYPE html>\n' + full.outerHTML;
  }

  async function collectCSS(scope) {
    const files = {};
    // inline <style>
    document.querySelectorAll('style').forEach((el,i) => {
      files[`inline_style_${i+1}.css`] = el.textContent;
    });
    // externos
    let idx=0;
    for (const link of [...document.querySelectorAll('link[rel="stylesheet"]')]) {
      const href=link.href; if(!href) continue;
      try {
        const text = await (await fetch(href,{mode:'cors'})).text();
        const name = `ext_${++idx}_${slug(href.split('/').pop())}.css`;
        files[name] = text;
        uiLog('CSS: '+name,'#69ff47');
      } catch(e) {
        files[`cors_link_${++idx}.txt`] = `/* CORS — no accesible */\n@import url("${href}");`;
        uiLog('CSS CORS: '+href.slice(-40),'#ff6b6b');
      }
    }
    // computed
    files['_computed_styles.css'] = scope.computedCSS;
    return files;
  }

  async function collectJS() {
    const files = {};
    document.querySelectorAll('script:not([src])').forEach((el,i) => {
      if (!el.textContent.trim()) return;
      files[`inline_script_${i+1}.js`] = el.textContent;
    });
    let idx=0;
    for (const s of [...document.querySelectorAll('script[src]')]) {
      if (!s.src) continue;
      try {
        const text = await (await fetch(s.src,{mode:'cors'})).text();
        const name = `ext_${++idx}_${slug(s.src.split('/').pop())}.js`;
        files[name] = text;
        uiLog('JS: '+name,'#ffd700');
      } catch(e) {
        uiLog('JS CORS: '+s.src.slice(-40),'#ff6b6b');
      }
    }
    return files;
  }

  async function collectImages(scope) {
    const root = scope.root;
    const urls = new Set();
    root.querySelectorAll('img').forEach(el => (el.currentSrc||el.src) && urls.add(el.currentSrc||el.src));
    root.querySelectorAll('[style*="background-image"]').forEach(el => {
      const m = el.style.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
      if(m) urls.add(m[1]);
    });
    const result=[];
    for (const url of urls) {
      if (!url) continue;
      if (url.startsWith('data:')) {
        result.push({ name:'inline_'+result.length+'.png', url, data:url.split(',')[1], b64:true });
        continue;
      }
      try {
        const blob = await (await fetch(url,{mode:'cors'})).blob();
        const b64  = await toBase64(blob);
        const ext  = blob.type.split('/')[1]?.replace('jpeg','jpg')||'bin';
        const name = `img_${result.length+1}_${slug(url.split('/').pop())}.${ext}`;
        result.push({ name, url, data:b64, mime:blob.type, b64:true });
        uiLog('IMG: '+name,'#c084fc');
      } catch(e) {
        uiLog('IMG CORS: '+url.slice(-40),'#ff6b6b');
      }
    }
    root.querySelectorAll('svg').forEach((svg,i) => {
      const src = new XMLSerializer().serializeToString(svg);
      result.push({ name:`svg_inline_${i+1}.svg`, url:null, data:src, mime:'image/svg+xml', b64:false });
    });
    return result;
  }

  function buildTree(scope) {
    const lines=[`/* ===== ÁRBOL DE CLASES — ${scope.label} ===== */\n`];
    function walk(el,d){
      const pad='  '.repeat(d);
      const cls=[...el.classList].join(' ');
      const tag=el.tagName.toLowerCase();
      const id=el.id?`#${el.id}`:'';
      if(cls||id) lines.push(`${pad}${tag}${id}${cls?' .'+[...el.classList].join(' .'):''}`)
      ;[...el.children].forEach(c=>walk(c,d+1));
    }
    walk(scope.root,0);
    return lines.join('\n');
  }

  // ──────────────────────────────────────────────
  // 7. ESCANEAR → llenar tabs
  // ──────────────────────────────────────────────
  document.getElementById('__ext_scan__').onclick = async function() {
    clearHL();
    const btn = this;
    btn.disabled = true; btn.textContent = '⏳';
    logEl.textContent = ''; uiLog('Iniciando escaneo…','#00e5ff');
    uiProgress(0,6);

    const scope = getScope();
    uiLog(`Scope: ${scope.isElement ? scope.selector : 'página completa'}`, '#00e5ff');

    try {
      // CSS computado
      scope.computedCSS = extractComputedStyles(scope);
      uiLog('Estilos computados ✓','#69ff47');
      uiProgress(1,6);

      // HTML
      state.html = buildHTML(scope, scope.computedCSS);
      document.getElementById('__ext_html_pre__').textContent = state.html;
      document.getElementById('__ext_html_info__').textContent =
        `${(state.html.length/1024).toFixed(1)} KB · scope: ${scope.label}`;
      uiLog('HTML generado ✓','#69ff47');
      uiProgress(2,6);

      // CSS
      state.cssFiles = await collectCSS(scope);
      const cssNames = Object.keys(state.cssFiles);
      // sub-tabs CSS
      const cssTabs = document.getElementById('__ext_css_tabs__');
      cssTabs.innerHTML = '';
      cssNames.forEach((name,i) => {
        const b = document.createElement('button');
        b.textContent = name;
        b.style.cssText = `padding:3px 8px;background:${i===0?'#2a1a4a':'#151520'};
          border:1px solid #252530;border-radius:4px;cursor:pointer;
          color:${i===0?'#c084fc':'#555'};font-size:9px;font-family:'Courier New',monospace;white-space:nowrap`;
        b.onclick = () => {
          cssTabs.querySelectorAll('button').forEach(x=>{x.style.background='#151520';x.style.color='#555';});
          b.style.background='#2a1a4a'; b.style.color='#c084fc';
          document.getElementById('__ext_css_pre__').textContent = state.cssFiles[name];
        };
        cssTabs.appendChild(b);
      });
      document.getElementById('__ext_css_pre__').textContent = state.cssFiles[cssNames[0]]||'';
      document.getElementById('__ext_css_info__').textContent =
        `${cssNames.length} archivos · ${Object.values(state.cssFiles).join('').length} chars`;
      uiLog('CSS recopilado ✓','#69ff47');
      uiProgress(3,6);

      // JS
      state.jsFiles = await collectJS();
      const jsNames = Object.keys(state.jsFiles);
      const jsTabs = document.getElementById('__ext_js_tabs__');
      jsTabs.innerHTML = '';
      jsNames.forEach((name,i) => {
        const b = document.createElement('button');
        b.textContent = name;
        b.style.cssText = `padding:3px 8px;background:${i===0?'#2a2000':'#151520'};
          border:1px solid #252530;border-radius:4px;cursor:pointer;
          color:${i===0?'#ffd700':'#555'};font-size:9px;font-family:'Courier New',monospace;white-space:nowrap`;
        b.onclick = () => {
          jsTabs.querySelectorAll('button').forEach(x=>{x.style.background='#151520';x.style.color='#555';});
          b.style.background='#2a2000'; b.style.color='#ffd700';
          document.getElementById('__ext_js_pre__').textContent = state.jsFiles[name];
        };
        jsTabs.appendChild(b);
      });
      document.getElementById('__ext_js_pre__').textContent = state.jsFiles[jsNames[0]]||'(sin scripts)';
      document.getElementById('__ext_js_info__').textContent =
        `${jsNames.length} archivos`;
      uiLog('JS recopilado ✓','#ffd700');
      uiProgress(4,6);

      // Imágenes
      state.images = await collectImages(scope);
      const grid = document.getElementById('__ext_img_grid__');
      grid.innerHTML = '';
      if (!state.images.length) {
        grid.innerHTML = '<div style="color:#555;font-size:11px;grid-column:1/-1">Sin imágenes en el scope</div>';
      } else {
        state.images.forEach(img => {
          const cell = document.createElement('div');
          cell.style.cssText = 'background:#151520;border:1px solid #252530;border-radius:6px;overflow:hidden;';
          if (img.mime === 'image/svg+xml') {
            cell.innerHTML = `<div style="padding:6px;font-size:8px;color:#555;word-break:break-all">${esc(img.name)}</div>`
              + img.data.slice(0,300);
          } else {
            cell.innerHTML = `<img src="data:${img.mime||'image/png'};base64,${img.data}"
              style="width:100%;height:70px;object-fit:cover;display:block">
              <div style="padding:4px 6px;font-size:8px;color:#555;word-break:break-all">${esc(img.name)}</div>`;
          }
          grid.appendChild(cell);
        });
      }
      uiLog(`${state.images.length} imágenes ✓`,'#c084fc');
      uiProgress(5,6);

      // Árbol
      state.tree = buildTree(scope);
      document.getElementById('__ext_tree_pre__').textContent = state.tree;
      document.getElementById('__ext_tree_info__').textContent =
        `${state.tree.split('\n').length} líneas · scope: ${scope.label}`;
      uiLog('Árbol generado ✓','#69ff47');
      uiProgress(6,6);

      uiLog('✅ Escaneo completo','#69ff47');
      activateTab('html');

    } catch(err) {
      uiLog('❌ '+err.message,'#ff6b6b');
      console.error('[EXTRACTOR]',err);
    }

    btn.disabled = false; btn.textContent = 'Escanear';
  };

  // ──────────────────────────────────────────────
  // 8. COPIAR POR TAB
  // ──────────────────────────────────────────────
  async function copyText(text, btn) {
    try {
      await navigator.clipboard.writeText(text);
      const orig = btn.textContent; btn.textContent='✅ Copiado';
      setTimeout(()=>btn.textContent=orig,2000);
    } catch(e) {
      const w=window.open(); w.document.write('<pre style="word-break:break-all">'+esc(text)+'</pre>');
    }
  }

  document.getElementById('__ext_copy_html__').onclick = function(){ copyText(state.html,this); };
  document.getElementById('__ext_copy_css__').onclick  = function(){
    const txt = Object.entries(state.cssFiles).map(([n,v])=>`/* ${n} */\n${v}`).join('\n\n');
    copyText(txt,this);
  };
  document.getElementById('__ext_copy_js__').onclick   = function(){
    const txt = Object.entries(state.jsFiles).map(([n,v])=>`/* ${n} */\n${v}`).join('\n\n');
    copyText(txt,this);
  };
  document.getElementById('__ext_copy_tree__').onclick = function(){ copyText(state.tree,this); };

  // Abrir HTML en nueva pestaña
  document.getElementById('__ext_open_html__').onclick = () => {
    if (!state.html) return;
    const w = window.open();
    w.document.open(); w.document.write(state.html); w.document.close();
  };

  // ──────────────────────────────────────────────
  // 9. DESCARGAR ZIP
  // ──────────────────────────────────────────────
  document.getElementById('__ext_zip__').onclick = async function() {
    if (!state.html) { uiLog('Primero pulsa Escanear','#ff6b6b'); activateTab('log'); return; }
    this.disabled=true; this.textContent='⏳';
    uiProgress(0,1);

    try {
      const zip  = new JSZip();
      const site = slug(location.hostname)||'sitio';

      zip.file('index.html', state.html);

      Object.entries(state.cssFiles).forEach(([n,v]) => zip.folder('css').file(n,v));
      Object.entries(state.jsFiles).forEach(([n,v])  => zip.folder('js').file(n,v));

      for (const img of state.images) {
        if (img.b64) zip.folder('images').file(img.name, img.data, {base64:true});
        else         zip.folder('images').file(img.name, img.data);
      }

      zip.file('_class_tree.txt', state.tree);
      zip.file('README.txt', [
        `URL: ${location.href}`,
        `Fecha: ${new Date().toLocaleString()}`,
        '',
        '  index.html       → HTML completo + computed styles',
        '  css/             → CSS (inline, externos, computed)',
        '  js/              → Scripts (inline, externos)',
        '  images/          → Imágenes y SVGs',
        '  _class_tree.txt  → Árbol de clases',
      ].join('\n'));

      const blob = await zip.generateAsync(
        {type:'blob',compression:'DEFLATE',compressionOptions:{level:6}},
        m => { bar.style.width=Math.round(m.percent)+'%'; }
      );

      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${site}_${Date.now()}.zip`;
      a.click();

      uiLog(`✅ ZIP: ${(blob.size/1024).toFixed(1)} KB`,'#69ff47');
      activateTab('log');
      this.textContent='✅ Descargado'; this.style.background='#69ff47';
      setTimeout(()=>{this.textContent='⬇ Descargar ZIP';this.style.background='#00e5ff';this.disabled=false;},3000);

    } catch(err) {
      uiLog('❌ '+err.message,'#ff6b6b');
      this.disabled=false; this.textContent='⬇ Descargar ZIP';
    }
  };

  // ──────────────────────────────────────────────
  // 10. MINIMIZAR / RESTAURAR
  // ──────────────────────────────────────────────
  const _bodyEls = [...panel.children].filter(el => el.id !== '__ext_header__');
  let _minimized = false;

  document.getElementById('__ext_header__').addEventListener('click', function(e) {
    if (e.target.id === '__ext_close__') return;
    _minimized = !_minimized;
    _bodyEls.forEach(el => el.style.display = _minimized ? 'none' : '');
    panel.style.maxHeight    = _minimized ? 'none' : '80vh';
    panel.style.borderRadius = _minimized ? '10px' : '14px';
    const minBtn = document.getElementById('__ext_min__');
    minBtn.textContent = _minimized ? '▲' : '—';
  });

  uiLog('Listo. Escribe una clase o deja vacío → Escanear','#00e5ff');
  log('Panel iniciado ✓','#69ff47');

})();