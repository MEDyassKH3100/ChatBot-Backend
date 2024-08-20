const mongoose = require("mongoose");

// Utilisez mongoose.connect pour une connexion unique et globale
mongoose.connect("mongodb://localhost:27017/owner", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("MongoDB Connected");
}).catch((err) => {
  console.error("MongoDB connection Error:", err);
});

// Exportez simplement mongoose, car la connexion est déjà établie globalement
module.exports = mongoose;
