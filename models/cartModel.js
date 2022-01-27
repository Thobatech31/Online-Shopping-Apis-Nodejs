const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema(
    {
        userId:{
            type: String,
            required: true,
        },
        products:[
            {
                productId:{
                    type: String,
                    required: true,
                },
                quantity:{
                    type: Number,
                    default: 1,
                },
            },
        ],
    },
    {timestamps : true}
);

// module.export = mongoose.model("Cart", CartSchema);
const Cart = mongoose.model("Cart", CartSchema)

module.exports = Cart