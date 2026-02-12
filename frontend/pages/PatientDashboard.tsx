import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { Patient, Doctor, ChatMessage, VitalSign, VitalHistoryPoint, DoctorPatientMessage } from '../types';
import { api } from '../services/mockApi';
import { getChatbotResponse } from '../services/chatbotService';
import { useVitals } from '../hooks/useVitals';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';
import { AppointmentScheduler } from '../components/AppointmentScheduler';
import { useNotification } from '../context/NotificationContext';

// Icons
const VitalsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
const ChatbotIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const DoctorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3"/><circle cx="12" cy="10" r="3"/><circle cx="12" cy="12" r="10"/></svg>;
const AppointmentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-rose-500 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
const TempIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-amber-500 animate-pulse"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z"/></svg>;
const RespirationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-blue-500 animate-pulse"><path d="M3 12h6l3-9 3 18 3-9h6"/></svg>;
const O2Icon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-emerald-500 animate-pulse"><path d="M12.25 21.16a10.05 10.05 0 0 1-5.18-1.74 2.43 2.43 0 0 1-1.33-2.18l-1.2-6.52a2.43 2.43 0 0 1 .53-2.17 10.05 10.05 0 0 1 14.86 6.31 2.43 2.43 0 0 1-2.17 2.72l-6.52 1.2a2.43 2.43 0 0 1-.99.28z"/><path d="M22 2S15 2 12 5"/><path d="M2 22s7 0 10-3"/></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 mr-2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;

const VitalsCard: React.FC<{ vital: VitalSign }> = ({ vital }) => {
    const icons = {
        'Heart Rate': <HeartIcon/>,
        'Temperature': <TempIcon/>,
        'Respiration Rate': <RespirationIcon/>,
        'SpO2': <O2Icon/>,
    }
    return (
        <div className="group bg-white p-6 rounded-2xl shadow-lg flex items-center transition-all duration-300 ease-in-out [transform-style:preserve-3d] hover:shadow-2xl hover:[transform:translateY(-8px)_rotateY(-15deg)_scale(1.03)] active:scale-[0.97]">
            <div className="mr-5 transition-transform duration-300 ease-in-out group-hover:[transform:translateZ(20px)]">{icons[vital.name]}</div>
            <div className="transition-transform duration-300 ease-in-out group-hover:[transform:translateZ(10px)]">
                <p className="text-slate-500 text-sm font-medium">{vital.name}</p>
                <p className="text-3xl font-bold text-slate-800">{vital.value} <span className="text-lg font-normal text-slate-600">{vital.unit}</span></p>
            </div>
        </div>
    )
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const getUnit = (name: string) => {
      if (name === 'Respiration Rate') return 'breaths/min';
      if (name === 'SpO2') return '%';
      return '';
    };

    return (
      <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-slate-200">
        <p className="label text-sm font-bold text-slate-800 mb-1">{`Time: ${label}`}</p>
        {payload.map((p: any, index: number) => (
          <p key={index} style={{ color: p.stroke }} className="text-sm font-medium">
            {`${p.name}: ${p.value.toFixed(1)} ${getUnit(p.name)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};


const VitalsDisplay: React.FC<{patient: Patient}> = ({ patient }) => {
    // FIX: Removed incorrect second argument from useVitals call.
    const { vitals, history } = useVitals(patient);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const chartData: Record<VitalSign['name'], VitalHistoryPoint[]> = history;
    
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const healthStatus = vitals.every(v => v.thresholds && v.value >= v.thresholds.min && v.value <= v.thresholds.max)
        ? "All your vitals are looking great!"
        : "Some of your vitals are outside the normal range. Your doctor has been notified.";
    const statusColor = healthStatus.includes("great") ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700';

    return (
        <div className="space-y-6">
             <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800">{getGreeting()}, {patient.name.split(' ')[0]}!</h2>
                <div className={`mt-2 p-3 rounded-lg flex items-center text-sm font-medium ${statusColor}`}>
                    <CheckCircleIcon />
                    <p>{healthStatus}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 [perspective:1000px]">
                {vitals.map(v => <VitalsCard key={v.name} vital={v}/>)}
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Vitals History (Last 30 mins)</h3>
                <ResponsiveContainer width="100%" height={350}>
                     <AreaChart data={chartData['Respiration Rate']} margin={isMobile ? { top: 5, right: 5, left: -25, bottom: 0 } : { top: 5, right: 20, left: -10, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorRespirationRate" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorSpO2" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="stroke-slate-300" vertical={false}/>
                        <XAxis 
                            dataKey="time" 
                            stroke="#64748b"
                            tick={{ fontSize: isMobile ? 10 : 12, fill: 'currentColor' }} 
                            className="text-slate-600"
                            tickLine={false}
                        />
                        <YAxis yAxisId="left" stroke="#3b82f6" domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: isMobile ? 10 : 12 }} />
                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" domain={[90, 100]} tick={{ fontSize: isMobile ? 10 : 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        {!isMobile && <Legend wrapperStyle={{ color: 'var(--text-color)' }} />}
                        <Area yAxisId="left" type="monotone" dataKey="value" name="Respiration Rate" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRespirationRate)" strokeWidth={2} isAnimationActive={true} />
                        <Area yAxisId="right" type="monotone" data={chartData['SpO2']} dataKey="value" name="SpO2" stroke="#10b981" fillOpacity={1} fill="url(#colorSpO2)" strokeWidth={2} isAnimationActive={true} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const TypingIndicator = () => (
    <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
    </div>
);

const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    useEffect(() => {
        setMessages([{
            id: 'welcome',
            text: "Hello! I'm your hospital assistant. How can I help you today?",
            sender: 'bot',
            timestamp: new Date()
        }])
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMessage: ChatMessage = { id: `user-${Date.now()}`, text: input, sender: 'user', timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const botResponseText = await getChatbotResponse(input);
        
        const botMessage: ChatMessage = { id: `bot-${Date.now()}`, text: botResponseText, sender: 'bot', timestamp: new Date() };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)] flex flex-col">
            <div className="p-4 border-b">
                <h3 className="text-xl font-semibold text-slate-800">Chat with Assistant</h3>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-indigo-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">AI</div>}
                        <div className={`max-w-lg px-4 py-3 rounded-2xl ${msg.sender === 'user' ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}`}>
                            <p>{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && <div className="flex justify-start"><div className="bg-slate-200 text-slate-800 px-4 py-3 rounded-2xl rounded-bl-none"><TypingIndicator/></div></div>}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t bg-slate-50 rounded-b-2xl">
                <div className="flex items-center gap-2">
                    <input 
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder="Type your message..."
                        className="w-full px-4 py-2 border text-slate-800 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading} className="bg-indigo-500 text-white p-3 rounded-full hover:bg-indigo-600 disabled:bg-indigo-300 transition">
                        <SendIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};

const DoctorChatModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  doctor: Doctor;
}> = ({ isOpen, onClose, patient, doctor }) => {
  const [messages, setMessages] = useState<DoctorPatientMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const fetchMessages = useCallback(async () => {
    const conversation = await api.getConversation(patient.id, doctor.id);
    setMessages(conversation);
    await api.markMessagesAsRead(doctor.id, patient.id);
  }, [patient.id, doctor.id]);

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const intervalId = setInterval(fetchMessages, 3000); 
      return () => clearInterval(intervalId);
    }
  }, [isOpen, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    setInput('');
    await api.sendMessage(patient.id, doctor.id, input.trim());
    await fetchMessages();
    setIsLoading(false);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg h-[90vh] flex flex-col transform transition-transform duration-300 scale-95 opacity-0 animate-fade-in-scale">
        <style>{`
            @keyframes fade-in-scale {
                from { transform: scale(0.95); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            .animate-fade-in-scale { animation: fade-in-scale 0.3s forwards cubic-bezier(0.16, 1, 0.3, 1); }
        `}</style>
        <header className="p-4 border-b flex items-center justify-between flex-shrink-0">
          <h3 className="text-xl font-semibold text-slate-800">Chat with {doctor.name}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl font-light">&times;</button>
        </header>
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === patient.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md px-4 py-3 rounded-2xl ${msg.senderId === patient.id ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}`}>
                <p>{msg.text}</p>
                <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t bg-slate-50 rounded-b-2xl flex-shrink-0">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="w-full px-4 py-2 border text-slate-800 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
            />
            <button onClick={handleSend} disabled={isLoading} className="bg-indigo-500 text-white p-3 rounded-full hover:bg-indigo-600 disabled:bg-indigo-300 transition">
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


const DoctorInfo: React.FC<{ patient: Patient; doctor: Doctor | null }> = ({ patient, doctor }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    if (!doctor) return <div>Loading doctor information...</div>;

    return (
        <>
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
                <h3 className="text-2xl font-semibold text-slate-800">Your Assigned Doctor</h3>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-sky-100 flex items-center justify-center border-4 border-white shadow-md">
                        <DoctorIcon/>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h4 className="text-3xl font-bold text-slate-900">{doctor.name}</h4>
                        <p className="text-xl text-sky-600 font-medium">{doctor.specialization}</p>
                        <p className="text-md text-slate-500 mt-2">Contact: {doctor.contact}</p>
                    </div>
                </div>
                <button onClick={() => setIsChatOpen(true)} className="w-full py-3 px-4 font-semibold text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                    Contact Doctor
                </button>
            </div>
            {doctor && <DoctorChatModal 
                isOpen={isChatOpen} 
                onClose={() => setIsChatOpen(false)} 
                patient={patient} 
                doctor={doctor} 
            />}
        </>
    );
};


export const PatientDashboard: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('Vitals');
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const patient = user as Patient;
    const { addToast } = useNotification();
    const notifiedMessagesRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        api.getDoctor(patient.assignedDoctorId).then(doc => doc && setDoctor(doc));
    }, [patient.assignedDoctorId]);

    useEffect(() => {
        if (!doctor) return;

        const checkMessages = async () => {
            const messages = await api.getConversation(patient.id, doctor.id);
            if (messages.length > 0) {
                const lastMessage = messages[messages.length - 1];

                if (lastMessage && lastMessage.senderId === doctor.id && !lastMessage.read && !notifiedMessagesRef.current.has(lastMessage.id)) {
                     const shortMessage = lastMessage.text.length > 40 ? `${lastMessage.text.substring(0, 40)}...` : lastMessage.text;
                     addToast(`New message from Dr. ${doctor.name.split(' ').pop()}: "${shortMessage}"`);
                     notifiedMessagesRef.current.add(lastMessage.id);
                }
            }
        };
        
        const intervalId = setInterval(checkMessages, 5000);
        return () => clearInterval(intervalId);

    }, [patient.id, doctor, addToast]);
    
    const sidebarItems = [
        { name: 'Vitals', icon: <VitalsIcon/>, onClick: () => setActiveTab('Vitals') },
        { name: 'Appointments', icon: <AppointmentIcon/>, onClick: () => setActiveTab('Appointments') },
        { name: 'Chatbot', icon: <ChatbotIcon/>, onClick: () => setActiveTab('Chatbot') },
        { name: 'Doctor Info', icon: <DoctorIcon/>, onClick: () => setActiveTab('Doctor Info') }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'Vitals':
                return <VitalsDisplay patient={patient}/>;
            case 'Appointments':
                return <AppointmentScheduler patient={patient} />;
            case 'Chatbot':
                return <Chatbot />;
            case 'Doctor Info':
                return <DoctorInfo patient={patient} doctor={doctor}/>;
            default:
                return <VitalsDisplay patient={patient}/>;
        }
    };

    return (
        <Layout sidebarItems={sidebarItems} activeItem={activeTab}>
            {renderContent()}
        </Layout>
    );
};
