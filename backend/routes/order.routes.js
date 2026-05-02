const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

// Definición de endpoints
router.post('/', orderController.createOrder);
router.get('/pending', orderController.getPendingOrders);
router.patch('/:id/deliver', orderController.markAsDelivered);
router.get('/history', orderController.getOrderHistory);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;