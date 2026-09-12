const { z } = require('zod');

const createOrderSchema = z.object({
  supplier_name: z.string().min(2, "El nombre del proveedor es obligatorio"),
  total_value: z.number().positive("El valor total debe ser mayor a 0"),
  delivery_date: z.string().refine(val => !isNaN(Date.parse(val)), "Formato de fecha inválido (YYYY-MM-DD)")
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(15)
});

module.exports = { createOrderSchema, paginationSchema };