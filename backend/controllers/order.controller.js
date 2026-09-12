const orderModel = require('../models/order.model');
const { createOrderSchema, paginationSchema } = require('../schemas/order.schema');
const catchAsync = require('../utils/catchAsync');

const createOrder = catchAsync(async (req, res) => {
  const validatedData = createOrderSchema.parse(req.body);
  const newOrder = await orderModel.create(validatedData);
  res.status(201).json({ success: true, data: newOrder });
});

const getPendingOrders = catchAsync(async (req, res) => {
  const orders = await orderModel.getPending();
  res.status(200).json({ success: true, data: orders });
});

const markAsDelivered = catchAsync(async (req, res) => {
  const updatedOrder = await orderModel.markAsDelivered(req.params.id);
  if (!updatedOrder) return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
  res.status(200).json({ success: true, data: updatedOrder });
});

const getOrderHistory = catchAsync(async (req, res) => {
  // Zod se encarga de parsear y proveer los valores por defecto (page=1, limit=15)
  const { page, limit } = paginationSchema.parse(req.query);
  const offset = (page - 1) * limit;

  const orders = await orderModel.getHistory(limit, offset);
  
  res.status(200).json({
    success: true,
    data: orders,
    currentPage: page,
    hasMore: orders.length === limit
  });
});

const deleteOrder = catchAsync(async (req, res) => {
  const deletedOrder = await orderModel.remove(req.params.id);
  if (!deletedOrder) return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
  res.status(200).json({ success: true, message: 'Pedido eliminado exitosamente' });
});

module.exports = { createOrder, getPendingOrders, markAsDelivered, getOrderHistory, deleteOrder };