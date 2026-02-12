import { Appointment } from '../types';

const APPOINTMENTS_KEY = 'hospital_appointments';

const getAllAppointments = (): Appointment[] => {
    try {
        const appointmentsJson = localStorage.getItem(APPOINTMENTS_KEY);
        return appointmentsJson ? JSON.parse(appointmentsJson) : [];
    } catch (error) {
        console.error("Failed to parse appointments from localStorage", error);
        return [];
    }
};

const saveAllAppointments = (appointments: Appointment[]) => {
    try {
        localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
    } catch (error) {
        console.error("Failed to save appointments to localStorage", error);
    }
};

export const appointmentService = {
    getAppointmentsForPatient: (patientId: string): Promise<Appointment[]> => {
        return new Promise(resolve => {
            const allAppointments = getAllAppointments();
            const patientAppointments = allAppointments.filter(app => app.patientId === patientId);
            resolve(patientAppointments);
        });
    },
    
    getAppointmentsForDoctor: (doctorPatientIds: string[]): Promise<Appointment[]> => {
         return new Promise(resolve => {
            const allAppointments = getAllAppointments();
            const doctorAppointments = allAppointments.filter(app => doctorPatientIds.includes(app.patientId) && app.status === 'booked');
            resolve(doctorAppointments);
        });
    },

    getBookedTimes: (doctorId: string, date: string): Promise<string[]> => {
        return new Promise(resolve => {
            const allAppointments = getAllAppointments();
            const bookedTimes = allAppointments
                .filter(app => app.doctorId === doctorId && app.date === date && app.status === 'booked')
                .map(app => app.time);
            resolve(bookedTimes);
        });
    },

    bookAppointment: (appointmentData: Omit<Appointment, 'id' | 'status'>): Promise<Appointment> => {
        return new Promise((resolve, reject) => {
            const allAppointments = getAllAppointments();
            const newAppointment: Appointment = {
                ...appointmentData,
                id: `appt-${Date.now()}`,
                status: 'booked',
            };

            const isSlotTaken = allAppointments.some(
                app => app.date === newAppointment.date && 
                       app.time === newAppointment.time && 
                       app.doctorId === newAppointment.doctorId &&
                       app.status === 'booked'
            );

            if (isSlotTaken) {
                return reject(new Error("This time slot is no longer available."));
            }

            allAppointments.push(newAppointment);
            saveAllAppointments(allAppointments);
            resolve(newAppointment);
        });
    },

    cancelAppointment: (appointmentId: string): Promise<boolean> => {
        return new Promise(resolve => {
            let allAppointments = getAllAppointments();
            const appointmentIndex = allAppointments.findIndex(app => app.id === appointmentId);
            if (appointmentIndex !== -1) {
                allAppointments[appointmentIndex].status = 'cancelled';
                saveAllAppointments(allAppointments);
                resolve(true);
            } else {
                resolve(false);
            }
        });
    },
};
