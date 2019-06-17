const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const basketSchema = new Schema({
    item_id:{
        type: Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },
    merchant_id:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    customer_id:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status:{
        type: Number,
        required: true
    }
});

const Basket = mongoose.model('Basket',basketSchema);
module.exports=Basket;