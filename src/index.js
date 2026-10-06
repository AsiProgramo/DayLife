require("dotenv").config();

const express = require("express");
const config = require("./server/config");
const { connect } = require("./config/mongoose");

// app extraida de express ya configurada
const app = config(express());

// conecta a la base de datos y luego levanta el servidor
connect()
    .then(() => {
        app.listen(app.get("port"), () => {
            console.log("server on port: http://localhost:" + app.get("port"));
        });
    })
    .catch((err) => {
        console.error("No se pudo conectar a MongoDB:", err.message);
        process.exit(1);
    });
