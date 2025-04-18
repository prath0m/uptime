const Incident = require("../models/incidentModel");
const Monitor = require("../models/monitorModel");
const User = require('../models/userModel');
const axios = require("axios");
const sendAlerts = require('../utils/alert');

const testUrl = async (monitor) => {
  await axios.get(monitor.url).catch(async (error) => {
    const existingIncident = await Incident.findOne({ monitorId: monitor._id });

    const currentDate = new Date().toJSON().slice(0, 10);
    const user = await User.findById(monitor.user);
    const data = {
        monitorID : monitor._id,
        monitorURL : monitor?.url,
        statusCode : error.response.status,
        createdAt: currentDate,
        firstName : user.firstName
    };

    if (!existingIncident) {
      await Incident.create({
        monitor: monitor._id,
        user: monitor.user,
        cause: `Service Down Status ${error.response.status}`,
      });
      await Monitor.updateOne({ _id: monitor._id }, { availability: false, lastIncidentAt: Date.now() });
      sendAlerts(user.email, data);
      console.log(`Issued service down warning for monitor ${monitor._id}`);
    }
    else if(!existingIncident.resolved){
      sendAlerts(user.email, data);
      console.log(`Issued service down warning for monitor ${monitor._id}`);
    }
  });
};

module.exports = testUrl;