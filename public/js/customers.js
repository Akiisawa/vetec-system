
/* ================= PATCH DEFINITIVO: CLIENTES ================= */
(function() {
  console.log('🚀 Patch de Clientes carregado!');

  // Injetar CSS (Força a aplicação dos estilos)
  const style = document.createElement('style');
  style.innerHTML = `
    /* Correções de Layout */
    .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
    .page-title { font-size: 24px; font-weight: 700; color: var(--text, #fff); margin: 0 0 4px 0; }
    .page-subtitle { font-size: 14px; color: var(--text-muted, #888); margin: 0; }
    
    /* Barra de Filtros Moderna */
    .filter-bar-modern { display: flex; gap: 16px; align-items: center; margin-bottom: 24px; flex-wrap: wrap; }
    .search-box { position: relative; flex: 1; max-width: 400px; }
    .search-box i { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted, #888); }
    .search-box input { width: 100%; padding: 10px 14px 10px 38px; border: 1px solid var(--border, #333); border-radius: var(--r, 8px); background: var(--bg-1, #111); color: var(--text, #fff); outline: none; transition: border 0.2s; }
    .search-box input:focus { border-color: var(--accent, #3b82f6); }
    
    .filter-tabs { display: flex; gap: 4px; background: var(--bg-2, #222); padding: 4px; border-radius: var(--r, 8px); border: 1px solid var(--border, #333); }
    .filter-tab { padding: 8px 16px; border: none; background: transparent; color: var(--text-muted, #888); font-size: 13px; font-weight: 500; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
    .filter-tab:hover { color: var(--text, #fff); }
    .filter-tab.active { background: var(--accent, #3b82f6); color: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
    
    /* Botões de Ação */
    .btn-icon { background: transparent; border: none; cursor: pointer; color: var(--text-muted, #888); padding: 6px; border-radius: 4px; transition: 0.2s; }
    .btn-icon:hover { background: var(--bg-1, #111); color: var(--text, #fff); }
    .text-danger:hover { color: #ef4444; }
  `;
  document.head.appendChild(style);

  let activeInterceptors = {};

  // Observador que fica de olho na tela
  const observer = new MutationObserver(() => {
    const h1 = document.querySelector('h1');
    // Se estamos na tela de Clientes e ela ainda não foi patchada
    if (h1 && h1.textContent.trim() === 'Clientes' && !document.querySelector('.patched-customers')) {
      document.body.classList.add('patched-customers');
      patchCustomersScreen();
    } else if (h1 && h1.textContent.trim() !== 'Clientes') {
      // Se saiu da tela, limpa a flag para permitir patch novamente na próxima vez
      document.body.classList.remove('patched-customers');
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  function patchCustomersScreen() {
    // Pega a área principal
    const main = document.querySelector('main') || document.querySelector('.main-content') || document.body;
    
    // Encontra a tabela antiga (para pegar os dados atuais)
    const oldTable = main.querySelector('table');
    const oldSearch = main.querySelector('input[type="text"]');
    const oldSelect = main.querySelector('select');
    
    if (!oldTable && !oldSearch) return; // Não achou a estrutura esperada

    const currentSearch = oldSearch ? oldSearch.value : '';
    const currentStatus = oldSelect ? oldSelect.value : '';

    // Substitui o HTML da tela inteira
    main.innerHTML = `
      <div class="page-header patched-customers">
        <div>
          <h1 class="page-title">Clientes</h1>
          <p class="page-subtitle">Cadastro comercial de clientes</p>
        </div>
        <button class="btn btn-primary" id="btn-new-customer">
          <i class="fa-solid fa-plus"></i> Novo Cliente
        </button>
      </div>

      <div class="card">
        <div class="filter-bar-modern">
          <div class="search-box">
            <i class="fa-solid fa-search"></i>
            <input type="text" id="cust-search" placeholder="Buscar por nome, CNPJ ou e-mail..." value="${currentSearch}">
          </div>
          <div class="filter-tabs" id="cust-tabs">
            <button class="filter-tab ${currentStatus === '' ? 'active' : ''}" data-status="">Todos</button>
            <button class="filter-tab ${currentStatus === 'ACTIVE' ? 'active' : ''}" data-status="ACTIVE">Ativos</button>
            <button class="filter-tab ${currentStatus === 'INACTIVE' ? 'active' : ''}" data-status="INACTIVE">Inativos</button>
            <button class="filter-tab ${currentStatus === 'BLOCKED' ? 'active' : ''}" data-status="BLOCKED">Bloqueados</button>
          </div>
        </div>
        <div id="customers-table-container">
          <!-- A tabela antiga vai ser movida pra cá para manter os dados -->
          ${oldTable ? oldTable.outerHTML : '<div style="padding: 20px;">Carregando dados...</div>'}
        </div>
      </div>
    `;

    // Reconectar busca
    const newSearch = document.getElementById('cust-search');
    newSearch.addEventListener('input', (e) => {
      if (oldSearch) {
        oldSearch.value = e.target.value;
        oldSearch.dispatchEvent(new Event('input'));
        oldSearch.dispatchEvent(new Event('keyup'));
      }
    });

    // Reconectar Abas
    document.querySelectorAll('.filter-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (oldSelect) {
          oldSelect.value = btn.dataset.status;
          oldSelect.dispatchEvent(new Event('change'));
        }
      });
    });

    // Reconectar botão "Novo Cliente"
    document.getElementById('btn-new-customer').addEventListener('click', () => {
      // Procura o botão original de novo cliente escondido e clica nele
      const oldBtn = main.querySelector('button');
      // Se não achar, tentamos invocar a função se ela existir
      if (typeof window.openCustomerModal === 'function') window.openCustomerModal();
      else if (oldBtn) oldBtn.click();
      else alert('Função de criar cliente não encontrada no sistema antigo.');
    });
  }
})();
