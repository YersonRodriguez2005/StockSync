const express = require('express');
const router = express.Router();
const financialController = require('../controllers/financial.controller');

router.get('/today-data', financialController.getInitialData); // Para cargar el form inicial
router.post('/save', financialController.saveFinancialClosure); // Hace Insert o Update automático
router.get('/history', financialController.getFinancialHistory);
router.delete('/:id', financialController.deleteClosure);

module.exports = router;