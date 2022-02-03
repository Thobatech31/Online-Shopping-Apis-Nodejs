const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        username:{
            type: String,
            required: true,
            unique: true,
        },
        email:{
            type: String,
            required: true,
            unique: true,
        },
        password:{
            type: String,
            required: true,
        },
        isAdmin:{
            type: Boolean,
            default: false,
        },
        resetLink:{
            type:String,
            default:'',
        },
    },
    {timestamps : true}
);

UserSchema.statics.checkEmailAlreadyExist = async (email) => {
    const emailExists = await User.findOne({ email })
    if (emailExists)
        return emailExists   
}

UserSchema.statics.checkUsernameAlreadyExist = async (username) => {
    const usernameExists = await User.findOne({ username })
    if (usernameExists)
        return usernameExists   
}


// module.exports = mongoose.model("User", UserSchema);
const User =  mongoose.model("User", UserSchema)

module.exports = User

