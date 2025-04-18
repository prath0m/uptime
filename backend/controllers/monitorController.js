const Monitor = require("../models/monitorModel");
const Incident = require("../models/incidentModel");
const SSLCheck = require("../models/sslCheckModel");
const User = require('../models/userModel');
const asyncHandler = require("express-async-handler");
const testUrl = require("../utils/testUrl");
const { checkSSLDetails } = require("../services/puppeteer");
const checkDomainNameExpiry = require("../services/domainNameExpiry");
const domainNames = require("../models/domainNameCheckModel");
const sendDomainNameAlert = require("../utils/DomainNameAlerts");


function isValidURL(str) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
    "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(str);
}

//@desc   Get Monitor
//@route  GET /api/v1/monitor/:id
//@access Private
const getMonitor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const monitor = await Monitor.findOne({ _id: id });
  res.status(200).json(monitor);
});

//@desc   Get All Monitor
//@route  GET /api/v1/monitor
//@access Private
const getUserMonitors = asyncHandler(async (req, res) => {
  const allMonitors = await Monitor.find({ user: req.user._id });
  res.status(200).json(allMonitors);
});

//@desc   Delete Monitor
//@route  DELETE /api/v1/monitor/:id
//@access Private
const deleteMonitor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedMonitor = await Monitor.findOneAndDelete({ _id: id });
  await Incident.deleteMany({ monitor: id });
  await SSLCheck.findOneAndDelete({ monitor : id });
  await domainNames.findOneAndDelete({ monitor : id });

  res.status(200).json({ message: "Monitor deleted successfully", id: deletedMonitor._id });
});

//@desc   Add Monitor
//@route  POST /api/v1/monitor
//@access Private
const addMonitor = asyncHandler(async (req, res) => {
    const { url, user, team, alertsTriggeredOn, notifyExpiration } = req.body;

    if(!url || !user || !team){
        return res.status(400).json({ message: "Provide all required fields" });
    }
    if(!isValidURL(url)){
        return res.status(400).json({ message: "Invalid URL" });
    }
    //Looking for a duplicate url
    const existingMonitor = await Monitor.find({ url, user });

    if(existingMonitor.length > 0 && existingMonitor.some((monitor) => monitor.alertsTriggeredOn == alertsTriggeredOn)){
        return res.status(409).json({ message: "Monitor already present" });
    }

    const createdMonitor = await Monitor.create(req.body);
    
    if(createdMonitor.alertsTriggeredOn == "1"){
      await testUrl(createdMonitor);
    }
    else if(alertsTriggeredOn == "3"){
        await checkSSLDetails(url, notifyExpiration, createdMonitor._id, user);
    }
    else if(alertsTriggeredOn == "4"){
        //get the expiry date
        const expiryDate = await checkDomainNameExpiry(url);
        const newDomainNameCheck = new domainNames({
          monitor : createdMonitor._id,
          expiryDate,
          notifyExpiration
        });
        await newDomainNameCheck.save();
        //check if the expiry date is in notification period
        const today = new Date();
        const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        if(daysLeft <= parseInt(notifyExpiration)){
          await Incident.create({
            monitor: createdMonitor._id,
            cause: `Domain Name expires in ${daysLeft} days`,
          });

          //send email alerts
          const userData = await User.findById(user);
          const data = {
            firstName : userData.firstName,
            monitorID : createdMonitor._id,
            monitorURL : url,
            expiryDays : daysLeft
          }
          sendDomainNameAlert(userData.email, data);
          console.log(`Issued domain name expiration warning for monitor ${createdMonitor._id}`);
        }
    }

    res.status(201).json({ message: "Monitor created successfully" });
});

//@desc   Update Monitor
//@route  PATCH /api/v1/monitor/:id
//@access Private
const updateMonitor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updatedMonitor = await Monitor.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedMonitor) {
    return res.status(400).json({ message: "Monitor doesn't exists" });
  } else {
    return res.status(200).json({ message: "Monitor updated successfully" });
  }
});

module.exports = {
  getMonitor,
  getUserMonitors,
  deleteMonitor,
  addMonitor,
  updateMonitor,
};
