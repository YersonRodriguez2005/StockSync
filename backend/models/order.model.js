const db = require('../config/db');

const create = async (orderData) => {
  const query = `
    INSERT INTO orders (supplier_name, total_value, delivery_date) 
    VALUES ($1, $2, $3) RETURNING *;
  `;
  const { rows } = await db.query(query, [orderData.supplier_name, orderData.total_value, orderData.delivery_date]);
  return rows[0];
};

const getPending = async () => {
  const query = "SELECT * FROM orders WHERE status = 'PENDING' ORDER BY delivery_date ASC;";
  const { rows } = await db.query(query);
  return rows;
};

const markAsDelivered = async (id) => {
  const query = "UPDATE orders SET status = 'DELIVERED' WHERE id = $1 RETURNING *;";
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const getHistory = async (limit, offset) => {
  const query = `
    SELECT * FROM orders 
    WHERE status = 'DELIVERED' AND delivery_date >= CURRENT_DATE - INTERVAL '1 month'
    ORDER BY delivery_date DESC LIMIT $1 OFFSET $2;
  `;
  const { rows } = await db.query(query, [limit, offset]);
  return rows;
};

const remove = async (id) => {
  const query = 'DELETE FROM orders WHERE id = $1 RETURNING *;';
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

module.exports = { create, getPending, markAsDelivered, getHistory, remove };