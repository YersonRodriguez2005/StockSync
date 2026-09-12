const db = require('../config/db');

// Helper interno SQL para la fecha de Colombia
const todayCol = `(CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota')::DATE`;

const getToday = async () => {
  const query = `
    SELECT id, supplier_name, amount, daily_target, is_closed, created_at,
           TO_CHAR(entry_date, 'YYYY-MM-DD') AS entry_date 
    FROM daily_ledger 
    WHERE entry_date = ${todayCol} AND is_closed = FALSE
    ORDER BY created_at ASC;
  `;
  const { rows } = await db.query(query);
  return rows;
};

const create = async (data) => {
  const query = `
    INSERT INTO daily_ledger (supplier_name, amount, daily_target, entry_date, is_closed) 
    VALUES ($1, $2, $3, ${todayCol}, FALSE) 
    RETURNING id, supplier_name, amount, daily_target, is_closed, created_at, 
              TO_CHAR(entry_date, 'YYYY-MM-DD') AS entry_date;
  `;
  const { rows } = await db.query(query, [data.supplier_name, data.amount, data.daily_target]);
  return rows[0];
};

const closeDay = async () => {
  const query = `UPDATE daily_ledger SET is_closed = TRUE WHERE entry_date = ${todayCol} AND is_closed = FALSE;`;
  await db.query(query);
};

const getHistory = async () => {
  const query = `
    SELECT TO_CHAR(entry_date, 'YYYY-MM-DD') AS entry_date,
           MAX(daily_target) FILTER (WHERE supplier_name = 'INICIO_CAJA') AS daily_target,
           SUM(amount) FILTER (WHERE supplier_name != 'INICIO_CAJA') AS total_spent,
           COUNT(*) FILTER (WHERE supplier_name != 'INICIO_CAJA') AS total_entries,
           JSON_AGG(
             JSON_BUILD_OBJECT('id', id, 'supplier_name', supplier_name, 'amount', amount, 'created_at', created_at) 
             ORDER BY created_at ASC
           ) FILTER (WHERE supplier_name != 'INICIO_CAJA') AS entries
    FROM daily_ledger WHERE is_closed = TRUE GROUP BY entry_date ORDER BY entry_date DESC;
  `;
  const { rows } = await db.query(query);
  return rows;
};

const removeEntry = async (id) => {
  const query = `DELETE FROM daily_ledger WHERE id = $1 AND entry_date = ${todayCol} AND is_closed = FALSE RETURNING *;`;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const removeDay = async (date) => {
  await db.query(`DELETE FROM daily_ledger WHERE entry_date = $1`, [date]);
};

module.exports = { getToday, create, closeDay, getHistory, removeEntry, removeDay };