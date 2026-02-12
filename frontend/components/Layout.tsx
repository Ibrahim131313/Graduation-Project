import React, { ReactNode, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface LayoutProps {
  children: ReactNode;
  sidebarItems: { name: string; icon: ReactNode; onClick: () => void }[];
  activeItem: string;
}

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-slate-500"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
);
const LogoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
);
const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);


export const Layout: React.FC<LayoutProps> = ({ children, sidebarItems, activeItem }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const capitalize = (s?: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

  const getRoleColor = (role?: Role) => {
    switch(role) {
      case Role.Patient: return 'text-emerald-500';
      case Role.Doctor: return 'text-sky-500';
      case Role.Nurse: return 'text-amber-500';
      case Role.Receptionist: return 'text-violet-500';
      case Role.Admin: return 'text-indigo-500';
      default: return 'text-slate-500';
    }
  }
  
  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  }

  return (
    <>
      <div className="flex h-screen bg-slate-100 overflow-hidden">
        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-20 lg:hidden transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <aside className={`w-64 flex-shrink-0 bg-slate-800 text-slate-200 flex flex-col fixed lg:relative inset-y-0 left-0 z-30 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
          <div className="h-20 flex items-center justify-center bg-slate-900">
            <LogoIcon />
            <h1 className="text-xl font-bold ml-2">Al Zohor</h1>
          </div>
          <nav className="flex-1 px-4 py-6">
            <ul>
              {sidebarItems.map((item) => (
                <li key={item.name} className="mb-2">
                  <button
                    onClick={() => {
                      item.onClick();
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                      activeItem === item.name
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-slate-700'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:scale-100 lg:blur-none scale-95 blur-sm' : ''}`}>
          {/* Header */}
          <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8">
            <div className="flex items-center">
               <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden mr-4 text-slate-600">
                  <MenuIcon />
               </button>
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">
                {capitalize(user?.role)} Dashboard
              </h2>
            </div>
            <div className="flex items-center">
              <div className="text-right mr-2 sm:mr-4">
                <p className="font-semibold text-slate-700 hidden sm:block">{user?.name}</p>
                {user && (user.role === Role.Doctor || user.role === Role.Nurse || user.role === Role.Receptionist) ? (
                    <p className={`text-sm font-medium ${getRoleColor(user?.role)}`}>{capitalize(user?.role)} &bull; <span className="font-mono text-xs align-baseline">{user.id}</span></p>
                ) : (
                    <p className={`text-sm font-medium ${getRoleColor(user?.role)}`}>{capitalize(user?.role)}</p>
                )}
              </div>
              <div className="hidden sm:block">
                  <UserIcon />
              </div>
              <button onClick={() => setShowLogoutConfirm(true)} className="ml-2 sm:ml-6 flex items-center text-slate-500 hover:text-red-500 transition-colors">
                  <LogoutIcon/>
                  <span className="hidden sm:inline ml-2 text-sm font-medium">Logout</span>
              </button>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-4 sm:p-8">
            {children}
          </main>
        </div>
      </div>
      
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
            aria-labelledby="logout-title"
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
                <h3 id="logout-title" className="text-lg font-semibold text-slate-900">Confirm Logout</h3>
                <p className="mt-2 text-sm text-slate-600">
                    Are you sure you want to log out?
                </p>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white rounded-md border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => setShowLogoutConfirm(false)}
                >
                    No
                </button>
                <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    onClick={handleLogout}
                >
                    Yes
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
