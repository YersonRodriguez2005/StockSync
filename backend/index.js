// arhciov de inicio del backend
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const orderRoutes = require('./routes/order.routes');
const productsRoutes = require('./routes/product.routes');
const ledgerRoutes = require('./routes/ledger.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

//Rutas
app.use('/api/orders', orderRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/ledger', ledgerRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});