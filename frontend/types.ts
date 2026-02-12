

export enum Role {
  Patient = 'patient',
  Doctor = 'doctor',
  Nurse = 'nurse',
  Receptionist = 'receptionist',
  Admin = 'admin',
}

export interface User {
  id: string; // This will map to patient_id, staff_id, etc.
  _id?: string; // This will map to MongoDB's _id
  name: string;
  role: Role;
  email: string;
  password?: string; // Made optional on client-side user object
}

export interface Doctor extends User {
  role: Role.Doctor;
  patients: string[]; // Array of patient IDs
  age: number;
  gender: 'male' | 'female';
  specialization: string;
  contact: string;
}

export interface Nurse extends User {
    role: Role.Nurse;
    age: number;
    gender: 'male' | 'female';
}

export interface Receptionist extends User {
    role: Role.Receptionist;
    age: number;
    gender: 'male' | 'female';
}

export interface Patient extends User {
  role: Role.Patient;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  deviceId: string;
  assignedDoctorId: string;
}

export type LoggedInUser = Patient | Doctor | Nurse | Receptionist | User;

export interface VitalSign {
  name: 'Heart Rate' | 'Temperature' | 'Respiration Rate' | 'SpO2';
  value: number;
  unit: string;
  thresholds?: { min: number; max: number };
}

export interface VitalHistoryPoint {
  time: string;
  value: number;
}

export interface Alert {
  id: string;
  patientName: string;
  patientId: string;
  vital: VitalSign['name'];
  value: number;
  timestamp: Date;
  message: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface DoctorPatientMessage {
  id: string;
  senderId: string; // patientId or doctorId
  receiverId: string; // patientId or doctorId
  text: string;
  timestamp: Date;
  read: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  reason: string;
  status: 'booked' | 'completed' | 'cancelled';
}

// FIX: Added AnalyticsData interface for the management dashboard.
export interface AnalyticsData {
  totalPatients: { month: string; count: number }[];
  alertStatistics: { day: string; count: number }[];
  genderDistribution: { name: string; value: number }[];
}