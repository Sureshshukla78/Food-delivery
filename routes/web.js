const homeController = require('../app/http/controllers/homeController');
const authController = require("../app/http/controllers/authController");
const cartController = require("../app/http/controllers/customers/cartController");
const orderController = require("../app/http/controllers/customers/orderController");
const adminOrderController = require("../app/http/controllers/admin/orderController");
const statusController = require("../app/http/controllers/admin/statusController");

// middlewares
const guest = require("../app/http/middlewares/guest");
const auth = require("../app/http/middlewares/auth");
const admin = require("../app/http/middlewares/admin");

function initRoutes(app){
    app.get("/", homeController().index)
    app.get("/login", guest, authController().login);
    app.post("/login", authController().postlogin)
    app.get("/register",guest, authController().register);
    app.post("/register", authController().postRegister);
    app.get("/logout", authController().userlogout);
    
    
    app.get("/cart", cartController().index);
    app.post("/update-cart", cartController().update);
    

    // customer routes
    app.post("/order", auth, orderController().store);
    app.get("/customer/orders", auth, orderController().index);
    app.get("/customer/orders/:id", auth, orderController().show);

    //admin
    app.get('/admin/orders',admin, adminOrderController().index);
    app.post('/admin/orders/status',admin, statusController().update);
}

module.exports = initRoutes;