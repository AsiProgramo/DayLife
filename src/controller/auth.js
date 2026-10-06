const passport = require("passport");

const ctrl = {};

ctrl.renderSignUp = (req, res) => {
    res.render("crear", { layout: "home" });
};

ctrl.renderSignIn = (req, res) => {
    res.render("login", { layout: "home" });
};

// después de registrarse no inicia sesión, manda al login
ctrl.signUp = passport.authenticate("signup", {
    successRedirect: "/login",
    failureRedirect: "/crear",
    failureFlash: true,
    session: false,
});

ctrl.signIn = passport.authenticate("signin", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
});

ctrl.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect("/login");
    });
};

// protege las rutas que necesitan sesión
ctrl.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    if (req.method === "GET") return res.redirect("/login");
    res.status(401).json({ error: "No autorizado" });
};

module.exports = ctrl;
