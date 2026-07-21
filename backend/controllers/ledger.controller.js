const db = require('../config/db');

// Helper: fecha actual en zona Colombia (Garantizado YYYY-MM-DD)
const getColombiaDate = () => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = formatter.formatToParts(new Date());
  const year = parts.find(p => p.type === 'year').value;
  const month = parts.find(p => p.type === 'month').value;
  const day = parts.find(p => p.type === 'day').value;
  return `${year}-${month}-${day}`;
};

const getTodayEntries = async (req, res) => {
  try {
    const query = `
      SELECT * FROM daily_ledger 
      WHERE entry_date = DATE(CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota')
        AND is_closed = FALSE
      ORDER BY created_at ASC;
    `;
    const { rows } = await db.query(query);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Error en getTodayEntries:', error);
    res.status(500).json({ success: false, message: 'Error al obtener registros' });
  }
};

const createEntry = async (req, res) => {
  const { supplier_name, amount, daily_target } = req.body;
  try {
    const query = `
      INSERT INTO daily_ledger (supplier_name, amount, daily_target, entry_date) 
      VALUES ($1, $2, $3, DATE(CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota')) 
      RETURNING *;
    `;
    const { rows } = await db.query(query, [supplier_name, amount, daily_target || 0]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error en createEntry:', error);
    res.status(500).json({ success: false, message: 'Error al guardar registro' });
  }
};

const closeDay = async (req, res) => {
  try {
    const query = `
      UPDATE daily_ledger
      SET is_closed = TRUE
      WHERE entry_date = DATE(CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota')
        AND is_closed = FALSE;
    `;
    await db.query(query);
    res.status(200).json({ success: true, message: 'Día cerrado correctamente' });
  } catch (error) {
    console.error('Error en closeDay:', error);
    res.status(500).json({ success: false, message: 'Error al cerrar el día' });
  }
};

const autoCloseDay = async () => {
  try {
    await db.query(`
      UPDATE daily_ledger 
      SET is_closed = TRUE 
      WHERE entry_date = DATE(CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota') 
        AND is_closed = FALSE
    `);
    console.log(`[CRON] Cierre automático ejecutado correctamente.`);
  } catch (error) {
    console.error('[CRON] Error en cierre automático:', error);
  }
};

const getLedgerHistory = async (req, res) => {
  try {
    const query = `
      SELECT
        entry_date,
        MAX(daily_target) FILTER (WHERE supplier_name = 'INICIO_CAJA') AS daily_target,
        SUM(amount) FILTER (WHERE supplier_name != 'INICIO_CAJA') AS total_spent,
        COUNT(*) FILTER (WHERE supplier_name != 'INICIO_CAJA') AS total_entries,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', id,
            'supplier_name', supplier_name,
            'amount', amount,
            'created_at', created_at
          ) ORDER BY created_at ASC
        ) FILTER (WHERE supplier_name != 'INICIO_CAJA') AS entries
      FROM daily_ledger
      WHERE is_closed = TRUE
      GROUP BY entry_date
      ORDER BY entry_date DESC;
    `;
    const { rows } = await db.query(query);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Error en getLedgerHistory:', error);
    res.status(500).json({ success: false, message: 'Error al obtener historial' });
  }
};

const deleteEntry = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      DELETE FROM daily_ledger
      WHERE id = $1
        AND entry_date = DATE(CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota')
        AND is_closed = FALSE
      RETURNING *;
    `;
    const { rows } = await db.query(query, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Registro no encontrado o no se puede eliminar' });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error en deleteEntry:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar registro' });
  }
};

const deleteDay = async (req, res) => {
  const { date } = req.params;
  try {
    await db.query(`DELETE FROM daily_ledger WHERE entry_date = $1`, [date]);
    res.status(200).json({ success: true, message: 'Día eliminado correctamente' });
  } catch (error) {
    console.error('Error en deleteDay:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar el día' });
  }
};

module.exports = {
  getTodayEntries,
  createEntry,
  closeDay,
  autoCloseDay,
  getLedgerHistory,
  deleteEntry,
  deleteDay,
};