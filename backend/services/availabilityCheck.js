const cron = require("node-cron");
const asyncHandler = require("express-async-handler");
const axios = require('axios');
const Monitor = require("../models/monitorModel");
const testUrl = require("../utils/testUrl");

//function to check availability of websites
const scheduledAvailabilityCheck = asyncHandler(async() => {
    console.log("Running availability check...");

    const monitors = await Monitor.find({ active: true })
    .select("url alertEmails  userId")
    .populate({ path: "user", select: "firstName" });

    for (const monitor of monitors) {
        await testUrl(monitor);
    }
});

//Run every day at midnight
cron.schedule("0 0 * * *", () => {
    scheduledAvailabilityCheck().catch((error) => {
        console.error("Error in Availability check:", error);
    });
});

module.exports = {scheduledAvailabilityCheck};