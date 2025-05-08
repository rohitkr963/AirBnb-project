const mongoose = require("mongoose"); 
const Schema = mongoose.Schema; 
const passportLocalMongoose = require("passport-local-mongoose"); // Passport plugin ko import kar rahe hain jo authentication handle karta hai

const userSchema = new Schema ({
    email: {
        type: String, 
        required: true 
    }
}) // User ke liye schema define kiya gaya hai

userSchema.plugin(passportLocalMongoose); // Passport-local-mongoose plugin ko schema me add kiya gaya hai for username, password hashing, etc.

module.exports = mongoose.model("User", userSchema); 

// for authentication first we make a schema for user step 1 // Step 1: User ke liye schema banana authentication ke liye
