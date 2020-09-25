const path = require('path');
const helpers = require('../helpers/libs');
const fs = require('fs-extra');
const ctrl = {};


ctrl.index = (req, res) => {
    res.render('index');
}
ctrl.login = (req, res) => {
    res.render('login');
}

ctrl.crear = async(req, res) => {
    const imgpath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    const targetpath = path.resolve(`src/public/upload/${helpers.randomString()}${ext}`);

    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
        await fs.rename(imgpath, targetpath);
    }

    res.send(ext);
}


module.exports = ctrl;