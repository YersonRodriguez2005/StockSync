const productModel = require('../models/product.model');
const { createProductSchema, updateStockSchema } = require('../schemas/product.schema');
const catchAsync = require('../utils/catchAsync');

const getInventory = catchAsync(async (req, res) => {
  const products = await productModel.getAll(req.query.lowStock);
  res.status(200).json({ success: true, count: products.length, data: products });
});

const createProduct = catchAsync(async (req, res) => {
  const validatedData = createProductSchema.parse(req.body);
  const newProduct = await productModel.create(validatedData);
  res.status(201).json({ success: true, data: newProduct });
});

const updateStock = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { quantity_change } = updateStockSchema.parse(req.body);
  const updatedProduct = await productModel.updateStock(id, quantity_change);
  
  if (!updatedProduct) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
  res.status(200).json({ success: true, data: updatedProduct });
});

const deleteProduct = catchAsync(async (req, res) => {
  const deletedProduct = await productModel.remove(req.params.id);
  if (!deletedProduct) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
  res.status(200).json({ success: true, message: 'Producto eliminado correctamente' });
});

module.exports = { getInventory, createProduct, updateStock, deleteProduct };