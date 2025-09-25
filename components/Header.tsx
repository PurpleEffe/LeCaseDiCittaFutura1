import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppContext';

const Header: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const { currentUser } = state;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const goHome = () => {
    dispatch({ type: 'SET_VIEW', payload: 'home' });
  };
  
  const handleAuthClick = () => {
      dispatch({ type: 'SET_VIEW', payload: 'login' });
  }
  
  const handleLogout = () => {
      dispatch({ type: 'LOGOUT_USER' });
      setMenuOpen(false);
  }
  
  const handleDashboardClick = () => {
      dispatch({ type: 'SET_VIEW', payload: 'adminDashboard' });
      setMenuOpen(false);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);


  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div onClick={goHome} className="cursor-pointer">
          {/* Corrected path to be relative from the root and added explicit dimensions */}
          <img src="./logo.png" alt="Riace Città Futura Logo" width="187" height="48" style={{height: '48px'}} />
        </div>
        <nav className="flex items-center space-x-6">
          <button onClick={goHome} className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-bold text-lg">
            Le Case
          </button>
          
          <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

          {currentUser ? (
            <div className="relative" ref={menuRef}>
                <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center space-x-2 group">
                    <span className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{currentUser.name}</span>
                    <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <i className={`fas fa-chevron-down text-xs text-slate-500 transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`}></i>
                </button>
                {menuOpen && (
                    <div className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-xl py-1 z-50 ring-1 ring-black ring-opacity-5 animate-fade-in">
                        {currentUser.role === 'admin' && (
                           <button onClick={handleDashboardClick} className="w-full text-left px-4 py-2 text-md text-gray-700 hover:bg-slate-100 hover:text-blue-600 transition-colors">Dashboard</button>
                        )}
                         <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-md text-gray-700 hover:bg-slate-100 hover:text-blue-600 transition-colors">
                           Logout
                         </button>
                    </div>
                )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button onClick={handleAuthClick} className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-bold px-3 py-2 text-lg">
                Accedi
              </button>
              <button onClick={handleAuthClick} className="bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600 transition-all duration-300 font-bold shadow-sm hover:shadow-lg transform hover:-translate-y-0.5 text-lg">
                Registrati
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;