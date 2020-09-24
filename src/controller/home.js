const ctrl = {};

ctrl.index = (req, res) => {
    res.render('index');
}
ctrl.login = (req, res) => {
    res.render('login');
}

ctrl.crear = (req, res) => {
    res.render('crear');
}


module.exports = ctrl;