const router = require('express').Router();
const Product = require("../models/productModel");
const {verifyTokenAndAuthorization, verifyTokenAndAdmin} = require("../verifyToken");
const { route } = require('./auth');

//Create 
router.post("/", verifyTokenAndAdmin, async (req, res) =>{

    // const newProducts = new Product(req.body);    
     try{
        const savedProduct = await Product.create(req.body)
        return res.status(200).json({
            status:{
                code:100,
                msg:"Product Added Successfully"
            },
            data:savedProduct,
        })
     } catch (err){
         return res.status(500).json({msg:err})
     }

})

//UPDATE PRODUCT
router.put("/:id", verifyTokenAndAdmin, async (req,res) =>{
    try{
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
            $set : req.body
        }, {new:true});
        
        return res.status(200).json({
            status:{
                code:100,
                msg:'Product Updated successfully'
            },
            data:updatedProduct,
        })
    } catch (err){
        return res.status(500).json({msg:err});
    }
})


//Delete Product
router.delete("/:id", verifyTokenAndAdmin, async (req, res) =>{
    try{
        await Product.findByIdAndDelete(req.params.id)
        return res.status(200).json({
            status:{
                code:100,
                msg:"Product deleted Successfully"
            }
        })
    } catch (err) {
        return res.status(500).json({msg:err})
    }
})

//Get Product
//since everybody can see product there's no need for verification
router.get("/:id", async (req, res) =>{
    try{
       const product = await Product.findById(req.params.id)
       return res.status(200).json({
           status:{
               code:100,
               msg:"Product Fetched Successfully",
           },
           data: product
       }) 

    }catch (err){
        return res.status(500).json({msg:err})
    }
})


//Get all Orders
router.get("/", async (req, res) =>{
    const qNew = req.query.new
    const qCategory = req.query.category
    try {
        let products;

        if(qNew){
            products = await Product.find().sort({CreatedAt: -1}).limit(5);
        }else if(qCategory){
            products = await Product.find({
                categories:{
                    $in:[qCategory],
                },
            });
        }else{
            products = await Product.find()
        }
        return res.status(200).json({
            status:{
                code:100,
                msg:"All Products Fetched Successfully",
            },
            data: products
        })
    }catch (err){
        return res.status(500).json({msg:err})
    }
})

module.exports = router
