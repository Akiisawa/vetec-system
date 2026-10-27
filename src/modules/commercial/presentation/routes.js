// src/modules/commercial/presentation/routes.js
'use strict';

const express = require('express');
const CustomersService = require('../application/customers-service');
const { requirePermission } = require('../../../app/middleware/rbac');

const router = express.Router();

router.get('/customers', requirePermission('customers', 'read'), (req, res) => {
  try {
    const data = CustomersService.list(req.query, req.user);
    res.json(data);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/customers/:id', requirePermission('customers', 'read'), (req, res) => {
  try {
    res.json(CustomersService.get(req.params.id));
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

router.post('/customers', requirePermission('customers', 'write'), (req, res) => {
  try {
    res.status(201).json(CustomersService.create(req.body));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/customers/:id', requirePermission('customers', 'write'), (req, res) => {
  try {
    res.json(CustomersService.update(req.params.id, req.body));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/customers/:id', requirePermission('customers', 'write'), (req, res) => {
  try {
    res.json(CustomersService.remove(req.params.id));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
