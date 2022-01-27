const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
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
        amount:{
            type: Number,
            required: true,
        },
        address:{
            type: Object,
            required: true,
        },
        status:{
            type: String,
            default: "pending",
        }
    },
    {timestamps : true}
);

// module.export = mongoose.model("Order", OrderSchema);
const Order = mongoose.model("Order", OrderSchema)

module.exports = Order