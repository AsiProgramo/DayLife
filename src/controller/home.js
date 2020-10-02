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
    //crea un nombre random
    const imgName = helpers.randomString();
    //mira tosdas las imagenes guardadas
    const imagenes = await Image.find({ filename: imgName });
    const saveImage = () => {
        //comprueba si hay alguna con el mismi nombre
        if (imagenes.length > 0) {
            saveImage();
        } else {
            const imgpath = req.file.path;

            const ext = path.extname(req.file.originalname).toLowerCase();
            const targetpath = path.resolve(`src/public/upload/${imgName}${ext}`);

            if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
                await fs.rename(imgpath, targetpath);
                const newimg = new Image({
                    mensaje: req.body.mensaje,
                    filename: imgName + ext,
                })
                const imageSaved = await newimg.save();
            } else {
                await fs.unlink(imgpath);
                res.status(500).json({
                    'error': 'Solo imagenes esta permitido.'
                });
            }

            res.send('img subida');
        }
    }


}


module.exports = ctrl;