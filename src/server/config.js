const express = require('express');
const path = require('path');
const exhbs = require('express-handlebars')
const route = require('../route/index.js');

const morgan = require('morgan');
const multer = require('multer');
const errhdr = require('errorhandler');
module.exports = app => {
    //setting
    app.set('port', process.env.PORT || 3000);
    app.set('views', path.join(__dirname, '../view'));
    app.engine('.hbs', exhbs({
        defaultLayout: 'main',
        partialsDir: path.join(app.get('views'), 'partials'),
        layoutsDir: path.join(app.get('views'), 'layout'),
        extname: '.hbs',
        helpers: require('./helpers')
    }));
    app.set('view engine', '.hbs');

    //middelwares
    app.use(morgan('dev'));
    app.use(multer({ dest: path.join(__dirname, '../public/upload/temp') }).single('image'));
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    //routes
    route(app);

    //static Files
    app.use('/public', express.static(path.join(__dirname, '../public')));

    //errohandles
    if ('development' === app.get('dev')) {
        app.use(errhdr)
    }
    return app;
}