
import React, { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

const RedCrescentIcon = () => (
    <svg xmlns="http://www.w.w3.org/2000/svg" className="h-10 w-10 mx-auto text-red-600" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
);

const AlertTriangleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2 flex-shrink-0">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);


export const LoginPage: React.FC = () => {
    const { login, isLoading, error, clearError } = useAuth();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Clear error when user starts typing
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (error) clearError();
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (error) clearError();
    };

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault(); // Prevents page reload
        await login(email, password);
    };
    
    const formContainerClasses = "w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg";
    const inputClasses = "w-full px-4 py-2 text-slate-700 bg-slate-100 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";
    const buttonClasses = "w-full py-3 px-4 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-colors";

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
            <div className={formContainerClasses}>
                <div className="text-center mb-6">
                    <RedCrescentIcon />
                    <h2 className="text-3xl font-bold text-slate-800 mt-4">Al Zohor Hospital Portal</h2>
                    <p className="text-slate-500 mt-1">Sign in to access your dashboard</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input type="email" placeholder="Email Address" value={email} onChange={handleEmailChange} className={inputClasses} required />
                    </div>
                    <div>
                        <input type="password" placeholder="Password" value={password} onChange={handlePasswordChange} className={inputClasses} required />
                    </div>

                    {error && (
                        <div className="flex items-center p-3 bg-red-100 border border-red-200 text-red-700 text-sm rounded-md" role="alert">
                            <AlertTriangleIcon />
                            <span>{error}</span>
                        </div>
                    )}
                    
                    <button type="submit" className={buttonClasses} disabled={isLoading}>
                        {isLoading ? 'Signing In...' : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
};
