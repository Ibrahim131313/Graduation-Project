//  GolabalVitalsMOnitor.tsx
import { useEffect } from 'react';
import { api } from '../services/mockApi';
import { Role, LoggedInUser } from '../types';

interface GlobalVitalsMonitorProps {
    user: LoggedInUser;
}

export const GlobalVitalsMonitor: React.FC<GlobalVitalsMonitorProps> = ({ user }) => {

    useEffect(() => {
        // Keep this to ensure data flow still happens
        if (user.role === Role.Nurse) {
            api.getAllPatients();
        } else if (user.role === Role.Doctor) {
            api.getDoctorPatients(user.id);
        }
    }, [user.role, user.id]);

    return null;
};
