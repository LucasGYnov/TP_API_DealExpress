require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
//const cors = require("cors"); implémentation de cors à faire ??

const authRoutes = require("./routes/auth.routes");
const dealsRoutes = require("./routes/deals.routes");
const commentsRoutes = require("./routes/comments.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
// app.use(cors()); // CORS ??
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
 app.use("/api/auth", authRoutes);
app.use("/api/deals", dealsRoutes);
/*  app.use("/api", commentsRoutes);
app.use("/api/admin", adminRoutes); */

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur DealExpress API" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route non trouvée" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Erreur serveur !" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}. Lien: http://localhost:${PORT}/`);
});
