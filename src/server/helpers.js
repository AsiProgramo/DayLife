const moment = require('moment');
const md5 = require('md5');
const helpers = {};

moment.locale('es');

helpers.timeago = timestamp => {
    return moment(timestamp).startOf('minute').fromNow();
};

helpers.getCurrentYear = () => {
    return new Date().getFullYear();
};

// hash para la foto de perfil de gravatar
helpers.gravatar = email => md5((email || '').trim().toLowerCase());

// nombre a mostrar: la parte del email antes de la @
helpers.username = email => (email || '').split('@')[0];

module.exports = helpers;
