const Appointment = require("../models/appointment-model");

const createAppointment = async (req, res) => {


  const { patient_id, doctor_id, date, time , reason } = req.body;
  try {
    let newAppointement = await new Appointment({
        "patient_id": patient_id ,
        "doctor_id" : doctor_id,
        "date": date,
        "time": time ,
        "reason":reason,
        "status": "booked"
        });


        await newAppointement.save();

    res.json({ status: "success", data: newAppointement });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

/////////////////////////////////////////////////////////////



const getDocAppointment= async (req, res) => {
    const doc_id = req.params.doc_id

    try{
       const docAppointments = await Appointment.find({ "doctor_id": doc_id });

       if(!docAppointments){
         return res.status(404).json({status: "fail",data: null})
       }


       res.json({status: "success",data: {docAppointments: docAppointments}})
    }catch(err){
       res.status(400).json({
          status: "error",
          message: err.message
       })
    }
};
//////////////////////////////////////////
const getPatAppointment= async (req, res) => {
    const pat_id = req.params.pat_id

    try{
       const patAppointments = await Appointment.find({ "patient_id": pat_id });

       if(!patAppointments){
         return res.status(404).json({status: "fail",data: null})
       }


       res.json({status: "success",data: {patAppointments: patAppointments}})
    }catch(err){
       res.status(400).json({
          status: "error",
          message: err.message
       })
    }
};


////////////////////////////////

const markAppointmentAsFulfilled = async (req, res) => {
  const { _id } = req.body;
  try {
    console.log("==================")
    await Appointment.updateOne(
      {"_id": _id },
      { status: "fulfilled" }
    );
    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

const DeleteAppointment = async (req,res)=>{
let _id = req.params.appo_id ;
try{
    await Appointment.deleteOne({"_id" : _id})
    res.status(200).json({status: "success"})
}catch(err){
    res.status(500).json({ status: "error", message: err.message });

}

}
module.exports = {  createAppointment ,getDocAppointment , getPatAppointment,markAppointmentAsFulfilled , DeleteAppointment };  
