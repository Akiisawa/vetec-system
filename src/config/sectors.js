// src/config/sectors.js
// Setores fixos da VETEC, conforme fluxograma da empresa.
// Ordem reflete o fluxo natural de uma Ordem de Serviço.
'use strict';

const SECTORS = Object.freeze({
  COMERCIAL:   'COMERCIAL',
  ENGENHARIA:  'ENGENHARIA',
  SUPRIMENTOS: 'SUPRIMENTOS',
  PCP:         'PCP',
  PRODUCAO:    'PRODUCAO',
  FINANCEIRO:  'FINANCEIRO',
});

const SECTOR_LIST = Object.freeze(Object.values(SECTORS));

const SECTOR_LABELS = Object.freeze({
  COMERCIAL:   'Comercial',
  ENGENHARIA:  'Engenharia',
  SUPRIMENTOS: 'Suprimentos',
  PCP:         'PCP',
  PRODUCAO:    'Produção',
  FINANCEIRO:  'Financeiro',
});

function isValidSector(s) {
  return typeof s === 'string' && SECTOR_LIST.includes(s);
}

module.exports = { SECTORS, SECTOR_LIST, SECTOR_LABELS, isValidSector };
