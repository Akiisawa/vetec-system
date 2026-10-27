// update-rebuild-vetec.js
// Gera a nova fundação modular do frontend VETEC.
// Uso: node update-rebuild-vetec.js
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');

// ---------- helpers ----------
function mkdirp(p) { fs.mkdirSync(p, { recursive: true }); }

function writeFile(p, content) {
  mkdirp(path.dirname(p));
  fs.writeFileSync(p, content, 'utf8');
  console.log('  ✓ ' + path.relative(ROOT, p));
}

function backupIfExists(p) {
  if (!fs.existsSync(p)) return;
  const bak = p + '.bak.' + Date.now();
  fs.copyFileSync(p, bak);
  console.log('  ⚠ backup → ' + path.relative(ROOT, bak));
}

// ---------- banner ----------
console.log('\n🔧 VETEC · Reconstrução modular do frontend\n');
console.log('📁 Garantindo estrutura de pastas...');
mkdirp(path.join(PUBLIC, 'css'));
mkdirp(path.join(PUBLIC, 'js', 'core'));
mkdirp(path.join(PUBLIC, 'js', 'modules'));
console.log('  ✓ pasta public/css');
console.log('  ✓ pasta public/js/core');
console.log('  ✓ pasta public/js/modules\n');

console.log('📝 Escrevendo arquivos...\n');

// ============================================================
// CSS GLOBAL
// ============================================================
writeFile(path.join(PUBLIC, 'css', 'global.css'), `/* VETEC · Design tokens + reset */
:root {
  --bg-base: #0f172a;
  --bg-surface: #1e293b;
  --bg-surface-2: #273449;
  --bg-elevated: #334155;
  --bg-hover: rgba(51, 65, 85, 0.4);

  --border: #334155;
  --border-strong: #475569;

  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;

  --accent: #3b82f6;
  --accent-hover: #2563eb;
  --accent-soft: rgba(59, 130, 246, 0.12);

  --success: #10b981;
  --success-soft: rgba(16, 185, 129, 0.12);
  --danger: #ef4444;
  --danger-soft: rgba(239, 68, 68, 0.12);
  --warning: #f59e0b;
  --warning-soft: rgba(245, 158, 11, 0.12);

  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  --radius-sm: 6px;
  --radius: 10px;
  --radius-lg: 14px;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
  --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.5);

  --transition: 150ms ease;

  --sidebar-width: 260px;
  --topbar-height: 64px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; }

body {
  font-family: var(--font-sans);
  background: var(--bg-base);
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a { color: var(--accent); text-decoration: none; }
a:hover { color: var(--accent-hover); }
button { font-family: inherit; cursor: pointer; }
input, select, textarea { font-family: inherit; }
h1, h2, h3, h4 { font-weight: 600; line-height: 1.25; }
::selection { background: var(--accent-soft); }

::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--bg-elevated); border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }

.hidden { display: none !important; }
`);

// ============================================================
// CSS LAYOUT (sidebar + topbar)
// ============================================================
writeFile(path.join(PUBLIC, 'css', 'layout.css'), `/* VETEC · Layout principal */
.app-shell {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  min-height: 100vh;
}

/* ---- Sidebar ---- */
.sidebar {
  background: var(--bg-surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 24px;
  border-bottom: 1px solid var(--border);
}

.brand-logo {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--accent), #8b5cf6);
  border-radius: 10px;
  font-weight: 800;
  font-size: 18px;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.brand-text { display: flex; flex-direction: column; }
.brand-text strong { font-size: 16px; letter-spacing: 0.5px; }
.brand-text span { font-size: 11px; color: var(--text-secondary); }

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  transition: background var(--transition), color var(--transition);
}

.nav-item:hover { background: var(--bg-hover); color: var(--text-primary); }
.nav-item.active { background: var(--accent-soft); color: var(--accent); }
.nav-icon { font-size: 16px; width: 20px; text-align: center; }

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border);
  font-size: 11px;
  color: var(--text-muted);
}

/* ---- Main ---- */
.app-main {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-width: 0;
}

/* ---- Topbar ---- */
.topbar {
  height: var(--topbar-height);
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.topbar-search { position: relative; flex: 1; max-width: 480px; }

.topbar-search .search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  opacity: 0.6;
  pointer-events: none;
}

.topbar-search input {
  width: 100%;
  height: 38px;
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  padding: 0 12px 0 36px;
  font-size: 13px;
  outline: none;
  transition: border-color var(--transition), box-shadow var(--transition);
}

.topbar-search input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.topbar-actions { display: flex; align-items: center; gap: 8px; }

.icon-btn {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
  font-size: 16px;
  position: relative;
  display: grid;
  place-items: center;
  transition: background var(--transition), color var(--transition);
}

.icon-btn:hover { background: var(--bg-hover); color: var(--text-primary); }

/* ---- User menu ---- */
.user-menu { position: relative; }

.user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 4px 10px 4px 4px;
  color: var(--text-primary);
  height: 38px;
  transition: background var(--transition);
}

.user-btn:hover { background: var(--bg-hover); }

.avatar {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--accent), #8b5cf6);
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  color: white;
}

.user-name { font-size: 13px; font-weight: 500; }
.chevron { font-size: 10px; color: var(--text-secondary); }

.dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  min-width: 240px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 100;
}

.dropdown[hidden] { display: none; }

.dropdown-header {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-bottom: 1px solid var(--border);
}

.dropdown-header strong { font-size: 13px; }
.dropdown-header span { font-size: 12px; color: var(--text-secondary); }
.dropdown-header small { font-size: 11px; color: var(--text-muted); }

.dropdown-item {
  width: 100%;
  padding: 10px 16px;
  background: transparent;
  border: none;
  text-align: left;
  color: var(--text-primary);
  font-size: 13px;
  transition: background var(--transition);
}

.dropdown-item:hover { background: var(--bg-hover); }

/* ---- View ---- */
.app-view { flex: 1; padding: 28px 32px; max-width: 1400px; width: 100%; }

@media (max-width: 900px) {
  .app-shell { grid-template-columns: 1fr; }
  .sidebar { display: none; }
  .app-view { padding: 16px; }
}
`);

// ============================================================
// CSS COMPONENTS
// ============================================================
writeFile(path.join(PUBLIC, 'css', 'components.css'), `/* VETEC · Componentes reutilizáveis */

/* ---- Botões ---- */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 16px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  transition: background var(--transition), color var(--transition),
              border-color var(--transition), transform 80ms ease;
}
.btn:active { transform: scale(0.98); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-primary { background: var(--accent); color: white; }
.btn-primary:hover:not(:disabled) { background: var(--accent-hover); }

.btn-secondary { background: var(--bg-surface-2); color: var(--text-primary); border-color: var(--border); }
.btn-secondary:hover:not(:disabled) { background: var(--bg-elevated); }

.btn-ghost { background: transparent; color: var(--text-secondary); }
.btn-ghost:hover:not(:disabled) { background: var(--bg-hover); color: var(--text-primary); }
.btn-ghost.active { background: var(--accent-soft); color: var(--accent); }

.btn-danger { background: var(--danger); color: white; }
.btn-danger:hover:not(:disabled) { background: #dc2626; }

.btn-icon {
  width: 32px;
  height: 32px;
  display: inline-grid;
  place-items: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 14px;
  transition: background var(--transition), color var(--transition);
}
.btn-icon:hover { background: var(--bg-hover); color: var(--text-primary); }
.btn-icon.danger:hover { background: var(--danger-soft); color: var(--danger); }

/* ---- Cabeçalho de página ---- */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.page-title { font-size: 24px; letter-spacing: -0.5px; }
.page-subtitle { color: var(--text-secondary); font-size: 13px; margin-top: 4px; }

/* ---- Card ---- */
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

/* ---- Toolbar / filtros ---- */
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
}

.search-box { position: relative; flex: 1; min-width: 220px; max-width: 360px; }
.search-box .search-icon {
  position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
  opacity: 0.6; font-size: 14px; pointer-events: none;
}
.search-box input {
  width: 100%; height: 38px;
  background: var(--bg-base); border: 1px solid var(--border);
  border-radius: var(--radius-sm); color: var(--text-primary);
  padding: 0 12px 0 36px; font-size: 13px; outline: none;
  transition: border-color var(--transition), box-shadow var(--transition);
}
.search-box input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.count-badge {
  margin-left: auto;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  background: var(--bg-surface-2);
  border-radius: 20px;
  color: var(--text-secondary);
}

/* ---- Tabs ---- */
.tabs {
  display: inline-flex;
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 3px;
  gap: 2px;
}
.tab {
  background: transparent; border: none; color: var(--text-secondary);
  padding: 6px 14px; border-radius: 5px; font-size: 12px; font-weight: 500;
  transition: background var(--transition), color var(--transition);
}
.tab:hover { color: var(--text-primary); }
.tab.active { background: var(--bg-surface-2); color: var(--text-primary); }

/* ---- Tabela ---- */
.table-wrap { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; font-size: 13px; }
.table thead th {
  text-align: left; padding: 12px 16px;
  font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
  color: var(--text-muted); background: rgba(15, 23, 42, 0.4);
  border-bottom: 1px solid var(--border);
}
.table tbody td {
  padding: 14px 16px; border-bottom: 1px solid var(--border);
  color: var(--text-primary); vertical-align: middle;
}
.table tbody tr:last-child td { border-bottom: none; }
.table tbody tr { transition: background var(--transition); }
.table tbody tr:hover { background: var(--bg-hover); }

.col-actions { text-align: right; width: 100px; }
.col-actions .btn-icon { margin-left: 2px; }

.table-empty {
  text-align: center; padding: 48px 16px !important;
  color: var(--text-muted); font-style: italic;
}
.table-empty.error { color: var(--danger); }

/* ---- Badges ---- */
.badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 10px; border-radius: 20px;
  font-size: 11px; font-weight: 600; line-height: 1.6;
}
.badge-success { background: var(--success-soft); color: var(--success); }
.badge-danger  { background: var(--danger-soft);  color: var(--danger); }
.badge-warning { background: var(--warning-soft); color: var(--warning); }
.badge-muted   { background: rgba(100, 116, 139, 0.15); color: var(--text-muted); }
.badge-info    { background: var(--accent-soft);   color: var(--accent); }

.badge-dot {
  position: absolute; top: 6px; right: 6px;
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--danger); padding: 0; animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%      { transform: scale(1.15); opacity: 0.85; }
}

/* ---- Paginação ---- */
.pagination {
  display: flex; align-items: center; gap: 4px;
  padding: 12px 16px; border-top: 1px solid var(--border);
  flex-wrap: wrap;
}
.pagination .btn { height: 32px; padding: 0 12px; font-size: 12px; }
.pagination-info { margin-left: auto; font-size: 12px; color: var(--text-muted); }

/* ---- Formulários ---- */
.form { display: flex; flex-direction: column; gap: 16px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }

.form-field { display: flex; flex-direction: column; gap: 6px; }
.form-field > span { font-size: 12px; font-weight: 500; color: var(--text-secondary); }

.form-field input,
.form-field select,
.form-field textarea {
  background: var(--bg-base); border: 1px solid var(--border);
  border-radius: var(--radius-sm); color: var(--text-primary);
  padding: 9px 12px; font-size: 13px; outline: none;
  transition: border-color var(--transition), box-shadow var(--transition);
}
.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.form-field textarea { resize: vertical; min-height: 70px; }

/* ---- Modal ---- */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(4px);
  display: grid; place-items: center; z-index: 1000;
  opacity: 0; transition: opacity 200ms ease; padding: 16px;
}
.modal-overlay.visible { opacity: 1; }

.modal {
  width: 100%; background: var(--bg-surface);
  border: 1px solid var(--border); border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg); max-height: 90vh;
  display: flex; flex-direction: column;
  transform: translateY(12px) scale(0.98);
  transition: transform 200ms ease;
}
.modal-overlay.visible .modal { transform: translateY(0) scale(1); }
.modal-sm { max-width: 400px; }
.modal-md { max-width: 620px; }
.modal-lg { max-width: 900px; }

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 22px; border-bottom: 1px solid var(--border);
}
.modal-header h2 { font-size: 17px; }
.modal-close {
  width: 32px; height: 32px; background: transparent; border: none;
  border-radius: var(--radius-sm); color: var(--text-secondary);
  font-size: 20px; display: grid; place-items: center;
  transition: background var(--transition), color var(--transition);
}
.modal-close:hover { background: var(--bg-hover); color: var(--text-primary); }
.modal-body { padding: 22px; overflow-y: auto; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 16px 22px; border-top: 1px solid var(--border);
}
.confirm-message { color: var(--text-secondary); line-height: 1.6; }

/* ---- Toasts ---- */
.toast-container {
  position: fixed; bottom: 20px; right: 20px;
  display: flex; flex-direction: column; gap: 8px;
  z-index: 2000; pointer-events: none;
}
.toast {
  pointer-events: auto; display: flex; align-items: center; gap: 10px;
  min-width: 260px; max-width: 400px; padding: 12px 14px;
  background: var(--bg-surface); border: 1px solid var(--border);
  border-left: 3px solid var(--accent); border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg); color: var(--text-primary); font-size: 13px;
  animation: toast-in 200ms ease;
}
.toast-out { animation: toast-out 200ms ease forwards; }
.toast-success { border-left-color: var(--success); }
.toast-error   { border-left-color: var(--danger); }
.toast-warning { border-left-color: var(--warning); }

.toast-icon {
  width: 20px; height: 20px; display: grid; place-items: center;
  border-radius: 50%; font-size: 11px; font-weight: 700; flex-shrink: 0;
}
.toast-success .toast-icon { background: var(--success-soft); color: var(--success); }
.toast-error   .toast-icon { background: var(--danger-soft);  color: var(--danger); }
.toast-warning .toast-icon { background: var(--warning-soft); color: var(--warning); }
.toast-info    .toast-icon { background: var(--accent-soft);  color: var(--accent); }
.toast-message { flex: 1; }
.toast-close {
  background: transparent; border: none; color: var(--text-muted);
  font-size: 16px; padding: 0 4px; line-height: 1;
}
.toast-close:hover { color: var(--text-primary); }

@keyframes toast-in {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0);     opacity: 1; }
}
@keyframes toast-out { to { transform: translateX(100%); opacity: 0; } }

/* ---- Estados vazios / loading ---- */
.loading, .empty-state, .error-state {
  text-align: center; padding: 64px 24px; color: var(--text-muted);
}
.empty-state h2, .error-state h2 {
  font-size: 20px; margin-bottom: 8px; color: var(--text-primary);
}
.error-state h2 { color: var(--danger); }

/* ---- Placeholder de módulos ---- */
.module-placeholder {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 80px 24px; color: var(--text-muted); text-align: center; gap: 12px;
}
.module-placeholder .placeholder-icon { font-size: 48px; opacity: 0.6; }
.module-placeholder h1 { font-size: 22px; color: var(--text-primary); }
.module-placeholder p { font-size: 14px; }
`);

// ============================================================
// CORE / STATE
// ============================================================
writeFile(path.join(PUBLIC, 'js', 'core', 'state.js'), `// VETEC · Estado global (auth simples com localStorage)
const STORAGE_KEY = 'vetec_auth';

export const state = {
  user: null,
  token: null,
  listeners: [],

  init() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        this.user = data.user || null;
        this.token = data.token || null;
      }
    } catch (e) {
      /* ignore */
    }
  },

  setAuth(user, token) {
    this.user = user;
    this.token = token;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
    this.notify();
  },

  clearAuth() {
    this.user = null;
    this.token = null;
    localStorage.removeItem(STORAGE_KEY);
    this.notify();
  },

  isAuthenticated() {
    return !!this.token;
  },

  subscribe(fn) { this.listeners.push(fn); },
  notify() { this.listeners.forEach((fn) => fn(this)); },
};
`);

// ============================================================
// CORE / API
// ============================================================
writeFile(path.join(PUBLIC, 'js', 'core', 'api.js'), `// VETEC · Wrapper de fetch com JWT + tratamento de erros
import { state } from './state.js';

const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (state.token) {
    headers['Authorization'] = \`Bearer \${state.token}\`;
  }

  const config = { ...options, headers };

  if (options.body && typeof options.body !== 'string') {
    config.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(\`\${BASE_URL}\${endpoint}\`, config);
  } catch (err) {
    throw new Error('Falha de conexão com o servidor');
  }

  if (response.status === 401) {
    state.clearAuth();
    window.dispatchEvent(new CustomEvent('vetec:unauthorized'));
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try { data = await response.json(); } catch (e) { data = null; }
  }

  if (!response.ok) {
    const message =
      (data && (data.message || data.error)) || \`Erro \${response.status}\`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get:    (endpoint)       => request(endpoint, { method: 'GET' }),
  post:   (endpoint, body) => request(endpoint, { method: 'POST',   body }),
  put:    (endpoint, body) => request(endpoint, { method: 'PUT',    body }),
  patch:  (endpoint, body) => request(endpoint, { method: 'PATCH',  body }),
  delete: (endpoint)       => request(endpoint, { method: 'DELETE' }),
};
`);

// ============================================================
// CORE / ROUTER
// ============================================================
writeFile(path.join(PUBLIC, 'js', 'core', 'router.js'), `// VETEC · SPA router baseado em hash (#route)
const routes = {};
let currentView = null;

export function registerRoute(name, handler) {
  routes[name] = handler;
}

export function navigate(name) {
  const target = '#' + name;
  if (window.location.hash === target) {
    handleHashChange();
  } else {
    window.location.hash = target;
  }
}

async function render(name) {
  const handler = routes[name];
  const view = document.getElementById('app-view');
  if (!view) return;

  if (!handler) {
    view.innerHTML =
      '<div class="empty-state">' +
        '<h2>Página não encontrada</h2>' +
        '<p>A rota <code>#' + name + '</code> não existe.</p>' +
      '</div>';
    return;
  }

  if (currentView && typeof currentView.destroy === 'function') {
    try { currentView.destroy(); } catch (e) { /* ignore */ }
  }

  document.querySelectorAll('[data-route]').forEach((el) => {
    el.classList.toggle('active', el.dataset.route === name);
  });

  view.innerHTML = '<div class="loading">Carregando...</div>';

  try {
    currentView = await handler(view);
  } catch (err) {
    console.error('[router]', err);
    view.innerHTML =
      '<div class="error-state"><h2>Erro</h2><p>' +
      (err && err.message ? err.message : 'Falha ao carregar módulo') +
      '</p></div>';
  }
}

function handleHashChange() {
  const name = window.location.hash.replace('#', '') || 'dashboard';
  render(name);
}

export const router = {
  start() {
    window.addEventListener('hashchange', handleHashChange);
    if (!window.location.hash) {
      window.location.hash = '#dashboard';
    } else {
      handleHashChange();
    }
  },
};
`);

// ============================================================
// CORE / UI (toast, modal, helpers)
// ============================================================
writeFile(path.join(PUBLIC, 'js', 'core', 'ui.js'), `// VETEC · Componentes de UI (toast, modal, confirm, helpers)

// ---------- Toast ----------
export function toast(message, type = 'info', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const el = document.createElement('div');
  el.className = 'toast toast-' + type;
  el.innerHTML =
    '<span class="toast-icon">' + iconFor(type) + '</span>' +
    '<span class="toast-message">' + escapeHtml(message) + '</span>' +
    '<button class="toast-close" aria-label="Fechar">×</button>';

  const remove = () => {
    el.classList.add('toast-out');
    setTimeout(() => el.remove(), 250);
  };

  el.querySelector('.toast-close').addEventListener('click', remove);
  container.appendChild(el);
  setTimeout(remove, duration);
}

function iconFor(type) {
  switch (type) {
    case 'success': return '✓';
    case 'error':   return '✕';
    case 'warning': return '⚠';
    default:        return 'ℹ';
  }
}

// ---------- Modal ----------
export function openModal({ title, body, actions = [], size = 'md', onClose }) {
  closeModal();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'active-modal';

  const actionsHtml = actions
    .map((a, i) =>
      '<button class="btn ' + (a.className || 'btn-secondary') +
      '" data-action-index="' + i + '">' + a.label + '</button>')
    .join('');

  overlay.innerHTML =
    '<div class="modal modal-' + size + '" role="dialog" aria-modal="true">' +
      '<div class="modal-header">' +
        '<h2>' + escapeHtml(title || '') + '</h2>' +
        '<button class="modal-close" aria-label="Fechar">×</button>' +
      '</div>' +
      '<div class="modal-body"></div>' +
      (actions.length ? '<div class="modal-footer">' + actionsHtml + '</div>' : '') +
    '</div>';

  const bodyEl = overlay.querySelector('.modal-body');
  if (typeof body === 'string') bodyEl.innerHTML = body;
  else if (body instanceof Node) bodyEl.appendChild(body);

  overlay.querySelector('.modal-close').addEventListener('click', () => closeModal(onClose));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(onClose); });

  actions.forEach((action, i) => {
    const btn = overlay.querySelector('[data-action-index="' + i + '"]');
    if (btn && action.onClick) btn.addEventListener('click', (e) => action.onClick(e, overlay));
  });

  document.body.appendChild(overlay);
  document.body.classList.add('modal-open');
  setTimeout(() => overlay.classList.add('visible'), 10);

  return overlay;
}

export function closeModal(onClose) {
  const overlay = document.getElementById('active-modal');
  if (!overlay) { if (onClose) onClose(); return; }
  overlay.classList.remove('visible');
  setTimeout(() => {
    overlay.remove();
    document.body.classList.remove('modal-open');
    if (onClose) onClose();
  }, 200);
}

// ---------- Confirm ----------
export function confirm({
  title = 'Confirmar',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
}) {
  return new Promise((resolve) => {
    openModal({
      title,
      size: 'sm',
      body: '<p class="confirm-message">' + escapeHtml(message || '') + '</p>',
      actions: [
        { label: cancelLabel, className: 'btn-secondary',
          onClick: () => { closeModal(); resolve(false); } },
        { label: confirmLabel, className: danger ? 'btn-danger' : 'btn-primary',
          onClick: () => { closeModal(); resolve(true); } },
      ],
      onClose: () => resolve(false),
    });
  });
}

// ---------- Helpers ----------
export function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatDate(date) {
  if (!date) return '—';
  try { return new Date(date).toLocaleDateString('pt-BR'); }
  catch (e) { return '—'; }
}

export function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}
`);

// ============================================================
// CORE / LAYOUT (sidebar + topbar)
// ============================================================
writeFile(path.join(PUBLIC, 'js', 'core', 'layout.js'), `// VETEC · Layout (sidebar + topbar)
import { state } from './state.js';
import { navigate } from './router.js';

const MENU = [
  { route: 'dashboard',      label: 'Dashboard',         icon: '📊' },
  { route: 'customers',      label: 'Clientes',          icon: '👥' },
  { route: 'equipments',     label: 'Equipamentos',      icon: '🔧' },
  { route: 'projects',       label: 'Projetos',          icon: '📁' },
  { route: 'tasks',          label: 'Tarefas',           icon: '✅' },
  { route: 'service-orders', label: 'Ordens de Serviço', icon: '📋' },
  { route: 'notifications',  label: 'Notificações',      icon: '🔔' },
];

export function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  sidebar.innerHTML =
    '<div class="sidebar-brand">' +
      '<div class="brand-logo">V</div>' +
      '<div class="brand-text">' +
        '<strong>VETEC</strong>' +
        '<span>Gestão Industrial</span>' +
      '</div>' +
    '</div>' +
    '<nav class="sidebar-nav">' +
      MENU.map((item) =>
        '<a href="#' + item.route + '" class="nav-item" data-route="' + item.route + '">' +
          '<span class="nav-icon">' + item.icon + '</span>' +
          '<span class="nav-label">' + item.label + '</span>' +
        '</a>'
      ).join('') +
    '</nav>' +
    '<div class="sidebar-footer"><span class="version">v2.0 · modular</span></div>';

  const current = window.location.hash.replace('#', '') || 'dashboard';
  sidebar.querySelectorAll('[data-route]').forEach((el) => {
    el.classList.toggle('active', el.dataset.route === current);
  });
}

let lastOutsideClickHandler = null;

export function renderTopbar() {
  const topbar = document.getElementById('topbar');
  if (!topbar) return;

  const user = state.user || {
    name: 'Usuário',
    email: 'usuario@vetec.com',
    role: 'Operador',
  };

  const initials = (user.name || 'U')
    .split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();

  topbar.innerHTML =
    '<div class="topbar-search">' +
      '<span class="search-icon">🔍</span>' +
      '<input id="global-search" type="search" placeholder="Buscar clientes, projetos, OS..." aria-label="Busca global">' +
    '</div>' +
    '<div class="topbar-actions">' +
      '<button class="icon-btn" id="notif-btn" title="Notificações">' +
        '🔔<span class="badge badge-dot" id="notif-badge" hidden></span>' +
      '</button>' +
      '<div class="user-menu" id="user-menu">' +
        '<button class="user-btn" id="user-btn">' +
          '<span class="avatar">' + initials + '</span>' +
          '<span class="user-name">' + (user.name || 'Usuário') + '</span>' +
          '<span class="chevron">▾</span>' +
        '</button>' +
        '<div class="dropdown" id="user-dropdown" hidden>' +
          '<div class="dropdown-header">' +
            '<strong>' + (user.name || 'Usuário') + '</strong>' +
            '<span>' + (user.email || '') + '</span>' +
            '<small>' + (user.role || '') + '</small>' +
          '</div>' +
          '<button class="dropdown-item" id="logout-btn">Sair</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  const userBtn = topbar.querySelector('#user-btn');
  const dropdown = topbar.querySelector('#user-dropdown');

  userBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.hidden = !dropdown.hidden;
  });

  if (lastOutsideClickHandler) {
    document.removeEventListener('click', lastOutsideClickHandler);
  }
  lastOutsideClickHandler = () => {
    const dd = document.getElementById('user-dropdown');
    if (dd) dd.hidden = true;
  };
  document.addEventListener('click', lastOutsideClickHandler);

  topbar.querySelector('#logout-btn').addEventListener('click', () => {
    state.clearAuth();
    window.location.reload();
  });

  topbar.querySelector('#notif-btn').addEventListener('click', () => navigate('notifications'));

  const search = topbar.querySelector('#global-search');
  search.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      document.dispatchEvent(new CustomEvent('global-search', { detail: search.value }));
    }
  });
}
`);

// ============================================================
// MODULE / CUSTOMERS (CRUD 100% funcional)
// ============================================================
writeFile(path.join(PUBLIC, 'js', 'modules', 'customers.js'), `// VETEC · Módulo Clientes (CRUD completo)
import { api } from '../core/api.js';
import {
  toast, openModal, closeModal, confirm, escapeHtml, debounce,
} from '../core/ui.js';

const PAGE_SIZE = 10;

const state = {
  items: [],
  total: 0,
  page: 1,
  pageSize: PAGE_SIZE,
  search: '',
  status: 'all',
  loading: false,
};

export async function CustomersModule(container) {
  container.innerHTML = renderShell();

  const el = {
    tbody:      container.querySelector('#customers-tbody'),
    pagination: container.querySelector('#customers-pagination'),
    search:     container.querySelector('#customers-search'),
    tabs:       container.querySelectorAll('[data-status]'),
    newBtn:     container.querySelector('#new-customer-btn'),
    count:      container.querySelector('#customers-count'),
  };

  function renderShell() {
    return (
      '<div class="page">' +
        '<div class="page-header">' +
          '<div>' +
            '<h1 class="page-title">Clientes</h1>' +
            '<p class="page-subtitle">Gerencie os clientes da operação</p>' +
          '</div>' +
          '<button class="btn btn-primary" id="new-customer-btn">' +
            '<span>+</span> Novo Cliente' +
          '</button>' +
        '</div>' +
        '<div class="card">' +
          '<div class="toolbar">' +
            '<div class="search-box">' +
              '<span class="search-icon">🔍</span>' +
              '<input id="customers-search" type="search" placeholder="Buscar por nome, e-mail ou documento..." />' +
            '</div>' +
            '<div class="tabs" role="tablist">' +
              '<button class="tab active" data-status="all">Todos</button>' +
              '<button class="tab" data-status="active">Ativos</button>' +
              '<button class="tab" data-status="inactive">Inativos</button>' +
            '</div>' +
            '<span class="count-badge" id="customers-count">0</span>' +
          '</div>' +
          '<div class="table-wrap">' +
            '<table class="table">' +
              '<thead><tr>' +
                '<th>Nome</th><th>E-mail</th><th>Telefone</th>' +
                '<th>Documento</th><th>Status</th>' +
                '<th class="col-actions">Ações</th>' +
              '</tr></thead>' +
              '<tbody id="customers-tbody">' +
                '<tr><td colspan="6" class="table-empty">Carregando...</td></tr>' +
              '</tbody>' +
            '</table>' +
          '</div>' +
          '<div class="pagination" id="customers-pagination"></div>' +
        '</div>' +
      '</div>'
    );
  }

  async function load() {
    state.loading = true;
    el.tbody.innerHTML =
      '<tr><td colspan="6" class="table-empty">Carregando...</td></tr>';

    try {
      const params = new URLSearchParams();
      params.set('page', state.page);
      params.set('limit', state.pageSize);
      if (state.search) params.set('search', state.search);
      if (state.status !== 'all') params.set('status', state.status);

      const result = await api.get('/customers?' + params.toString());

      let items = [];
      let total = 0;
      let serverPaginated = false;

      if (Array.isArray(result)) {
        items = result;
        total = result.length;
      } else if (result && Array.isArray(result.items)) {
        items = result.items;
        total = result.total ?? result.items.length;
        serverPaginated = true;
      } else if (result && Array.isArray(result.data)) {
        items = result.data;
        total = result.total ?? result.data.length;
        serverPaginated = !!result.total;
      } else if (result && Array.isArray(result.rows)) {
        items = result.rows;
        total = result.count ?? result.rows.length;
        serverPaginated = true;
      }

      if (!serverPaginated && Array.isArray(result)) {
        let filtered = items;
        if (state.status !== 'all') {
          const wantActive = state.status === 'active';
          filtered = filtered.filter((c) => {
            const active = c.active !== undefined ? !!c.active : c.status === 'active';
            return active === wantActive;
          });
        }
        if (state.search) {
          const q = state.search.toLowerCase();
          filtered = filtered.filter((c) =>
            (c.name || '').toLowerCase().includes(q) ||
            (c.email || '').toLowerCase().includes(q) ||
            (c.document || '').toLowerCase().includes(q)
          );
        }
        total = filtered.length;
        const start = (state.page - 1) * state.pageSize;
        items = filtered.slice(start, start + state.pageSize);
      }

      state.items = items;
      state.total = total;
      renderTable();
      renderPagination();
    } catch (err) {
      console.error('[customers] load', err);
      el.tbody.innerHTML =
        '<tr><td colspan="6" class="table-empty error">Erro ao carregar: ' +
        escapeHtml(err.message) + '</td></tr>';
      toast('Erro ao carregar clientes: ' + err.message, 'error');
    } finally {
      state.loading = false;
    }
  }

  function renderTable() {
    if (!state.items.length) {
      el.tbody.innerHTML =
        '<tr><td colspan="6" class="table-empty">Nenhum cliente encontrado.</td></tr>';
      el.count.textContent = '0';
      return;
    }

    el.tbody.innerHTML = state.items.map((c) => {
      const active = c.active !== undefined ? !!c.active : c.status !== 'inactive';
      const badge = active
        ? '<span class="badge badge-success">Ativo</span>'
        : '<span class="badge badge-muted">Inativo</span>';

      return (
        '<tr data-id="' + c.id + '">' +
          '<td><strong>' + escapeHtml(c.name || '—') + '</strong></td>' +
          '<td>' + escapeHtml(c.email || '—') + '</td>' +
          '<td>' + escapeHtml(c.phone || c.telefone || '—') + '</td>' +
          '<td>' + escapeHtml(c.document || c.cpfCnpj || '—') + '</td>' +
          '<td>' + badge + '</td>' +
          '<td class="col-actions">' +
            '<button class="btn-icon" data-action="edit" data-id="' + c.id + '" title="Editar">✎</button>' +
            '<button class="btn-icon danger" data-action="delete" data-id="' + c.id + '" title="Excluir">🗑</button>' +
          '</td>' +
        '</tr>'
      );
    }).join('');

    el.count.textContent = String(state.total);
  }

  function renderPagination() {
    const totalPages = Math.max(1, Math.ceil(state.total / state.pageSize));
    const p = state.page;
    const start = Math.max(1, p - 2);
    const end = Math.min(totalPages, p + 2);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);

    el.pagination.innerHTML =
      '<button class="btn btn-ghost" data-page="' + (p - 1) + '"' + (p <= 1 ? ' disabled' : '') + '>← Anterior</button>' +
      pages.map((n) =>
        '<button class="btn btn-ghost' + (n === p ? ' active' : '') +
        '" data-page="' + n + '">' + n + '</button>'
      ).join('') +
      '<button class="btn btn-ghost" data-page="' + (p + 1) + '"' + (p >= totalPages ? ' disabled' : '') + '>Próxima →</button>' +
      '<span class="pagination-info">Página ' + p + ' de ' + totalPages +
      ' · ' + state.total + ' registro(s)</span>';
  }

  function getById(id) {
    return state.items.find((x) => String(x.id) === String(id));
  }

  function openForm(customer) {
    const isEdit = !!customer;
    const body =
      '<form id="customer-form" class="form">' +
        '<div class="form-row">' +
          '<label class="form-field"><span>Nome *</span>' +
            '<input name="name" required value="' + escapeHtml(customer?.name || '') + '" />' +
          '</label>' +
          '<label class="form-field"><span>Documento (CPF/CNPJ)</span>' +
            '<input name="document" value="' + escapeHtml(customer?.document || customer?.cpfCnpj || '') + '" />' +
          '</label>' +
        '</div>' +
        '<div class="form-row">' +
          '<label class="form-field"><span>E-mail</span>' +
            '<input name="email" type="email" value="' + escapeHtml(customer?.email || '') + '" />' +
          '</label>' +
          '<label class="form-field"><span>Telefone</span>' +
            '<input name="phone" value="' + escapeHtml(customer?.phone || customer?.telefone || '') + '" />' +
          '</label>' +
        '</div>' +
        '<div class="form-row">' +
          '<label class="form-field"><span>Endereço</span>' +
            '<input name="address" value="' + escapeHtml(customer?.address || '') + '" />' +
          '</label>' +
          '<label class="form-field"><span>Status</span>' +
            '<select name="active">' +
              '<option value="true"' + (customer?.active !== false ? ' selected' : '') + '>Ativo</option>' +
              '<option value="false"' + (customer?.active === false ? ' selected' : '') + '>Inativo</option>' +
            '</select>' +
          '</label>' +
        '</div>' +
        '<label class="form-field"><span>Observações</span>' +
          '<textarea name="notes" rows="3">' + escapeHtml(customer?.notes || '') + '</textarea>' +
        '</label>' +
      '</form>';

    openModal({
      title: isEdit ? 'Editar Cliente' : 'Novo Cliente',
      body,
      size: 'md',
      actions: [
        { label: 'Cancelar', className: 'btn-secondary', onClick: () => closeModal() },
        {
          label: isEdit ? 'Salvar' : 'Criar',
          className: 'btn-primary',
          onClick: async (e, overlay) => {
            const form = overlay.querySelector('#customer-form');
            if (!form.reportValidity()) return;
            const fd = new FormData(form);
            const payload = {
              name: (fd.get('name') || '').trim(),
              document: (fd.get('document') || '').trim() || null,
              email: (fd.get('email') || '').trim() || null,
              phone: (fd.get('phone') || '').trim() || null,
              address: (fd.get('address') || '').trim() || null,
              notes: (fd.get('notes') || '').trim() || null,
              active: fd.get('active') === 'true',
            };
            if (!payload.name) { toast('Nome é obrigatório', 'warning'); return; }

            const btn = e.currentTarget;
            btn.disabled = true;
            const original = btn.textContent;
            btn.textContent = 'Salvando...';
            try {
              if (isEdit) {
                await api.put('/customers/' + customer.id, payload);
                toast('Cliente atualizado com sucesso', 'success');
              } else {
                await api.post('/customers', payload);
                toast('Cliente criado com sucesso', 'success');
              }
              closeModal();
              await load();
            } catch (err) {
              console.error(err);
              toast(err.message || 'Erro ao salvar', 'error');
              btn.disabled = false;
              btn.textContent = original;
            }
          },
        },
      ],
    });
  }

  async function remove(id) {
    const customer = getById(id);
    const ok = await confirm({
      title: 'Excluir cliente',
      message: 'Tem certeza que deseja excluir "' +
        (customer?.name || 'este cliente') +
        '"? Esta ação não pode ser desfeita.',
      confirmLabel: 'Excluir',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete('/customers/' + id);
      toast('Cliente excluído', 'success');
      if (state.items.length === 1 && state.page > 1) state.page--;
      await load();
    } catch (err) {
      toast(err.message || 'Erro ao excluir', 'error');
    }
  }

  // ---- Events ----
  el.tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.action === 'edit') {
      const c = getById(id);
      if (c) openForm(c);
    } else if (btn.dataset.action === 'delete') {
      remove(id);
    }
  });

  el.newBtn.addEventListener('click', () => openForm(null));

  const debouncedSearch = debounce(() => {
    state.page = 1;
    load();
  }, 300);

  el.search.addEventListener('input', () => {
    state.search = el.search.value.trim();
    debouncedSearch();
  });

  el.tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      el.tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      state.status = tab.dataset.status;
      state.page = 1;
      load();
    });
  });

  el.pagination.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-page]');
    if (!btn || btn.disabled) return;
    const p = parseInt(btn.dataset.page, 10);
    if (!Number.isNaN(p)) {
      state.page = p;
      load();
    }
  });

  await load();

  return { destroy() { /* listeners são de elementos já removidos */ } };
}
`);

// ============================================================
// MODULE / _PLACEHOLDER (factory)
// ============================================================
writeFile(path.join(PUBLIC, 'js', 'modules', '_placeholder.js'), `// VETEC · Factory de placeholders para módulos em migração
import { escapeHtml } from '../core/ui.js';

export function makePlaceholder(title, icon = '🚧', description = 'Módulo em migração.') {
  return async function PlaceholderModule(container) {
    container.innerHTML =
      '<div class="page">' +
        '<div class="page-header">' +
          '<div>' +
            '<h1 class="page-title">' + escapeHtml(title) + '</h1>' +
            '<p class="page-subtitle">' + escapeHtml(description) + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="module-placeholder">' +
            '<div class="placeholder-icon">' + icon + '</div>' +
            '<h1>Em construção</h1>' +
            '<p>O módulo de ' + escapeHtml(title) +
            ' será migrado para a nova arquitetura em uma próxima etapa.</p>' +
          '</div>' +
        '</div>' +
      '</div>';
    return { destroy() {} };
  };
}
`);

// ============================================================
// MÓDULOS PLACEHOLDER
// ============================================================
writeFile(path.join(PUBLIC, 'js', 'modules', 'dashboard.js'), `// VETEC · Dashboard (placeholder)
import { makePlaceholder } from './_placeholder.js';
export const DashboardModule = makePlaceholder(
  'Dashboard', '📊', 'Visão geral da operação industrial.'
);
`);

writeFile(path.join(PUBLIC, 'js', 'modules', 'equipments.js'), `// VETEC · Equipamentos (placeholder)
import { makePlaceholder } from './_placeholder.js';
export const EquipmentsModule = makePlaceholder(
  'Equipamentos', '🔧', 'Cadastro e manutenção de equipamentos.'
);
`);

writeFile(path.join(PUBLIC, 'js', 'modules', 'projects.js'), `// VETEC · Projetos (placeholder)
import { makePlaceholder } from './_placeholder.js';
export const ProjectsModule = makePlaceholder(
  'Projetos', '📁', 'Gestão de projetos industriais.'
);
`);

writeFile(path.join(PUBLIC, 'js', 'modules', 'tasks.js'), `// VETEC · Tarefas (placeholder)
import { makePlaceholder } from './_placeholder.js';
export const TasksModule = makePlaceholder(
  'Tarefas', '✅', 'Acompanhamento de tarefas e checklists.'
);
`);

writeFile(path.join(PUBLIC, 'js', 'modules', 'service-orders.js'), `// VETEC · Ordens de Serviço (placeholder)
import { makePlaceholder } from './_placeholder.js';
export const ServiceOrdersModule = makePlaceholder(
  'Ordens de Serviço', '📋', 'Ordens de serviço e execução em campo.'
);
`);

writeFile(path.join(PUBLIC, 'js', 'modules', 'notifications.js'), `// VETEC · Notificações (placeholder)
import { makePlaceholder } from './_placeholder.js';
export const NotificationsModule = makePlaceholder(
  'Notificações', '🔔', 'Central de notificações e alertas.'
);
`);

// ============================================================
// MAIN (bootstrap)
// ============================================================
writeFile(path.join(PUBLIC, 'js', 'main.js'), `// VETEC · Bootstrap da SPA
import { state } from './core/state.js';
import { router, registerRoute } from './core/router.js';
import { renderSidebar, renderTopbar } from './core/layout.js';
import { toast } from './core/ui.js';

import { DashboardModule }     from './modules/dashboard.js';
import { CustomersModule }     from './modules/customers.js';
import { EquipmentsModule }    from './modules/equipments.js';
import { ProjectsModule }      from './modules/projects.js';
import { TasksModule }         from './modules/tasks.js';
import { ServiceOrdersModule } from './modules/service-orders.js';
import { NotificationsModule } from './modules/notifications.js';

// ---------- Auth bootstrap ----------
state.init();

// Re-renderiza topbar em mudanças de auth
state.subscribe(() => renderTopbar());

// Aviso global de 401 (sessão expirada)
window.addEventListener('vetec:unauthorized', () => {
  toast('Sessão expirada. Faça login novamente.', 'warning', 5000);
});

// ---------- Rotas ----------
registerRoute('dashboard',      DashboardModule);
registerRoute('customers',      CustomersModule);
registerRoute('equipments',     EquipmentsModule);
registerRoute('projects',       ProjectsModule);
registerRoute('tasks',          TasksModule);
registerRoute('service-orders', ServiceOrdersModule);
registerRoute('notifications',  NotificationsModule);

// ---------- Layout + router ----------
if (!window.location.hash) window.location.hash = '#dashboard';

renderSidebar();
renderTopbar();
router.start();

// Dica: para testar sem login, no console do browser:
// localStorage.setItem('vetec_auth', JSON.stringify({
//   token: 'SEU_JWT_AQUI',
//   user: { name: 'Admin', email: 'admin@vetec.com', role: 'Administrador' }
// }));
// location.reload();
`);

// ============================================================
// INDEX.HTML (novo shell — sem app.js)
// ============================================================
backupIfExists(path.join(PUBLIC, 'index.html'));

writeFile(path.join(PUBLIC, 'index.html'), `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#0f172a" />
  <title>VETEC · Gestão Industrial</title>

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

  <link rel="stylesheet" href="./css/global.css" />
  <link rel="stylesheet" href="./css/layout.css" />
  <link rel="stylesheet" href="./css/components.css" />
</head>
<body>
  <div class="app-shell">
    <aside id="sidebar" class="sidebar"></aside>

    <div class="app-main">
      <header id="topbar" class="topbar"></header>
      <main id="app-view" class="app-view"></main>
    </div>
  </div>

  <div id="toast-container" class="toast-container" aria-live="polite"></div>

  <noscript>
    <div style="padding:24px;color:#f1f5f9;background:#0f172a;min-height:100vh;">
      Este sistema requer JavaScript habilitado.
    </div>
  </noscript>

  <script type="module" src="./js/main.js"></script>
</body>
</html>
`);

// ---------- done ----------
console.log('\n✅ Reconstrução concluída!\n');
console.log('Próximos passos:');
console.log('  1. Reinicie o servidor (npm run dev / node src/server.js)');
console.log('  2. Abra http://localhost:3000 no browser');
console.log('  3. Navegue pelas rotas: #dashboard, #customers, #equipments ...');
console.log('  4. Para testar a API real, autentique-se — o token fica em');
console.log("     localStorage['vetec_auth'] no formato { token, user }");
console.log('\nPara inspecionar o antigo index.html:');
console.log('  → arquivo public/index.html.bak.<timestamp> foi criado.');
console.log('\n');