const express = require('express');
const router = express.Router();
//controllers
const home = require('../controller/home');
const image = require('../controller/image');
const auth = require('../controller/auth');

const { isAuthenticated } = auth;

// pasa los errores de las funciones async al manejador de errores de express
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = app => {

    // Authentication routes
    router.get('/login', auth.renderSignIn);
    router.post('/login', auth.signIn);

    router.get('/crear', auth.renderSignUp);
    router.post('/crear', auth.signUp);

    router.get('/logout', auth.logout);

    // App routes (requieren sesión)
    router.get('/', isAuthenticated, wrap(home.index));
    router.get('/images/:image_id', isAuthenticated, wrap(image.index));
    router.post('/images', isAuthenticated, wrap(image.create));
    router.post('/images/:image_id/like', isAuthenticated, wrap(image.like));
    router.post('/images/:image_id/comment', isAuthenticated, wrap(image.comment));
    router.delete('/images/:image_id', isAuthenticated, wrap(image.remove));

    app.use(router);
};
