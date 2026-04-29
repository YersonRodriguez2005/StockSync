const express = require('express');
const router = express.Router();
const ledgerController = require('../controllers/ledger.controller');

// GET /api/ledger/today
router.get('/today', ledgerController.getTodayEntries);

// PATCH /api/ledger/close-day
router.patch('/close-day', ledgerController.closeDay);

// GET /api/ledger/history
router.get('/history', ledgerController.getLedgerHistory);

// POST /api/ledger
router.post('/', ledgerController.createEntry);

module.exports = router;