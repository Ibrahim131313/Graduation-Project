const Staff = require("../models/staff-model");
const Login = require("../models/login-model");
const bcrypt = require("bcryptjs");

/**
 * Get all staff members
 */
const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find();
    res.json({ status: "success", data: { staff: staff } });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

/**
 * Add new staff member
 */
const addNewStaffMem = async (req, res) => {
  try {
    let new_staff = await new Staff(req.body);
    let password = new_staff.email.split("@")[0];
    let hashed_password = await bcrypt.hash(password, 6);

    let new_login = await new Login({
      user_id: new_staff.staff_id,
      email: new_staff.email,
      password: hashed_password,
      role: new_staff.role,
    });

    await new_staff.save();
    await new_login.save();
    return res.status(201).json({ status: "success", data: { staffMem: new_staff } });
  } catch (err) {
    // Handle duplicate key error with user-friendly message
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        status: "error",
        message: `A staff member with this ${field === 'staff_id' ? 'Staff ID' : field} already exists. Please use a different value.`,
      });
    }
    res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};

/**
 * Get all doctors
 */
const getDoctors = async (req, res) => {
  try {
    const Doctors = await Staff.find({ role: "doctor" });
    res.json({ status: "success", data: { Doctors: Doctors } });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

/**
 * Get all nurses
 */
const getNurses = async (req, res) => {
  try {
    const nurses = await Staff.find({ role: "nurse" });
    res.json({ status: "success", data: { nurses: nurses } });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

/**
 * Get all receptionists
 */
const getReceptionists = async (req, res) => {
  try {
    const receptionists = await Staff.find({ role: "receptionist" });
    res.json({ status: "success", data: { receptionists: receptionists } });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

/**
 * Get staff member by ID
 */
const getStaffById = async (req, res) => {
  try {
    const staffMem = await Staff.findOne({ staff_id: req.params.id });

    if (!staffMem) {
      return res.status(404).json({ status: "fail", data: null });
    }
    res.json({ status: "success", data: { staffMem: staffMem } });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};

/**
 * Delete staff member by ID
 */
const deleteStaffById = async (req, res) => {
  try {
    await Staff.deleteOne({ staff_id: req.params.id });
    await Login.deleteOne({ user_id: req.params.id });
    res.status(200).json({ status: "success", data: null });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

/**
 * Update staff member by ID
 */
const updateStaffById = async (req, res) => {
  let id = req.params.id;
  try {
    const editedStaff = await Staff.findOneAndUpdate(
      { staff_id: id },
      { $set: req.body },
      { new: true }
    );
    const editedUser = await Login.findOneAndUpdate(
      { user_id: id },
      { $set: req.body },
      { new: true }
    );
    if (!editedStaff) {
      res.status(404).json({ status: "fail", data: null });
    }
    res.json({ status: "success", data: { user: editedStaff } });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

module.exports = {
  getAllStaff,
  addNewStaffMem,
  getDoctors,
  getNurses,
  getReceptionists,
  getStaffById,
  deleteStaffById,
  updateStaffById,
};
