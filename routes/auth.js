const router = require('express').Router();
const User = require('../models/userModel');
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const mailgun = require("mailgun-js");
const { result } = require('lodash');
const DOMAIN = 'sandbox1007fd244adb439091af67d5b46543d1.mailgun.org';
const mg = mailgun({ apiKey: 'efe5ce01dcc618d9e3b297f06f81cc8a-c250c684-64e5fd3a', domain: DOMAIN });
const { verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyToken } = require("../verifyToken");


//REGISTER WITHOUT EMAIL VERIFICATION
router.post("/register", async (req, res) => {
    const { username, email } = req.body;

    //Check If Username Field Empty
    if (!username)
        return res.status(401).json({ msg: "Username Field is Empty" })

    //Check If Email address Field Empty
    if (!email)
        return res.status(401).json({ msg: "Email Field is Empty" })

    //Check If Password Field Empty
    if (!req.body.password)
        return res.status(401).json({ msg: "Password Field is Empty" })

    //Check if username already exists in the DB
    const usernameExists = await User.checkUsernameAlreadyExist(username)
    if (usernameExists)
        return res.status(401).json({ msg: "Username Already Exists" });

    //Check if email already exists in the DB
    const emailExists = await User.checkEmailAlreadyExist(email)
    if (emailExists)
        return res.status(401).json({ msg: "Email Already Exists" });

    try {
        const savedUser = await User.create({
            username,
            email,
            password: CryptoJS.AES.encrypt(req.body.password, process.env.ENCRYPT_PASSWORD_KEY), //Using CRYPTOJS on password Encryption
        });
        return res.status(200).json({
            status: {
                code: 100,
                msg: 'registration successfully'
            },
            data: savedUser,
        })
    } catch (err) {
        return res.status(500).send(err.message)
    }
})

//REGISTER WITH EMAIL VERIFICATION
router.post("/register-verify", async (req, res) => {
    const { username, email, password } = req.body;

    //Check If Username Field Empty
    if (!username)
        return res.status(401).json({ msg: "Username Field is Empty" })

    //Check If Email address Field Empty
    if (!email)
        return res.status(401).json({ msg: "Email Field is Empty" })

    //Check If Password Field Empty
    if (!req.body.password)
        return res.status(401).json({ msg: "Password Field is Empty" })

    //Check if username already exists in the DB
    const usernameExists = await User.checkUsernameAlreadyExist(username)
    if (usernameExists)
        return res.status(401).json({ msg: "Username Already Exists" });

    //Check if email already exists in the DB
    const emailExists = await User.checkEmailAlreadyExist(email)
    if (emailExists)
        return res.status(401).json({ msg: "Email Already Exists" });

    try {
        const token = jwt.sign({ username, email, password }, process.env.ENCRYPT_PASSWORD_KEY, { expiresIn: '20m' });

        const data = {
            from: 'fakeemail@gmail.com',
            to: email,
            subject: 'Account Activation Link',
            html: `
                <h2>Please click on the given link to activate your account</h2>
                <p>${process.env.CLIENT_URL}/authentication/activate/${token}</p>
            `
        };
        mg.messages().send(data, function (error, body) {
            if (error) {
                return res.status(401).json({
                    msg: err.message
                })
            }
            return res.status(200).json({
                status: {
                    code: 100,
                    msg: 'Email has been sent successfully, Kindly Activate your Account'
                },
            })
        });
    } catch (err) {
        return res.status(500).send(err.message)
    }
})

//EMAIL ACTIVATE
router.post("/activate-email", async (req, res) => {
    const { token } = req.body;
    if (token) {
        jwt.verify(token, process.env.ENCRYPT_PASSWORD_KEY, function (err, decodedToken) {
            if (err) {
                res.status(401).json({ msg: "Incorrect or Expiredf Linlk" })
            }

            const { username, email, password } = decodedToken;

            User.findOne({ email }).exec((err, user) => {
                if (user) {
                    return res.status(400).json({
                        status: 400,
                        message: "User with Email Already exists"
                    })
                }
                try {
                    const savedUser = User.create({
                        username,
                        email,
                        password: CryptoJS.AES.encrypt(password, process.env.ENCRYPT_PASSWORD_KEY), //Using CRYPTOJS on password Encryption 
                    });
                    return res.status(200).json({
                        status: {
                            code: 100,
                            msg: 'registration successfully'
                        },
                        data: savedUser,
                    })
                } catch (err) {
                    return res.status(400).json({ msg: "Registration error" });

                }
            })
        })
    } else {
        res.status(500).json({ msg: "Token is not Exist" })
    }
})

//FORGOT PASSWORD
router.put("/forgot-password", async (req, res) => {
    const { email } = req.body;
    // //Check if username already exists in the DB
    // const usernameExists = await User.checkUsernameAlreadyExist(username)
    // if (!usernameExists)
    //     return res.status(401).json({ msg: "User with this Username does not Exists" });

    //Check if email already exists in the DB
    const user = await User.checkEmailAlreadyExist(email)
    if (!user)
        return res.status(401).json({ msg: "User with this Email Already does not exists Exists" });
    try {
        const token = jwt.sign({ id: user._id }, process.env.RESET_PASSWORD_KEY, { expiresIn: '20m' });

        const data = {
            from: 'fakeemail@gmail.com',
            to: email,
            subject: 'Password Reset Link',
            html: `
                <h2>Please click on the given link to reset  your password</h2>
                <p>${process.env.CLIENT_URL}/resetpassword/${token}</p>
            `
        };

        return user.updateOne({ resetLink: token }, function (err, success) {
            if (err) {
                return res.status(400).json({ msg: "Reset password link error" });
            } else {

                mg.messages().send(data, function (error, body) {
                    if (error) {
                        return res.status(401).json({
                            msg: err.message
                        })
                    }
                    return res.status(200).json({
                        status: {
                            code: 100,
                            msg: 'Email has been sent successfully, Kindly Follow the instruction'
                        },
                        email: user.email,
                        username: user.username
                    })
                });

            }
        })
    } catch (err) {
        return res.status(500).json(err.message)
    }
})

//RESET PASSWORD
router.put("/reset-password", async (req, res) => {
    const { resetLink, newPassword } = req.body;

    if (resetLink) {
        jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, function (err, decodedData) {
            if (err) {
                res.status(401).json({ msg: "Incorrect Token or Expired Toekn" })
            }

            User.findOne({ resetLink }).exec((err, user) => {
                if (err || !user) {
                    return res.status(400).json({
                        status: 400,
                        message: "User with with this token does not exist"
                    })
                }

                const obj = {
                    password: CryptoJS.AES.encrypt(newPassword, process.env.ENCRYPT_PASSWORD_KEY), //Using CRYPTOJS on password Encryption 

                }

                user = _.extend(user, obj);
                user.save((err, result) => {
                    if (err) {
                        return res.status(400).json({ msg: "Reset password error" });
                    } else {
                        return res.status(200).json({ msg: "Your password has been change" })
                    }
                })
            })
        })


    } else {
        return res.status(500).json({ msg: "Authentication Error !!!" })

    }
})

//CHANGE PASSWORD
router.post("/change-password", verifyToken, async (req, res) => {
    const { oldPassword, newPassword, confirmNewPassword } = req.body
    const useremail = req.user.email;
    const user = await User.findOne({ useremail })

    const originalPassword = CryptoJS.AES.decrypt(user.password, process.env.ENCRYPT_PASSWORD_KEY).toString(CryptoJS.enc.Utf8); //Using CRYPTOJS on password Encryption 

    if (originalPassword == oldPassword) {
        if (newPassword == confirmNewPassword) {

            const newHashPassword = CryptoJS.AES.encrypt(newPassword, process.env.ENCRYPT_PASSWORD_KEY)

            return user.updateOne({ password: 'U2FsdGVkX19fKpq+tqJop1MQWTnK/UGTb4Gp2q2I2Es='  }, function (err, success) {
                if (err) {
                    return res.status(400).json({ msg: "Error occure" });
                } else {

                    return res.status(200).json({
                        status: {
                            code: 100,
                            msg: "Password Updated Succesfully"
                        },
                        // data: user.password
                    })
                }
            })


        } else {
            res.status(401).json({ msg: "New Password does not matches Confirm Password" })
        }

    } else {
        res.status(401).json({ msg: "Old Password does not matches with your password" })
    }

})

//LOGIN
router.post("/login", async (req, res) => {
    const { username } = req.body;
    //Check If Username Field Empty
    if (!username)
        return res.status(401).json({ msg: "Username Field is Empty" })

    //Check If Username Field Empty
    if (!password)
        return res.status(401).json({ msg: "Password Field is Empty" })


    try {
        //check if the user with the username exist
        const user = await User.findOne({ username: username })
        if (!user)
            return res.status(401).json({ msg: "Wrong Username or Password" })

        const hashPassword = CryptoJS.AES.decrypt(user.password, process.env.ENCRYPT_PASSWORD_KEY); //Decrypting the password to the normal character
        const originalPassword = hashPassword.toString(CryptoJS.enc.Utf8);
        if (originalPassword != req.body.password)
            return res.status(401).json({ msg: "Wrong Username or Password" });

        const token = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
        },
            process.env.TOKEN_SECRET_KEY,
            { expiresIn: "3d" },
        );

        const { password, ...others } = user._doc
        res.status(200).json({
            status: {
                code: 100,
                msg: "Login Succesfully"
            },
            data: { ...others, token }
        })
    } catch (err) {
        return res.status(500).send(err)
    }
})

module.exports = router
