const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rewardSchema = new Schema({
    name : {
        type : String,
        required : true
    },
    status: {
        type: Number,
        required: true
    },
    point : {
        type: Number,
        required: true
    }
});

const Reward = mongoose.model('reward',rewardSchema);
module.exports = Reward;