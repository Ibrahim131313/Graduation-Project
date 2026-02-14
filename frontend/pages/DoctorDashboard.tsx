import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { Doctor, Patient, DoctorPatientMessage } from '../types';
import { api } from '../services/mockApi';
import { DoctorAppointmentsView } from '../components/DoctorAppointmentsView';
import { PatientDetailView } from '../components/PatientDetailView';
import { appointmentService } from '../services/appointmentService';
import { useNotification } from '../context/NotificationContext';
import { useAlert } from '../context/AlertContext';

// Icons
const PatientListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const AlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const MessageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const AppointmentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;

const MessagingView: React.FC<{ doctor: Doctor }> = ({ doctor }) => {
  type ConversationSummary = { patient: Patient, lastMessage: DoctorPatientMessage, unreadCount: number };
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [messages, setMessages] = useState<DoctorPatientMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const fetchConversations = useCallback(async () => {
    const convos = await api.getDoctorConversations(doctor.id);
    setConversations(convos);
  }, [doctor.id]);

  const fetchMessages = useCallback(async (patientId: string) => {
    const conversation = await api.getConversation(patientId, doctor.id);
    setMessages(conversation);
    await api.markMessagesAsRead(patientId, doctor.id);
    await fetchConversations(); 
  }, [doctor.id, fetchConversations]);

  useEffect(() => {
    fetchConversations();
    const intervalId = setInterval(fetchConversations, 5000);
    return () => clearInterval(intervalId);
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedPatient) {
      fetchMessages(selectedPatient.id);
      const intervalId = setInterval(() => fetchMessages(selectedPatient.id), 3000);
      return () => clearInterval(intervalId);
    }
  }, [selectedPatient, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSelectConversation = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedPatient || isLoading) return;
    setIsLoading(true);
    setInput('');
    await api.sendMessage(doctor.id, selectedPatient.id, input.trim());
    await fetchMessages(selectedPatient.id);
    setIsLoading(false);
  };
  
  // Mobile chat view uses absolute positioning for smooth slide transitions
  return (
    <div className="bg-white rounded-xl shadow-md flex flex-col overflow-hidden" style={{ height: 'calc(100dvh - 10rem)', minHeight: '400px' }}>
      <div className="flex-1 flex relative overflow-hidden">
        {/* Conversation List */}
        <div className={`absolute inset-0 sm:relative sm:inset-auto sm:w-1/3 flex-shrink-0 border-r border-slate-200 flex flex-col bg-white z-10 transition-transform duration-300 ease-in-out ${selectedPatient ? '-translate-x-full sm:translate-x-0' : 'translate-x-0'}`}>
          <div className="p-4 border-b flex-shrink-0">
            <h3 className="text-xl font-semibold text-slate-800">Messages</h3>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {conversations.length > 0 ? conversations.map(convo => (
              <button key={convo.patient.id} onClick={() => handleSelectConversation(convo.patient)} className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 ${selectedPatient?.id === convo.patient.id ? 'bg-sky-50' : ''}`}>
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-slate-800">{convo.patient.name}</p>
                  {convo.unreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{convo.unreadCount}</span>}
                </div>
                <p className="text-sm text-slate-500 truncate">{convo.lastMessage.text}</p>
              </button>
            )) : <p className="p-4 text-slate-500">No conversations yet.</p>}
          </div>
        </div>
        {/* Chat View */}
        <div className={`absolute inset-0 sm:relative sm:inset-auto sm:w-2/3 flex-shrink-0 flex flex-col bg-white transition-transform duration-300 ease-in-out ${selectedPatient ? 'translate-x-0' : 'translate-x-full sm:translate-x-0'}`}>
          {selectedPatient ? (
            <>
              <div className="p-4 border-b flex items-center flex-shrink-0">
                <button onClick={() => setSelectedPatient(null)} className="sm:hidden mr-4 p-2 rounded-full hover:bg-slate-100">
                  &larr;
                </button>
                <h3 className="text-xl font-semibold text-slate-800 truncate">Chat with {selectedPatient.name}</h3>
              </div>
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto overscroll-contain space-y-4">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === doctor.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] sm:max-w-lg px-4 py-3 rounded-2xl ${msg.senderId === doctor.id ? 'bg-sky-500 text-white rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}`}>
                      <p className="break-words">{msg.text}</p>
                      <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-3 sm:p-4 border-t bg-slate-50 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Type your message..." className="flex-1 min-w-0 px-4 py-2 border text-slate-800 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500" disabled={isLoading}/>
                  <button onClick={handleSend} disabled={isLoading} className="flex-shrink-0 bg-sky-500 text-white p-3 rounded-full hover:bg-sky-600 disabled:bg-sky-300 transition"><SendIcon/></button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 hidden sm:flex items-center justify-center text-slate-500 text-center p-4">
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const DoctorDashboard: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('Patients');
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [conversations, setConversations] = useState<{patient: Patient, lastMessage: DoctorPatientMessage, unreadCount: number}[]>([]);
    const [newAppointmentCount, setNewAppointmentCount] = useState(0);
    const lastSeenAppointmentCountRef = useRef(0);
    const { addToast } = useNotification();
    const { alerts } = useAlert();
    const notifiedMessagesRef = useRef<Set<string>>(new Set());
    
    const doctor = user as Doctor;
    
    const doctorAlerts = alerts.filter(alert => doctor.patients.includes(alert.patientId));

    useEffect(() => {
        api.getDoctorPatients(doctor.id).then(fetchedPatients => {
            setPatients(fetchedPatients);

            // Initialize the last-seen count on first load
            const patientIds = fetchedPatients.map(p => p.id);
            appointmentService.getAppointmentsForDoctor(patientIds).then(appointments => {
                lastSeenAppointmentCountRef.current = appointments.length;
            });
        });

        const fetchConvos = async () => {
            const convos = await api.getDoctorConversations(doctor.id);
            setConversations(convos);

            convos.forEach(convo => {
                if (convo.unreadCount > 0 && convo.lastMessage.senderId !== doctor.id && !notifiedMessagesRef.current.has(convo.lastMessage.id)) {
                    const shortMessage = convo.lastMessage.text.length > 40 ? `${convo.lastMessage.text.substring(0, 40)}...` : convo.lastMessage.text;
                    addToast(`New message from ${convo.patient.name}: "${shortMessage}"`);
                    notifiedMessagesRef.current.add(convo.lastMessage.id);
                }
            });
        };
        fetchConvos();
        const intervalId = setInterval(fetchConvos, 5000);
        return () => clearInterval(intervalId);
    }, [doctor.id, addToast]);

    // Poll for new appointments
    useEffect(() => {
        if (patients.length === 0) return;
        const patientIds = patients.map(p => p.id);

        const checkNewAppointments = async () => {
            const appointments = await appointmentService.getAppointmentsForDoctor(patientIds);
            const currentCount = appointments.length;
            const diff = currentCount - lastSeenAppointmentCountRef.current;

            if (diff > 0 && activeTab !== 'Appointments') {
                setNewAppointmentCount(prev => prev + diff);
                addToast(`You have ${diff} new appointment${diff > 1 ? 's' : ''}!`);
            }
            lastSeenAppointmentCountRef.current = currentCount;
        };

        const intervalId = setInterval(checkNewAppointments, 5000);
        return () => clearInterval(intervalId);
    }, [patients, activeTab, addToast]);

    const handleSelectPatientFromAppointment = (patientId: string) => {
        const patient = patients.find(p => p.id === patientId);
        if (patient) {
            setSelectedPatient(patient);
            setActiveTab('Patients');
        }
    };

    const totalUnread = conversations.reduce((sum, convo) => sum + convo.unreadCount, 0);

    const sidebarItems = [
        { name: 'Patients', icon: <PatientListIcon />, onClick: () => { setActiveTab('Patients'); setSelectedPatient(null); } },
        { name: 'Appointments', icon: <div className="relative"><AppointmentIcon /><span className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center transition-opacity ${newAppointmentCount > 0 ? 'opacity-100' : 'opacity-0'}`}>{newAppointmentCount}</span></div>, onClick: () => { setActiveTab('Appointments'); setSelectedPatient(null); setNewAppointmentCount(0); } },
        { name: 'Messages', icon: <div className="relative"><MessageIcon /><span className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center transition-opacity ${totalUnread > 0 ? 'opacity-100' : 'opacity-0'}`}>{totalUnread}</span></div>, onClick: () => { setActiveTab('Messages'); setSelectedPatient(null); } },
        { name: 'Alerts', icon: <div className="relative"><AlertIcon /><span className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center transition-opacity ${doctorAlerts.length > 0 ? 'opacity-100' : 'opacity-0'}`}>{doctorAlerts.length}</span></div>, onClick: () => { setActiveTab('Alerts'); setSelectedPatient(null); } }
    ];

    const renderPatientList = () => (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Assigned Patients</h3>
            <div className="space-y-3">
                {patients.map(p => (
                    <button key={p.id} onClick={() => setSelectedPatient(p)} className="w-full text-left p-4 rounded-lg bg-slate-50 hover:bg-sky-100 border border-slate-200 hover:border-sky-300 transition-transform duration-150 active:scale-[0.98] flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-slate-800">{p.name}, {p.age}</p>
                            <p className="text-sm text-slate-500">{p.gender}</p>
                        </div>
                        <span className="text-sm font-medium text-sky-600">View Details &rarr;</span>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderAlerts = () => (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Critical Alerts ({doctorAlerts.length})</h3>
            <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto">
                {doctorAlerts.length === 0 ? <p className="text-slate-500">No active alerts for your patients.</p> :
                 doctorAlerts.map(a => (
                    <div key={a.id} className="p-4 rounded-lg bg-red-50 border border-red-200">
                        <p className="font-bold text-red-700">{a.message}</p>
                        <p className="text-sm text-red-600">Patient: {a.patientName} | Value: {a.value}</p>
                        <p className="text-xs text-slate-500 mt-1">{a.timestamp.toLocaleString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderContent = () => {
        if (activeTab === 'Appointments') return <DoctorAppointmentsView doctor={doctor} onSelectPatient={handleSelectPatientFromAppointment} />;
        if (activeTab === 'Messages') return <MessagingView doctor={doctor} />;
        if (activeTab === 'Alerts') return renderAlerts();

        if (selectedPatient) {
            return <PatientDetailView patient={selectedPatient} onBack={() => setSelectedPatient(null)} />;
        }
        return renderPatientList();
    };

    // Simulate new appointments with a button
    const simulateNewAppointment = () => {
        setNewAppointmentCount(count => count + 1);
    };

    return (
        <Layout sidebarItems={sidebarItems} activeItem={selectedPatient ? 'Patients' : activeTab}>
            {/* Simulate new appointment button for demo/testing */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={simulateNewAppointment}
                    className="bg-sky-500 text-white px-4 py-2 rounded-full shadow hover:bg-sky-600 transition font-semibold"
                >
                    Simulate New Appointment
                </button>
            </div>
            {renderContent()}
        </Layout>
    );
};