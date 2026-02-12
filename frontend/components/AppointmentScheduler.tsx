import React, { useState, useEffect, useCallback } from 'react';
import { Patient, Doctor, Appointment } from '../types';
import { appointmentService } from '../services/appointmentService';
import { api } from '../services/mockApi';

const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;

const AVAILABLE_TIMES = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

export const AppointmentScheduler: React.FC<{ patient: Patient }> = ({ patient }) => {
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    });
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [reason, setReason] = useState('');
    const [bookedTimes, setBookedTimes] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);

    useEffect(() => {
        api.getDoctor(patient.assignedDoctorId).then(doc => doc && setDoctor(doc));
        fetchAppointments();
    }, [patient]);

    const fetchAppointments = useCallback(() => {
        appointmentService.getAppointmentsForPatient(patient.id).then(setAppointments);
    }, [patient.id]);
    
    useEffect(() => {
        if (selectedDate && doctor) {
            const dateString = selectedDate.toISOString().split('T')[0];
            appointmentService.getBookedTimes(doctor.id, dateString).then(setBookedTimes);
            setSelectedTime(null);
        }
    }, [selectedDate, doctor]);

    const handleDateSelect = (day: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (day >= today) {
            setSelectedDate(day);
        }
    };
    
    const handleBooking = async () => {
        if (!selectedDate || !selectedTime || !reason.trim() || !doctor) {
            setError("Please select a date, time, and provide a reason for your visit.");
            return;
        }
        setError(null);
        setSuccess(null);

        const appointmentData = {
            patientId: patient.id,
            doctorId: doctor.id,
            date: selectedDate.toISOString().split('T')[0],
            time: selectedTime,
            reason: reason.trim(),
        };

        try {
            await appointmentService.bookAppointment(appointmentData);
            setSuccess(`Appointment booked successfully for ${selectedTime} on ${selectedDate.toLocaleDateString()}!`);
            fetchAppointments();
            setSelectedTime(null);
            setReason('');
             const dateString = selectedDate.toISOString().split('T')[0];
            appointmentService.getBookedTimes(doctor.id, dateString).then(setBookedTimes);
        } catch (e: any) {
            setError(e.message);
        }
    };

    const promptCancel = (appointmentId: string) => {
        setAppointmentToCancel(appointmentId);
        setShowCancelConfirm(true);
    };

    const handleConfirmCancel = async () => {
        if (!appointmentToCancel) return;
        await appointmentService.cancelAppointment(appointmentToCancel);
        fetchAppointments();
        setShowCancelConfirm(false);
        setAppointmentToCancel(null);
    };

    const renderCalendar = () => {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const today = new Date();
        today.setHours(0,0,0,0);

        const calendarDays = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="p-2"></div>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayDate = new Date(year, month, i);
            const isToday = dayDate.getTime() === today.getTime();
            const isSelected = selectedDate && dayDate.getTime() === selectedDate.getTime();
            const isPast = dayDate < today;

            let dayClass = "w-full aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200";

            if (isPast) {
                dayClass += " text-slate-400 cursor-not-allowed";
            } else if (isSelected) {
                dayClass += " bg-blue-600 text-white font-bold shadow-lg transform scale-105";
            } else if (isToday) {
                dayClass += " bg-blue-100 text-blue-700 font-semibold";
            } else {
                dayClass += " text-slate-700 hover:bg-slate-100";
            }

            calendarDays.push(
                <button
                    key={i}
                    disabled={isPast}
                    onClick={() => handleDateSelect(dayDate)}
                    className={dayClass}
                >
                    {i}
                </button>
            );
        }

        return (
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 rounded-full hover:bg-slate-100"><ChevronLeftIcon /></button>
                    <h3 className="font-semibold text-lg">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                    <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 rounded-full hover:bg-slate-100"><ChevronRightIcon /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-2">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>
                <div className="grid grid-cols-7 gap-2">{calendarDays}</div>
            </div>
        );
    };

    const upcomingAppointments = appointments.filter(a => new Date(`${a.date}T00:00:00`) >= new Date(new Date().setHours(0,0,0,0)) && a.status === 'booked').sort((a,b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {renderCalendar()}
                    {selectedDate && (
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="font-semibold mb-4">Available Slots for {selectedDate.toLocaleDateString()}</h3>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {AVAILABLE_TIMES.map(time => {
                                    const isBooked = bookedTimes.includes(time);
                                    return (
                                        <button
                                            key={time}
                                            disabled={isBooked}
                                            onClick={() => setSelectedTime(time)}
                                            className={`
                                                p-3 rounded-lg text-sm font-medium transition-colors duration-200
                                                ${isBooked ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-100 text-slate-800 hover:bg-blue-200'}
                                                ${selectedTime === time ? 'bg-blue-600 text-white font-bold ring-2 ring-offset-2 ring-blue-500' : ''}
                                            `}
                                        >
                                            {time}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {selectedTime && (
                        <div className="bg-white p-6 rounded-xl shadow-md">
                             <h3 className="font-semibold mb-2">Book for {selectedTime} on {selectedDate?.toLocaleDateString()}</h3>
                             <textarea 
                                value={reason} 
                                onChange={(e) => setReason(e.target.value)} 
                                className="w-full p-2 border rounded-md mb-3"
                                placeholder="Reason for visit..."
                            ></textarea>
                            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                            {success && <p className="text-emerald-600 text-sm mb-3">{success}</p>}
                            <button onClick={handleBooking} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Confirm Booking</button>
                        </div>
                    )}
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                     <h3 className="text-xl font-semibold text-slate-800 mb-4">Your Appointments</h3>
                     <div className="space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
                        {upcomingAppointments.length > 0 ? upcomingAppointments.map(app => (
                            <div key={app.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                                 <div className="flex items-center text-slate-700 font-semibold mb-1">
                                    <CalendarIcon />
                                    <span>{new Date(app.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {app.time}</span>
                                </div>
                                <p className="text-sm text-slate-600 pl-7 mb-2"><strong>Reason:</strong> {app.reason}</p>
                                <div className="pl-7">
                                   <button onClick={() => promptCancel(app.id)} className="text-xs text-red-600 hover:underline">Cancel Appointment</button>
                                </div>
                            </div>
                        )) : <p className="text-slate-500">You have no upcoming appointments.</p>}
                     </div>
                </div>
            </div>

            {showCancelConfirm && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
                    aria-labelledby="cancel-title"
                    role="dialog"
                    aria-modal="true"
                >
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-sm transform transition-all animate-fade-in-scale">
                    <style>{`
                        @keyframes fade-in-scale {
                            from { transform: scale(0.95); opacity: 0; }
                            to { transform: scale(1); opacity: 1; }
                        }
                        .animate-fade-in-scale { animation: fade-in-scale 0.2s forwards cubic-bezier(0.16, 1, 0.3, 1); }
                    `}</style>
                    <div className="p-6">
                        <h3 id="cancel-title" className="text-lg font-semibold text-slate-900">Confirm Cancellation</h3>
                        <p className="mt-2 text-sm text-slate-600">
                            Are you sure you want to cancel this appointment? This action cannot be undone.
                        </p>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white rounded-md border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={() => setShowCancelConfirm(false)}
                        >
                            No
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            onClick={handleConfirmCancel}
                        >
                            Yes, Cancel
                        </button>
                    </div>
                  </div>
                </div>
            )}
        </>
    );
};