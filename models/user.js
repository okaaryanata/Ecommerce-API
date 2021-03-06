const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name : {
        type : String,
        required : true
    },
    role: {
        type: Number,
        required: true
    },
    password : {
        type: String,
        required: true
    },
    point : {
        type: Number,
        required: false
    }
});

const User = mongoose.model('user',userSchema);
module.exports = User;