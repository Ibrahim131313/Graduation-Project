

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { Layout } from '../components/Layout';
import { Doctor, Nurse, Receptionist, Role } from '../types';
import { api } from '../services/mockApi';
import { useAlert } from '../context/AlertContext';
import { useNotification } from '../context/NotificationContext';

// Icons
const StaffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const AddIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const AlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;

type StaffFormData = {
  id: string;
  name: string;
  age?: number;
  gender: 'male' | 'female';
  email: string;
  role: Role.Doctor | Role.Nurse | Role.Receptionist;
};

const initialFormState: StaffFormData = {
    id: '',
    name: '',
    age: undefined,
    gender: 'male',
    email: '',
    role: Role.Doctor,
};

const StaffForm: React.FC<{ onSave: () => void; }> = ({ onSave }) => {
    const [formData, setFormData] = useState<StaffFormData>(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'age' ? (value === '' ? undefined : parseInt(value)) : value 
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.addStaffMember(formData);
            onSave();
            setFormData(initialFormState); // Reset form
        } catch (error) {
            console.error("Failed to add staff member", error);
        } finally {
            setIsLoading(false);
        }
    };

    const inputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500";

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Add New Staff Member</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700">Staff ID</label><input type="text" name="id" value={formData.id} onChange={handleChange} className={inputClasses} required /></div>
                    <div><label className="block text-sm font-medium text-slate-700">Full Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClasses} required /></div>
                    <div><label className="block text-sm font-medium text-slate-700">Age</label><input type="number" name="age" value={formData.age || ''} onChange={handleChange} min="0" max="120" className={inputClasses} /></div>
                    <div><label className="block text-sm font-medium text-slate-700">Gender</label><select name="gender" value={formData.gender} onChange={handleChange} className={inputClasses} required><option value="male">Male</option><option value="female">Female</option></select></div>
                    <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClasses} required /></div>
                    <div><label className="block text-sm font-medium text-slate-700">Role</label><select name="role" value={formData.role} onChange={handleChange} className={inputClasses} required><option value={Role.Doctor}>Doctor</option><option value={Role.Nurse}>Nurse</option><option value={Role.Receptionist}>Receptionist</option></select></div>
                </div>
                <div className="pt-2 flex justify-end">
                    <button type="submit" disabled={isLoading} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                        <AddIcon/> {isLoading ? 'Adding...' : 'Add Staff'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export const AdminDashboard: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [nurses, setNurses] = useState<Nurse[]>([]);
    const [receptionists, setReceptionists] = useState<Receptionist[]>([]);
    const [activeTab, setActiveTab] = useState('Staff Management');
    const { alerts } = useAlert();
    const { addToast } = useNotification();
    const [staffToDelete, setStaffToDelete] = useState<(Doctor | Nurse | Receptionist) | null>(null);

    const fetchData = useCallback(() => {
        api.getAllDoctors().then(setDoctors);
        api.getAllNurses().then(setNurses);
        api.getAllReceptionists().then(setReceptionists);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteClick = (staffMember: Doctor | Nurse | Receptionist) => {
        setStaffToDelete(staffMember);
    };

    const handleConfirmDelete = async () => {
        if (!staffToDelete) return;

        try {
            // FIX: The deleteStaffMember API call only takes one argument (staffId).
            await api.deleteStaffMember(staffToDelete.id);
            addToast(`Staff member ${staffToDelete.name} has been removed.`, 'success');
            setStaffToDelete(null);
            fetchData();
        } catch (error) {
            console.error("Failed to delete staff member", error);
            addToast("Failed to remove staff member.", 'error');
        }
    };

    const handleCancelDelete = () => {
        setStaffToDelete(null);
    };

    const sidebarItems = [
        { name: 'Staff Management', icon: <StaffIcon />, onClick: () => setActiveTab('Staff Management') },
        { name: 'Alerts', icon: <div className="relative"><AlertIcon /><span className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center transition-opacity ${alerts.length > 0 ? 'opacity-100' : 'opacity-0'}`}>{alerts.length}</span></div>, onClick: () => setActiveTab('Alerts') }
    ];

    const StaffList: React.FC<{ 
        title: string; 
        staff: (Doctor | Nurse | Receptionist)[],
        onDelete: (staffMember: Doctor | Nurse | Receptionist) => void;
    }> = ({ title, staff, onDelete }) => (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">{title}</h3>
            <ul className="space-y-2">
                {staff.map(member => (
                    <li key={member.id} className="p-3 bg-slate-50 rounded-md flex justify-between items-center group">
                        <div>
                            <p className="font-medium text-slate-800">{member.name}</p>
                            <p className="text-sm text-slate-500">{member.email}</p>
                            <p className="text-xs text-slate-500 font-mono pt-1">ID: {member.id}</p>
                        </div>
                         <button 
                            onClick={() => onDelete(member)}
                            className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-100 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            aria-label={`Delete ${member.name}`}
                        >
                           <DeleteIcon />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
    
    const renderAlerts = () => (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">All Critical Alerts ({alerts.length})</h3>
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

    const renderStaffManagement = () => (
        <div className="space-y-6">
            <StaffForm onSave={fetchData} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <StaffList title="Doctors" staff={doctors} onDelete={handleDeleteClick} />
                <StaffList title="Nurses" staff={nurses} onDelete={handleDeleteClick} />
                <StaffList title="Receptionists" staff={receptionists} onDelete={handleDeleteClick} />
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'Alerts':
                return renderAlerts();
            case 'Staff Management':
            default:
                return renderStaffManagement();
        }
    };


    return (
        <Layout sidebarItems={sidebarItems} activeItem={activeTab}>
            {renderContent()}
            {staffToDelete && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
                    aria-labelledby="delete-staff-title"
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
                        <h3 id="delete-staff-title" className="text-lg font-semibold text-slate-900">Confirm Deletion</h3>
                        <p className="mt-2 text-sm text-slate-600">
                            Are you sure you want to remove <strong>{staffToDelete.name}</strong> from the system? This action cannot be undone.
                        </p>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                        <button
                            type="button"
                            onClick={handleCancelDelete}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white rounded-md border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmDelete}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Delete
                        </button>
                    </div>
                  </div>
                </div>
            )}
        </Layout>
    );
};