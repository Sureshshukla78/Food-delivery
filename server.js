require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const ejs = require("ejs");
const expressLayout = require("express-ejs-layouts");
const path = require("path")
const mongoose = require('mongoose');
const session = require("express-session");
const flash = require("express-flash");
const MongoDbStore = require('connect-mongo');
const passport = require('passport');
const emitter = require('events');

// database connection
const url = process.env.CONNECTION_URL;
mongoose.connect(url).then(() => {
    console.log("Connection is stablished with MongoDb.");
}).catch((e) => {
    console.log(`Error in connecting due to :${e}`)
});
// session store
const mongoStore = new MongoDbStore({
    mongoUrl : url,
    collection : 'sessions'
})

// event-emitter
const eventEmitter = new emitter();
app.set('eventEmitter', eventEmitter);

// session config
app.use(session({
    secret: process.env.SECRET_KEY,
    store: mongoStore,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: false,
    saveUninitialized: false,
}));

// passport config
const passportInit = require('./app/config/passport');
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session())



// global middleware
app.use((req, res, next)=>{
    res.locals.session = req.session;
    res.locals.user = req.user;
    next();
})

// setting template engine
app.use(expressLayout);
app.set('views', path.join(__dirname, '/resources/views'));
app.set('view engine', 'ejs');


app.use(flash());
// assets
app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded({extended:false}));

//routes
require('./routes/web')(app);
app.use((req,res)=>{
    res.status(404).send('<h1>404, Page Not Found</h1>');
})

// listening server
const server = app.listen(port, () => {
    console.log(`Server is Running on port ${port}`);
});

// socket
const io = require("socket.io")(server);
io.on('connection', (socket)=>{
    // join 
    // console.log(socket.id);
    socket.on('join', (orderId)=>{
        // console.log(orderId);
        socket.join(orderId);
    })
})

eventEmitter.on('orderUpdated',(data)=>{
    io.to(`order_${data.id}`).emit('orderUpdated', data);
})

eventEmitter.on('orderPlaced',(data)=>{
    io.to(`adminRoom`).emit('orderPlaced', data);
})