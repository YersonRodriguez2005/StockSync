const express = require('express');
const router = express.Router();
const ledgerController = require('../controllers/ledger.controller');

router.get('/today', ledgerController.getTodayEntries);
router.patch('/close-day', ledgerController.closeDay);
router.get('/history', ledgerController.getLedgerHistory);
router.post('/', ledgerController.createEntry);
router.delete('/delete-day', ledgerController.deleteDay);
router.delete('/day/:date', ledgerController.deleteDay);
router.delete('/:id', ledgerController.deleteEntry);


module.exports = router;