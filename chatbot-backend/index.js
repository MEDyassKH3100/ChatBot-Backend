const express = require("express");
const db = require("./config/db");
const UserModel = require("./model/user.model");
const app = express();
const userRouter = require("./routers/user.router");
const morgan = require("morgan");
const AttestationModel = require("./model/attestation.model");
const attestationRouter = require("./routers/attestation.route");

app.use(express.json());
// Utilisez /api comme préfixe pour toutes les routes

// create express server
app.use(morgan("dev"));
const port = 3000;

app.use("/user", userRouter);
app.use("/attestation", attestationRouter);
app.listen(port, () => {
  console.log(`Server Listening on port http://localhost:${port}`);
});
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YzI3M2FlYzliMzc0NDM2ZmU4NDJlNCIsImlhdCI6MTcyNDAyMDMyNiwiZXhwIjoxNzI0MDIzOTI2fQ.NNNo0dNNrwQaQA8zn2fwbeO4oooJmZk8OgoMb1AlsEA",/*