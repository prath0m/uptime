const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service : 'Gmail',
    secure : false,
    auth : {
        user : process.env.GMAIL_USER,
        pass : process.env.GMAIL_PASSWORD
    }
});

const sendAlerts = (emailId, data)=>{
    try{
        const info = transporter.sendMail({
            from : process.env.GMAIL_USER,
            to : emailId,
            subject : 'Service Down!',
            text : `
Dear ${data.firstName},
Your service monitored by UpGuard is down.
A downtime incident was reported at ${data.createdAt} with status code ${data.statusCode}.

Monitor Id : ${data.monitorID}
Service URL : ${data.monitorURL}

Visit the incident tab on your UpGuard profile for more.

Thankyou...
Team UpGuard`
        });
        console.log("Alert email sent to : ", data.firstName);
    }
    catch(error){
        console.log("Error sending email", error);
    }
};

module.exports = sendAlerts;