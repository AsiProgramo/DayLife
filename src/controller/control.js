const ctrl = {};

ctrl.index = (req, res) => {
        res.send('index page');
    }
    //sube img
ctrl.create = (req, res) => {
    res.send('img');
}

//Like a una img
ctrl.like = (req, res) => {
        res.send('img like');
    }
    //coment a una img
ctrl.coment = (req, res) => {
        res.send('img coment');
    }
    //delete a una img
ctrl.delete = (req, res) => {

    }
    //chat live
ctrl.chatlive = (req, res) => {
    res.send('Chat Live');
}

module.exports = ctrl;