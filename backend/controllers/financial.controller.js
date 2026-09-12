const financialModel = require('../models/financial.model');
const { closureSchema, paginationSchema } = require('../schemas/financial.schema');
const catchAsync = require('../utils/catchAsync');

// Obtener datos iniciales (Gastos del ledger) para llenar el formulario
const getInitialData = catchAsync(async (req, res) => {
  const ledgerExpenses = await financialModel.getTodayLedgerExpenses();
  const todayClosure = await financialModel.getTodayClosure();
  
  res.status(200).json({ 
    success: true, 
    data: {
      ledger_expenses: ledgerExpenses,
      saved_closure: todayClosure // Si ya había hecho un arqueo hoy, lo mandamos para que lo pueda editar
    }
  });
});

// Guardar o Actualizar el arqueo del día
const saveFinancialClosure = catchAsync(async (req, res) => {
  const validatedData = closureSchema.parse(req.body);
  const closure = await financialModel.saveClosure(validatedData);
  
  res.status(200).json({ success: true, data: closure, message: 'Arqueo guardado exitosamente' });
});

// Ver el historial paginado
const getFinancialHistory = catchAsync(async (req, res) => {
  const { page, limit } = paginationSchema.parse(req.query);
  const offset = (page - 1) * limit;

  const history = await financialModel.getHistory(limit, offset);
  
  res.status(200).json({
    success: true,
    data: history,
    currentPage: page,
    hasMore: history.length === limit
  });
});

// Eliminar un arqueo (en caso extremo de error histórico)
const deleteClosure = catchAsync(async (req, res) => {
  const deletedClosure = await financialModel.remove(req.params.id);
  if (!deletedClosure) return res.status(404).json({ success: false, message: 'Cierre no encontrado' });
  res.status(200).json({ success: true, message: 'Arqueo eliminado exitosamente' });
});

module.exports = { getInitialData, saveFinancialClosure, getFinancialHistory, deleteClosure };