

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { Nurse, Patient } from '../types';
import { api } from '../services/mockApi';
import { PatientDetailView } from '../components/PatientDetailView';
import { useAlert } from '../context/AlertContext';

// Icons
const PatientListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const AlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;

export const NurseDashboard: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('Patients');
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const { alerts } = useAlert();
    
    const nurse = user as Nurse;

    useEffect(() => {
        api.getAllPatients().then(setPatients);
    }, []);
    
    const sidebarItems = [
        { name: 'Patients', icon: <PatientListIcon />, onClick: () => { setActiveTab('Patients'); setSelectedPatient(null); } },
        { name: 'Alerts', icon: <div className="relative"><AlertIcon /><span className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center transition-opacity ${alerts.length > 0 ? 'opacity-100' : 'opacity-0'}`}>{alerts.length}</span></div>, onClick: () => { setActiveTab('Alerts'); setSelectedPatient(null); } }
    ];

    const renderPatientList = () => (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">All Hospital Patients</h3>
            <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto">
                {patients.map(p => (
                    <button key={p.id} onClick={() => setSelectedPatient(p)} className="w-full text-left p-4 rounded-lg bg-slate-50 hover:bg-sky-100 border border-slate-200 hover:border-sky-300 transition-transform duration-150 active:scale-[0.98] flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-slate-800">{p.name}, {p.age}</p>
                            <p className="text-sm text-slate-500">{p.gender}</p>
                        </div>
                        <span className="text-sm font-medium text-sky-600">Monitor Vitals &rarr;</span>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderAlerts = () => (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Critical Alerts ({alerts.length})</h3>
            <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto">
                {alerts.length === 0 ? <p className="text-slate-500">No active alerts.</p> :
                 alerts.map(a => (
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
        if (activeTab === 'Alerts') return renderAlerts();

        if (selectedPatient) {
            return <PatientDetailView patient={selectedPatient} onBack={() => setSelectedPatient(null)} />;
        }
        return renderPatientList();
    };

    return (
        <Layout sidebarItems={sidebarItems} activeItem={selectedPatient ? 'Patients' : activeTab}>
            {renderContent()}
        </Layout>
    );
};