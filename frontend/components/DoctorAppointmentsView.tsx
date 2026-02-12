import React, { useState, useEffect } from 'react';
import { Doctor, Patient, Appointment } from '../types';
import { appointmentService } from '../services/appointmentService';
import { api } from '../services/mockApi';

const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd" /></svg>;

type GroupedAppointments = Record<string, (Appointment & { patientName: string })[]>;

interface DoctorAppointmentsViewProps {
    doctor: Doctor;
    onSelectPatient: (patientId: string) => void;
}

export const DoctorAppointmentsView: React.FC<DoctorAppointmentsViewProps> = ({ doctor, onSelectPatient }) => {
    const [appointments, setAppointments] = useState<GroupedAppointments>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            setIsLoading(true);
            const doctorPatients = await api.getDoctorPatients(doctor.id);
            const patientIds = doctorPatients.map(p => p.id);
            
            const appointmentList = await appointmentService.getAppointmentsForDoctor(patientIds);
            
            const appointmentsWithPatientNames = appointmentList.map(app => {
                const patient = doctorPatients.find(p => p.id === app.patientId);
                return { ...app, patientName: patient?.name || 'Unknown Patient' };
            });

            const grouped = appointmentsWithPatientNames
                .sort((a,b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
                .reduce((acc, app) => {
                    const date = new Date(app.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    if (!acc[date]) {
                        acc[date] = [];
                    }
                    acc[date].push(app);
                    return acc;
                }, {} as GroupedAppointments);

            setAppointments(grouped);
            setIsLoading(false);
        };

        fetchAppointments();
        const intervalId = setInterval(fetchAppointments, 5000); // Refresh every 5 seconds
        return () => clearInterval(intervalId);
    }, [doctor]);

    if (isLoading) {
        return <div className="p-6 text-slate-600">Loading appointments...</div>;
    }

    const sortedDates = Object.keys(appointments).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    return (
        <div className="bg-white rounded-xl shadow-md p-6 h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)] flex flex-col">
            <h3 className="text-2xl font-semibold text-slate-800 mb-6 border-b pb-4">Upcoming Appointments</h3>
            <div className="flex-1 overflow-y-auto">
                {sortedDates.length > 0 ? (
                    <div className="space-y-6">
                        {sortedDates.map(date => (
                            <div key={date}>
                                <h4 className="font-bold text-lg text-slate-700 mb-3 sticky top-0 bg-white/80 backdrop-blur-sm py-2">{date}</h4>
                                <div className="space-y-3">
                                    {appointments[date].map(app => (
                                        <button 
                                            key={app.id} 
                                            onClick={() => onSelectPatient(app.patientId)}
                                            className="w-full text-left p-4 rounded-lg bg-slate-50 border border-slate-200 hover:bg-sky-100 hover:border-sky-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
                                            aria-label={`View details for ${app.patientName}'s appointment at ${app.time}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-slate-800">{app.patientName}</p>
                                                    <p className="text-sm text-slate-600 mt-1"><strong>Reason:</strong> {app.reason}</p>
                                                </div>
                                                <div className="flex items-center text-sm font-medium bg-sky-100 text-sky-700 px-3 py-1 rounded-full flex-shrink-0 ml-2">
                                                    <ClockIcon />
                                                    {app.time}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 text-center mt-8">No upcoming appointments scheduled.</p>
                )}
            </div>
        </div>
    );
};
