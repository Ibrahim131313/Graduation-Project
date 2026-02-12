

import React, { useState, useEffect } from 'react';
import { Patient, VitalSign, VitalHistoryPoint } from '../types';
import { useVitals } from '../hooks/useVitals';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Icons
const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-red-500"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
const TempIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-orange-500"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z"/></svg>;
const RespirationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-blue-500"><path d="M3 12h6l3-9 3 18 3-9h6"/></svg>;
const O2Icon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-emerald-500"><path d="M12.25 21.16a10.05 10.05 0 0 1-5.18-1.74 2.43 2.43 0 0 1-1.33-2.18l-1.2-6.52a2.43 2.43 0 0 1 .53-2.17 10.05 10.05 0 0 1 14.86 6.31 2.43 2.43 0 0 1-2.17 2.72l-6.52 1.2a2.43 2.43 0 0 1-.99.28z"/><path d="M22 2S15 2 12 5"/><path d="M2 22s7 0 10-3"/></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-indigo-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const GenderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-pink-500"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path><path d="M12 11.25V16.5"></path><path d="M12 8.25V6"></path><path d="M9.75 14.25h4.5"></path></svg>;
const DeviceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-slate-500"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>;

const VitalsCard: React.FC<{ vital: VitalSign }> = ({ vital }) => {
    const icons = {
        'Heart Rate': <HeartIcon/>,
        'Temperature': <TempIcon/>,
        'Respiration Rate': <RespirationIcon/>,
        'SpO2': <O2Icon/>,
    };
    const isCritical = vital.thresholds && (vital.value < vital.thresholds.min || vital.value > vital.thresholds.max);

    return (
        <div className="relative group [perspective:1000px]">
            {isCritical && (
                <div className="absolute -inset-0.5 bg-red-500 rounded-xl blur opacity-75 animate-pulse"></div>
            )}
            <div className={`relative bg-gradient-to-br from-white to-slate-50 p-6 rounded-xl shadow-lg flex items-center transition-all duration-300 border-4 group-hover:shadow-2xl group-hover:[transform:translateZ(10px)_scale(1.02)] ${isCritical ? 'border-red-500' : 'border-transparent'}`}>
                <div className="mr-5">{icons[vital.name]}</div>
                <div>
                    <p className="text-slate-500 text-sm font-medium">{vital.name}</p>
                    <p className={`text-4xl font-bold ${isCritical ? 'text-red-600' : 'text-slate-800'}`}>
                        {vital.value} <span className="text-xl font-normal text-slate-600">{vital.unit}</span>
                    </p>
                </div>
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

export const PatientDetailView: React.FC<{ patient: Patient; onBack: () => void; }> = ({ patient, onBack }) => {
    const { vitals, history } = useVitals(patient);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const chartData: Record<VitalSign['name'], VitalHistoryPoint[]> = history;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-slate-800">Monitoring: {patient.name}</h2>
                <button onClick={onBack} className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition w-full sm:w-auto">
                    &larr; Back to Patient List
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-sky-500">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Patient Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-100 p-3 rounded-full"><CalendarIcon /></div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Age</p>
                            <p className="text-xl font-semibold text-slate-800">{patient.age}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-pink-100 p-3 rounded-full"><GenderIcon /></div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Gender</p>
                            <p className="text-xl font-semibold text-slate-800">{patient.gender}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-100 p-3 rounded-full"><DeviceIcon /></div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Device ID</p>
                            <p className="text-xl font-semibold text-slate-800 font-mono">{patient.deviceId}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {vitals.map(v => <VitalsCard key={v.name} vital={v} />)}
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
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