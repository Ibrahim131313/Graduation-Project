import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Alert } from '../types';

interface AlertContextType {
  alerts: Alert[];
  addAlert: (newAlert: Alert) => void;
  removeAlert: (patientId: string, vitalName: Alert['vital']) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = useCallback((newAlert: Alert) => {
    setAlerts(prevAlerts => {
      const existingAlertIndex = prevAlerts.findIndex(
        a => a.patientId === newAlert.patientId && a.vital === newAlert.vital
      );

      if (existingAlertIndex > -1) {
        // Update existing alert to keep timestamp fresh
        const updatedAlerts = [...prevAlerts];
        updatedAlerts[existingAlertIndex] = newAlert;
        return updatedAlerts;
      }
      // Add new alert to the top
      return [newAlert, ...prevAlerts];
    });
  }, []);
  
  const removeAlert = useCallback((patientId: string, vitalName: Alert['vital']) => {
    setAlerts(prevAlerts => prevAlerts.filter(a => !(a.patientId === patientId && a.vital === vitalName)));
  }, []);


  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
