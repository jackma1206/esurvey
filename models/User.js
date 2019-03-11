const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  googleId: String,
  credits: { type: Number, default: 0 }
});
//tells mongoose to create collections users from model userSchema
mongoose.model("users", userSchema);
