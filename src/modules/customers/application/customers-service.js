// src/modules/commercial/application/customers-service.js
'use strict';

const CustomersRepository = require('../../../infrastructure/repositories/mock/customers-repository');

function onlyDigits(s) { return String(s || '').replace(/\D/g, ''); }

function validateCPF(cpf) {
  cpf = onlyDigits(cpf);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let sum = 0, rest;
  for (let i = 1; i <= 9; i++) sum += parseInt(cpf[i - 1]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(cpf[10])) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum += parseInt(cpf[i - 1]) * (12 - i);
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  return rest === parseInt(cpf[11]);
}

function validateCNPJ(cnpj) {
  cnpj = onlyDigits(cnpj);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  const w1 = [5,4,3,2,9,8,7,6,5,4,3,2];
  const w2 = [6,5,4,3,2,9,8,7,6,5,4,3,2];
  const calc = (weights) => {
    let sum = 0;
    for (let i = 0; i < weights.length; i++) sum += parseInt(cnpj[i]) * weights[i];
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  if (calc(w1) !== parseInt(cnpj[12])) return false;
  if (calc(w2) !== parseInt(cnpj[13])) return false;
  return true;
}

function validateDocument(doc, type) {
  if (type === 'PF') return validateCPF(doc);
  return validateCNPJ(doc);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''));
}

function sanitize(payload) {
  const out = {};
  for (const k of Object.keys(payload || {})) {
    if (typeof payload[k] === 'string') out[k] = payload[k].trim();
    else out[k] = payload[k];
  }
  return out;
}

function validate(payload) {
  const errors = [];
  const p = sanitize(payload);

  if (!p.legalName || p.legalName.length < 3) errors.push('Razão social é obrigatória (mín. 3 caracteres).');
  if (!p.document) errors.push('CNPJ/CPF é obrigatório.');
  else if (!validateDocument(p.document, p.type || 'PJ')) errors.push('CNPJ/CPF inválido.');
  if (p.email && !validateEmail(p.email)) errors.push('E-mail inválido.');
  if (p.status && !['ACTIVE','BLOCKED','INACTIVE'].includes(p.status)) errors.push('Status inválido.');

  return { errors, data: p };
}

const CustomersService = {
  list(q, user) {
    return CustomersRepository.list(q, user);
  },

  get(id) {
    const c = CustomersRepository.findById(id);
    if (!c) throw new Error('Cliente não encontrado.');
    return c;
  },

  create(payload) {
    const { errors, data } = validate(payload);
    if (errors.length) throw new Error(errors.join(' '));

    const existing = CustomersRepository.findByDocument(data.document);
    if (existing) throw new Error('Já existe um cliente com este CNPJ/CPF.');

    return CustomersRepository.create(data);
  },

  update(id, payload) {
    const current = CustomersRepository.findById(id);
    if (!current) throw new Error('Cliente não encontrado.');

    const merged = { ...current, ...sanitize(payload) };
    const { errors, data } = validate(merged);
    if (errors.length) throw new Error(errors.join(' '));

    if (data.document !== current.document) {
      const existing = CustomersRepository.findByDocument(data.document);
      if (existing && existing.id !== current.id) throw new Error('CNPJ/CPF já cadastrado em outro cliente.');
    }

    return CustomersRepository.update(id, data);
  },

  remove(id) {
    const ok = CustomersRepository.remove(id);
    if (!ok) throw new Error('Cliente não encontrado.');
    return { ok: true };
  },
};

module.exports = CustomersService;
