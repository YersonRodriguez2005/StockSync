const express = require("express");
const cors = require("cors");
require("dotenv").config();
const cron = require("node-cron");

// Importación de rutas
const orderRoutes = require("./routes/order.routes");
const productsRoutes = require("./routes/product.routes");
const ledgerRoutes = require("./routes/ledger.routes");
const financialRoutes = require("./routes/financial.routes");

// Controladores y Middlewares
const { autoCloseDay } = require("./controllers/ledger.controller");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// Programación de tareas
cron.schedule("0 22 * * *", autoCloseDay, {
  timezone: "America/Bogota",
});
console.log("[CRON] Cierre automático de caja programado para las 10:00pm hora Colombia");

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/orders", orderRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/finance", financialRoutes);

// Manejador de Errores Global (Debe ir estrictamente después de las rutas)
app.use(errorHandler);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});