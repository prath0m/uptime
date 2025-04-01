const tls = require("tls");
// const https = require("https");
const Incident = require("../models/incidentModel");
const SSLCheck = require("../models/sslCheckModel");
const User = require('../models/userModel');
const sslAlerts = require('../utils/SSLalert');

// Function to fetch SSL certificate details
const fetchSSLDetails = (url) => {
    return new Promise((resolve, reject) => {
        try{
            const hostname = new URL(url).hostname;
            const port = 443;
      
            const options = { host: hostname, port, servername: hostname };
            const socket = tls.connect(options, () => {
                const certificate = socket.getPeerCertificate();
                socket.end();
        
                if(!certificate || Object.keys(certificate).length === 0){
                    return reject(new Error("No SSL certificate found."));
                }
                
                resolve({
                    issuer: certificate.issuer?.O || "Unknown Issuer",
                    validFrom: new Date(certificate.valid_from).getTime(),
                    validTo: new Date(certificate.valid_to).getTime(),
                    protocol: "TLS",
                });
            });
            socket.on("error", (err) => reject(err));
        }
        catch (error) {
          reject(error);
        }
    });
};

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

        const user = await User.findById(userId);
        const data = {
            firstName : user.firstName,
            monitorID : monitorId,
            monitorURL : url,
            expiryDays : differenceInDays
        }

        sslAlerts(user.email, data); //send alerts in email
        return Promise.resolve();
    } 
    catch(error){
        return Promise.reject(error);
    }
};

module.exports = {
    checkSSLDetails,
};
