import { useState, useEffect, useCallback } from 'react';
import { VitalSign, VitalHistoryPoint, Patient } from '../types';
import { api } from '../services/mockApi';

const INITIAL_VITALS: VitalSign[] = [
  { name: 'Heart Rate', value: 0, unit: 'BPM', thresholds: { min: 50, max: 120 } },
  { name: 'Temperature', value: 0, unit: '°C', thresholds: { min: 36.1, max: 37.8 } },
  { name: 'Respiration Rate', value: 0, unit: 'breaths/min', thresholds: { min: 12, max: 20 } },
  { name: 'SpO2', value: 0, unit: '%', thresholds: { min: 95, max: 100 } },
];

// Helper to map API keys to frontend names
const vitalKeyMap: Record<string, VitalSign['name']> = {
    heart_rate: 'Heart Rate',
    temperature: 'Temperature',
    respiration_rate: 'Respiration Rate',
    spo2: 'SpO2'
};

export const useVitals = (patient: Patient | null) => {
  const [vitals, setVitals] = useState<VitalSign[]>(INITIAL_VITALS);
  const [history, setHistory] = useState<Record<VitalSign['name'], VitalHistoryPoint[]>>({
    'Heart Rate': [], 'Temperature': [], 'Respiration Rate': [], 'SpO2': [],
  });

  const fetchVitals = useCallback(async () => {
    if (!patient?.deviceId) {
        // console.log("useVitals: No patient deviceId available."); // Debugging
        return;
    }

    try {
        // console.log(`useVitals: Fetching readings for device: ${patient.deviceId}`); // Debugging
        const readings = await api.getReadingsForDevice(patient.deviceId);
        // console.log("useVitals: Raw readings from API:", readings); // Debugging

        if (readings && readings.length > 0) {
            // FIX: Get the LATEST reading from the end of the array
            const latestReading = readings[readings.length - 1].sensors; // <--- MODIFIED HERE
            // console.log("useVitals: Latest reading's sensors:", latestReading); // Debugging

            const newVitals = INITIAL_VITALS.map(vital => {
                const apiKeys = Object.keys(vitalKeyMap).filter(key => vitalKeyMap[key] === vital.name);
                const value = apiKeys.length > 0 ? latestReading[apiKeys[0]] : 0;
                return { ...vital, value: parseFloat(Number(value).toFixed(1)) };
            });
            setVitals(newVitals);
            // console.log("useVitals: Updated vitals state:", newVitals); // Debugging

            // Process history (readings are oldest to newest, which is good for charting in order)
            const newHistory: Record<VitalSign['name'], VitalHistoryPoint[]> = {
                'Heart Rate': [], 'Temperature': [], 'Respiration Rate': [], 'SpO2': [],
            };

            // Use the original 'readings' array, as it's already oldest to newest.
            // Slice the last 30 for charting, ensuring they are ordered correctly.
            const readingsForChart = readings.slice(-30);

            readingsForChart.forEach(reading => {
                const time = new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                Object.keys(reading.sensors).forEach(apiKey => {
                    const vitalName = vitalKeyMap[apiKey];
                    if (vitalName) {
                        newHistory[vitalName].push({
                            time,
                            value: parseFloat(Number(reading.sensors[apiKey]).toFixed(1))
                        });
                    }
                });
            });
            setHistory(newHistory);
            // console.log("useVitals: Updated history state:", newHistory); // Debugging
        } else {
            // console.log("useVitals: No readings found for device."); // Debugging
            setVitals(INITIAL_VITALS); // Reset to initial if no readings
            setHistory({ 'Heart Rate': [], 'Temperature': [], 'Respiration Rate': [], 'SpO2': [] });
        }
    } catch (error) {
        console.error(`Failed to fetch vitals for device ${patient.deviceId}:`, error);
        setVitals(INITIAL_VITALS); // Reset on error
        setHistory({ 'Heart Rate': [], 'Temperature': [], 'Respiration Rate': [], 'SpO2': [] });
    }
  }, [patient?.deviceId]); // Depend on patient.deviceId

  useEffect(() => {
    if (patient) {
        fetchVitals(); // Initial fetch
        const intervalId = setInterval(fetchVitals, 5000); // Poll every 5 seconds
        return () => clearInterval(intervalId);
    } else {
        // Clear interval and reset vitals if patient is null (e.g., logged out)
        setVitals(INITIAL_VITALS);
        setHistory({ 'Heart Rate': [], 'Temperature': [], 'Respiration Rate': [], 'SpO2': [] });
    }
  }, [patient, fetchVitals]); // Depend on patient and fetchVitals

  return { vitals, history };
};