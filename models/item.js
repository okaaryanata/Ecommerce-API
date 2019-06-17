const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    name : {
        type : String,
        required : true
    },
    item_code : {
        type : String,
        required: false
    },
    merchant_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    merchant_name: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: false
    },
    price: {
        type: Number,
        required: true
    }
});

const Item = mongoose.model('item', itemSchema);
module.exports=Item;