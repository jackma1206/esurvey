const express = require("express");
const mongoose = require("mongoose");
const keys = require("./config/keys");
const cookieSession = require("cookie-session");
const passport = require("passport");
const bodyParser = require("body-parser");

require("./models/User");
require("./models/Survey");
require("./services/passport");

mongoose.connect(keys.mongoURI);

const app = express();

app.use(
  cookieSession({
    // how long the cookie will last
    maxAge: 30 * 24 * 60 * 60 * 1000,
    //key to encrypt cookie
    keys: [keys.cookieKey]
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
//route handler
// app.get("/", (req, res) => {
//   res.send({ bye: "buddy" });
// });

require("./routes/authRoutes")(app);
require("./routes/billingRoutes")(app);
require("./routes/surveyRoutes")(app);

//used for production only
if (process.env.NODE_ENV === "production") {
  //express will serve prod assets
  app.use(express.static("client/build"));
  //express will serve up index.html file if it doenst recognize route

  const path = require("path");
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

//for heroku
const PORT = process.env.PORT || 5000;

app.listen(PORT);
