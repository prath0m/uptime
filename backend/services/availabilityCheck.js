const cron = require("node-cron");
const asyncHandler = require("express-async-handler");
const axios = require('axios');

//function to check availability of websites
const scheduledAvailabilityCheck = asyncHandler(async() => {
    console.log("Running availability check...");
    axios.get('/api/v1/check/availability');
});

//Run every day at midnight
cron.schedule("34 19 * * *", () => {
    scheduledAvailabilityCheck().catch((error) => {
        console.error("Error in Availability check:", error);
    });
});

module.exports = {scheduledAvailabilityCheck};