const Incident = require("../models/incidentModel");
const Monitor = require("../models/monitorModel");
const User = require('../models/userModel');
const axios = require("axios");
const sendAlerts = require('../utils/alert');

const testUrl = async (monitor) => {
  await axios.get(monitor.url).catch(async (error) => {
    //Checks if an incident is already created
    const existingIncident = await Incident.findOne({ monitorId: monitor._id });

    //Creates an incident
    if (!existingIncident) {
      await createAnIncident(monitor._id, monitor.user, error.response.status);
      const currentDate = new Date().toJSON().slice(0, 10);

      const user = await User.findById(monitor.user);

      const data = {
        monitorID : monitor._id,
        monitorURL : monitor?.url,
        statusCode : error.response.status,
        createdAt: currentDate,
        firstName : user.firstName
      };

      sendAlerts(user.email, data);
    }
  });
};

//Creates an incident
const createAnIncident = async (monitorId, userId, statusCode) => {
  await Incident.create({
    monitor: monitorId,
    user: userId,
    cause: `Status ${statusCode}`,
  });

  await Monitor.updateOne({ _id: monitorId }, { availability: false, lastIncidentAt: Date.now() });
};

module.exports = testUrl;
