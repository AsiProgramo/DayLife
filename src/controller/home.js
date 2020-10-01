const path = require('path');
const helpers = require('../helpers/libs');
const fs = require('fs-extra');
const { Image } = require('../models');
const ctrl = {};


ctrl.index = (req, res) => {
    res.render('index');
}
ctrl.login = (req, res) => {
    res.render('login');
}

ctrl.crear = async(req, res) => {
    const imgpath = req.file.path;
    const imgName = helpers.randomString();
    const ext = path.extname(req.file.originalname).toLowerCase();
    const targetpath = path.resolve(`src/public/upload/${imgName}${ext}`);

    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
        await fs.rename(imgpath, targetpath);
        const newimg = new Image({
            mensaje: req.body.mensaje,
            filename: imgName + ext,
        })
        const imageSaved = await newimg.save();
    }

    res.send('img subida');
}


module.exports = ctrl;