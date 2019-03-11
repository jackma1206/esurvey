const _ = require("lodash");
const { Path } = require("path-parser");
const { URL } = require("url");
const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const requireCredits = require("../middlewares/requireCredits");
const Mailer = require("../services/Mailer");
const surveyTemplate = require("../services/emailTemplates/surveyTemplate");

const Survey = mongoose.model("surveys");

module.exports = app => {
  app.get("/api/surveys", requireLogin, async (req, res) => {
    const surveys = await Survey.find({ _user: req.user.id }).select({
      recipients: false
    });
    res.send(surveys);
  });

  app.get("/api/surveys/:surveyId/:choice", (req, res) => {
    res.send("Hey there! Thanks for voting!");
  });

  //process data from sendgrid email clicks and save to db
  app.post("/api/surveys/webhooks", (req, res) => {
    const p = new Path("/api/surveys/:surveyId/:choice");

    _.chain(req.body) //chains lodash functions
      .map(({ email, url }) => {
        //map over all req.body sent back
        const match = p.test(new URL(url).pathname);
        if (match) {
          return {
            email,
            surveyId: match.surveyId,
            choice: match.choice
          };
        }
      })
      .compact() //removes undefined elements
      .uniqBy("email", "surveyId") //takes out duplicate events with same email AND surveyId
      .each(({ surveyId, email, choice }) => {
        Survey.updateOne(
          {
            //find and update one record ({args to find record}, {update record with this data })
            _id: surveyId,
            recipients: {
              $elemMatch: { email: email, responded: false }
            }
          },
          {
            $inc: { [choice]: 1 }, //increment [yes] || [no] by 1
            $set: { "recipients.$.responded": true }, //set found recipients.responded to true
            lastResponded: new Date()
          }
        ).exec();
      })
      .value(); //gets return value
    res.send({});
  });

  //middleware in order of execution
  //send survey mail and save survey to db
  app.post("/api/surveys", requireLogin, requireCredits, async (req, res) => {
    const { title, subject, body, recipients } = req.body;
    const survey = new Survey({
      title,
      subject,
      body,
      recipients: recipients
        .split(",")
        .map(email => ({ email: email.trim(), responded: false })),
      _user: req.user.id,
      dateSent: Date.now()
    });

    //send mail
    const mailer = new Mailer(survey, surveyTemplate(survey));

    try {
      await mailer.send();
      //if mail is sent successfully, save survey, update user, save user
      await survey.save();
      req.user.credits -= 1;
      const user = await req.user.save();

      res.send(user);
    } catch (err) {
      //error handling
      res.status(422).send(err);
    }
  });
};
