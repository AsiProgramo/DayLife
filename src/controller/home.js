const ctrl = {};

ctrl.index = (req, res) => {
    res.render('index');
}
ctrl.login = (req, res) => {
    res.render('login');
}

module.exports = ctrl;