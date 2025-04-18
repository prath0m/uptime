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

const sslAlerts = (emailId, data)=>{
    try{
        const info = transporter.sendMail({
            from : process.env.GMAIL_USER,
            to : emailId,
            subject : 'SSL Certificate expiry!',
            text : `
Dear ${data.firstName},
The SSL certificate of your service monitored by UpGuard is about to expire in ${data.expiryDays} days. 
Please renew the certificate to avoid any potential security risks.

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

module.exports = sslAlerts;