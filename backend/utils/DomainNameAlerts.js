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

const sendDomainNameAlert = (emailId, data)=>{
    try{
        const info = transporter.sendMail({
            from : process.env.GMAIL_USER,
            to : emailId,
            subject : 'Domain Name Expiry aproaching!',
            text : `
Dear ${data.firstName},
The Domain Name for your service monitored by UpGuard is expiring in ${data.expiryDays} days.
Please renew your domain name to avoid any service disruption.

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

module.exports = sendDomainNameAlert;