const tls = require("tls");
const https = require("https");
const Incident = require("../models/incidentModel");
const SSLCheck = require("../models/sslCheckModel");

// Function to fetch SSL certificate details
const fetchSSLDetails = (url) => {
  return new Promise((resolve, reject) => {
    try {
      const hostname = new URL(url).hostname; // Extract hostname from URL
      const port = 443; // Default HTTPS port

      const options = { host: hostname, port, servername: hostname };
      const socket = tls.connect(options, () => {
        const certificate = socket.getPeerCertificate();
        socket.end();

        if (!certificate || Object.keys(certificate).length === 0) {
          return reject(new Error("No SSL certificate found."));
        }

        resolve({
          issuer: certificate.issuer?.O || "Unknown Issuer",
          validFrom: new Date(certificate.valid_from).getTime(), // Convert to timestamp
          validTo: new Date(certificate.valid_to).getTime(),
          protocol: "TLS",
        });
      });

      socket.on("error", (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
};

//function to check SSL certificate expiry and create incident
const checkSSLDetails = async (url, notifyExpiration, monitorId, userId) => {
  try {
    // Fetch SSL details directly
    const sslData = await fetchSSLDetails(url);

    // Convert timestamps to readable dates
    sslData.validFrom = new Date(sslData.validFrom);
    sslData.validTo = new Date(sslData.validTo);

    // Calculate days until expiration
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const today = Date.now();
    const differenceInMilliseconds = sslData.validTo - today;
    const differenceInDays = Math.floor(differenceInMilliseconds / millisecondsPerDay);

    // Log an incident if SSL expiry is within the notify period
    if (differenceInDays <= parseInt(notifyExpiration)) {
      await Incident.create({
        monitor: monitorId,
        user: userId,
        cause: `SSL certificate expires in ${differenceInDays} days`,
      });
    }

    // Store SSL check result in the database
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
