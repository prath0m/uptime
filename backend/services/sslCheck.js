const cron = require("node-cron");
const asyncHandler = require("express-async-handler");
const SSLCheck = require("../models/sslCheckModel");
const Incident = require("../models/incidentModel");
const User = require('../models/userModel');
const Monitor = require('../models/monitorModel');
const sslAlerts = require("../utils/SSLalert");

const scheduledSSLExpiryCheck = asyncHandler(async () => {
    console.log("Running scheduled SSL expiry check...");
    const sslRecords = await SSLCheck.find();
    const today = new Date();
    const millisecondsPerDay = 24 * 60 * 60 * 1000;

    for (const record of sslRecords) {
        const validTo = new Date(record.validTo);
        const differenceInDays = Math.floor((validTo - today) / millisecondsPerDay);
        //If SSL is expiring soon, log an incident
        if (differenceInDays <= parseInt(record.notifyExpiration)) {
            //send email alerts
            const monitorData = await Monitor.findById({_id: record.monitor});
            const user = await User.findById(monitorData.user);
            const data = {
                firstName : user.firstName,
                monitorID : record.monitor,
                monitorURL : monitorData.url,
                expiryDays : differenceInDays
            }
            const emailId = user.email;

            const createdIncident = await Incident.findOne({monitor: record.monitor});
            if(!createdIncident){
                await Incident.create({
                    monitor: record.monitor,
                    cause: `SSL certificate expires in ${differenceInDays} days`,
                });
                sslAlerts(emailId, data);
                console.log(`SSL expiry warning for Monitor ID: ${record.monitor}`);
            }
            else if(!createdIncident.resolved){
                sslAlerts(emailId, data);
                console.log(`SSL expiry warning for Monitor ID: ${record.monitor}`);
            }
        }
    }
});

//Run after every 3 hours
cron.schedule("0 */3 * * *", () => {
    scheduledSSLExpiryCheck().catch((error) => {
        console.error("Error in SSL expiry check:", error);
    });
});

module.exports = { scheduledSSLExpiryCheck };
