const express = require('express');
const router = express.Router();
const home = require('../controller/home');
const control = require('../controller/control');
module.exports = app => {

    router.get('/', home.index);
    router.get('/login', home.login);
    router.get('/crear', home.crear);
    router.get('/image/:id', control.index);
    router.post('/image', control.create);
    router.post('/registro', control.chatlive)
    router.post('/image/:id/like', control.like);
    router.post('/image/:id/coment', control.coment)
    router.delete('/image/:id', control.delete)
    router.post('/chatlive', control.chatlive)
    app.use(router);
}