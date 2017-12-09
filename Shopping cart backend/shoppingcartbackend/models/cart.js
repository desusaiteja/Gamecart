var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    cart_id: {type: String, required: true},
    products: [{
        product_id: {type:String, required: true},
        qty: {type: Number, required: true}
    }],
    share_id: {type: String}
});

module.exports = mongoose.model('Cart', schema);