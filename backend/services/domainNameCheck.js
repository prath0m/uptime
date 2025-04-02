const cron = require("node-cron");
const asyncHandler = require("express-async-handler");
const domainNames = require('../models/domainNameCheckModel');
const User = require('../models/userModel');
const Incident = require("../models/incidentModel");
const Monitor = require('../models/monitorModel');
const sendDomainNameAlert = require('../utils/DomainNameAlerts');

const scheduledDomainNameExpiryCheck = asyncHandler(async() =>{
    console.log("Running scheduled Domain Name Expiry expiry check...");
    const domainNameRecords = await domainNames.find();
    const today = new Date();
    
    for(const record of domainNameRecords){
        const daysLeft = Math.floor((record.expiryDate - today) / (1000 * 60 * 60 * 24));
        if(daysLeft <= parseInt(record.notifyExpiration)){
            //gather data for email alerts
            const monitorData = await Monitor.findById(record.monitor);
            const user = await User.findById(monitorData.user);
            const data = {
                firstName : user.firstName,
                monitorID : record.monitor,
                monitorURL : monitorData.url,
                expiryDays : daysLeft
            }
            const emailId = user.email;

            const createdIncident = await Incident.findOne({monitor: record.monitor});
            if(!createdIncident){
                await Incident.create({
                    monitor: record.monitor,
                    cause: `Domain Name expires in ${daysLeft} days`,
                    user: user._id
                });
                sendDomainNameAlert(emailId, data);
                console.log(`Issued domain name expiration warning for monitor ${record.monitor}`);
            }
            else if(!createdIncident.resolved){
                sendDomainNameAlert(emailId, data);
                console.log(`Issued domain name expiration warning for monitor ${record.monitor}`);
            }
        }
    }    
})

//Run every day at midnight
cron.schedule("0 0 * * *", () => {
    scheduledDomainNameExpiryCheck().catch((error) => {
        console.error("Error in Domain Name expiry check:", error);
    });
});

module.exports = { scheduledDomainNameExpiryCheck };
