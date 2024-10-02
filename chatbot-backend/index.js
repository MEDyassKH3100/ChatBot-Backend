const express = require("express");
const db = require("./config/db");
const UserModel = require("./model/user.model");
const app = express();
const userRouter = require("./routers/user.router");
const morgan = require("morgan");
const AttestationModel = require("./model/attestation.model");
const attestationRouter = require("./routers/attestation.route");
const auth = require("./auth");

// Chemin absolu vers le dossier public
app.use(express.static('public'));

// Middleware pour servir le favicon
app.use('/favicon.ico', express.static('public/favicon.ico'));

const port = 3000;
app.use(express.json());

app.use(morgan("dev"));

app.use("/user", userRouter);
app.use("/attestation", attestationRouter);
app.listen(port, () => {
  console.log(`Server Listening on port http://localhost:${port}`);
});
