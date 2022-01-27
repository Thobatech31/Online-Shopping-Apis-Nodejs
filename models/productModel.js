const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
    {
        title:{
            type: String,
            required: true,
            unique: true,
        },
        desc:{
            type: String,
            required: true,
        },
        categories:{
            type: Array,
        },
        img:{
            type: String,
            required: true,
        },
        size:{
            type: Array,
        },
        color:{
            type: Array,
        },
        price:{
            type: String,
            required: true,
        },
        inStock:{
            type:Boolean,
            required:true,
        },

    },
    {timestamps : true}
);

// module.export = mongoose.model("Product", ProductSchema);
const Product = mongoose.model("Product", ProductSchema)

module.exports = Product