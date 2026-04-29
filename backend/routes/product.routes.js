const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

router.get('/', productController.getInventory);
router.post('/', productController.createProduct);
router.patch('/:id/stock', productController.updateStock); // Usamos PATCH para actualizaciones parciales
router.delete('/:id', productController.deleteProduct);

module.exports = router;