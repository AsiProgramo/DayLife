const fs = require('fs-extra');
const path = require('path');

const md5 = require('md5');

const ctrl = {};

const sidebar = require('../helpers/sidebar');
const { randomNumber, escapeRegex } = require('../helpers/libs');
const { Image, Comment } = require('../models');
const { UPLOAD_DIR } = require('../config/paths');

const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];

// busca una imagen por su id único (nombre del archivo sin extensión)
const findImage = (uniqueId) => Image.findOne({
    filename: { $regex: '^' + escapeRegex(uniqueId) + '\\.' }
});

ctrl.index = async(req, res) => {
    const image = await findImage(req.params.image_id);
    if (!image) return res.redirect('/');

    image.views = image.views + 1;
    await image.save();

    const comments = await Comment.find({ image_id: image._id })
        .sort({ 'timestamp': 1 });

    let viewModel = { image, comments };
    viewModel.isOwner = !!(req.user && image.user_id && image.user_id.equals(req.user._id));
    viewModel = await sidebar(viewModel);
    res.render('image', viewModel);
};

ctrl.create = async(req, res) => {
    if (!req.file) {
        req.flash('error', 'Selecciona una imagen');
        return res.redirect('/');
    }

    const imageTempPath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();

    // Validate Extension
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        await fs.remove(imageTempPath);
        req.flash('error', 'Solo se permiten imágenes (png, jpg, jpeg, gif, webp)');
        return res.redirect('/');
    }

    // genera un nombre que no exista todavía
    let imgUrl;
    do {
        imgUrl = randomNumber();
    } while (await findImage(imgUrl));

    // Image Location
    await fs.move(imageTempPath, path.join(UPLOAD_DIR, imgUrl + ext));
    const newImg = new Image({
        title: req.body.title,
        filename: imgUrl + ext,
        description: req.body.description,
        user_id: req.user._id
    });
    const imageSaved = await newImg.save();
    res.redirect('/images/' + imageSaved.uniqueId);
};

ctrl.like = async(req, res) => {
    const image = await findImage(req.params.image_id);
    if (!image) return res.status(404).json({ error: 'Imagen no encontrada' });

    const updated = await Image.findByIdAndUpdate(
        image._id, { $inc: { likes: 1 } }, { new: true }
    );
    res.json({ likes: updated.likes });
};

ctrl.comment = async(req, res) => {
    const image = await findImage(req.params.image_id);
    if (!image) return res.redirect('/');

    const text = (req.body.comment || '').trim();
    if (!text) return res.redirect('/images/' + image.uniqueId);

    const newComment = new Comment({
        comment: text,
        email: req.user.email,
        name: req.user.email.split('@')[0],
        gravatar: md5(req.user.email),
        image_id: image._id
    });
    await newComment.save();
    res.redirect('/images/' + image.uniqueId + '#' + newComment._id);
};

ctrl.remove = async(req, res) => {
    const image = await findImage(req.params.image_id);
    if (!image) return res.status(404).json({ error: 'Imagen no encontrada' });

    if (!image.user_id || !image.user_id.equals(req.user._id)) {
        return res.status(403).json({ error: 'Solo el autor puede borrar la imagen' });
    }

    await fs.remove(path.join(UPLOAD_DIR, image.filename));
    await Comment.deleteMany({ image_id: image._id });
    await image.deleteOne();
    res.json(true);
};

module.exports = ctrl;
