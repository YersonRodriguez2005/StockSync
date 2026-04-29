const db = require('../config/db');

// 1. Obtener todo el inventario (con opción de filtrar bajo stock)
const getInventory = async (req, res) => {
  try {
    // Si se pasa ?lowStock=true en la URL, filtramos los menores a 3
    const { lowStock } = req.query;
    let query = 'SELECT * FROM products ORDER BY category, name ASC;';
    
    if (lowStock === 'true') {
      query = 'SELECT * FROM products WHERE stock < 3 ORDER BY stock ASC;';
    }

    const { rows } = await db.query(query);
    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error en getInventory:', error);
    res.status(500).json({ success: false, message: 'Error al consultar inventario' });
  }
};

// 2. Registrar un nuevo producto
const createProduct = async (req, res) => {
  const { name, stock, category } = req.body;
  try {
    const query = `
      INSERT INTO products (name, stock, category) 
      VALUES ($1, $2, $3) 
      RETURNING *;
    `;
    const { rows } = await db.query(query, [name, stock || 0, category]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error en createProduct:', error);
    res.status(500).json({ success: false, message: 'Error al crear producto' });
  }
};

// 3. Actualizar cantidad de stock (Lógica central)
const updateStock = async (req, res) => {
  const { id } = req.params;
  const { quantity_change } = req.body; // Puede ser positivo (+5) o negativo (-2)

  try {
    // El "por qué" de esta consulta: Delegamos la matemática a PostgreSQL
    // Esto previene "Race Conditions" (condiciones de carrera) si dos empleados 
    // modifican el stock al mismo milisegundo.
    const query = `
      UPDATE products 
      SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *;
    `;
    
    const { rows } = await db.query(query, [quantity_change, id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
    
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    // Capturar el error del constraint CHECK (stock >= 0) de la BD
    if (error.code === '23514') { // 23514 es el código de error de PostgreSQL para violaciones de CHECK
      return res.status(400).json({ success: false, message: 'El stock no puede ser menor a 0' });
    }
    console.error('Error en updateStock:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar stock' });
  }
};

// 4. Eliminar producto (por errores de registro)
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'DELETE FROM products WHERE id = $1 RETURNING *;';
    const { rows } = await db.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
    res.status(200).json({ success: true, message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error en deleteProduct:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar producto' });
  }
};

module.exports = { getInventory, createProduct, updateStock, deleteProduct };