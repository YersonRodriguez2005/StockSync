const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Errores de validación de Zod (Manejo seguro)
  if (err.name === 'ZodError' || err.issues) {
    const errorList = err.issues || err.errors || [];
    return res.status(400).json({ 
      success: false, 
      errors: errorList.map(e => e.message) 
    });
  }

  // Errores específicos de PostgreSQL
  if (err.code === '23514') {
    return res.status(400).json({ 
      success: false, 
      message: 'Violación de restricción en la base de datos (Ej: stock negativo)' 
    });
  }

  // Error genérico del servidor
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Error interno del servidor' 
  });
};

module.exports = errorHandler;