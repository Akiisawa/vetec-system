'use strict';

const STATUS = {
  PLANNING:    { label:'Planejamento', color:'#06b6d4', icon:'fa-clipboard-list' },
  IN_PROGRESS: { label:'Em Andamento', color:'#f59e0b', icon:'fa-gears' },
  ON_HOLD:     { label:'Em Espera',    color:'#a855f7', icon:'fa-circle-pause' },
  COMPLETED:   { label:'Concluído',    color:'#22c55e', icon:'fa-circle-check' },
  CANCELLED:   { label:'Cancelado',    color:'#ef4444', icon:'fa-circle-xmark' },
};
const ROLES = {
  ADMIN:      { label:'Administrador', color:'#3b82f6', icon:'fa-crown' },
  MANAGER:    { label:'Gestor',        color:'#06b6d4', icon:'fa-user-tie' },
  TECHNICIAN: { label:'Técnico',       color:'#22c55e', icon:'fa-screwdriver-wrench' },
  VIEWER:     { label:'Visualizador',  color:'#8a93a7', icon:'fa-eye' },
};
const EQUIP_STATUS = {
  OPERATIONAL: { label:'Operacional', color:'#22c55e', icon:'fa-circle-check' },
  MAINTENANCE: { label:'Manutenção',  color:'#f59e0b', icon:'fa-wrench' },
  BROKEN:      { label:'Quebrado',    color:'#ef4444', icon:'fa-circle-xmark' },
  RETIRED:     { label:'Aposentado',  color:'#8a93a7', icon:'fa-box-archive' },
};
const TASK_PRIORITY = {
  LOW:    { label:'Baixa',   color:'#94a3b8', icon:'fa-arrow-down' },
  MEDIUM: { label:'Média',   color:'#3b82f6', icon:'fa-minus' },
  HIGH:   { label:'Alta',    color:'#f59e0b', icon:'fa-arrow-up' },
  URGENT: { label:'Urgente', color:'#ef4444', icon:'fa-fire' },
};
const TASK_STATUS = {
  TODO:        { label:'A Fazer',      color:'#8a93a7', icon:'fa-circle' },
  IN_PROGRESS: { label:'Em Andamento', color:'#3b82f6', icon:'fa-spinner' },
  BLOCKED:     { label:'Bloqueada',    color:'#ef4444', icon:'fa-ban' },
  DONE:        { label:'Concluída',    color:'#22c55e', icon:'fa-check' },
};
const SO_STATUS = {
  OPEN:        { label:'Aberta',       color:'#3b82f6', icon:'fa-folder-open' },
  IN_PROGRESS: { label:'Em Andamento', color:'#f59e0b', icon:'fa-gears' },
  ON_HOLD:     { label:'Em Espera',    color:'#a855f7', icon:'fa-circle-pause' },
  DONE:        { label:'Concluída',    color:'#22c55e', icon:'fa-circle-check' },
  CANCELLED:   { label:'Cancelada',    color:'#ef4444', icon:'fa-circle-xmark' },
};
const NOTIF_ICONS = { INFO:'fa-circle-info', WARNING:'fa-triangle-exclamation', SUCCESS:'fa-circle-check', DANGER:'fa-circle-exclamation' };

const state = {
  token: localStorage.getItem('vetec_token'),
  user: JSON.parse(localStorage.getItem('vetec_user') || 'null'),
  theme: localStorage.getItem('vetec_theme') || 'dark',
  view: 'dashboard',
  collapsed: localStorage.getItem('vetec_sidebar') === '1',
  unreadCount: 0,
};

const $  = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const el = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const formatCNPJ = (v) => { const d = String(v || '').replace(/\D/g,'').padStart(14,'0').slice(0,14); return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5'); };
const formatBRL = (v) => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL', maximumFractionDigits:0 }).format(Number(v) || 0);
const formatDate = (v) => v ? new Date(v.length === 10 ? v + 'T00:00:00' : v).toLocaleDateString('pt-BR') : '—';
const formatDateTime = (v) => v ? new Date(v).toLocaleString('pt-BR') : '—';
const initials = (n) => String(n || '').split(' ').filter(Boolean).slice(0,2).map(x => x[0]).join('').toUpperCase() || '?';
const debounce = (fn, ms = 300) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

const badgeStatus = (s) => `<span class="badge badge-status-${s}"><i class="fa-solid ${STATUS[s]?.icon||'fa-circle'}"></i> ${STATUS[s]?.label||s}</span>`;
const badgeRole = (r) => `<span class="badge badge-role-${r}">${ROLES[r]?.label||r}</span>`;
const badgeEquip = (s) => `<span class="badge badge-equip-${s}"><i class="fa-solid ${EQUIP_STATUS[s]?.icon||'fa-circle'}"></i> ${EQUIP_STATUS[s]?.label||s}</span>`;
const badgePriority = (p) => `<span class="badge badge-task-${p}">${TASK_PRIORITY[p]?.label||p}</span>`;
const badgeTaskStatus = (s) => `<span class="badge badge-task-${s}">${TASK_STATUS[s]?.label||s}</span>`;
const badgeSO = (s) => `<span class="badge badge-so-${s}"><i class="fa-solid ${SO_STATUS[s]?.icon||'fa-circle'}"></i> ${SO_STATUS[s]?.label||s}</span>`;

/* ==== TOAST ==== */
function toast(message, type = 'info', duration = 3500) {
  const icons = { success:'fa-circle-check', error:'fa-circle-xmark', warning:'fa-triangle-exclamation', info:'fa-circle-info' };
  const t = document.createElement('div');
  t.className = 'toast toast-' + type;
  t.innerHTML = `<i class="fa-solid ${icons[type]||icons.info} toast-icon"></i><div class="toast-message">${esc(message)}</div><button class="toast-close"><i class="fa-solid fa-xmark"></i></button>`;
  el('toasts').appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  const remove = () => { t.classList.remove('show'); setTimeout(() => t.remove(), 250); };
  t.querySelector('.toast-close').onclick = remove;
  setTimeout(remove, duration);
}

/* ==== CONFIRM ==== */
function confirmDialog({ title = 'Confirmar', message, confirmText = 'Confirmar', danger = false }) {
  return new Promise((resolve) => {
    const ov = document.createElement('div');
    ov.className = 'modal-overlay';
    ov.innerHTML = `<div class="modal modal-sm"><div class="confirm-icon ${danger?'danger':''}"><i class="fa-solid ${danger?'fa-triangle-exclamation':'fa-circle-question'}"></i></div><h2 class="modal-title">${esc(title)}</h2><p class="confirm-message">${esc(message)}</p><div class="modal-actions"><button class="btn btn-ghost" data-cancel>Cancelar</button><button class="btn ${danger?'btn-danger':'btn-primary'}" data-ok>${esc(confirmText)}</button></div></div>`;
    document.body.appendChild(ov);
    const close = (r) => { ov.remove(); resolve(r); };
    ov.querySelector('[data-cancel]').onclick = () => close(false);
    ov.querySelector('[data-ok]').onclick = () => close(true);
    ov.onclick = (e) => { if (e.target === ov) close(false); };
  });
}

/* ==== API ==== */
async function api(method, path, body) {
  const res = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type':'application/json', ...(state.token ? { Authorization:'Bearer ' + state.token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 && state.token) { logout(); throw new Error('Sessão expirada'); }
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.ok === false) throw new Error(json?.error?.message || ('Erro ' + res.status));
  return json.data;
}

/* ==== THEME ==== */
function applyTheme() { document.documentElement.setAttribute('data-theme', state.theme); localStorage.setItem('vetec_theme', state.theme); }
function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
  const btn = el('theme-toggle');
  if (btn) btn.innerHTML = `<i class="fa-solid ${state.theme==='dark'?'fa-sun':'fa-moon'}"></i>`;
  if (state.view === 'dashboard') setTimeout(() => loadDashboard(), 50);
}

/* ==== SESSION ==== */
function saveSession(token, user) { state.token = token; state.user = user; localStorage.setItem('vetec_token', token); localStorage.setItem('vetec_user', JSON.stringify(user)); }
function logout() { state.token = null; state.user = null; localStorage.removeItem('vetec_token'); localStorage.removeItem('vetec_user'); render(); }

/* ==== RENDER ==== */
function render() {
  if (!state.token) renderLogin();
  else { renderShell(); refreshNotifCount(); setInterval(refreshNotifCount, 30000); }
}

/* ==== LOGIN ==== */
function renderLogin() {
  el('app').innerHTML = `
    <div class="login-wrap"><div class="login-bg-glow"></div>
      <div class="login-container">
        <div class="login-brand">
          <div class="brand-logo"><i class="fa-solid fa-industry"></i></div>
          <h1>VETEC</h1>
          <p class="brand-tagline">Sistema de Gestão Industrial</p>
          <div class="brand-features">
            <div class="brand-feature"><i class="fa-solid fa-shield-halved"></i><div><strong>Segurança RBAC</strong><span>Controle de acesso por perfil</span></div></div>
            <div class="brand-feature"><i class="fa-solid fa-chart-line"></i><div><strong>Visão Estratégica</strong><span>Dashboard em tempo real</span></div></div>
            <div class="brand-feature"><i class="fa-solid fa-bolt"></i><div><strong>Rápido & Simples</strong><span>Interface intuitiva e responsiva</span></div></div>
          </div>
        </div>
        <div class="login-form-wrap">
          <form class="login-card" id="login-form">
            <div class="login-header"><h2>Bem-vindo de volta</h2><p>Entre com suas credenciais para acessar</p></div>
            <label class="field"><span class="field-label"><i class="fa-solid fa-envelope"></i> E-mail</span><input name="email" type="email" required value="admin@vetec.demo" autocomplete="username"></label>
            <label class="field"><span class="field-label"><i class="fa-solid fa-lock"></i> Senha</span><div class="input-with-action"><input name="password" type="password" required value="vetec@123" autocomplete="current-password"><button type="button" class="toggle-password"><i class="fa-solid fa-eye"></i></button></div></label>
            <button type="submit" class="btn btn-primary btn-block btn-lg"><i class="fa-solid fa-right-to-bracket"></i> Entrar</button>
            <small id="login-error" class="login-error"></small>
            <div class="login-demo"><div class="login-demo-title"><i class="fa-solid fa-flask"></i> Contas demo (senha: vetec@123)</div>
              <div class="demo-accounts">
                <button type="button" class="demo-account" data-email="admin@vetec.demo"><i class="fa-solid fa-crown"></i> Admin</button>
                <button type="button" class="demo-account" data-email="maria@vetec.demo"><i class="fa-solid fa-user-tie"></i> Gestor</button>
                <button type="button" class="demo-account" data-email="joao@vetec.demo"><i class="fa-solid fa-screwdriver-wrench"></i> Técnico</button>
                <button type="button" class="demo-account" data-email="ana@vetec.demo"><i class="fa-solid fa-eye"></i> Viewer</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>`;
  el('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true; const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Entrando...';
    try {
      const data = await api('POST', '/auth/login', { email: fd.get('email'), password: fd.get('password') });
      saveSession(data.token, data.user);
      toast(`Bem-vindo, ${data.user.name.split(' ')[0]}!`, 'success');
      render();
    } catch (err) { el('login-error').textContent = err.message; btn.disabled = false; btn.innerHTML = orig; }
  };
  $('.toggle-password').onclick = () => { const inp = $('input[name=password]'); inp.type = inp.type === 'password' ? 'text' : 'password'; };
  $$('.demo-account').forEach(b => b.onclick = () => { $('input[name=email]').value = b.dataset.email; });
}

/* ==== SHELL ==== */
function renderShell() {
  el('app').innerHTML = `
    <div class="shell ${state.collapsed?'collapsed':''}">
      <aside class="sidebar">
        <div class="sidebar-header"><div class="brand-logo brand-logo-sm"><i class="fa-solid fa-industry"></i></div><div class="brand-text"><strong>VETEC</strong><span>Industrial</span></div></div>
        <nav class="sidebar-nav">
          <div class="nav-section">Principal</div>
          <a data-view="dashboard" class="nav-item"><i class="fa-solid fa-gauge-high"></i><span>Dashboard</span></a>
          <div class="nav-section">Cadastros</div>
          <a data-view="customers" class="nav-item"><i class="fa-solid fa-building"></i><span>Clientes</span></a>
          <a data-view="equipments" class="nav-item"><i class="fa-solid fa-toolbox"></i><span>Equipamentos</span></a>
          <a data-view="projects" class="nav-item"><i class="fa-solid fa-diagram-project"></i><span>Projetos</span></a>
          <div class="nav-section">Operação</div>
          <a data-view="tasks" class="nav-item"><i class="fa-solid fa-list-check"></i><span>Tarefas</span></a>
          <a data-view="service-orders" class="nav-item"><i class="fa-solid fa-clipboard-list"></i><span>Ordens de Serviço</span></a>
          <div class="nav-section">Sistema</div>
          <a data-view="notifications" class="nav-item"><i class="fa-solid fa-bell"></i><span>Notificações</span><span class="nav-badge" id="notif-badge" hidden>0</span></a>
          <a data-view="users" class="nav-item admin-only"><i class="fa-solid fa-users"></i><span>Usuários</span></a>
          <a data-view="audit" class="nav-item admin-only"><i class="fa-solid fa-clock-rotate-left"></i><span>Auditoria</span></a>
        </nav>
        <div class="sidebar-footer"><div class="user-card"><div class="user-avatar">${initials(state.user?.name)}</div><div class="user-info"><strong>${esc(state.user?.name)}</strong><span>${ROLES[state.user?.role]?.label||''}</span></div></div></div>
      </aside>
      <div class="main-wrapper">
        <header class="topbar">
          <div class="topbar-left">
            <button class="icon-btn" id="sidebar-toggle"><i class="fa-solid fa-bars"></i></button>
            <div class="breadcrumb" id="breadcrumb"></div>
          </div>
          <div class="topbar-right">
            <button class="search-trigger" id="search-trigger"><i class="fa-solid fa-magnifying-glass"></i><span>Buscar...</span><kbd>Ctrl K</kbd></button>
            <button class="icon-btn" id="notif-btn" title="Notificações"><i class="fa-solid fa-bell"></i></button>
            <button class="icon-btn" id="theme-toggle"></button>
            <div class="user-menu-wrap">
              <button class="user-menu-trigger" id="user-menu-trigger"><div class="user-avatar user-avatar-sm">${initials(state.user?.name)}</div></button>
              <div class="user-menu" id="user-menu" hidden>
                <div class="user-menu-header"><strong>${esc(state.user?.name)}</strong><span>${esc(state.user?.email)}</span></div>
                <button class="user-menu-item" id="logout-btn"><i class="fa-solid fa-right-from-bracket"></i> Sair</button>
              </div>
            </div>
          </div>
        </header>
        <main class="main" id="main"></main>
      </div>
    </div>`;

  el('theme-toggle').innerHTML = `<i class="fa-solid ${state.theme==='dark'?'fa-sun':'fa-moon'}"></i>`;
  $$('.nav-item').forEach(a => a.onclick = (e) => { e.preventDefault(); state.view = a.dataset.view; renderView(); });
  if (state.user?.role !== 'ADMIN') $$('.admin-only').forEach(n => n.style.display = 'none');
  el('sidebar-toggle').onclick = () => { state.collapsed = !state.collapsed; localStorage.setItem('vetec_sidebar', state.collapsed?'1':'0'); $('.shell').classList.toggle('collapsed', state.collapsed); };
  el('theme-toggle').onclick = toggleTheme;
  el('search-trigger').onclick = openGlobalSearch;
  el('notif-btn').onclick = () => toggleNotifDropdown();
  const trigger = el('user-menu-trigger');
  const menu = el('user-menu');
  trigger.onclick = (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; };
  document.addEventListener('click', () => menu.hidden = true);
  menu.onclick = (e) => e.stopPropagation();
  el('logout-btn').onclick = () => logout();
  renderView();
}

async function refreshNotifCount() {
  try {
    const data = await api('GET', '/notifications/unread');
    state.unreadCount = data.unread;
    const navBadge = el('notif-badge');
    const topBadge = el('notif-btn');
    if (navBadge) { navBadge.textContent = data.unread; navBadge.hidden = data.unread === 0; }
    if (topBadge) {
      const existing = topBadge.querySelector('.icon-badge');
      if (existing) existing.remove();
      if (data.unread > 0) topBadge.insertAdjacentHTML('beforeend', `<span class="icon-badge">${data.unread}</span>`);
    }
  } catch {}
}

/* ================= NOTIFICAÇÕES – DROPDOWN ================= */
function toggleNotifDropdown() {
  const existing = el('notif-dropdown');
  if (existing) { existing.remove(); return; }

  const dropdown = document.createElement('div');
  dropdown.id = 'notif-dropdown';
  dropdown.className = 'notif-dropdown';
  dropdown.innerHTML =
    '<div class="notif-dropdown-header"><strong>Notificações</strong></div>' +
    '<div class="notif-dropdown-body" id="notif-dropdown-list">' +
    '<div class="loading"><i class="fa-solid fa-spinner fa-spin"></i></div></div>' +
    '<div class="notif-dropdown-footer"><a href="#" id="notif-see-all">Ver todas as notificações</a></div>';

  const btn = el('notif-btn');
  const rect = btn.getBoundingClientRect();
  dropdown.style.position = 'fixed';
  dropdown.style.top = (rect.bottom + 8) + 'px';
  dropdown.style.right = (window.innerWidth - rect.right) + 'px';
  dropdown.style.zIndex = 1000;
  document.body.appendChild(dropdown);

  const closeOnOutside = (e) => {
    if (!dropdown.contains(e.target) && e.target !== btn) {
      dropdown.remove();
      document.removeEventListener('click', closeOnOutside);
    }
  };
  setTimeout(() => document.addEventListener('click', closeOnOutside), 0);

  el('notif-see-all').onclick = (e) => {
    e.preventDefault();
    dropdown.remove();
    state.view = 'notifications';
    renderView();
  };

  loadNotifDropdown();
}

async function loadNotifDropdown() {
  const listEl = el('notif-dropdown-list');
  if (!listEl) return;
  try {
    const data = await api('GET', '/notifications?page=1&pageSize=3');
    const items = (data && data.items) || [];
    if (!items.length) {
      listEl.innerHTML = '<div class="notif-empty">Nenhuma notificação</div>';
    } else {
      const icons = (typeof NOTIF_ICONS !== 'undefined') ? NOTIF_ICONS : {};
      listEl.innerHTML = items.map(n =>
        '<div class="notif-item ' + (n.read ? '' : 'unread') + '">' +
          '<i class="fa-solid ' + (icons[n.type] || 'fa-circle-info') + ' notif-icon"></i>' +
          '<div class="notif-content">' +
            '<div class="notif-title">' + esc(n.title) + '</div>' +
            '<div class="notif-msg">' + esc(n.message || '') + '</div>' +
            '<div class="notif-time">' + formatDateTime(n.createdAt) + '</div>' +
          '</div>' +
        '</div>'
      ).join('');
    }
    // Marca como lidas
    await api('POST', '/notifications/read-all');
    if (typeof refreshNotifCount === 'function') refreshNotifCount();
  } catch (e) {
    listEl.innerHTML = '<div class="notif-error">' + esc(e.message) + '</div>';
  }
}


function setBreadcrumb(items) {
  const bc = el('breadcrumb');
  if (!bc) return;
  bc.innerHTML = items.map((it, i) => i === items.length - 1 ? `<span class="crumb-current">${esc(it)}</span>` : `<span class="crumb">${esc(it)}</span><i class="fa-solid fa-chevron-right crumb-sep"></i>`).join('');
}

function renderView() {
  if (state.charts) Object.values(state.charts).forEach(c => c?.destroy?.()); state.charts = {};
  $$('.nav-item').forEach(a => a.classList.toggle('active', a.dataset.view === state.view));
  const main = el('main');
  const map = { dashboard: renderDashboard, customers: renderCustomers, projects: renderProjects, equipments: renderEquipments, tasks: renderTasks, 'service-orders': renderServiceOrders, users: renderUsers, notifications: renderNotifications, audit: renderAudit };
  (map[state.view] || renderDashboard)(main);
}

/* ================= DASHBOARD ================= */
async function renderDashboard(main) {
  setBreadcrumb(['VETEC', 'Dashboard']);
  main.innerHTML = `<div class="view-header"><div><h1>Olá, ${esc(state.user?.name?.split(' ')[0]||'usuário')} 👋</h1><p class="subtitle">${new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p></div><div class="view-actions"><button class="btn btn-ghost btn-sm" id="refresh-dash"><i class="fa-solid fa-rotate"></i> Atualizar</button></div></div><div id="dashboard-content">${dashSkeleton()}</div>`;
  el('refresh-dash').onclick = () => loadDashboard();
  await loadDashboard();
}

function dashSkeleton() {
  return `<div class="kpi-grid">${[1,2,3,4,5,6].map(() => `<div class="kpi-card skeleton"><div class="skeleton-icon"></div><div style="flex:1"><div class="skeleton-line" style="width:40%"></div><div class="skeleton-line skeleton-lg" style="width:70%"></div><div class="skeleton-line" style="width:50%"></div></div></div>`).join('')}</div><div class="charts-grid"><div class="card skeleton" style="height:340px"></div><div class="card skeleton" style="height:340px"></div></div>`;
}

async function loadDashboard() {
  const content = el('dashboard-content');
  content.innerHTML = dashSkeleton();
  try {
    const [dash, projectsRes] = await Promise.all([
      api('GET', '/reports/dashboard'),
      api('GET', '/projects?page=1&pageSize=6'),
    ]);
    content.innerHTML = `
      <div class="kpi-grid">
        ${kpi('Clientes', dash.counts.customers, 'fa-building', 'info', 'Ativos')}
        ${kpi('Projetos', dash.counts.projects, 'fa-diagram-project', 'accent', `${dash.counts.activeProjects} em andamento`)}
        ${kpi('Tarefas', dash.counts.tasksPending, 'fa-list-check', 'warning', `${dash.counts.tasksOverdue} atrasadas`)}
        ${kpi('Ordens de Serviço', dash.counts.soOpen, 'fa-clipboard-list', 'purple', `${dash.counts.serviceOrders} total`)}
        ${kpi('Equipamentos', dash.counts.equipments, 'fa-toolbox', 'success', `${dash.counts.eqOperational} operacionais`)}
        ${kpi('Orçamento', formatBRL(dash.totalBudget), 'fa-sack-dollar', 'accent', 'Total dos projetos', true)}
      </div>
      <div class="charts-grid">
        <div class="card chart-card"><div class="card-header"><div><h3>Projetos por Status</h3><p>Distribuição atual</p></div><span class="badge-soft badge-info">${dash.counts.projects} total</span></div><div class="chart-container"><canvas id="chart-status"></canvas></div></div>
        <div class="card chart-card"><div class="card-header"><div><h3>Tarefas por Prioridade</h3><p>Foco da equipe</p></div><span class="badge-soft badge-warning">${dash.counts.tasksPending} pendentes</span></div><div class="chart-container"><canvas id="chart-priority"></canvas></div></div>
      </div>
      <div class="grid-2">
        <div class="card"><div class="card-header"><div><h3>Projetos Recentes</h3><p>Últimos cadastrados</p></div><button class="btn btn-ghost btn-sm" id="go-projects">Ver todos</button></div>${renderRecentProjects(projectsRes.items)}</div>
        <div class="card"><div class="card-header"><div><h3>Atividade Recente</h3></div></div>${renderRecentActivity(dash.recentAudit)}</div>
      </div>`;
    el('go-projects').onclick = () => { state.view = 'projects'; renderView(); };
    requestAnimationFrame(() => drawCharts(dash));
  } catch (e) {
    content.innerHTML = `<div class="card"><div class="error-box">${esc(e.message)}</div></div>`;
  }
}

function kpi(label, value, icon, tone, helper, small) {
  return `<div class="kpi-card"><div class="kpi-icon kpi-${tone}"><i class="fa-solid ${icon}"></i></div><div class="kpi-body"><span class="kpi-label">${esc(label)}</span><strong class="kpi-value ${small?'kpi-value-sm':''}">${value}</strong><span class="kpi-helper">${esc(helper)}</span></div></div>`;
}

function renderRecentProjects(items) {
  if (!items.length) return `<div class="empty empty-sm"><i class="fa-solid fa-folder-open"></i><p>Nenhum projeto</p></div>`;
  return `<div class="recent-list">${items.map(p => `<div class="recent-item"><div class="recent-icon" style="background:${STATUS[p.status]?.color}20;color:${STATUS[p.status]?.color}"><i class="fa-solid ${STATUS[p.status]?.icon}"></i></div><div class="recent-body"><strong>${esc(p.name)}</strong><span>${esc(p.code)} · ${esc(p.customerName||'')}</span></div><div class="recent-meta"><span class="badge badge-status-${p.status}">${STATUS[p.status]?.label}</span><span class="recent-budget">${formatBRL(p.budget)}</span></div></div>`).join('')}</div>`;
}

function renderRecentActivity(audit) {
  if (!audit.length) return `<div class="empty empty-sm"><i class="fa-solid fa-clock"></i><p>Sem atividade</p></div>`;
  const icons = { LOGIN:'fa-right-to-bracket', CREATE:'fa-plus', UPDATE:'fa-pen', DELETE:'fa-trash' };
  const colors = { LOGIN:'#3b82f6', CREATE:'#22c55e', UPDATE:'#f59e0b', DELETE:'#ef4444' };
  return `<div class="activity-list">${audit.slice(0,8).map(a => `<div class="activity-item"><div class="activity-icon" style="color:${colors[a.action]||'#8a93a7'}"><i class="fa-solid ${icons[a.action]||'fa-circle'}"></i></div><div class="activity-body"><strong>${a.action} <span class="muted">${esc(a.resource)}${a.resourceId?'#'+a.resourceId:''}</span></strong><span>${formatDateTime(a.at)}</span></div></div>`).join('')}</div>`;
}

function drawCharts(dash) {
  if (!dash || typeof Chart === 'undefined') return;
  state.charts = state.charts || {};
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim();
  const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim();
  const statusCanvas = el('chart-status');
  if (statusCanvas) {
    const labels = Object.keys(dash.projectsByStatus);
    state.charts.status = new Chart(statusCanvas, {
      type:'doughnut',
      data:{ labels: labels.map(k => STATUS[k]?.label||k), datasets:[{ data: Object.values(dash.projectsByStatus), backgroundColor: labels.map(k => STATUS[k]?.color||'#888'), borderColor:'transparent', borderWidth:0, hoverOffset:8 }] },
      options:{ responsive:true, maintainAspectRatio:false, cutout:'70%', plugins:{ legend:{ position:'bottom', labels:{ color:textColor, padding:16, font:{ family:'Inter', size:12 }, usePointStyle:true, pointStyle:'circle' } }, tooltip:{ backgroundColor:'#1a2230', borderColor, borderWidth:1, padding:12, cornerRadius:8 } } },
    });
  }
  const prioCanvas = el('chart-priority');
  if (prioCanvas) {
    const labels = Object.keys(dash.tasksByPriority);
    state.charts.priority = new Chart(prioCanvas, {
      type:'bar',
      data:{ labels: labels.map(k => TASK_PRIORITY[k]?.label||k), datasets:[{ data: Object.values(dash.tasksByPriority), backgroundColor: labels.map(k => (TASK_PRIORITY[k]?.color||'#888')+'99'), borderColor: labels.map(k => TASK_PRIORITY[k]?.color||'#888'), borderWidth:2, borderRadius:6 }] },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false }, tooltip:{ backgroundColor:'#1a2230', borderColor, borderWidth:1, padding:12, cornerRadius:8 } }, scales:{ x:{ ticks:{ color:textColor, font:{ family:'Inter', size:11 } }, grid:{ display:false } }, y:{ ticks:{ color:textColor, font:{ family:'Inter', size:11 } }, grid:{ color:borderColor } } } },
    });
  }
}

/* ================= CUSTOMERS ================= */
let customersState = { search:'' };
async function renderCustomers(main) {
  setBreadcrumb(['VETEC', 'Clientes']);
  main.innerHTML = `
    <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px;">
      <div>
        <h1 class="page-title">Clientes</h1>
        <p class="page-subtitle">Cadastro comercial de clientes</p>
      </div>
      <button class="btn btn-primary" onclick="openCustomerModal()">
        <i class="fa-solid fa-plus"></i> Novo Cliente
      </button>
    </div>

    <div class="card" style="background: var(--bg-2); border-radius: var(--r); padding: 20px; border: 1px solid var(--border);">
      
      <!-- Barra de Filtros -->
      <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 24px; flex-wrap: wrap;">
        
        <!-- Input com Lupa -->
        <div style="position: relative; flex: 1; max-width: 400px;">
          <i class="fa-solid fa-search" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
          <input type="text" id="customer-search" placeholder="Buscar por nome, CNPJ ou e-mail..." style="width: 100%; padding: 10px 14px 10px 38px; border: 1px solid var(--border); border-radius: var(--r); background: var(--bg-1); color: var(--text); outline: none;">
        </div>

        <!-- Abas (Pílulas) -->
        <div style="display: flex; gap: 4px; background: var(--bg-2); padding: 4px; border-radius: var(--r); border: 1px solid var(--border);">
          <button class="filter-tab active" onclick="setCustomerFilter(this, '')" style="padding: 8px 16px; border: none; background: var(--accent); color: #fff; font-size: 13px; font-weight: 500; border-radius: 6px; cursor: pointer;">Todos</button>
          <button class="filter-tab" onclick="setCustomerFilter(this, 'ACTIVE')" style="padding: 8px 16px; border: none; background: transparent; color: var(--text-muted); font-size: 13px; font-weight: 500; border-radius: 6px; cursor: pointer;">Ativos</button>
          <button class="filter-tab" onclick="setCustomerFilter(this, 'INACTIVE')" style="padding: 8px 16px; border: none; background: transparent; color: var(--text-muted); font-size: 13px; font-weight: 500; border-radius: 6px; cursor: pointer;">Inativos</button>
          <button class="filter-tab" onclick="setCustomerFilter(this, 'BLOCKED')" style="padding: 8px 16px; border: none; background: transparent; color: var(--text-muted); font-size: 13px; font-weight: 500; border-radius: 6px; cursor: pointer;">Bloqueados</button>
        </div>
      </div>

      <div id="customers-table"></div>
    </div>
  `;

  el('customer-search').oninput = debounce((e) => {
    window.customerSearch = e.target.value;
    loadCustomers();
  }, 300);

  await loadCustomers();
}

async function loadCustomers() {
  const box = el('customers-table');
  if (!box) return;
  try {
    let q = '?page=1&pageSize=100';
    if (window.customerSearch) q += `&search=${encodeURIComponent(window.customerSearch)}`;
    if (window.customerStatus) q += `&status=${encodeURIComponent(window.customerStatus)}`;

    const { items } = await api('GET', `/customers${q}`);
    
    if (!items.length) {
      box.innerHTML = `<div style="text-align:center; padding: 40px; color: var(--text-muted);">Nenhum cliente encontrado</div>`;
      return;
    }

    box.innerHTML = `
      <table class="table" style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr>
            <th style="padding: 12px; border-bottom: 1px solid var(--border); color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Código</th>
            <th style="padding: 12px; border-bottom: 1px solid var(--border); color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Razão Social</th>
            <th style="padding: 12px; border-bottom: 1px solid var(--border); color: var(--text-muted); font-size: 11px; text-transform: uppercase;">CNPJ/CPF</th>
            <th style="padding: 12px; border-bottom: 1px solid var(--border); color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Segmento</th>
            <th style="padding: 12px; border-bottom: 1px solid var(--border); color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Status</th>
            <th style="padding: 12px; border-bottom: 1px solid var(--border); color: var(--text-muted); font-size: 11px; text-transform: uppercase; text-align: right;">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(c => `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid var(--border);"><span style="font-family: monospace; font-size: 12px; color: var(--accent); background: var(--bg-1); padding: 2px 6px; border-radius: 4px;">${esc(c.code || c.id)}</span></td>
              <td style="padding: 12px; border-bottom: 1px solid var(--border);">
                <div style="font-weight: 600;">${esc(c.legalName)}</div>
                ${c.tradeName ? `<div style="font-size: 11px; color: var(--text-muted);">${esc(c.tradeName)}</div>` : ''}
              </td>
              <td style="padding: 12px; border-bottom: 1px solid var(--border);">${formatDoc(c.document)}</td>
              <td style="padding: 12px; border-bottom: 1px solid var(--border);">${esc(c.segment || '-')}</td>
              <td style="padding: 12px; border-bottom: 1px solid var(--border);">
                <span style="font-size: 11px; font-weight: 600; padding: 4px 8px; border-radius: 12px; background: ${c.status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' : c.status === 'BLOCKED' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)'}; color: ${c.status === 'ACTIVE' ? '#10b981' : c.status === 'BLOCKED' ? '#ef4444' : '#f59e0b'};">
                  ${c.status === 'ACTIVE' ? 'ATIVO' : c.status === 'BLOCKED' ? 'BLOQUEADO' : 'INATIVO'}
                </span>
              </td>
              <td style="padding: 12px; border-bottom: 1px solid var(--border); text-align: right;">
                <button class="btn-icon" onclick="openCustomerModal(${c.id})" title="Editar"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-icon text-danger" onclick="deleteCustomer(${c.id})" title="Excluir"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (e) {
    box.innerHTML = `<div style="padding: 20px; color: #ef4444;">${esc(e.message)}</div>`;
  }
}

async function openCustomerModal(id) {
  let c = { name:'', cnpj:'', email:'', phone:'', city:'', state:'' };
  if (id) { try { c = await api('GET', `/customers/${id}`); } catch (e) { toast(e.message,'error'); return; } }
  showModal({ title: id?'Editar Cliente':'Novo Cliente', body:`
    <div class="form-field"><label>Razão Social *</label><input name="name" required value="${esc(c.name)}"></div>
    <div class="form-row"><div class="form-field"><label>CNPJ *</label><input name="cnpj" required value="${esc(formatCNPJ(c.cnpj))}"></div><div class="form-field"><label>Telefone</label><input name="phone" value="${esc(c.phone||'')}"></div></div>
    <div class="form-field"><label>E-mail</label><input name="email" type="email" value="${esc(c.email||'')}"></div>
    <div class="form-row"><div class="form-field"><label>Cidade</label><input name="city" value="${esc(c.city||'')}"></div><div class="form-field"><label>UF</label><input name="state" maxlength="2" value="${esc(c.state||'')}"></div></div>`,
    onSubmit: async (data) => {
      if (id) { await api('PATCH', `/customers/${id}`, data); toast('Atualizado','success'); }
      else { await api('POST','/customers',data); toast('Criado','success'); }
      loadCustomers();
    } });
}

/* ================= PROJECTS ================= */
let projectsState = { search:'', status:'' };
async function renderProjects(main) {
  setBreadcrumb(['VETEC','Projetos']);
  main.innerHTML = `<div class="view-header"><div><h1>Projetos</h1><p class="subtitle">Acompanhe os projetos</p></div><div class="view-actions"><button class="btn btn-primary" id="new-project"><i class="fa-solid fa-plus"></i> Novo Projeto</button></div></div><div class="table-wrap"><div class="table-toolbar"><div class="search-input"><i class="fa-solid fa-magnifying-glass"></i><input type="search" id="project-search" placeholder="Buscar..."></div><div class="filter-tabs" id="project-filters"><button class="filter-tab active" data-status="">Todos</button>${Object.entries(STATUS).map(([k,v])=>`<button class="filter-tab" data-status="${k}">${v.label}</button>`).join('')}</div></div><div id="projects-table"><div class="loading"><i class="fa-solid fa-spinner fa-spin"></i></div></div></div>`;
  el('new-project').onclick = () => openProjectModal();
  el('project-search').oninput = debounce((e)=>{ projectsState.search=e.target.value; loadProjects(); },300);
  $$('#project-filters .filter-tab').forEach(b=>b.onclick=()=>{ $$('#project-filters .filter-tab').forEach(x=>x.classList.remove('active')); b.classList.add('active'); projectsState.status=b.dataset.status; loadProjects(); });
  await loadProjects();
}

async function loadProjects() {
  const box = el('projects-table'); if (!box) return;
  try {
    const params = new URLSearchParams({ page:1, pageSize:100 });
    if (projectsState.search) params.set('search', projectsState.search);
    if (projectsState.status) params.set('status', projectsState.status);
    const { items } = await api('GET', `/projects?${params}`);
    if (!items.length) { box.innerHTML = `<div class="table-empty"><div class="empty"><i class="fa-solid fa-diagram-project"></i><h3>Nenhum projeto</h3></div></div>`; return; }
    box.innerHTML = `<table class="table"><thead><tr><th>Projeto</th><th>Cliente</th><th>Gestor</th><th>Status</th><th>Orçamento</th><th></th></tr></thead><tbody>${items.map(p=>`<tr><td><div class="cell-main"><div class="recent-icon" style="background:${STATUS[p.status]?.color}20;color:${STATUS[p.status]?.color}"><i class="fa-solid ${STATUS[p.status]?.icon}"></i></div><div><div class="cell-name">${esc(p.name)}</div><div class="cell-sub"><code>${esc(p.code)}</code></div></div></div></td><td>${esc(p.customerName||'—')}</td><td>${esc(p.managerName||'—')}</td><td>${badgeStatus(p.status)}</td><td><strong>${formatBRL(p.budget)}</strong></td><td><div class="row-actions"><button class="btn-icon-ghost" data-edit="${p.id}"><i class="fa-solid fa-pen"></i></button><button class="btn-icon-danger" data-del="${p.id}"><i class="fa-solid fa-trash"></i></button></div></td></tr>`).join('')}</tbody></table>`;
    $$('[data-edit]',box).forEach(b=>b.onclick=()=>openProjectModal(+b.dataset.edit));
    $$('[data-del]',box).forEach(b=>b.onclick=async()=>{ const ok=await confirmDialog({title:'Excluir projeto?',message:'Não pode ser desfeito.',confirmText:'Excluir',danger:true}); if(!ok)return; try{await api('DELETE',`/projects/${b.dataset.del}`);toast('Excluído','success');loadProjects();}catch(e){toast(e.message,'error');} });
  } catch (e) { box.innerHTML = `<div class="table-empty"><div class="error-box">${esc(e.message)}</div></div>`; }
}

async function openProjectModal(id) {
  try {
    const canList = ['ADMIN','MANAGER'].includes(state.user.role);
    const [cRes, uRes] = await Promise.all([api('GET','/customers?page=1&pageSize=100'), canList?api('GET','/users?page=1&pageSize=100'):Promise.resolve({items:[state.user]})]);
    let p = { name:'', customerId:'', managerId:'', status:'PLANNING', budget:0, startDate:'', endDate:'' };
    if (id) p = await api('GET', `/projects/${id}`);
    showModal({ title: id?'Editar Projeto':'Novo Projeto', body:`
      <div class="form-field"><label>Nome *</label><input name="name" required value="${esc(p.name)}"></div>
      <div class="form-row"><div class="form-field"><label>Cliente *</label><select name="customerId" required><option value="">...</option>${cRes.items.map(c=>`<option value="${c.id}" ${c.id===p.customerId?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div>
      <div class="form-field"><label>Gestor *</label><select name="managerId" required>${uRes.items.map(u=>`<option value="${u.id}" ${u.id===p.managerId?'selected':''}>${esc(u.name)}</option>`).join('')}</select></div></div>
      <div class="form-row"><div class="form-field"><label>Status</label><select name="status">${Object.entries(STATUS).map(([k,v])=>`<option value="${k}" ${k===p.status?'selected':''}>${v.label}</option>`).join('')}</select></div>
      <div class="form-field"><label>Orçamento</label><input name="budget" type="number" min="0" step="0.01" value="${p.budget||0}"></div></div>
      <div class="form-row"><div class="form-field"><label>Início</label><input name="startDate" type="date" value="${p.startDate||''}"></div><div class="form-field"><label>Fim</label><input name="endDate" type="date" value="${p.endDate||''}"></div></div>`,
      onSubmit: async (data) => {
        data.customerId = +data.customerId; data.managerId = +data.managerId; data.budget = +data.budget;
        if (id) { await api('PATCH',`/projects/${id}`,data); toast('Atualizado','success'); }
        else { await api('POST','/projects',data); toast('Criado','success'); }
        loadProjects();
      } });
  } catch (e) { toast(e.message,'error'); }
}

/* ================= EQUIPMENTS ================= */
let equipState = { search:'', status:'' };
async function renderEquipments(main) {
  setBreadcrumb(['VETEC','Equipamentos']);
  main.innerHTML = `<div class="view-header"><div><h1>Equipamentos</h1><p class="subtitle">Controle de máquinas industriais</p></div><div class="view-actions"><button class="btn btn-primary" id="new-equip"><i class="fa-solid fa-plus"></i> Novo Equipamento</button></div></div><div class="table-wrap"><div class="table-toolbar"><div class="search-input"><i class="fa-solid fa-magnifying-glass"></i><input type="search" id="equip-search" placeholder="Buscar por nome, código ou local..."></div><div class="filter-tabs" id="equip-filters"><button class="filter-tab active" data-status="">Todos</button>${Object.entries(EQUIP_STATUS).map(([k,v])=>`<button class="filter-tab" data-status="${k}">${v.label}</button>`).join('')}</div></div><div id="equip-table"><div class="loading"><i class="fa-solid fa-spinner fa-spin"></i></div></div></div>`;
  el('new-equip').onclick = () => openEquipModal();
  el('equip-search').oninput = debounce((e)=>{ equipState.search=e.target.value; loadEquipments(); },300);
  $$('#equip-filters .filter-tab').forEach(b=>b.onclick=()=>{ $$('#equip-filters .filter-tab').forEach(x=>x.classList.remove('active')); b.classList.add('active'); equipState.status=b.dataset.status; loadEquipments(); });
  await loadEquipments();
}

async function loadEquipments() {
  const box = el('equip-table'); if (!box) return;
  try {
    const params = new URLSearchParams({ page:1, pageSize:100 });
    if (equipState.search) params.set('search', equipState.search);
    if (equipState.status) params.set('status', equipState.status);
    const { items } = await api('GET', `/equipments?${params}`);
    if (!items.length) { box.innerHTML = `<div class="table-empty"><div class="empty"><i class="fa-solid fa-toolbox"></i><h3>Nenhum equipamento</h3></div></div>`; return; }
    box.innerHTML = `<table class="table"><thead><tr><th>Equipamento</th><th>Tipo</th><th>Local</th><th>Status</th><th>Próx. Manutenção</th><th></th></tr></thead><tbody>${items.map(e=>`<tr><td><div class="cell-main"><div class="recent-icon" style="background:${EQUIP_STATUS[e.status]?.color}20;color:${EQUIP_STATUS[e.status]?.color}"><i class="fa-solid ${EQUIP_STATUS[e.status]?.icon}"></i></div><div><div class="cell-name">${esc(e.name)}</div><div class="cell-sub"><code>${esc(e.code)}</code></div></div></div></td><td>${esc(e.type||'—')}</td><td>${esc(e.location||'—')}</td><td>${badgeEquip(e.status)}</td><td>${formatDate(e.nextMaintenanceDate)}</td><td><div class="row-actions"><button class="btn-icon-ghost" data-edit="${e.id}"><i class="fa-solid fa-pen"></i></button><button class="btn-icon-danger" data-del="${e.id}"><i class="fa-solid fa-trash"></i></button></div></td></tr>`).join('')}</tbody></table>`;
    $$('[data-edit]',box).forEach(b=>b.onclick=()=>openEquipModal(+b.dataset.edit));
    $$('[data-del]',box).forEach(b=>b.onclick=async()=>{ const ok=await confirmDialog({title:'Excluir equipamento?',message:'Não pode ser desfeito.',confirmText:'Excluir',danger:true}); if(!ok)return; try{await api('DELETE',`/equipments/${b.dataset.del}`);toast('Excluído','success');loadEquipments();}catch(e){toast(e.message,'error');} });
  } catch (e) { box.innerHTML = `<div class="table-empty"><div class="error-box">${esc(e.message)}</div></div>`; }
}

async function openEquipModal(id) {
  let e = { name:'', type:'', manufacturer:'', model:'', serialNumber:'', location:'', status:'OPERATIONAL', purchaseDate:'', lastMaintenanceDate:'', nextMaintenanceDate:'', notes:'' };
  if (id) { try { e = await api('GET', `/equipments/${id}`); } catch (err) { toast(err.message,'error'); return; } }
  showModal({ title: id?'Editar Equipamento':'Novo Equipamento', body:`
    <div class="form-field"><label>Nome *</label><input name="name" required value="${esc(e.name)}"></div>
    <div class="form-row"><div class="form-field"><label>Tipo</label><input name="type" value="${esc(e.type||'')}"></div><div class="form-field"><label>Local</label><input name="location" value="${esc(e.location||'')}"></div></div>
    <div class="form-row"><div class="form-field"><label>Fabricante</label><input name="manufacturer" value="${esc(e.manufacturer||'')}"></div><div class="form-field"><label>Modelo</label><input name="model" value="${esc(e.model||'')}"></div></div>
    <div class="form-row"><div class="form-field"><label>Nº de Série</label><input name="serialNumber" value="${esc(e.serialNumber||'')}"></div><div class="form-field"><label>Status</label><select name="status">${Object.entries(EQUIP_STATUS).map(([k,v])=>`<option value="${k}" ${k===e.status?'selected':''}>${v.label}</option>`).join('')}</select></div></div>
    <div class="form-row"><div class="form-field"><label>Últ. Manutenção</label><input name="lastMaintenanceDate" type="date" value="${e.lastMaintenanceDate||''}"></div><div class="form-field"><label>Próx. Manutenção</label><input name="nextMaintenanceDate" type="date" value="${e.nextMaintenanceDate||''}"></div></div>
    <div class="form-field"><label>Observações</label><textarea name="notes">${esc(e.notes||'')}</textarea></div>`,
    onSubmit: async (data) => {
      if (id) { await api('PATCH',`/equipments/${id}`,data); toast('Atualizado','success'); }
      else { await api('POST','/equipments',data); toast('Criado','success'); }
      loadEquipments();
    } });
}

/* ================= TASKS ================= */
let tasksState = { search:'', status:'', priority:'' };
async function renderTasks(main) {
  setBreadcrumb(['VETEC','Tarefas']);
  main.innerHTML = `<div class="view-header"><div><h1>Tarefas</h1><p class="subtitle">Acompanhe as tarefas dos projetos</p></div><div class="view-actions"><button class="btn btn-primary" id="new-task"><i class="fa-solid fa-plus"></i> Nova Tarefa</button></div></div><div class="table-wrap"><div class="table-toolbar"><div class="search-input"><i class="fa-solid fa-magnifying-glass"></i><input type="search" id="task-search" placeholder="Buscar tarefas..."></div><div class="filter-tabs" id="task-filters"><button class="filter-tab active" data-status="">Todas</button>${Object.entries(TASK_STATUS).map(([k,v])=>`<button class="filter-tab" data-status="${k}">${v.label}</button>`).join('')}</div></div><div id="tasks-table"><div class="loading"><i class="fa-solid fa-spinner fa-spin"></i></div></div></div>`;
  el('new-task').onclick = () => openTaskModal();
  el('task-search').oninput = debounce((e)=>{ tasksState.search=e.target.value; loadTasks(); },300);
  $$('#task-filters .filter-tab').forEach(b=>b.onclick=()=>{ $$('#task-filters .filter-tab').forEach(x=>x.classList.remove('active')); b.classList.add('active'); tasksState.status=b.dataset.status; loadTasks(); });
  await loadTasks();
}

async function loadTasks() {
  const box = el('tasks-table'); if (!box) return;
  try {
    const params = new URLSearchParams({ page:1, pageSize:100 });
    if (tasksState.search) params.set('search', tasksState.search);
    if (tasksState.status) params.set('status', tasksState.status);
    const { items } = await api('GET', `/tasks?${params}`);
    if (!items.length) { box.innerHTML = `<div class="table-empty"><div class="empty"><i class="fa-solid fa-list-check"></i><h3>Nenhuma tarefa</h3></div></div>`; return; }
    box.innerHTML = `<table class="table"><thead><tr><th>Tarefa</th><th>Projeto</th><th>Responsável</th><th>Prioridade</th><th>Status</th><th>Prazo</th><th></th></tr></thead><tbody>${items.map(t=>`<tr><td><div class="cell-name">${esc(t.title)}</div></td><td><code>${esc(t.projectCode||'—')}</code></td><td>${esc(t.assigneeName||'—')}</td><td>${badgePriority(t.priority)}</td><td>${badgeTaskStatus(t.status)}</td><td class="${t.overdue?'overdue':''}">${formatDate(t.dueDate)}${t.overdue?' ⚠':''}</td><td><div class="row-actions"><button class="btn-icon-ghost" data-edit="${t.id}"><i class="fa-solid fa-pen"></i></button><button class="btn-icon-danger" data-del="${t.id}"><i class="fa-solid fa-trash"></i></button></div></td></tr>`).join('')}</tbody></table>`;
    $$('[data-edit]',box).forEach(b=>b.onclick=()=>openTaskModal(+b.dataset.edit));
    $$('[data-del]',box).forEach(b=>b.onclick=async()=>{ const ok=await confirmDialog({title:'Excluir tarefa?',message:'Não pode ser desfeito.',confirmText:'Excluir',danger:true}); if(!ok)return; try{await api('DELETE',`/tasks/${b.dataset.del}`);toast('Excluída','success');loadTasks();}catch(e){toast(e.message,'error');} });
  } catch (e) { box.innerHTML = `<div class="table-empty"><div class="error-box">${esc(e.message)}</div></div>`; }
}

async function openTaskModal(id) {
  try {
    const [pRes, uRes] = await Promise.all([api('GET','/projects?page=1&pageSize=100'), api('GET','/users?page=1&pageSize=100').catch(()=>({items:[state.user]}))]);
    let t = { title:'', projectId:'', assigneeId:'', priority:'MEDIUM', status:'TODO', dueDate:'', estimatedHours:0, actualHours:0 };
    if (id) t = await api('GET', `/tasks/${id}`);
    showModal({ title: id?'Editar Tarefa':'Nova Tarefa', body:`
      <div class="form-field"><label>Título *</label><input name="title" required value="${esc(t.title)}"></div>
      <div class="form-row"><div class="form-field"><label>Projeto *</label><select name="projectId" required><option value="">...</option>${pRes.items.map(p=>`<option value="${p.id}" ${p.id===t.projectId?'selected':''}>${esc(p.code)} - ${esc(p.name)}</option>`).join('')}</select></div>
      <div class="form-field"><label>Responsável</label><select name="assigneeId"><option value="">—</option>${uRes.items.map(u=>`<option value="${u.id}" ${u.id===t.assigneeId?'selected':''}>${esc(u.name)}</option>`).join('')}</select></div></div>
      <div class="form-row"><div class="form-field"><label>Prioridade</label><select name="priority">${Object.entries(TASK_PRIORITY).map(([k,v])=>`<option value="${k}" ${k===t.priority?'selected':''}>${v.label}</option>`).join('')}</select></div>
      <div class="form-field"><label>Status</label><select name="status">${Object.entries(TASK_STATUS).map(([k,v])=>`<option value="${k}" ${k===t.status?'selected':''}>${v.label}</option>`).join('')}</select></div></div>
      <div class="form-row"><div class="form-field"><label>Prazo</label><input name="dueDate" type="date" value="${t.dueDate||''}"></div>
      <div class="form-field"><label>Horas estimadas</label><input name="estimatedHours" type="number" min="0" value="${t.estimatedHours||0}"></div></div>`,
      onSubmit: async (data) => {
        data.projectId = +data.projectId;
        if (data.assigneeId) data.assigneeId = +data.assigneeId; else delete data.assigneeId;
        if (id) { await api('PATCH',`/tasks/${id}`,data); toast('Atualizada','success'); }
        else { await api('POST','/tasks',data); toast('Criada','success'); }
        loadTasks();
      } });
  } catch (e) { toast(e.message,'error'); }
}

/* ================= SERVICE ORDERS ================= */
let soState = { search:'', status:'' };
async function renderServiceOrders(main) {
  setBreadcrumb(['VETEC','Ordens de Serviço']);
  main.innerHTML = `<div class="view-header"><div><h1>Ordens de Serviço</h1><p class="subtitle">Manutenções e atendimentos</p></div><div class="view-actions"><button class="btn btn-primary" id="new-so"><i class="fa-solid fa-plus"></i> Nova OS</button></div></div><div class="table-wrap"><div class="table-toolbar"><div class="search-input"><i class="fa-solid fa-magnifying-glass"></i><input type="search" id="so-search" placeholder="Buscar por título ou código..."></div><div class="filter-tabs" id="so-filters"><button class="filter-tab active" data-status="">Todas</button>${Object.entries(SO_STATUS).map(([k,v])=>`<button class="filter-tab" data-status="${k}">${v.label}</button>`).join('')}</div></div><div id="so-table"><div class="loading"><i class="fa-solid fa-spinner fa-spin"></i></div></div></div>`;
  el('new-so').onclick = () => openSOModal();
  el('so-search').oninput = debounce((e)=>{ soState.search=e.target.value; loadSOs(); },300);
  $$('#so-filters .filter-tab').forEach(b=>b.onclick=()=>{ $$('#so-filters .filter-tab').forEach(x=>x.classList.remove('active')); b.classList.add('active'); soState.status=b.dataset.status; loadSOs(); });
  await loadSOs();
}

async function loadSOs() {
  const box = el('so-table'); if (!box) return;
  try {
    const params = new URLSearchParams({ page:1, pageSize:100 });
    if (soState.search) params.set('search', soState.search);
    if (soState.status) params.set('status', soState.status);
    const { items } = await api('GET', `/service-orders?${params}`);
    if (!items.length) { box.innerHTML = `<div class="table-empty"><div class="empty"><i class="fa-solid fa-clipboard-list"></i><h3>Nenhuma OS</h3></div></div>`; return; }
    box.innerHTML = `<table class="table"><thead><tr><th>OS</th><th>Cliente</th><th>Equipamento</th><th>Responsável</th><th>Prioridade</th><th>Status</th><th></th></tr></thead><tbody>${items.map(s=>`<tr><td><div class="cell-main"><div class="recent-icon" style="background:${SO_STATUS[s.status]?.color}20;color:${SO_STATUS[s.status]?.color}"><i class="fa-solid ${SO_STATUS[s.status]?.icon}"></i></div><div><div class="cell-name">${esc(s.title)}</div><div class="cell-sub"><code>${esc(s.code)}</code></div></div></div></td><td>${esc(s.customerName||'—')}</td><td>${esc(s.equipmentName||'—')}</td><td>${esc(s.assigneeName||'—')}</td><td>${badgePriority(s.priority)}</td><td>${badgeSO(s.status)}</td><td><div class="row-actions"><button class="btn-icon-ghost" data-edit="${s.id}"><i class="fa-solid fa-pen"></i></button><button class="btn-icon-danger" data-del="${s.id}"><i class="fa-solid fa-trash"></i></button></div></td></tr>`).join('')}</tbody></table>`;
    $$('[data-edit]',box).forEach(b=>b.onclick=()=>openSOModal(+b.dataset.edit));
    $$('[data-del]',box).forEach(b=>b.onclick=async()=>{ const ok=await confirmDialog({title:'Excluir OS?',message:'Não pode ser desfeito.',confirmText:'Excluir',danger:true}); if(!ok)return; try{await api('DELETE',`/service-orders/${b.dataset.del}`);toast('Excluída','success');loadSOs();}catch(e){toast(e.message,'error');} });
  } catch (e) { box.innerHTML = `<div class="table-empty"><div class="error-box">${esc(e.message)}</div></div>`; }
}

async function openSOModal(id) {
  try {
    const [cRes, pRes, eRes, uRes] = await Promise.all([
      api('GET','/customers?page=1&pageSize=100'),
      api('GET','/projects?page=1&pageSize=100'),
      api('GET','/equipments?page=1&pageSize=100'),
      api('GET','/users?page=1&pageSize=100').catch(()=>({items:[state.user]}))
    ]);
    let s = { title:'', description:'', customerId:'', projectId:'', equipmentId:'', assigneeId:'', priority:'MEDIUM', status:'OPEN', scheduledDate:'', hoursWorked:0, totalCost:0 };
    if (id) s = await api('GET', `/service-orders/${id}`);
    showModal({ title: id?'Editar OS':'Nova Ordem de Serviço', body:`
      <div class="form-field"><label>Título *</label><input name="title" required value="${esc(s.title)}"></div>
      <div class="form-field"><label>Descrição</label><textarea name="description">${esc(s.description||'')}</textarea></div>
      <div class="form-row"><div class="form-field"><label>Cliente *</label><select name="customerId" required><option value="">...</option>${cRes.items.map(c=>`<option value="${c.id}" ${c.id===s.customerId?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div>
      <div class="form-field"><label>Projeto (opcional)</label><select name="projectId"><option value="">—</option>${pRes.items.map(p=>`<option value="${p.id}" ${p.id===s.projectId?'selected':''}>${esc(p.code)}</option>`).join('')}</select></div></div>
      <div class="form-row"><div class="form-field"><label>Equipamento (opcional)</label><select name="equipmentId"><option value="">—</option>${eRes.items.map(e=>`<option value="${e.id}" ${e.id===s.equipmentId?'selected':''}>${esc(e.name)}</option>`).join('')}</select></div>
      <div class="form-field"><label>Responsável</label><select name="assigneeId"><option value="">—</option>${uRes.items.map(u=>`<option value="${u.id}" ${u.id===s.assigneeId?'selected':''}>${esc(u.name)}</option>`).join('')}</select></div></div>
      <div class="form-row"><div class="form-field"><label>Prioridade</label><select name="priority">${Object.entries(TASK_PRIORITY).map(([k,v])=>`<option value="${k}" ${k===s.priority?'selected':''}>${v.label}</option>`).join('')}</select></div>
      <div class="form-field"><label>Status</label><select name="status">${Object.entries(SO_STATUS).map(([k,v])=>`<option value="${k}" ${k===s.status?'selected':''}>${v.label}</option>`).join('')}</select></div></div>
      <div class="form-row"><div class="form-field"><label>Agendamento</label><input name="scheduledDate" type="date" value="${s.scheduledDate||''}"></div>
      <div class="form-field"><label>Horas trabalhadas</label><input name="hoursWorked" type="number" min="0" value="${s.hoursWorked||0}"></div></div>
      <div class="form-field"><label>Custo total (R$)</label><input name="totalCost" type="number" min="0" step="0.01" value="${s.totalCost||0}"></div>`,
      onSubmit: async (data) => {
        data.customerId = +data.customerId;
        if (data.projectId) data.projectId = +data.projectId; else delete data.projectId;
        if (data.equipmentId) data.equipmentId = +data.equipmentId; else delete data.equipmentId;
        if (data.assigneeId) data.assigneeId = +data.assigneeId; else delete data.assigneeId;
        data.hoursWorked = +data.hoursWorked; data.totalCost = +data.totalCost;
        if (id) { await api('PATCH',`/service-orders/${id}`,data); toast('Atualizada','success'); }
        else { await api('POST','/service-orders',data); toast('Criada','success'); }
        loadSOs();
      } });
  } catch (e) { toast(e.message,'error'); }
}

/* ================= USERS ================= */
async function renderUsers(main) {
  setBreadcrumb(['VETEC','Usuários']);
  main.innerHTML = `<div class="view-header"><div><h1>Usuários</h1></div><div class="view-actions"><button class="btn btn-primary" id="new-user"><i class="fa-solid fa-user-plus"></i> Novo Usuário</button></div></div><div class="table-wrap"><div id="users-table"><div class="loading"><i class="fa-solid fa-spinner fa-spin"></i></div></div></div>`;
  el('new-user').onclick = () => openUserModal();
  await loadUsers();
}

async function loadUsers() {
  const box = el('users-table'); if (!box) return;
  try {
    const { items } = await api('GET', '/users?page=1&pageSize=100');
    box.innerHTML = `<table class="table"><thead><tr><th>Usuário</th><th>E-mail</th><th>Perfil</th><th>Status</th><th></th></tr></thead><tbody>${items.map(u=>`<tr><td><div class="cell-main"><div class="cell-avatar">${initials(u.name)}</div><div><div class="cell-name">${esc(u.name)}</div><div class="cell-sub">#${u.id}</div></div></div></td><td>${esc(u.email)}</td><td>${badgeRole(u.role)}</td><td>${u.active?'<span class="badge badge-status-COMPLETED">Ativo</span>':'<span class="badge badge-status-CANCELLED">Inativo</span>'}</td><td><div class="row-actions"><button class="btn-icon-danger" data-del="${u.id}" ${u.id===state.user.id?'disabled':''}><i class="fa-solid fa-trash"></i></button></div></td></tr>`).join('')}</tbody></table>`;
    $$('[data-del]',box).forEach(b=>b.onclick=async()=>{ const ok=await confirmDialog({title:'Excluir usuário?',message:'Perderá acesso ao sistema.',confirmText:'Excluir',danger:true}); if(!ok)return; try{await api('DELETE',`/users/${b.dataset.del}`);toast('Excluído','success');loadUsers();}catch(e){toast(e.message,'error');} });
  } catch (e) { box.innerHTML = `<div class="table-empty"><div class="error-box">${esc(e.message)}</div></div>`; }
}

function openUserModal() {
  showModal({ title:'Novo Usuário', body:`
    <div class="form-field"><label>Nome *</label><input name="name" required></div>
    <div class="form-field"><label>E-mail *</label><input name="email" type="email" required></div>
    <div class="form-field"><label>Senha * (mín. 8)</label><input name="password" type="password" required minlength="8"></div>
    <div class="form-field"><label>Perfil</label><select name="role"><option value="VIEWER">Visualizador</option><option value="TECHNICIAN">Técnico</option><option value="MANAGER">Gestor</option><option value="ADMIN">Administrador</option></select></div>`,
    onSubmit: async (data) => { await api('POST','/users',data); toast('Criado','success'); loadUsers(); } });
}

/* ================= NOTIFICATIONS ================= */
async function renderNotifications(main) {
  setBreadcrumb(['VETEC','Notificações']);
  main.innerHTML = `<div class="view-header"><div><h1>Notificações</h1><p class="subtitle">Suas notificações</p></div><div class="view-actions"><button class="btn btn-ghost btn-sm" id="read-all"><i class="fa-solid fa-check-double"></i> Marcar todas como lidas</button></div></div><div id="notif-container"><div class="loading"><i class="fa-solid fa-spinner fa-spin"></i></div></div>`;
  el('read-all').onclick = async () => { try { await api('POST','/notifications/read-all'); toast('Todas marcadas','success'); renderNotifications(main); refreshNotifCount(); } catch (e) { toast(e.message,'error'); } };
  try {
    const { items } = await api('GET', '/notifications');
    if (!items.length) { el('notif-container').innerHTML = `<div class="empty"><i class="fa-solid fa-bell-slash"></i><h3>Sem notificações</h3></div>`; return; }
    el('notif-container').innerHTML = `<div class="notif-list">${items.map(n => `<div class="notif-item ${n.read?'':'unread'}"><div class="notif-icon ${n.type}"><i class="fa-solid ${NOTIF_ICONS[n.type]||'fa-bell'}"></i></div><div class="notif-body"><strong>${esc(n.title)}</strong><p>${esc(n.message)}</p><span>${formatDateTime(n.createdAt)}</span></div><div class="notif-actions">${!n.read?`<button class="btn-icon-ghost" data-read="${n.id}" title="Marcar lida"><i class="fa-solid fa-check"></i></button>`:''}<button class="btn-icon-danger" data-del="${n.id}"><i class="fa-solid fa-trash"></i></button></div></div>`).join('')}</div>`;
    $$('[data-read]').forEach(b => b.onclick = async () => { try { await api('PATCH',`/notifications/${b.dataset.read}/read`); renderNotifications(main); refreshNotifCount(); } catch (e) { toast(e.message,'error'); } });
    $$('[data-del]').forEach(b => b.onclick = async () => { try { await api('DELETE',`/notifications/${b.dataset.del}`); renderNotifications(main); refreshNotifCount(); } catch (e) { toast(e.message,'error'); } });
  } catch (e) { el('notif-container').innerHTML = `<div class="error-box">${esc(e.message)}</div>`; }
}

/* ================= AUDIT ================= */
async function renderAudit(main) {
  setBreadcrumb(['VETEC','Auditoria']);
  main.innerHTML = `<div class="view-header"><div><h1>Auditoria</h1><p class="subtitle">Log completo de ações no sistema</p></div><div class="view-actions"><button class="btn btn-ghost btn-sm" id="refresh-audit"><i class="fa-solid fa-rotate"></i> Atualizar</button></div></div><div class="table-wrap"><div id="audit-table"><div class="loading"><i class="fa-solid fa-spinner fa-spin"></i></div></div></div>`;
  el('refresh-audit').onclick = () => loadAudit();
  await loadAudit();
}

async function loadAudit() {
  const box = el('audit-table'); if (!box) return;
  try {
    const { items } = await api('GET', '/audit?limit=200');
    if (!items.length) { box.innerHTML = `<div class="table-empty"><div class="empty"><i class="fa-solid fa-clock-rotate-left"></i><h3>Sem registros</h3></div></div>`; return; }
    const icons = { LOGIN:'fa-right-to-bracket', CREATE:'fa-plus', UPDATE:'fa-pen', DELETE:'fa-trash' };
    const colors = { LOGIN:'#3b82f6', CREATE:'#22c55e', UPDATE:'#f59e0b', DELETE:'#ef4444' };
    box.innerHTML = `<table class="table"><thead><tr><th>Quando</th><th>Ator</th><th>Ação</th><th>Recurso</th></tr></thead><tbody>${items.map(a => `<tr><td>${formatDateTime(a.at)}</td><td><div class="cell-main"><div class="cell-avatar">${initials(a.actorName||'?')}</div><div>${esc(a.actorName||'Sistema')}</div></div></td><td><span class="badge" style="background:${colors[a.action]}20;color:${colors[a.action]}"><i class="fa-solid ${icons[a.action]||'fa-circle'}"></i> ${a.action}</span></td><td><code>${esc(a.resource)}${a.resourceId?'#'+a.resourceId:''}</code></td></tr>`).join('')}</tbody></table>`;
  } catch (e) { box.innerHTML = `<div class="table-empty"><div class="error-box">${esc(e.message)}</div></div>`; }
}

/* ================= MODAL ================= */
function showModal({ title, body, onSubmit }) {
  const ov = document.createElement('div');
  ov.className = 'modal-overlay';
  ov.innerHTML = `<form class="modal"><div class="modal-header"><h2>${esc(title)}</h2><button type="button" class="modal-close" data-close><i class="fa-solid fa-xmark"></i></button></div><div class="modal-body">${body}</div><div class="modal-actions"><button type="button" class="btn btn-ghost" data-close>Cancelar</button><button type="submit" class="btn btn-primary"><i class="fa-solid fa-check"></i> Salvar</button></div><div class="modal-error"></div></form>`;
  document.body.appendChild(ov);
  const form = ov.querySelector('form');
  const close = () => ov.remove();
  ov.querySelectorAll('[data-close]').forEach(b => b.onclick = close);
  ov.onclick = (e) => { if (e.target === ov) close(); };
  form.onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    for (const k of Object.keys(data)) if (data[k] === '') delete data[k];
    const submitBtn = form.querySelector('button[type=submit]');
    submitBtn.disabled = true; const orig = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
    try { await onSubmit(data); close(); }
    catch (err) { form.querySelector('.modal-error').textContent = err.message; submitBtn.disabled = false; submitBtn.innerHTML = orig; }
  };
}

/* ================= GLOBAL SEARCH ================= */
function openGlobalSearch() {
  const ov = document.createElement('div');
  ov.className = 'modal-overlay';
  ov.innerHTML = `<div class="modal search-modal"><div class="search-modal-input"><i class="fa-solid fa-magnifying-glass"></i><input type="search" id="gs-input" placeholder="Buscar clientes, projetos, tarefas, equipamentos..." autofocus><kbd>Esc</kbd></div><div class="search-results" id="gs-results"><div class="search-empty">Digite para buscar...</div></div></div>`;
  document.body.appendChild(ov);
  const close = () => { ov.remove(); document.removeEventListener('keydown', escFn); };
  const escFn = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', escFn);
  ov.onclick = (e) => { if (e.target === ov) close(); };
  const input = el('gs-input');
  const results = el('gs-results');
  const search = debounce(async (q) => {
    if (!q || q.length < 2) { results.innerHTML = '<div class="search-empty">Digite ao menos 2 caracteres...</div>'; return; }
    try {
      const [c, p, t, e] = await Promise.all([
        api('GET', `/customers?page=1&pageSize=5&search=${encodeURIComponent(q)}`),
        api('GET', `/projects?page=1&pageSize=5&search=${encodeURIComponent(q)}`),
        api('GET', `/tasks?page=1&pageSize=5&search=${encodeURIComponent(q)}`),
        api('GET', `/equipments?page=1&pageSize=5&search=${encodeURIComponent(q)}`),
      ]);
      let html = '';
      if (c.items.length) { html += '<div class="search-group-title">Clientes</div>'; html += c.items.map(x => `<button class="search-result" data-type="customer" data-id="${x.id}"><div class="search-result-icon"><i class="fa-solid fa-building"></i></div><div class="search-result-body"><strong>${esc(x.name)}</strong><span>${formatCNPJ(x.cnpj)}</span></div></button>`).join(''); }
      if (p.items.length) { html += '<div class="search-group-title">Projetos</div>'; html += p.items.map(x => `<button class="search-result" data-type="project" data-id="${x.id}"><div class="search-result-icon"><i class="fa-solid ${STATUS[x.status]?.icon}"></i></div><div class="search-result-body"><strong>${esc(x.name)}</strong><span>${esc(x.code)}</span></div></button>`).join(''); }
      if (t.items.length) { html += '<div class="search-group-title">Tarefas</div>'; html += t.items.map(x => `<button class="search-result" data-type="task" data-id="${x.id}"><div class="search-result-icon"><i class="fa-solid fa-list-check"></i></div><div class="search-result-body"><strong>${esc(x.title)}</strong><span>${esc(x.projectCode||'')}</span></div></button>`).join(''); }
      if (e.items.length) { html += '<div class="search-group-title">Equipamentos</div>'; html += e.items.map(x => `<button class="search-result" data-type="equip" data-id="${x.id}"><div class="search-result-icon"><i class="fa-solid fa-toolbox"></i></div><div class="search-result-body"><strong>${esc(x.name)}</strong><span>${esc(x.code)}</span></div></button>`).join(''); }
      results.innerHTML = html || '<div class="search-empty">Nenhum resultado</div>';
      $$('.search-result', results).forEach(b => b.onclick = () => {
        close();
        const t = b.dataset.type, id = +b.dataset.id;
        if (t === 'customer') openCustomerModal(id);
        if (t === 'project') openProjectModal(id);
        if (t === 'task') openTaskModal(id);
        if (t === 'equip') openEquipModal(id);
      });
    } catch (e) { results.innerHTML = `<div class="search-empty">${esc(e.message)}</div>`; }
  }, 250);
  input.oninput = (e) => search(e.target.value);
  input.focus();
}

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); if (state.token) openGlobalSearch(); }
});

/* ================= INIT ================= */
applyTheme();
render();
/* VETEC RBAC-VIEWER: oculta ações de edição para VIEWER */
(function () {
  const orig = window.renderView;
  if (typeof orig === 'function') {
    window.renderView = function () {
      const r = orig.apply(this, arguments);
      if (state && state.user && state.user.role === 'VIEWER') {
        document.querySelectorAll('[data-edit],[data-del],.btn-edit,.btn-del,.action-edit,.action-delete')
          .forEach(b => { b.style.display = 'none'; });
      }
      return r;
    };
  }
})();


/* ============================================================
 * VETEC — Módulo Comercial (Clientes)
 * ============================================================ */
(function () {
  'use strict';

  const fmtDoc = (v) => {
    const d = String(v || '').replace(/\D/g, '');
    if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    return v || '';
  };

  const STATUS_LABELS = {
    ACTIVE: 'Ativo',
    BLOCKED: 'Bloqueado',
    INACTIVE: 'Inativo',
  };

  const SEGMENTS = [
    'Metalurgia', 'Construção Civil', 'Alimentício', 'Automotivo',
    'Químico', 'Farmacêutico', 'Energia', 'Papel e Celulose',
    'Mineração', 'Outros',
  ];

  // ---------- render principal ----------
  async function renderCustomers(container) {
    const canWrite = canWriteCustomers();

    container.innerHTML =
      '<div class="page-header">' +
        '<div><h1>Clientes</h1><p class="muted">Cadastro comercial de clientes</p></div>' +
        (canWrite ? '<button class="btn btn-primary" id="btn-new-customer"><i class="fa-solid fa-plus"></i> Novo Cliente</button>' : '') +
      '</div>' +
      '<div class="card">' +
        '<div class="filter-bar">' +
          '<input type="search" id="customer-search" class="input" placeholder="Buscar por razão social, CNPJ ou e-mail...">' +
          '<select id="customer-status" class="input">' +
            '<option value="">Todos os status</option>' +
            '<option value="ACTIVE">Ativos</option>' +
            '<option value="BLOCKED">Bloqueados</option>' +
            '<option value="INACTIVE">Inativos</option>' +
          '</select>' +
        '</div>' +
        '<div id="customers-list"><div class="loading"><i class="fa-solid fa-spinner fa-spin"></i></div></div>' +
      '</div>';

    if (canWrite) {
      el('btn-new-customer').onclick = () => openCustomerModal(null);
    }

    const searchEl = el('customer-search');
    const statusEl = el('customer-status');
    const reload = () => loadCustomers();
    let t;
    searchEl.oninput = () => { clearTimeout(t); t = setTimeout(reload, 250); };
    statusEl.onchange = reload;

    await loadCustomers();
  }

  function canWriteCustomers() {
    const u = (typeof state !== 'undefined' && state.user) ? state.user : null;
    if (!u) return false;
    if (u.role === 'ADMIN') return true;
    if (u.role === 'VIEWER') return false;
    // MANAGER/TECHNICIAN só escrevem se forem do comercial
    return u.sector === 'COMERCIAL';
  }

  async function loadCustomers() {
    const box = el('customers-list');
    if (!box) return;
    const q = new URLSearchParams();
    const s = el('customer-search') && el('customer-search').value.trim();
    const st = el('customer-status') && el('customer-status').value;
    if (s) q.set('search', s);
    if (st) q.set('status', st);

    try {
      const data = await api('GET', '/customers?' + q.toString());
      const items = data.items || [];
      if (!items.length) {
        box.innerHTML = '<div class="empty-state">Nenhum cliente cadastrado.</div>';
        return;
      }
      box.innerHTML =
        '<table class="table">' +
          '<thead><tr>' +
            '<th>Código</th><th>Razão Social</th><th>CNPJ/CPF</th>' +
            '<th>Segmento</th><th>Status</th><th class="text-right">Ações</th>' +
          '</tr></thead>' +
          '<tbody>' +
          items.map(c =>
            '<tr>' +
              '<td><code>' + esc(c.code) + '</code></td>' +
              '<td><strong>' + esc(c.tradeName || c.legalName) + '</strong>' +
                (c.tradeName && c.tradeName !== c.legalName ? '<div class="muted small">' + esc(c.legalName) + '</div>' : '') +
              '</td>' +
              '<td>' + esc(fmtDoc(c.document)) + '</td>' +
              '<td>' + esc(c.segment || '—') + '</td>' +
              '<td><span class="badge badge-' + (c.status === 'ACTIVE' ? 'success' : c.status === 'BLOCKED' ? 'danger' : 'muted') + '">' +
                esc(STATUS_LABELS[c.status] || c.status) + '</span></td>' +
              '<td class="text-right">' +
                '<button class="btn-icon" data-view="' + c.id + '" title="Ver"><i class="fa-solid fa-eye"></i></button>' +
                (canWriteCustomers() ? '<button class="btn-icon" data-edit="' + c.id + '" title="Editar"><i class="fa-solid fa-pen"></i></button>' : '') +
                (canWriteCustomers() ? '<button class="btn-icon text-danger" data-del="' + c.id + '" title="Excluir"><i class="fa-solid fa-trash"></i></button>' : '') +
              '</td>' +
            '</tr>'
          ).join('') +
          '</tbody>' +
        '</table>' +
        '<div class="table-footer muted small">' + data.total + ' cliente(s) — página ' + data.page + '</div>';

      box.querySelectorAll('[data-view]').forEach(b =>
        b.onclick = () => openCustomerModal(b.dataset.view, true));
      box.querySelectorAll('[data-edit]').forEach(b =>
        b.onclick = () => openCustomerModal(b.dataset.edit, false));
      box.querySelectorAll('[data-del]').forEach(b =>
        b.onclick = () => deleteCustomer(b.dataset.del));
    } catch (e) {
      box.innerHTML = '<div class="error-state">' + esc(e.message) + '</div>';
    }
  }

  async function openCustomerModal(id, readOnly) {
    let customer = {
      type: 'PJ', document: '', legalName: '', tradeName: '', stateRegistration: '',
      email: '', phone: '', segment: '', status: 'ACTIVE',
      address: { zip: '', street: '', number: '', complement: '', district: '', city: '', state: '' },
    };
    if (id) {
      try {
        customer = await api('GET', '/customers/' + id);
      } catch (e) {
        alert('Erro ao carregar cliente: ' + e.message);
        return;
      }
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML =
      '<div class="modal modal-lg">' +
        '<div class="modal-header">' +
          '<h2>' + (id ? (readOnly ? 'Visualizar' : 'Editar') : 'Novo') + ' Cliente</h2>' +
          '<button class="btn-close" id="cust-close">&times;</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<form id="cust-form" class="form-grid">' +
            '<h3 class="form-section">Identificação</h3>' +
            '<label>Tipo' +
              '<select name="type" ' + (readOnly ? 'disabled' : '') + '>' +
                '<option value="PJ"' + (customer.type === 'PJ' ? ' selected' : '') + '>Pessoa Jurídica</option>' +
                '<option value="PF"' + (customer.type === 'PF' ? ' selected' : '') + '>Pessoa Física</option>' +
              '</select>' +
            '</label>' +
            '<label>CNPJ / CPF *' +
              '<input name="document" required value="' + esc(customer.document) + '" ' + (readOnly ? 'disabled' : '') + '>' +
            '</label>' +
            '<label class="span-2">Razão Social *' +
              '<input name="legalName" required value="' + esc(customer.legalName) + '" ' + (readOnly ? 'disabled' : '') + '>' +
            '</label>' +
            '<label class="span-2">Nome Fantasia' +
              '<input name="tradeName" value="' + esc(customer.tradeName || '') + '" ' + (readOnly ? 'disabled' : '') + '>' +
            '</label>' +
            '<label>Inscrição Estadual' +
              '<input name="stateRegistration" value="' + esc(customer.stateRegistration || '') + '" ' + (readOnly ? 'disabled' : '') + '>' +
            '</label>' +
            '<label>Segmento' +
              '<select name="segment" ' + (readOnly ? 'disabled' : '') + '>' +
                '<option value="">—</option>' +
                SEGMENTS.map(s => '<option value="' + esc(s) + '"' + (customer.segment === s ? ' selected' : '') + '>' + esc(s) + '</option>').join('') +
              '</select>' +
            '</label>' +

            '<h3 class="form-section">Contato</h3>' +
            '<label>E-mail' +
              '<input type="email" name="email" value="' + esc(customer.email || '') + '" ' + (readOnly ? 'disabled' : '') + '>' +
            '</label>' +
            '<label>Telefone' +
              '<input name="phone" value="' + esc(customer.phone || '') + '" ' + (readOnly ? 'disabled' : '') + '>' +
            '</label>' +

            '<h3 class="form-section">Endereço</h3>' +
            '<label>CEP<input name="address.zip" value="' + esc(customer.address && customer.address.zip || '') + '" ' + (readOnly ? 'disabled' : '') + '></label>' +
            '<label class="span-2">Logradouro<input name="address.street" value="' + esc(customer.address && customer.address.street || '') + '" ' + (readOnly ? 'disabled' : '') + '></label>' +
            '<label>Número<input name="address.number" value="' + esc(customer.address && customer.address.number || '') + '" ' + (readOnly ? 'disabled' : '') + '></label>' +
            '<label>Complemento<input name="address.complement" value="' + esc(customer.address && customer.address.complement || '') + '" ' + (readOnly ? 'disabled' : '') + '></label>' +
            '<label>Bairro<input name="address.district" value="' + esc(customer.address && customer.address.district || '') + '" ' + (readOnly ? 'disabled' : '') + '></label>' +
            '<label>Cidade<input name="address.city" value="' + esc(customer.address && customer.address.city || '') + '" ' + (readOnly ? 'disabled' : '') + '></label>' +
            '<label>UF<input name="address.state" maxlength="2" value="' + esc(customer.address && customer.address.state || '') + '" ' + (readOnly ? 'disabled' : '') + '></label>' +

            '<h3 class="form-section">Situação</h3>' +
            '<label>Status' +
              '<select name="status" ' + (readOnly ? 'disabled' : '') + '>' +
                '<option value="ACTIVE"' + (customer.status === 'ACTIVE' ? ' selected' : '') + '>Ativo</option>' +
                '<option value="BLOCKED"' + (customer.status === 'BLOCKED' ? ' selected' : '') + '>Bloqueado</option>' +
                '<option value="INACTIVE"' + (customer.status === 'INACTIVE' ? ' selected' : '') + '>Inativo</option>' +
              '</select>' +
            '</label>' +
            '<label class="span-2">Observações' +
              '<textarea name="notes" rows="3" ' + (readOnly ? 'disabled' : '') + '>' + esc(customer.notes || '') + '</textarea>' +
            '</label>' +
          '</form>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn" id="cust-cancel">' + (readOnly ? 'Fechar' : 'Cancelar') + '</button>' +
          (readOnly ? '' : '<button class="btn btn-primary" id="cust-save">Salvar</button>') +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    el('cust-close').onclick = () => overlay.remove();
    el('cust-cancel').onclick = () => overlay.remove();

    if (!readOnly) {
      el('cust-save').onclick = async () => {
        const fd = new FormData(el('cust-form'));
        const payload = {
          type: fd.get('type'),
          document: fd.get('document'),
          legalName: fd.get('legalName'),
          tradeName: fd.get('tradeName'),
          stateRegistration: fd.get('stateRegistration'),
          email: fd.get('email'),
          phone: fd.get('phone'),
          segment: fd.get('segment'),
          status: fd.get('status'),
          notes: fd.get('notes'),
          address: {
            zip: fd.get('address.zip'),
            street: fd.get('address.street'),
            number: fd.get('address.number'),
            complement: fd.get('address.complement'),
            district: fd.get('address.district'),
            city: fd.get('address.city'),
            state: fd.get('address.state'),
          },
        };
        try {
          if (id) await api('PUT', '/customers/' + id, payload);
          else await api('POST', '/customers', payload);
          overlay.remove();
          loadCustomers();
        } catch (e) {
          alert('Erro: ' + e.message);
        }
      };
    }
  }

  async function deleteCustomer(id) {
    if (!confirm('Excluir este cliente? Esta ação não pode ser desfeita.')) return;
    try {
      await api('DELETE', '/customers/' + id);
      loadCustomers();
    } catch (e) {
      alert('Erro ao excluir: ' + e.message);
    }
  }

  // ---------- integração com o shell ----------
  const VIEW_ID = 'customers';
  const NAV_LABEL = 'Clientes';
  const NAV_ICON = 'fa-address-book';

  // 1) Intercepta renderView para desenhar a nossa view
  function installViewHook() {
    if (typeof window.renderView !== 'function') return false;
    if (window.__VETEC_CUSTOMERS_HOOKED__) return true;
    const orig = window.renderView;
    window.renderView = function () {
      if (typeof state !== 'undefined' && state.view === VIEW_ID) {
        const main = (typeof el === 'function' && el('main-content'))
          || document.querySelector('main')
          || document.querySelector('#app');
        if (main) {
          renderCustomers(main);
          return;
        }
      }
      return orig.apply(this, arguments);
    };
    window.__VETEC_CUSTOMERS_HOOKED__ = true;
    return true;
  }

  // 2) Injeta botão no menu
  function installNavHook() {
    if (window.__VETEC_CUSTOMERS_NAV__) return;
    const inject = () => {
      const nav = document.querySelector('.sidebar nav, .sidebar-menu, nav.sidebar, #sidebar-nav, .nav-list');
      if (!nav) return;
      if (nav.querySelector('[data-view="' + VIEW_ID + '"]')) return;
      const btn = document.createElement('button');
      btn.className = 'nav-item';
      btn.dataset.view = VIEW_ID;
      btn.innerHTML = '<i class="fa-solid ' + NAV_ICON + '"></i> <span>' + NAV_LABEL + '</span>';
      btn.onclick = () => {
        state.view = VIEW_ID;
        if (typeof renderView === 'function') renderView();
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        btn.classList.add('active');
      };
      nav.appendChild(btn);
    };
    const iv = setInterval(() => {
      const nav = document.querySelector('.sidebar nav, .sidebar-menu, nav.sidebar, #sidebar-nav, .nav-list');
      if (nav) { inject(); clearInterval(iv); }
    }, 200);
    setTimeout(() => clearInterval(iv), 5000);
  }

  // 3) Aplica CSS do menu quando a classe 'nav-item' não existir (fallback)
  function installInit() {
    const tryInit = () => {
      if (typeof state !== 'undefined' && typeof renderView === 'function') {
        installViewHook();
        installNavHook();
        return true;
      }
      return false;
    };
    if (!tryInit()) {
      const iv = setInterval(() => { if (tryInit()) clearInterval(iv); }, 200);
      setTimeout(() => clearInterval(iv), 8000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installInit);
  } else {
    installInit();
  }
})();


function formatDoc(doc) {
  if (!doc) return '-';
  doc = String(doc).replace(/\D/g, '');
  if (doc.length === 11) return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (doc.length === 14) return doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return doc;
}


/* ================= DROPDOWN DO USUÁRIO ================= */
function toggleUserDropdown(e) {
  if (e) e.stopPropagation();
  let drop = el('user-dropdown');
  if (drop) { drop.remove(); return; }

  drop = document.createElement('div');
  drop.id = 'user-dropdown';
  drop.className = 'user-dropdown';
  drop.innerHTML = `
    <div class="user-dropdown-header">
      <div class="avatar-large">${(state.user.name || 'U').substring(0, 2).toUpperCase()}</div>
      <div>
        <div class="user-dropdown-name">${esc(state.user.name)}</div>
        <div class="user-dropdown-email">${esc(state.user.email)}</div>
        <div class="user-dropdown-role">${state.user.role}</div>
      </div>
    </div>
    <div class="user-dropdown-body">
      <button class="user-dropdown-item text-danger" onclick="logout()">
        <i class="fa-solid fa-arrow-right-from-bracket"></i> Sair da conta
      </button>
    </div>
  `;

  // Posiciona abaixo do botão
  const trigger = document.querySelector('.topbar-user-trigger');
  if (trigger) {
    const rect = trigger.getBoundingClientRect();
    drop.style.position = 'fixed';
    drop.style.top = (rect.bottom + 8) + 'px';
    drop.style.right = (window.innerWidth - rect.right) + 'px';
  }

  document.body.appendChild(drop);

  // Fecha ao clicar fora
  const close = (ev) => {
    if (!drop.contains(ev.target) && !trigger.contains(ev.target)) {
      drop.remove();
      document.removeEventListener('click', close);
    }
  };
  setTimeout(() => document.addEventListener('click', close), 0);
}

function logout() {
  // Limpa token/estado e volta pro login
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  state.user = null;
  state.token = null;
  window.location.reload();
}

function setCustomerFilter(btn, status) {
  document.querySelectorAll('.filter-tab').forEach(b => {
    b.classList.remove('active');
    b.style.background = 'transparent';
    b.style.color = 'var(--text-muted)';
  });
  btn.classList.add('active');
  btn.style.background = 'var(--accent)';
  btn.style.color = '#fff';
  window.customerStatus = status;
  loadCustomers();
}

function formatDoc(doc) {
  if (!doc) return '-';
  doc = String(doc).replace(/\D/g, '');
  if (doc.length === 11) return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (doc.length === 14) return doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1/$2-$3');
  return doc;
}


/* ================= OVERRIDE: MODULE CUSTOMERS ================= */
// Redireciona a chamada antiga do app.js para o novo módulo limpo
window.renderCustomers = async function(main) {
  if (window.CustomerModule) {
    await window.CustomerModule.render(main);
  } else {
    console.error('CustomerModule não carregado! Verifique o index.html');
  }
};
