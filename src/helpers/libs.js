const helpers = {};

helpers.randomString = () => {
    const opts = 'abcdefghijklmnopqrstvwxyz0123456789';
    let randomname = '';
    for (let i = 0; i < 6; i++) {
        randomname += opts.charAt(Math.floor(Math.random() * opts.length));
    }
    return randomname;
}

module.exports = helpers;