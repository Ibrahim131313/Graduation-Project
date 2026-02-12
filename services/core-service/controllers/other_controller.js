const Patients = require("../models/patients-model");

/**
 * Get all patients for a specific doctor
 */
const getDocPats = async (req, res) => {
  try {
    const docPatients = await Patients.find({ doctor_id: req.params.id });
    if (!docPatients) {
      return res.status(404).json({ status: "fail", data: null });
    }
    res.json({ status: "success", data: { docPatients: docPatients } });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};

module.exports = {
  getDocPats,
};
