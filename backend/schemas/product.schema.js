const { z } = require('zod');

// Validamos que al crear, los datos vengan correctos desde el frontend
const createProductSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  stock: z.number().int("El stock debe ser un número entero").min(0, "El stock inicial no puede ser negativo").optional().default(0),
  category: z.string().min(2, "La categoría es obligatoria")
});

// Validamos que el cambio de stock sea un número entero (positivo o negativo)
const updateStockSchema = z.object({
  quantity_change: z.number().int("El cambio de stock debe ser un número entero")
});

module.exports = { createProductSchema, updateStockSchema };