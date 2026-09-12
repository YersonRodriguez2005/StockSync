const db = require('../config/db');

const getAll = async (lowStock) => {
  let query = 'SELECT * FROM products ORDER BY category, name ASC;';
  if (lowStock === 'true') {
    query = 'SELECT * FROM products WHERE stock < 3 ORDER BY stock ASC;';
  }
  const { rows } = await db.query(query);
  return rows;
};

const create = async (productData) => {
  const query = `
    INSERT INTO products (name, stock, category) 
    VALUES ($1, $2, $3) RETURNING *;
  `;
  const { rows } = await db.query(query, [productData.name, productData.stock, productData.category]);
  return rows[0];
};

const updateStock = async (id, quantity_change) => {
  const query = `
    UPDATE products 
    SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $2 RETURNING *;
  `;
  const { rows } = await db.query(query, [quantity_change, id]);
  return rows[0]; // Retorna undefined si no encuentra el ID
};

const remove = async (id) => {
  const query = 'DELETE FROM products WHERE id = $1 RETURNING *;';
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

module.exports = { getAll, create, updateStock, remove };