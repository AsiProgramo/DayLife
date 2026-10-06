const path = require("path");
const fs = require("fs-extra");
const morgan = require("morgan");
const express = require("express");
const errorHandler = require("errorhandler");
const multer = require("multer");
const { engine } = require("express-handlebars");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
require("../config/passport");

const routes = require("../routes");
const { TEMP_DIR } = require("../config/paths");

module.exports = (app) => {
    // Settings
    app.set("port", process.env.PORT || 3000);
    app.set("views", path.join(__dirname, "../views"));
    app.engine(
        ".hbs",
        engine({
            defaultLayout: "main",
            layoutsDir: path.join(app.get("views"), "layouts"),
            partialsDir: path.join(app.get("views"), "partials"),
            helpers: require("./helpers"),
            extname: ".hbs",
            // permite leer las propiedades de los documentos de mongoose
            runtimeOptions: {
                allowProtoPropertiesByDefault: true,
                allowProtoMethodsByDefault: true,
            },
        })
    );
    app.set("view engine", ".hbs");

    // la carpeta de subida no está en git, la creamos al iniciar
    fs.ensureDirSync(TEMP_DIR);

    // middlewares
    app.use(morgan("dev"));
    app.use(
        multer({
            dest: TEMP_DIR,
            limits: { fileSize: 10 * 1024 * 1024 },
        }).single("image")
    );
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    app.use(
        session({
            secret: process.env.SESSION_SECRET || "somesecretkey",
            resave: false,
            saveUninitialized: false,
        })
    );
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());

    // Global Variables (por petición, no compartidas entre usuarios)
    app.use((req, res, next) => {
        // the current user session
        res.locals.user = req.user || null;
        // succes messages by flash
        res.locals.success = req.flash("success");
        // passport authentication erros
        res.locals.error = req.flash("error");
        next();
    });

    // Static files
    app.use("/public", express.static(path.join(__dirname, "../public")));

    // Routes
    routes(app);

    // Error Handling
    if ("development" === app.get("env")) {
        app.use(errorHandler());
    }

    return app;
};
