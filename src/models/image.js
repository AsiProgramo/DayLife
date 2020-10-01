const mongoose = require('mongoose');
const { Schema } = mongoose;
const path = require('path');


const ImageSquema = new Schema({
    mensaje: { type: String },
    filename: { type: String },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now }

});

ImageSquema.virtual('uniqueId')
    .get(() => {
        return this.filename.replace(path.extname(this.filename), '');
    })

module.exports = mongoose.model('Image', ImageSquema);