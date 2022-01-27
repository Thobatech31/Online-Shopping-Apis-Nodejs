const router = require('express').Router();
const Cart = require("../models/cartModel");
const { verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyToken } = require("../verifyToken");
const { route } = require('./auth');

//Create Cart
router.post("/", verifyToken, async (req, res) => {

  // const newProducts = new Product(req.body);    
  try {
    const savedCart = await Cart.create(req.body)
    return res.status(200).json({
      status: {
        code: 100,
        msg: "Cart Added Successfully"
      },
      data: savedCart,
    })
  } catch (err) {
    return res.status(500).json({ msg: err })
  }

})

//UPDATE Cart
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const updatedCart = await Cart.findByIdAndUpdate(req.params.id, {
      $set: req.body
    }, { new: true });

    return res.status(200).json({
      status: {
        code: 100,
        msg: 'Cart Updated successfully'
      },
      data: updatedCart,
    })
  } catch (err) {
    return res.status(500).json({ msg: err });
  }
})


//Delete Cart
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id)
    return res.status(200).json({
      status: {
        code: 100,
        msg: "Cart deleted Successfully"
      }
    })
  } catch (err) {
    return res.status(500).json({ msg: err })
  }
})


//Get Cart Based on user Id
router.get("/find/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId})
    return res.status(200).json({
      status: {
        code: 100,
        msg: "Cart Fetched Successfully",
      },
      data: cart
    })

  } catch (err) {
    return res.status(500).json({ msg: err })
  }
})


//Get all Orders (Only admin can view all orders)
router.get("/", verifyTokenAndAdmin, async (req, res) => {

  try {
    const carts = await Cart.find()
    
    return res.status(200).json({
      status: {
        code: 100,
        msg: "All Orders Fetched Successfully",
      },
      data: carts
    })
  } catch (err) {
    return res.status(500).json({ msg: err })
  }
})

module.exports = router
