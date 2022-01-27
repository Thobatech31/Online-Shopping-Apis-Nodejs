const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
var cors = require('cors');

// //import Routes
const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');
const orderRoute = require('./routes/order');
const cartRoute = require('./routes/cart');
const productRoute = require('./routes/product');
const stripeRoute = require("./routes/stripe");


dotenv.config();


//Middlewares
app.use(cors());
app.use(express.json());


//Connect to Database
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
        useUnifiedTopology: true,
})
.then(console.log("connected To Mondo DB"))
.catch((err) => console.log(err));

// //Routes Middleware
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/orders', orderRoute);
app.use('/api/carts', cartRoute);
app.use('/api/products', productRoute);
app.use("/api/checkout", stripeRoute);


const PORT = process.env.PORT || 8000
app.listen(
    PORT,
    console.log(`The app is running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)