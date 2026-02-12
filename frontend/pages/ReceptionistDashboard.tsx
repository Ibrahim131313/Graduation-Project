import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { Patient, Doctor, Role } from '../types';
import { api } from '../services/mockApi';
import { useNotification } from '../context/NotificationContext';

// Icons
const PatientListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const AddIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const CancelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

type PatientFormData = Omit<Patient, 'role' | 'username'> & { email: string };

const PatientFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    doctors: Doctor[];
}> = ({ isOpen, onClose, onSave, doctors }) => {
    // Default to 'male' as 'Other' is removed
    const [formData, setFormData] = useState<Partial<PatientFormData>>({ gender: 'male' });
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useNotification();

    // Reset form to lowercase 'male'
    const resetForm = () => setFormData({ gender: 'male' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        let processedValue = value;
        if (name === 'age') {
            processedValue = parseInt(value);
        } else if (name === 'gender') { 
            processedValue = value.toLowerCase(); // Convert gender to lowercase
        }

        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const patientDataToSend = {
                ...formData,
                gender: formData.gender?.toLowerCase() // Ensure it's lowercase before sending
            };
            await api.addPatient(patientDataToSend as PatientFormData);
            console.log("hellooooooooooooooooooooooooooooooooo")
            addToast('Patient added successfully.', 'success');
            onSave();
            onClose();
            resetForm();
        } catch (error) {
            console.error("Failed to save patient", error);
            addToast('Failed to add patient.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;
    
    const inputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500";
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-slate-900">Add New Patient</h3>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-slate-700">Patient ID</label><input type="text" name="id" value={formData.id || ''} onChange={handleChange} className={inputClasses} required /></div>
                            <div><label className="block text-sm font-medium text-slate-700">Full Name</label><input type="text" name="name" value={formData.name || ''} onChange={handleChange} className={inputClasses} required /></div>
                            <div><label className="block text-sm font-medium text-slate-700">Age</label><input type="number" name="age" value={formData.age || ''} onChange={handleChange} className={inputClasses} required /></div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Gender</label>
                                <select 
                                    name="gender" 
                                    value={formData.gender || 'male'} // Ensure default value is lowercase
                                    onChange={handleChange} 
                                    className={inputClasses}
                                >
                                    <option value="male">Male</option>   
                                    <option value="female">Female</option> 
                                </select>
                            </div>
                            <div><label className="block text-sm font-medium text-slate-700">Device ID</label><input type="text" name="deviceId" value={formData.deviceId || ''} onChange={handleChange} className={inputClasses} required /></div>
                            <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700">Email</label><input type="email" name="email" value={formData.email || ''} onChange={handleChange} className={inputClasses} required/></div>
                            <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700">Assigned Doctor</label><select name="assignedDoctorId" value={formData.assignedDoctorId || ''} onChange={handleChange} className={inputClasses} required><option value="" disabled>Select a doctor</option>{doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
                        </div>
                    </div>
                    <div className="bg-slate-50 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white rounded-md border border-slate-300 hover:bg-slate-50">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400">{isLoading ? 'Saving...' : 'Save Patient'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export const ReceptionistDashboard: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<Patient>>({});

    const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const { addToast } = useNotification();


    const fetchPatients = useCallback(() => {
        api.getAllPatients().then(setPatients).catch(err => addToast(err.message, 'error'));
    }, [addToast]);

    useEffect(() => {
        fetchPatients();
        api.getAllDoctors().then(setDoctors).catch(err => addToast(err.message, 'error'));
    }, [fetchPatients, addToast]);

    const handleEdit = (patient: Patient) => {
        setEditingPatientId(patient.id);
        setEditFormData(patient);
    };
    
    const handleCancelEdit = () => {
        setEditingPatientId(null);
        setEditFormData({});
    };

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        let processedValue = value;
        if (name === 'age') {
            processedValue = parseInt(value);
        } else if (name === 'gender') { // Ensure gender is lowercase for edit form as well
            processedValue = value.toLowerCase(); 
        }

        setEditFormData(prev => ({ ...prev, [name]: processedValue }));
    };
    
    const handleUpdatePatient = async () => {
        if (!editingPatientId) return;
        try {
            // Ensure gender is lowercase here as a final safeguard if not already handled
            const patientDataToUpdate = {
                ...editFormData,
                gender: editFormData.gender?.toLowerCase()
            };
            await api.updatePatient(editingPatientId, patientDataToUpdate);
            addToast("Patient information updated successfully.", 'success');
            setEditingPatientId(null);
            setEditFormData({});
            fetchPatients();
        } catch (error) {
            addToast('Failed to update patient.', 'error');
        }
    };

    const handleDelete = async () => {
        if (patientToDelete && deleteConfirmText === patientToDelete.name) {
            try {
                await api.deletePatient(patientToDelete.id);
                addToast(`Patient ${patientToDelete.name} deleted.`, 'info');
                setPatientToDelete(null);
                setDeleteConfirmText('');
                fetchPatients();
            } catch(error) {
                addToast('Failed to delete patient.', 'error');
            }
        }
    };
    
    const sidebarItems = [
        { name: 'Patient Records', icon: <PatientListIcon />, onClick: () => {} },
    ];

    // Pagination logic
    const totalPages = Math.ceil(patients.length / itemsPerPage);
    const currentPatients = patients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const goToNextPage = () => setCurrentPage((page) => Math.min(page + 1, totalPages));
    const goToPreviousPage = () => setCurrentPage((page) => Math.max(page - 1, 1));
    
    const inputClasses = "w-full px-2 py-1 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500";

    return (
        <>
            <Layout sidebarItems={sidebarItems} activeItem="Patient Records">
                <div className="bg-white rounded-xl shadow-md">
                    <div className="p-6 flex justify-between items-center border-b">
                        <h3 className="text-xl font-semibold text-slate-800">Patient Records</h3>
                        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                            <AddIcon />
                            Add New Patient
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Patient ID</th>
                                    <th scope="col" className="px-6 py-3">Name</th>
                                    <th scope="col" className="px-6 py-3">Email</th>
                                    <th scope="col" className="px-6 py-3">Age</th>
                                    <th scope="col" className="px-6 py-3">Gender</th>
                                    <th scope="col" className="px-6 py-3">Device ID</th>
                                    <th scope="col" className="px-6 py-3">Assigned Doctor</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentPatients.map(p => (
                                   <tr key={p._id} className={`border-b transition-colors duration-150 ${editingPatientId === p.id ? 'bg-sky-50' : 'odd:bg-white even:bg-slate-50 hover:bg-sky-100'}`}>
                                        {editingPatientId === p.id ? (
                                            <>
                                                <td className="px-6 py-2 font-mono text-slate-700">{p.id}</td>
                                                <td className="px-6 py-2"><input type="text" name="name" value={editFormData.name || ''} onChange={handleEditFormChange} className={inputClasses} /></td>
                                                <td className="px-6 py-2"><input type="email" name="email" value={editFormData.email || ''} onChange={handleEditFormChange} className={inputClasses} /></td>
                                                <td className="px-6 py-2"><input type="number" name="age" value={editFormData.age || ''} onChange={handleEditFormChange} className={`${inputClasses} w-16`} /></td>
                                                <td className="px-6 py-2">
                                                    <select name="gender" value={editFormData.gender} onChange={handleEditFormChange} className={inputClasses}>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-2"><input type="text" name="deviceId" value={editFormData.deviceId || ''} onChange={handleEditFormChange} className={inputClasses} /></td>
                                                <td className="px-6 py-2"><select name="assignedDoctorId" value={editFormData.assignedDoctorId} onChange={handleEditFormChange} className={inputClasses}>{doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></td>
                                                <td className="px-6 py-2">
                                                    <div className="flex items-center gap-3">
                                                        <button onClick={handleUpdatePatient} className="text-emerald-600 hover:text-emerald-800 p-1 rounded-full hover:bg-emerald-100"><SaveIcon/></button>
                                                        <button onClick={handleCancelEdit} className="text-slate-600 hover:text-slate-800 p-1 rounded-full hover:bg-slate-200"><CancelIcon/></button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-6 py-4 font-mono text-slate-600">{p.id}</td>
                                                <td className="px-6 py-4 font-medium text-slate-900">{p.name}</td>
                                                <td className="px-6 py-4">{p.email || 'N/A'}</td>
                                                <td className="px-6 py-4">{p.age}</td>
                                                <td className="px-6 py-4">{p.gender}</td>
                                                <td className="px-6 py-4 font-mono text-slate-600">{p.deviceId}</td>
                                                <td className="px-6 py-4">{doctors.find(d => d.id === p.assignedDoctorId)?.name || 'N/A'}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-800" aria-label={`Edit ${p.name}`}><EditIcon/></button>
                                                        <button onClick={() => setPatientToDelete(p)} className="text-red-600 hover:text-red-800" aria-label={`Delete ${p.name}`}><DeleteIcon/></button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                   </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                         <div className="p-4 border-t flex items-center justify-between">
                            <span className="text-sm text-slate-600">
                                Page {currentPage} of {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={goToPreviousPage} 
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-sm font-medium text-slate-700 bg-white rounded-md border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    Previous
                                </button>
                                <button 
                                    onClick={goToNextPage} 
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 text-sm font-medium text-slate-700 bg-white rounded-md border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Layout>
            <PatientFormModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={fetchPatients}
                doctors={doctors}
            />
             {patientToDelete && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
                    aria-labelledby="delete-patient-title"
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
                        <h3 id="delete-patient-title" className="text-lg font-semibold text-slate-900">Confirm Deletion</h3>
                        <p className="mt-2 text-sm text-slate-600">
                            This action cannot be undone. To permanently delete <strong>{patientToDelete.name}</strong>, please type their name below.
                        </p>
                        <div className="mt-4">
                            <label htmlFor="delete-confirm" className="block text-sm font-medium text-slate-700 sr-only">
                                Patient Name
                            </label>
                            <input
                                type="text"
                                id="delete-confirm"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                        <button
                            type="button"
                            onClick={() => {
                                setPatientToDelete(null);
                                setDeleteConfirmText('');
                            }}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white rounded-md border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleteConfirmText !== patientToDelete.name}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Delete Patient
                        </button>
                    </div>
                  </div>
                </div>
            )}
        </>
    );
};