const db = require('../config/db');

// Helper interno para forzar la fecha y zona horaria (Neiva/Bogotá)
const todayCol = `(CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota')::DATE`;
const constantAdminSalary = 100000; // Constante de la lógica de negocio

// 1. Obtener los gastos del Ledger (Libreta) del día actual
const getTodayLedgerExpenses = async () => {
  const query = `
    SELECT SUM(amount) AS total_ledger_expenses 
    FROM daily_ledger 
    WHERE entry_date = ${todayCol} 
    AND supplier_name != 'INICIO_CAJA';
  `;
  const { rows } = await db.query(query);
  return Number(rows[0].total_ledger_expenses || 0);
};

// 2. Crear o Actualizar (Upsert) el cierre del día
const saveClosure = async (data) => {
  const ledger_expenses = await getTodayLedgerExpenses();
  
  // Sumamos los pagos de clientes al ingreso total usando la columna correcta
  const total_income = data.cash_sales + data.digital_sales + (data.client_payments || 0);
  const total_expenses = ledger_expenses + data.manual_expenses;
  
  const gross_profit = total_income - total_expenses;
  const net_profit = gross_profit - constantAdminSalary;
  
  // El efectivo al bolsillo no incluye lo digital, pero asumimos que el pago del cliente 
  // ya fue anotado arriba en efectivo o digital. El campo es solo informativo del total.
  const physical_cash_remaining = data.cash_sales - total_expenses - constantAdminSalary - data.next_day_base;

  const query = `
    INSERT INTO financial_closures (
      closure_date, cash_sales, digital_sales, client_payments, ledger_expenses, manual_expenses, 
      admin_salary, next_day_base, gross_profit, net_profit, physical_cash_remaining
    ) VALUES (
      ${todayCol}, $1, $2, $3, $4, $5, 
      $6, $7, $8, $9, $10
    )
    ON CONFLICT (closure_date) DO UPDATE SET
      cash_sales = EXCLUDED.cash_sales,
      digital_sales = EXCLUDED.digital_sales,
      client_payments = EXCLUDED.client_payments,
      ledger_expenses = EXCLUDED.ledger_expenses,
      manual_expenses = EXCLUDED.manual_expenses,
      next_day_base = EXCLUDED.next_day_base,
      gross_profit = EXCLUDED.gross_profit,
      net_profit = EXCLUDED.net_profit,
      physical_cash_remaining = EXCLUDED.physical_cash_remaining,
      created_at = CURRENT_TIMESTAMP
    RETURNING *, TO_CHAR(closure_date, 'YYYY-MM-DD') AS closure_date;
  `;

  const values = [
    data.cash_sales, data.digital_sales, (data.client_payments || 0), ledger_expenses, data.manual_expenses,
    constantAdminSalary, data.next_day_base, gross_profit, net_profit, physical_cash_remaining
  ];

  const { rows } = await db.query(query, values);
  return rows[0];
};

// 3. Obtener el cierre de hoy (si existe)
const getTodayClosure = async () => {
  const query = `
    SELECT *, TO_CHAR(closure_date, 'YYYY-MM-DD') AS closure_date 
    FROM financial_closures 
    WHERE closure_date = ${todayCol};
  `;
  const { rows } = await db.query(query);
  return rows[0] || null;
};

// 4. Obtener Historial (Paginado)
const getHistory = async (limit, offset) => {
  const query = `
    SELECT *, TO_CHAR(closure_date, 'YYYY-MM-DD') AS closure_date 
    FROM financial_closures 
    ORDER BY financial_closures.closure_date DESC 
    LIMIT $1 OFFSET $2;
  `;
  const { rows } = await db.query(query, [limit, offset]);
  return rows;
};

// 5. Eliminar un cierre histórico
const remove = async (id) => {
  const query = 'DELETE FROM financial_closures WHERE id = $1 RETURNING *;';
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

module.exports = { getTodayLedgerExpenses, saveClosure, getTodayClosure, getHistory, remove };