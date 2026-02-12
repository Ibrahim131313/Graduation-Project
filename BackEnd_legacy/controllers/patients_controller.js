const Readings = require("../models/readings-model");
const Patients = require("../models/patients-model");
const Staff = require("../models/staff-model");
const Login = require("../models/login-model")
const Conversations = require('../models/conversations-model')
const Messages = require('../models/messages-model')
const bcrypt = require("bcryptjs")
const JWT = require("jsonwebtoken")


//  here we need to get all readings that have different patient_id
const getAllPatients = async (req,res) => {
    try{
       //  console.log("trying to connect")
         const patients = await Patients.find();
      
 
         res.json({status: "success",data: {patients: patients}}) 
    }catch(err){
       res.status(400).json({status: "error",message: err.message})
    }
 
 }
 

 
 
 const getPatientById = async (req,res)=> {
    try{
       const patient = await Patients.findOne({ patient_id: req.params.id });
       if(!patient){
         return res.status(404).json({status: "fail",data: null})
       }
         res.json({status: "success",data: {patient: patient}})
       
       
    }catch(err){
       res.status(400).json({
          status: "error",
          message: err.message
       })
    }
 }
 

 
 const addNewPatient = async (req, res) => {
    try{

      
      let doctor = await Staff.findOne({staff_id: req.body.doctor_id})
      if(!doctor){
         return res.status(400).json({"status" : "failed", "message": "the doctor id not registered"})
      }
       let new_patient = await new Patients(req.body);
        let  password = new_patient.email.split('@')[0]; ////////////////////////////////////////////
 
       let hashed_password =await bcrypt.hash(password , 6);
       let new_login = await new Login({
          user_id: new_patient.patient_id,
          email: new_patient.email,
          password: hashed_password,
          role: "patient"
       })

       let new_convesation =   await new Conversations({
         conversation_id: `conv_${new_patient.patient_id}`,
         doctor_id: new_patient.doctor_id,
         patient_id: new_patient.patient_id,
         patient_name: new_patient.name,
         last_message: '',
       })         

      await new_patient.save()
      await new_login.save()
      await new_convesation.save()
      res.status(201).json({status: "success",data: {patient: new_patient}});
   }catch(err){
          res.status(400).json({
          status: "error",
          message: err.message      
    })
   }
 
 }
 

 
 
// let for now delete only the patient from patients collection and keep the data in 
// future i need to store it for the analysis and delete it from readings db
const deletePatientById = async (req,res)=>{
    try{
      let patient = await Patients.findOne({patient_id: req.params.id})
       await Patients.deleteOne({ patient_id: req.params.id });
       await Login.deleteOne({ user_id: req.params.id });
       await Readings.deleteMany({device_id: patient.device_id})
       await Conversations.deleteOne({conversation_id: `conv_${patient.patient_id}`})
       await Messages.deleteMany({conversation_id: `conv_${patient.patient_id}`})
       res.status(200).json({status: "success",data: null})
    }catch(err){
       res.status(400).json({status: "error",message: err.message})
    }
 }
 
 
const updatePatient = async (req, res) => {
  const id = req.params.id;            // old patient_id
  const newId = req.body.patient_id;   // new patient_id (new user_id)

  try {
    // 1) Update Patient
    const editedPatient = await Patients.findOneAndUpdate(
      { patient_id: id },
      { $set: req.body },
      { new: true }
    );

    if (!editedPatient) {
      return res.status(404).json({ status: "fail", data: null });
    }

   
    const loginFields = {};

    // update user_id
    if (newId) loginFields.user_id = newId;

    // update email if exists in req
    if (req.body.email){
         loginFields.email = req.body.email;
        
         let  password = req.body.email.split('@')[0]; 
 
       let hashed_password = await bcrypt.hash(password , 6);
         loginFields.password = hashed_password ;
    } 
    // 3) Update Login
    const editedUser = await Login.findOneAndUpdate(
      { user_id: id },            // find old user_id
      { $set: loginFields },      // set new user_id + email
      { new: true }
    );

    console.log(req.body)
    let new_conv_id = `conv_${newId}`
    let new_conv_content = {}
    if(req.body.patient_id)new_conv_content.patient_id = req.body.patient_id
    if(req.body.doctor_id)new_conv_content.doctor_id = req.body.doctor_id
    if(req.body.name)new_conv_content.patient_name = req.body.name
    if(req.body.patient_id)new_conv_content.conversation_id = new_conv_id
    console.log(new_conv_content)
    await Conversations.findOneAndUpdate(
      {conversation_id: `conv_${id}`},
      {$set: new_conv_content},
      {new: true }
    )

         //  console.log(editedUser);
       res.json({status: "success", data: {user: editedPatient}})
    }catch(err){
       res.status(400).json({status: "error",message: err.message})
    }
 }

 

 
module.exports = {
    getAllPatients,
    getPatientById,
    addNewPatient,
    deletePatientById,
    updatePatient
    }