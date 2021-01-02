const mongoose = require('mongoose');

const { database } = require('./keys');
//conecta a la base de datos db
mongoose.connect(database.URI, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(db => console.log('db is conected'))
    .catch(err => console.error(err));