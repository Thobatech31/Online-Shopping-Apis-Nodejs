const router = require('express').Router();
const User = require('../models/userModel');
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");


//REGISTER
router.post("/register", async (req, res) => {
    const {username, email} = req.body;

    //Check If Username Field Empty
    if(!username) 
    return res.status(401).json({msg: "Username Field is Empty"})

    //Check If Email address Field Empty
    if(!email) 
    return res.status(401).json({msg: "Email Field is Empty"})

    //Check If Password Field Empty
    if(!req.body.password) 
    return res.status(401).json({msg: "Password Field is Empty"})

    //Check if username already exists in the DB
    const usernameExists =  await User.checkUsernameAlreadyExist(username)
    if(usernameExists) 
    return res.status(401).json({msg : "Username Already Exists"});

    //Check if email already exists in the DB
    const emailExists =  await User.checkEmailAlreadyExist(email)
    if(emailExists) 
    return res.status(401).json({msg : "Email Already Exists"});

    try{
        const savedUser = await User.create({
            username,
            email,
            password :CryptoJS.AES.encrypt(req.body.password, process.env.ENCRYPT_PASSWORD_KEY), //Using CRYPTOJS on password Encryption
        });
        return res.status(200).json({
            status:{
                code:100,
                msg:'registration successfully'
            },
            data:savedUser,
        })
    } catch (err) {
       return res.status(500).send(err.message)
    }
})

//LOGIN
router.post("/login", async (req, res) =>{
    const {username} = req.body;

   try{
    //check if the user with the username exist
    const user = await User.findOne({username: username})
    if(!user)
    return res.status(401).json({msg: "Wrong Username or Password"})

    const hashPassword = CryptoJS.AES.decrypt(user.password, process.env.ENCRYPT_PASSWORD_KEY); //Decrypting the password to the normal character
    const originalPassword = hashPassword.toString(CryptoJS.enc.Utf8);
    if(originalPassword != req.body.password)
    return res.status(401).json({msg: "Wrong Username or Password"});

    const token = jwt.sign({
        id:user._id,
        username: user.username,
        email: user.email,
        isAdmin:user.isAdmin,
    }, 
    process.env.TOKEN_SECRET_KEY,
    {expiresIn:"3d"},
    );

    const {password, ...others} = user._doc
    res.status(200).json({
        status:{
            code: 100,
            msg: "Login Succesfully"
        },
        data: {...others, token}
    })
   } catch(err){
    return res.status(500).send(err)
   }
})

module.exports = router
