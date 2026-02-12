// src/services/mockApi.ts

import { Role, Doctor, Patient, User, LoggedInUser, DoctorPatientMessage, Nurse, Receptionist, AnalyticsData, VitalSign } from '../types';

// Read backend configuration from environment variables.
// In microservices architecture, all API calls go through the Nginx gateway.
// For production: VITE_BACKEND_URL should be empty string "" for relative URLs (same origin).
// For development: VITE_BACKEND_URL defaults to http://localhost:8080.
const backendUrl = import.meta.env.VITE_BACKEND_URL;
const BASE_URL = backendUrl !== undefined ? `${backendUrl}/api` : '/api';


// --- Helper Functions ---
const getToken = () => localStorage.getItem('authToken');

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();

  // Use the standard Headers object for more robust header management.
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  // Add the Authorization header to all requests except for the login endpoint.
  if (token) {
    headers.set('authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  // Handle responses that might not have a body (e.g., DELETE requests)
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    const json = await response.json();
    if (json.status && json.status !== 'success') {
        throw new Error(json.message || 'API operation failed');
    }
    return json.data || json; // Return 'data' if it exists, otherwise the full object
  }

  return {}; // Return empty object for non-json responses
};

// --- Mappers ---
// MODIFICATION: Added explicitRole parameter to mapUserFromApi
const mapUserFromApi = (apiUser: any, explicitRole?: Role): LoggedInUser => {
    if (!apiUser) {
        throw new Error("mapUserFromApi received null or undefined user data.");
    }
    // MODIFICATION: Prioritize explicitRole if provided, otherwise fallback to apiUser.role
    const role = (explicitRole || (apiUser.role || '')).toLowerCase() as Role;

    // console.log("mapUserFromApi debug -> apiUser:", apiUser, "explicitRole:", explicitRole, "-> derived role:", role); // Debugging line

    const baseUser = {
        id: apiUser.staff_id || apiUser.patient_id || apiUser._id || 'unknown-id',
        _id: apiUser._id,
        name: apiUser.name || 'Unnamed User',
        email: apiUser.email || 'no-email@example.com',
        age: apiUser.age || 0,
        // Gender handled specifically per role below
    };

    switch (role) {
        case Role.Patient:
            const patientGender = (apiUser.gender || '').toLowerCase();
            const mappedPatientGender: 'Male' | 'Female' =
                patientGender === 'female' ? 'Female' : 'Male';

            return {
                ...baseUser,
                role: Role.Patient,
                deviceId: apiUser.device_id || '', // This should now correctly map "dev003"
                assignedDoctorId: apiUser.doctor_id || '',
                gender: mappedPatientGender,
            } as Patient;
        case Role.Doctor:
            const doctorGender = (apiUser.gender || '').toLowerCase();
            const mappedDoctorGender: 'male' | 'female' = doctorGender === 'female' ? 'female' : 'male';
            return {
                ...baseUser,
                role: Role.Doctor,
                patients: [],
                specialization: apiUser.specialization || 'General Practice',
                contact: apiUser.contact || 'N/A',
                gender: mappedDoctorGender,
             } as Doctor
        case Role.Nurse:
            const nurseGender = (apiUser.gender || '').toLowerCase();
            const mappedNurseGender: 'male' | 'female' = nurseGender === 'female' ? 'female' : 'male';
            return {
                ...baseUser,
                role: Role.Nurse,
                gender: mappedNurseGender,
            } as Nurse;
        case Role.Receptionist:
            const receptionistGender = (apiUser.gender || '').toLowerCase();
            const mappedReceptionistGender: 'male' | 'female' = receptionistGender === 'female' ? 'female' : 'male';
            return {
                ...baseUser,
                role: Role.Receptionist,
                gender: mappedReceptionistGender,
            } as Receptionist;
        case Role.Admin:
            const adminGender = (apiUser.gender || '').toLowerCase();
            const mappedAdminGender: 'male' | 'female' = adminGender === 'female' ? 'female' : 'male';
            return {
                ...baseUser,
                role: Role.Admin,
                gender: mappedAdminGender,
            } as User;
        default:
            // This default should ideally not be hit if the explicitRole is passed correctly.
            // If it is hit, it means an unexpected role value was encountered.
            console.warn(`Attempted to map user with unknown role: ${role}. Falling back to generic User.`);
            // Default to Male gender as "Other" is removed.
            return { ...baseUser, role: Role.Admin, gender: 'Male' } as User; // Default to Admin as a generic fallback if role is truly unknown
    }
};


// --- Real API Implementation ---

export const api = {
  login: async (email: string, password: string): Promise<LoggedInUser | null> => {
    const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Invalid credentials or server error' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    const json = await response.json();
    if (json.status !== 'success') {
        throw new Error(json.message || 'Login failed');
    }

    const loginData = json.data || json;

    if (loginData.token && loginData.role && loginData.user_id) {
        const token = loginData.token;
        const role = (loginData.role as string).toLowerCase() as Role;
        const userId = loginData.user_id;

        localStorage.setItem('authToken', token);

        let rawUserDetailsFromAPI: any;

        try {
            if (role === Role.Patient) {
                const { patient } = await apiFetch(`/patients/${userId}`);
                rawUserDetailsFromAPI = patient;
            } else if (role === Role.Admin) {
                // Admin users are not stored in Staff collection - create basic admin object
                rawUserDetailsFromAPI = {
                    _id: userId,
                    staff_id: userId,
                    name: 'Administrator',
                    email: email,
                    role: Role.Admin,
                    age: 0,
                    gender: 'male'
                };
            }
            else { // Doctor, Nurse, Receptionist (all other staff types)
                const { staffMem } = await apiFetch(`/staff/${userId}`);
                rawUserDetailsFromAPI = staffMem;
            }
        } catch (detailFetchError) {
            console.error(`Failed to fetch full user details for ${role} with ID ${userId}:`, detailFetchError);
            localStorage.removeItem('authToken');
            throw new Error(`Login successful, but failed to retrieve full details for ${role}. Permissions issue or missing user profile.`);
        }


        if (rawUserDetailsFromAPI) {
            console.log("==== rawUserDetailsFromAPI (before mapping) =====");
            console.log(rawUserDetailsFromAPI);
            // MODIFICATION: Pass the 'role' explicitly to mapUserFromApi
            let foundUser = mapUserFromApi(rawUserDetailsFromAPI, role);
            console.log("==== foundUser (after mapping) =====");
            console.log(foundUser);
            // The role should already be correct now due to explicit passing, but this line ensures it.
            foundUser.role = role;

            if (foundUser.role === Role.Doctor) {
                try {
                    const doctorPatients = await api.getDoctorPatients(foundUser.id);
                    (foundUser as Doctor).patients = doctorPatients.map(p => p.id);
                } catch (e) {
                    console.error(`Failed to fetch patients for doctor ${foundUser.id}`, e);
                    (foundUser as Doctor).patients = [];
                }
            }

            localStorage.setItem('user', JSON.stringify(foundUser));
            return foundUser;
        } else {
            localStorage.removeItem('authToken');
            throw new Error("Login successful, but failed to construct user object.");
        }
    }

    throw new Error("Login failed: Incomplete response from server.");
  },


  // Patient data
  getPatient: async (id: string): Promise<Patient> => {
    const { patient } = await apiFetch(`/patients/${id}`);
    // MODIFICATION: Pass Role.Patient explicitly as this endpoint specifically returns a patient
    return mapUserFromApi(patient, Role.Patient) as Patient;
  },
  getAllPatients: async (): Promise<Patient[]> => {
    const { patients } = await apiFetch('/patients');
    return patients.map((p: any) => {
        // MODIFICATION: Pass Role.Patient explicitly for each patient in the array
        return mapUserFromApi(p, Role.Patient) as Patient;
    });
  },
  addPatient: (patientData: Omit<Patient, 'role' | 'email'> & {email: string}) => {
    const apiData = {
        patient_id: patientData.id,
        name: patientData.name,
        age: patientData.age,
        gender: patientData.gender,
        device_id: patientData.deviceId,
        doctor_id: patientData.assignedDoctorId,
        email: patientData.email
    };
    return apiFetch('/patients/add', { method: 'POST', body: JSON.stringify(apiData) });
  },
  updatePatient: (patientId: string, updatedData: Partial<Patient>) => {
    const apiData = {
        name: updatedData.name,
        age: updatedData.age,
        gender: updatedData.gender,
        email: updatedData.email,
        device_id: updatedData.deviceId,
        doctor_id: updatedData.assignedDoctorId,
    }
    return apiFetch(`/patients/${patientId}`, { method: 'PATCH', body: JSON.stringify(apiData) });
  },
  deletePatient: (patientId: string) => {
    return apiFetch(`/patients/${patientId}`, { method: 'DELETE' });
  },

  // Staff data
  getAllStaff: async (): Promise<(Doctor | Nurse | Receptionist)[]> => {
    const { staff } = await apiFetch('/staff/');
    // For general staff, their 'role' *should* be present in the staff object from the API.
    // If not, you might need to adjust the backend or infer roles based on other fields.
    // Assuming 'staff' objects from the API contain a 'role' field.
    return staff.map((s: any) => mapUserFromApi(s));
  },
  getDoctor: async (id: string): Promise<Doctor> => {
    const { staffMem } = await apiFetch(`/staff/${id}`);
    // MODIFICATION: Explicitly pass Role.Doctor
    return mapUserFromApi(staffMem, Role.Doctor) as Doctor;
  },
  getDoctorPatients: async (doctorId: string): Promise<Patient[]> => {
    const { docPatients } = await apiFetch(`/other/doc/pats/${doctorId}`);
    return docPatients.map((p: any) => mapUserFromApi(p, Role.Patient) as Patient);
  },
  getAllDoctors: async (): Promise<Doctor[]> => {
    const { Doctors } = await apiFetch('/staff/doctors');
    return Doctors.map((d: any) => mapUserFromApi(d, Role.Doctor) as Doctor);
  },
  getAllNurses: async (): Promise<Nurse[]> => {
    const { nurses } = await apiFetch('/staff/nurses');
    return nurses.map((n: any) => mapUserFromApi(n, Role.Nurse) as Nurse);
  },
  getAllReceptionists: async (): Promise<Receptionist[]> => {
    const { receptionists } = await apiFetch('/staff/receptionists');
    return receptionists.map((r: any) => mapUserFromApi(r, Role.Receptionist) as Receptionist);
  },
  addStaffMember: (staffData: any) => {
    const apiData = {
        staff_id: staffData.id,
        name: staffData.name,
        age: staffData.age,
        gender: staffData.gender,
        email: staffData.email,
        role: staffData.role
    };
    return apiFetch('/staff/add', { method: 'POST', body: JSON.stringify(apiData) });
  },
  deleteStaffMember: (staffId: string) => {
    return apiFetch(`/staff/${staffId}`, { method: 'DELETE' });
  },

  // Vitals Data
  getReadingsForDevice: async(deviceId: string) => {
      console.log("==================   only one device  ==============")
      const { "dev_Readings": readings } = await apiFetch(`/readings/${deviceId}`);
      console.log("this is the total reading acco to the device_id"+ deviceId)
      console.log(readings)
      return readings;
  },
  getAllReadings: async() => {
    console.log("=============== all readings  =================")
      const { readings } = await apiFetch('/readings');
      return readings;
  },


  // --- Retained Mock Implementations ---

  getAnalytics: (): Promise<AnalyticsData> => {
    const data: AnalyticsData = {
      totalPatients: [
        { month: 'Jan', count: 2 }, { month: 'Feb', count: 2 }, { month: 'Mar', count: 3 },
        { month: 'Apr', count: 3 }, { month: 'May', count: 3 }, { month: 'Jun', count: 3 },
      ],
      alertStatistics: [
        { day: 'Mon', count: 5 }, { day: 'Tue', count: 8 }, { day: 'Wed', count: 3 },
        { day: 'Thu', count: 6 }, { day: 'Fri', count: 9 }, { day: 'Sat', count: 4 }, { day: 'Sun', count: 2 },
      ],
      genderDistribution: [ { name: 'Male', value: 2 }, { name: 'Female', value: 1 } ],
    };
    return new Promise(resolve => setTimeout(() => resolve(data), 800));
  },

  getConversation: (participant1Id: string, participant2Id: string): Promise<DoctorPatientMessage[]> => {
    const messages = (JSON.parse(localStorage.getItem('messages') || '[]') as DoctorPatientMessage[]).filter(m =>
        (m.senderId === participant1Id && m.receiverId === participant2Id) ||
        (m.senderId === participant2Id && m.receiverId === participant1Id)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return Promise.resolve(messages);
  },

  sendMessage: (senderId: string, receiverId: string, text: string): Promise<DoctorPatientMessage> => {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]') as DoctorPatientMessage[];
    const newMessage: DoctorPatientMessage = {
        id: `msg-${Date.now()}`,
        senderId,
        receiverId,
        text,
        timestamp: new Date(),
        read: false,
    };
    messages.push(newMessage);
    localStorage.setItem('messages', JSON.stringify(messages));
    return Promise.resolve(newMessage);
  },

  getDoctorConversations: async (doctorId: string): Promise<{ patient: Patient, lastMessage: DoctorPatientMessage, unreadCount: number }[]> => {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]') as DoctorPatientMessage[];
    const patients = await api.getAllPatients();
    const conversations: Record<string, { patient: Patient, lastMessage: DoctorPatientMessage, unreadCount: number }> = {};
    const doctorMessages = messages.filter(m => m.senderId === doctorId || m.receiverId === doctorId);

    for (const message of doctorMessages) {
      const patientId = message.senderId === doctorId ? message.receiverId : message.senderId;
      if (!conversations[patientId] || new Date(conversations[patientId].lastMessage.timestamp).getTime() < new Date(message.timestamp).getTime()) {
        const patient = patients.find(p => p.id === patientId);
        if (patient) {
          conversations[patientId] = { patient, lastMessage: message, unreadCount: 0 };
        }
      }
    }

    for (const message of doctorMessages) {
      if (message.receiverId === doctorId && !message.read) {
        const patientId = message.senderId;
        if (conversations[patientId]) {
          conversations[patientId].unreadCount++;
        }
      }
    }

    return Object.values(conversations).sort((a,b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime());
  },

  markMessagesAsRead: (senderId: string, receiverId: string) => {
    const messages = (JSON.parse(localStorage.getItem('messages') || '[]') as DoctorPatientMessage[]).map(m => {
        if (m.senderId === senderId && m.receiverId === receiverId && !m.read) {
            return { ...m, read: true };
        }
        return m;
    });
    localStorage.setItem('messages', JSON.stringify(messages));
    return Promise.resolve(true);
  },
};