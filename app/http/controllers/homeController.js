const Menu = require("../../models/menu");

function homeController(){
    return {
        async index(req, res) {
            const data = await Menu.find()
            // console.log(data);
            return res.render('home', {menu: data});
        }
    }
}

module.exports = homeController;