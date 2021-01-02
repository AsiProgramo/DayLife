const express = require('express');
const router = express.Router();
//controllers
const home = require('../controller/home');
const image = require('../controller/image');
const auth = require('../controller/auth');

module.exports = app => {

    router.get('/', home.index);
    router.get('/images/:image_id', image.index);
    router.post('/images', image.create);
    router.post('/images/:image_id/like', image.like);
    router.post('/images/:image_id/comment', image.comment);
    router.delete('/images/:image_id', image.remove);
    //router.post('/chatlive', image.chatlive)

    // Authentication routes
    router.get('/auth/signin', auth.renderSignIn);
    router.post('/auth/signin', auth.signIn);

    router.get('/signup', auth.renderSignUp);
    router.post('/signup', auth.signUp);

    router.get('/logout', auth.logout);
    app.use(router);
};