const router = require('express').Router();
const Order = require("../models/orderModel");
const {verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyToken} = require("../verifyToken");
const { route } = require('./auth');

//Create  Order
router.post("/", verifyToken, async (req, res) =>{
    const {userId, productId, amount, address} = req.body;
    //check if userId i s Empty
    if(!userId){
        return res.status(401).json({msg: "Userid is empty"});
    }


     if(!amount){
        return res.status(401).json({msg:"Amount Field is Empty"});
     }

     if(!address){
        return res.status(401).json({msg:"Address Field is Empty"})
     }

     try{
        const savedOrder = await Order.create(req.body)
        return res.status(200).json({
            status:{
                code:100,
                msg:"Order Added Successfully"
            },
            data:savedOrder,
        })
     } catch (err){
         return res.status(500).json({msg:err})
     }

})

//UPDATE ORDER (ONLY ADMIN CAN UPDATE ORDER)
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true });

        return res.status(200).json({
            status: {
                code: 100,
                msg: 'Order Updated successfully'
            },
            data: updatedOrder,
        })
    } catch (err) {
        return res.status(500).json({ msg: err });
    }
})


//Delete Order (ONLY ADMIN CAN DELETE ORDER)
router.delete("/:id", verifyTokenAndAdmin, async (req, res) =>{
    try{
        await Order.findByIdAndDelete(req.params._id)
        return res.status(200).json({
            status:{
                code:100,
                msg:"Order deleted Successfully"
            }
        })
    } catch (err) {
        return res.status(500).json({msg:err})
    }
})

//Get Orders
router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) =>{
    try{
        const orders = await Order.find({ userId: req.params.userId}) //we use FIND because user can have more than one order
       return res.status(200).json({
           status:{
               code:100,
               msg:"Orders Fetched Successfully",
           },
           data: orders
       }) 

    }catch (err){
        return res.status(500).json({msg:err})
    }
})


//Get all Orders (ONLY ADMIN CAN GET ALL ORDERS)
router.get("/", verifyTokenAndAdmin, async (req, res) =>{
    try{
        const orders = await Order.find()
        return res.status(200).json({
            status:{
                code:100,
                msg:"All Orders Fetched Successfully",
            },
            data: orders
        })
    }catch (err){
        return res.status(500).json({msg:err})
    }
})

//Get Monthly Income (ONLY ADMIN CAN GET THE INCOME)
router.get("/income", verifyTokenAndAdmin, async (req, res) =>{
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));
    try{
        const incomeData = await Order.aggregate([
            { $match: { createdAt: { $gte: previousMonth } } },
            {
                $project: {
                    month: { $month: "$createdAt" },
                    sales: "$amount"
                },
            },
            {
                $group: {
                    _id: "$month",
                    total: { $sum: "$sales" },
                },
            },
          
        ]);
        return res.status(200).json({
            status:{
                code:100,
                msg:"Income Fetched Succesfully",
            },
            data: incomeData
        })

    }catch(err){
        return res.status(500).json({msg:err})   
    }
})

module.exports = router
