const tls = require("tls");
const https = require("https");
const Incident = require("../models/incidentModel");
const SSLCheck = require("../models/sslCheckModel");

//function to check SSL certificate expiry and create incident
const checkSSLDetails = async (url, notifyExpiration, monitorId, userId) => {
  try {
    const sslData = await fetchSSLDetails(url);

    sslData.validFrom = new Date(sslData.validFrom);
    sslData.validTo = new Date(sslData.validTo);

    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const today = Date.now();
    const differenceInMilliseconds = sslData.validTo - today;
    const differenceInDays = Math.floor(differenceInMilliseconds / millisecondsPerDay);

    if (differenceInDays <= parseInt(notifyExpiration)) {
      await Incident.create({
        monitor: monitorId,
        user: userId,
        cause: `SSL certificate expires in ${differenceInDays} days`,
      });
    }

    await SSLCheck.create({
      ...sslData,
      monitor: monitorId,
      notifyExpiration: notifyExpiration,
    });

    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = {
  checkSSLDetails,
};
