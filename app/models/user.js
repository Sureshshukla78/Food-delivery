const mongoose = require("mongoose");
const Schema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique:true,
    },
    password:{
        type: String,
        required: true,
    },
    role:{
        type: String, 
        default: 'customer'
    }
},{
    timestamps:true
});

const User = new mongoose.model("User", Schema);
module.exports = User;