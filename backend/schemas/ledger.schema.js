const { z } = require('zod');

const createEntrySchema = z.object({
  supplier_name: z.string().min(2, "El nombre del proveedor es obligatorio"),
  amount: z.number().min(0, "El monto no puede ser negativo"), 
  daily_target: z.number().min(0).optional().default(0)
});

module.exports = { createEntrySchema };