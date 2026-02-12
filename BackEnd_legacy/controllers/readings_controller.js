const Readings = require("../models/readings-model");
const Patients = require("../models/patients-model");
const Login = require("../models/login-model")
const bcrypt = require("bcryptjs")
const JWT = require("jsonwebtoken")



const getAllReadings = async (req,res) => {
    try{
         const readings = await Readings.find(); 
         res.json({status: "success",data: {readings: readings}}) 
    }catch(err){
       res.status(400).json({status: "error",message: err.message})
    }
 
 }

 
 
// get all reading for certian patient
const getDevReadingById = async (req, res) => {
  try {
    const dev_Readings = await Readings.find({ device_id: req.params.id })
      .sort({ timestamp: -1 })   // NEWEST first
      .limit(20);                // only last 20 readings

    if (!dev_Readings || dev_Readings.length === 0) {
      return res.status(404).json({ status: "fail", data: null });
    }

    res.json({
      status: "success",
      data: { dev_Readings }
    });

  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message
    });
  }
};


 
const addNewReading = async (req, res) => {
    try{
 
    // 1️⃣ Check if the patient exists
    const { device_id } = req.body;
     const existingPatient = await Patients.findOne({ device_id });
     if (!existingPatient) {
       return res.status(404).json({
         status: "fail",
         message: `the device with ID ${device_id} is not registered`
       });
     }
 
       let new_reading = await new Readings(req.body);
      await new_reading.save()
      res.status(201).json({status: "success",data: {reading: new_reading}});
   }catch(err){
          res.status(400).json({
          status: "error",
          message: err.message      
    })
   }
 
 }

 
module.exports = {
    getAllReadings,
    getDevReadingById,
    addNewReading,
    }