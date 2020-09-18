const express = require('express');
const config = require('./server/config');

// requiere la base de datos
require('./datebase');

//ohs app extraido de express
const app = config(express());


// llama a el serve el un puerto
app.listen(app.get('port'), () => {
    console.log('server on port:http://localhost:' + app.get('port'));
});