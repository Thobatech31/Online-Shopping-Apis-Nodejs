const {verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin} = require("../verifyToken");
const router = require('express').Router();
const User = require("../models/userModel");
const CryptoJS = require("crypto-js");
const { route } = require("./auth");

//UPDATE USER
router.put("/:id", verifyTokenAndAuthorization, async (req,res) =>{
    if(req.body.password){
        req.body.password = CryptoJS.AES.encrypt(req.body.password, process.env.ENCRYPT_PASSWORD_KEY).toString();
    };

    try{
        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
            $set : req.body
        }, {new:true});
        
        const {password, ...othersUpdatedDetails} = updatedUser._doc;
        return res.status(200).json({
            status:{
                code:100,
                msg:'User Updated successfully'
            },
            data:othersUpdatedDetails,
        })
    } catch (err){
        return res.status(500).json({msg:err});
    }
})


//DELETE USER
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) =>{
    try{
        await User.findByIdAndDelete(req.params.id);
        return res.status(200).json({
            status:{
                code:100,
                msg:'User has been Deleted successfully'
            },
        })
    }catch (err){
        return res.status(500).json({msg:err});
    }
})

//GET USER (Note only admin can get user)
router.get("/:id", verifyTokenAndAdmin, async (req, res) =>{
    try{
        const user = await User.findById(req.params.id);
        const {password, ...others} = user._doc
        return res.status(200).json({
            status:{
                code:100,
                msg:'User fetched successfully'
            },
            data: others
        })
    }catch (err){
        return res.status(500).json({msg:err});
    }
})

//GET All USERS (Note only admin can get user)
router.get("/", verifyTokenAndAdmin, async (req, res) =>{

    //Initiating a seach parameter with (Username)
       let query = {};
        if(req.query.search){
            query.$or=[
                { "username" : { $regex: req.query.search, $options: 'i'} },
            ];
        }

        const pageSize = req.query.pageSize || 10;
        const currentPage = req.query.currentPage || 1;
    try{
        const users = await User.find(query)
        .sort({ createdAt: -1 })
        .skip(pageSize * (currentPage - 1))
        .limit(pageSize);

        // count the total number of records for that model
        const totalUsers = await User.countDocuments(); 

      if(!users) return res.status(404).json({msg : "There's No User Available"})

        return res.status(200).json({
            status:{
                code:100,
                msg:'Users fetched successfully'
            },
            data: users,
            totalPage: parseInt(pageSize),
            totalRecords: parseInt(totalUsers),
            currentPage:parseInt(currentPage),
        })
    }catch (err){
        return res.status(500).json({msg:err});
    }
})

//GET MONTHLY STATS
router.get("/monthly/stats", verifyTokenAndAdmin, async (req, res) =>{
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

    try{
        const stats = await User.aggregate([
            { $match: { createdAt: { $gte: lastYear } } },
            {
                $project: {
                    month: { $month: "$createdAt"},
                },
            },
            {
                $group: {
                    _id: "$month",
                    total: { $sum: 1},
                },
            },
    
        ]);
        return res.status(200).json({
            status:{
                code:100,
                msg:'Data Fetched successfully'
            },
            data: stats,
        })
    } catch (err){
        return res.status(500).json({msg:err})
    }
})

module.exports = router
