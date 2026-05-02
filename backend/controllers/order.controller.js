const db = require('../config/db');

// 1. Crear un nuevo pedido
const createOrder = async (req, res) => {
  const { supplier_name, total_value, delivery_date } = req.body;
  
  try {
    // Usamos $1, $2 para evitar SQL Injection. RETURNING * devuelve el registro creado.
    const query = `
      INSERT INTO orders (supplier_name, total_value, delivery_date) 
      VALUES ($1, $2, $3) 
      RETURNING *;
    `;
    const values = [supplier_name, total_value, delivery_date];
    const { rows } = await db.query(query, values);
    
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error en createOrder:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// 2. Obtener pedidos pendientes (Para la vista de Calendario)
const getPendingOrders = async (req, res) => {
  try {
    const query = `
      SELECT * FROM orders 
      WHERE status = 'PENDING' 
      ORDER BY delivery_date ASC;
    `;
    const { rows } = await db.query(query);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Error en getPendingOrders:', error);
    res.status(500).json({ success: false, message: 'Error al obtener pedidos' });
  }
};

// 3. Marcar pedido como entregado
const markAsDelivered = async (req, res) => {
  const { id } = req.params;
  
  try {
    const query = `
      UPDATE orders 
      SET status = 'DELIVERED' 
      WHERE id = $1 
      RETURNING *;
    `;
    const { rows } = await db.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }
    
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error en markAsDelivered:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el pedido' });
  }
};

const getOrderHistory = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const offset = (page - 1) * limit;

  try {
    const query = `
      SELECT * FROM orders 
      WHERE status = 'DELIVERED' 
      AND delivery_date >= CURRENT_DATE - INTERVAL '1 month'
      ORDER BY delivery_date DESC
      LIMIT $1 OFFSET $2;
    `;
    
    const { rows } = await db.query(query, [limit, offset]);
    
    res.status(200).json({
      success: true,
      data: rows,
      currentPage: page,
      hasMore: rows.length === limit
    });
  } catch (error) {
    console.error('Error en getOrderHistory:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el historial de pedidos' });
  }
};

const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'DELETE FROM orders WHERE id = $1 RETURNING *;';
    const { rows } = await db.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }
    
    res.status(200).json({ success: true, message: 'Pedido eliminado exitosamente' });
  } catch (error) {
    console.error('Error en deleteOrder:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar el pedido' });
  }
};

module.exports = {
  createOrder,
  getPendingOrders,
  markAsDelivered,
  getOrderHistory,
  deleteOrder
};