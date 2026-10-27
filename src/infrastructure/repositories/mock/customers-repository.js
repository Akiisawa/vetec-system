// src/infrastructure/repositories/mock/customers-repository.js
'use strict';

const db = { customers: [], nextId: 1 };

// seed opcional — 2 clientes de exemplo
db.customers.push(
  {
    id: db.nextId++,
    code: 'CLI-0001',
    type: 'PJ',
    document: '12.345.678/0001-90',
    legalName: 'Indústria Metalúrgica Alfa Ltda',
    tradeName: 'Alfa Metal',
    stateRegistration: '110.042.490',
    email: 'contato@alfametal.com.br',
    phone: '(11) 3456-7890',
    segment: 'Metalurgia',
    status: 'ACTIVE',
    sellerId: 1,
    address: {
      zip: '01310-100',
      street: 'Av. Paulista',
      number: '1000',
      complement: 'Sala 42',
      district: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
    },
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: db.nextId++,
    code: 'CLI-0002',
    type: 'PJ',
    document: '98.765.432/0001-10',
    legalName: 'Construtora Beta S.A.',
    tradeName: 'Beta Engenharia',
    stateRegistration: '220.111.222',
    email: 'compras@beta.com.br',
    phone: '(21) 3333-4444',
    segment: 'Construção Civil',
    status: 'ACTIVE',
    sellerId: 1,
    address: {
      zip: '20040-020',
      street: 'Av. Rio Branco',
      number: '156',
      complement: '',
      district: 'Centro',
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
);

function paginate(items, query) {
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 20;
  const total = items.length;
  return {
    items: items.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize),
    total, page, pageSize,
  };
}

const CustomersRepository = {
  list(query = {}, user = null) {
    let items = [...db.customers];

    if (query.search) {
      const s = query.search.toLowerCase();
      items = items.filter(c =>
        (c.legalName && c.legalName.toLowerCase().includes(s)) ||
        (c.tradeName && c.tradeName.toLowerCase().includes(s)) ||
        (c.document && c.document.includes(s)) ||
        (c.email && c.email.toLowerCase().includes(s))
      );
    }
    if (query.status) items = items.filter(c => c.status === query.status);
    if (query.segment) items = items.filter(c => c.segment === query.segment);

    return paginate(items, query);
  },

  findById(id) {
    return db.customers.find(c => c.id === Number(id)) || null;
  },

  findByDocument(doc) {
    if (!doc) return null;
    const clean = String(doc).replace(/\D/g, '');
    return db.customers.find(c => String(c.document).replace(/\D/g, '') === clean) || null;
  },

  create(payload) {
    const now = new Date().toISOString();
    const code = 'CLI-' + String(db.nextId).padStart(4, '0');
    const customer = {
      id: db.nextId++,
      code,
      type: payload.type || 'PJ',
      document: payload.document,
      legalName: payload.legalName,
      tradeName: payload.tradeName || payload.legalName,
      stateRegistration: payload.stateRegistration || '',
      email: payload.email || '',
      phone: payload.phone || '',
      segment: payload.segment || '',
      status: payload.status || 'ACTIVE',
      sellerId: payload.sellerId || null,
      address: payload.address || {},
      notes: payload.notes || '',
      createdAt: now,
      updatedAt: now,
    };
    db.customers.push(customer);
    return customer;
  },

  update(id, payload) {
    const c = this.findById(id);
    if (!c) return null;
    Object.assign(c, payload, { updatedAt: new Date().toISOString() });
    return c;
  },

  remove(id) {
    const idx = db.customers.findIndex(c => c.id === Number(id));
    if (idx === -1) return false;
    db.customers.splice(idx, 1);
    return true;
  },

  _db: db,
};

module.exports = CustomersRepository;
