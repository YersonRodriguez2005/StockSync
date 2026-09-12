const ledgerModel = require('../models/ledger.model');
const { createEntrySchema } = require('../schemas/ledger.schema');
const catchAsync = require('../utils/catchAsync');

const getTodayEntries = catchAsync(async (req, res) => {
  const entries = await ledgerModel.getToday();
  res.status(200).json({ success: true, data: entries });
});

const createEntry = catchAsync(async (req, res) => {
  const validatedData = createEntrySchema.parse(req.body);
  const newEntry = await ledgerModel.create(validatedData);
  res.status(201).json({ success: true, data: newEntry });
});

const closeDay = catchAsync(async (req, res) => {
  await ledgerModel.closeDay();
  res.status(200).json({ success: true, message: 'Día cerrado correctamente' });
});

const autoCloseDay = async () => {
  try {
    await ledgerModel.closeDay();
    console.log(`[CRON] Cierre automático ejecutado exitosamente`);
  } catch (error) {
    console.error('[CRON] Error en cierre automático:', error);
  }
};

const getLedgerHistory = catchAsync(async (req, res) => {
  const history = await ledgerModel.getHistory();
  res.status(200).json({ success: true, data: history });
});

const deleteEntry = catchAsync(async (req, res) => {
  const deletedEntry = await ledgerModel.removeEntry(req.params.id);
  if (!deletedEntry) return res.status(404).json({ success: false, message: 'Registro no encontrado o el día ya está cerrado' });
  res.status(200).json({ success: true, data: deletedEntry });
});

const deleteDay = catchAsync(async (req, res) => {
  await ledgerModel.removeDay(req.params.date);
  res.status(200).json({ success: true, message: 'Día eliminado correctamente' });
});

module.exports = { getTodayEntries, createEntry, closeDay, autoCloseDay, getLedgerHistory, deleteEntry, deleteDay };