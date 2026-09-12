const { z } = require('zod');

// Schema para crear o editar el cierre financiero
const closureSchema = z.object({
  cash_sales: z.coerce.number().min(0, "Las ventas en efectivo no pueden ser negativas").default(0),
  digital_sales: z.coerce.number().min(0, "Las ventas digitales no pueden ser negativas").default(0),
  manual_expenses: z.coerce.number().min(0, "Los egresos extra no pueden ser negativos").default(0),
  next_day_base: z.coerce.number().min(0, "La base para mañana no puede ser negativa").default(0),
  client_payments: z.number().min(0).optional().default(0),
});

// Paginación para el historial
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(15)
});

module.exports = { closureSchema, paginationSchema };