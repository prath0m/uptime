const cron = require("node-cron");
const asyncHandler = require("express-async-handler");
const SSLCheck = require("../models/sslCheckModel");
const Incident = require("../models/incidentModel");

const checkSSLCertExpiry = asyncHandler(async () => {
    console.log("Running scheduled SSL expiry check...");

    //Get all SSL records
    const sslRecords = await SSLCheck.find();

    //Get today's date
    const today = new Date();
    const millisecondsPerDay = 24 * 60 * 60 * 1000;

    //Check for upcoming expirations
    for (const record of sslRecords) {
        const validTo = new Date(record.validTo);
        const differenceInDays = Math.floor((validTo - today) / millisecondsPerDay);

        //If SSL is expiring soon, log an incident
        if (differenceInDays <= parseInt(record.notifyExpiration)) {
            await Incident.create({
                monitor: record.monitor,
                cause: `SSL certificate expires in ${differenceInDays} days`
            });
            console.log(`SSL expiry warning for Monitor ID: ${record.monitor}`);
        }
    }
});

//Run every day at midnight
cron.schedule("0 0 * * *", () => {
    checkSSLCertExpiry().catch((error) => {
        console.error("Error in SSL expiry check:", error);
    });
});

module.exports = { checkSSLCertExpiry };
