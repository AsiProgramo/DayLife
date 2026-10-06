const helpers = {};

// genera un id aleatorio de 6 caracteres para el nombre de la imagen
helpers.randomNumber = () => {
    const possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomNumber = '';
    for (let i = 0; i < 6; i++) {
        randomNumber += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return randomNumber;
};

// escapa caracteres especiales para usar un texto dentro de un RegExp
helpers.escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = helpers;
