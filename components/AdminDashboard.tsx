import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { House, Reservation } from '../types';
import HouseForm from './HouseForm';

const AdminDashboard: React.FC = () => {
  // FIX: Actively wait for the DayPicker library to load
  const [DayPicker, setDayPicker] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    // Check if the component is already available
    if ((window as any).ReactDayPicker?.DayPicker) {
        setDayPicker(() => (window as any).ReactDayPicker.DayPicker);
        return;
    }

    // If not, poll for it
    const interval = setInterval(() => {
        if ((window as any).ReactDayPicker?.DayPicker) {
            setDayPicker(() => (window as any).ReactDayPicker.DayPicker);
            clearInterval(interval);
        }
    }, 100); // Check every 100ms

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);

  const { state, actions } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingHouse, setEditingHouse] = useState<House | null>(null);
  const [showHouseForm, setShowHouseForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<House | null>(null);

  // State for managing blocked dates
  const [managingDatesFor, setManagingDatesFor] = useState<House | null>(null);
  const [selectedBlockedDays, setSelectedBlockedDays] = useState<Date[]>([]);
  const [isSavingDates, setIsSavingDates] = useState(false);


  const handleStatusChange = (id: number, status: 'confirmed' | 'rejected') => {
    actions.updateReservationStatus(id, status);
  };
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-600/20';
      case 'confirmed': return 'bg-green-100 text-green-800 ring-1 ring-green-600/20';
      case 'rejected': return 'bg-red-100 text-red-800 ring-1 ring-red-600/20';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const handleDeleteHouse = (house: House) => {
    if (house) {
        actions.deleteHouse(house.id);
        setShowDeleteConfirm(null);
    }
  };

  const openAddForm = () => {
    setEditingHouse(null);
    setShowHouseForm(true);
  };

  const openEditForm = (house: House) => {
    setEditingHouse(house);
    setShowHouseForm(true);
  };

  const openDateManager = (house: House) => {
      setManagingDatesFor(house);
      setSelectedBlockedDays(house.blockedDates.map(d => new Date(d)));
  };

  const handleSaveBlockedDates = async () => {
    if (managingDatesFor) {
      setIsSavingDates(true);
      const dateStrings = selectedBlockedDays.map(d => d.toISOString().split('T')[0]);
      await actions.updateBlockedDates(managingDatesFor.id, dateStrings);
      setIsSavingDates(false);
      setManagingDatesFor(null);
    }
  };
  
  const StatCard: React.FC<{icon: string; label: string; value: number | string; gradient: string; onClick?: () => void}> = ({icon, label, value, gradient, onClick}) => {
      const isClickable = !!onClick;
      const baseClasses = `p-6 rounded-xl shadow-lg flex items-center space-x-4 text-white ${gradient}`;
      const clickableClasses = isClickable ? 'cursor-pointer transform hover:-translate-y-1 transition-transform' : '';

      return (
        <div className={`${baseClasses} ${clickableClasses}`} onClick={onClick}>
            <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center">
                <i className={`fas ${icon} text-white text-2xl`}></i>
            </div>
            <div>
                <p className="text-white/90 text-sm font-medium">{label}</p>
                <p className="text-3xl font-extrabold">{value}</p>
            </div>
        </div>
      );
  };

  const pendingReservations = state.reservations.filter(r => r.status === 'pending').length;

  return (
    <div>
      <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 tracking-tight mb-4">Pannello di Controllo</h2>
      <p className="text-center text-lg text-slate-500 mb-10">Gestisci le case e le richieste di soggiorno da un unico posto.</p>
      
       <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
                <div className="bg-white p-4 rounded-lg shadow-xl space-y-2">
                     <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`w-full text-left font-bold text-lg p-3 rounded-md flex items-center space-x-3 transition-colors duration-300 ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                        <i className="fas fa-chart-pie w-6"></i><span>Riepilogo</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('reservations')}
                        className={`w-full text-left font-bold text-lg p-3 rounded-md flex items-center space-x-3 transition-colors duration-300 ${activeTab === 'reservations' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                         <i className="fas fa-calendar-check w-6"></i><span>Richieste</span>
                         {pendingReservations > 0 && <span className="bg-white text-blue-600 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">{pendingReservations}</span>}
                      </button>
                      <button
                        onClick={() => setActiveTab('houses')}
                        className={`w-full text-left font-bold text-lg p-3 rounded-md flex items-center space-x-3 transition-colors duration-300 ${activeTab === 'houses' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                         <i className="fas fa-home w-6"></i><span>Le Tue Case</span>
                      </button>
                </div>
            </aside>

            <main className="lg:col-span-3">
                 <div className="bg-white p-6 rounded-lg shadow-xl min-h-[400px]">
                    {activeTab === 'dashboard' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                               <StatCard icon="fa-home" label="Case Totali" value={state.houses.length} gradient="bg-gradient-to-br from-blue-500 to-blue-700" onClick={() => setActiveTab('houses')} />
                               <StatCard icon="fa-hourglass-half" label="Richieste in Attesa" value={pendingReservations} gradient="bg-gradient-to-br from-orange-400 to-orange-500" onClick={() => setActiveTab('reservations')} />
                               <StatCard icon="fa-users" label="Utenti Registrati" value={state.users.length} gradient="bg-gradient-to-br from-green-500 to-green-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">Benvenuto, Gestore!</h3>
                                <p className="text-slate-600 leading-relaxed">Utilizza i menù a lato per navigare tra le sezioni. Da qui puoi approvare o rifiutare le richieste di soggiorno e gestire le proprietà, aggiungendone di nuove o modificando quelle esistenti.</p>
                            </div>
                        </div>
                    )}
                    {activeTab === 'reservations' && (
                        <div className="animate-fade-in">
                          <h3 className="text-2xl font-bold mb-4 text-gray-800">Richieste di Soggiorno</h3>
                          <div className="space-y-4">
                            {state.reservations.length > 0 ? state.reservations.map((res: Reservation) => (
                              <div key={res.id} className="border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow bg-white">
                                <div className="flex justify-between items-start flex-wrap">
                                    <div className="flex-grow">
                                        <p className="font-bold text-lg text-blue-700">{res.houseName}</p>
                                        <p className="text-slate-600">Da: <span className="font-medium text-slate-800">{res.guestName}</span> ({res.guestEmail})</p>
                                        <p className="text-slate-600">Date: <span className="font-medium text-slate-800">{res.checkIn}</span> a <span className="font-medium text-slate-800">{res.checkOut}</span></p>
                                        <p className="text-slate-600">Ospiti: <span className="font-medium text-slate-800">{res.guests}</span></p>
                                        {res.message && <p className="text-slate-500 mt-2 italic bg-slate-50 p-2 rounded">"{res.message}"</p>}
                                    </div>
                                    <div className="text-right mt-2 sm:mt-0">
                                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusClass(res.status)}`}>
                                            {res.status.charAt(0).toUpperCase() + res.status.slice(1)}
                                        </span>
                                        {res.status === 'pending' && (
                                          <div className="mt-4 space-x-2">
                                            <button onClick={() => handleStatusChange(res.id, 'confirmed')} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors text-sm font-semibold">Approva</button>
                                            <button onClick={() => handleStatusChange(res.id, 'rejected')} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm font-semibold">Rifiuta</button>
                                          </div>
                                        )}
                                    </div>
                                </div>
                              </div>
                            )) : <p className="text-slate-500">Nessuna richiesta di prenotazione al momento.</p>}
                          </div>
                        </div>
                    )}
                    {activeTab === 'houses' && (
                        <div className="animate-fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-bold text-gray-800">Gestione Case</h3>
                                 <button onClick={openAddForm} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                                    <i className="fas fa-plus"></i><span>Aggiungi Casa</span>
                                </button>
                            </div>
                            <div className="space-y-3">
                                {state.houses.map(house => (
                                    <div key={house.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                                        <p className="font-semibold text-slate-700">{house.name}</p>
                                        <div className="space-x-2">
                                            <button onClick={() => openDateManager(house)} className="text-green-600 hover:text-green-800 p-2 transition-colors" title="Gestisci Date Bloccate"><i className="fas fa-calendar-alt"></i></button>
                                            <button onClick={() => openEditForm(house)} className="text-blue-600 hover:text-blue-800 p-2 transition-colors" title="Modifica Casa"><i className="fas fa-pencil-alt"></i></button>
                                            <button onClick={() => setShowDeleteConfirm(house)} className="text-red-500 hover:text-red-700 p-2 transition-colors" title="Elimina Casa"><i className="fas fa-trash-alt"></i></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                 </div>
            </main>
       </div>

      {showHouseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
             <div className="p-6 md:p-8">
                <HouseForm 
                    initialData={editingHouse}
                    onClose={() => { setShowHouseForm(false); setEditingHouse(null); }}
                />
             </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
         <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm mx-auto">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Sei sicuro?</h3>
                <p className="text-slate-600 mb-6">Vuoi davvero eliminare la casa "{showDeleteConfirm.name}"? <br/> L'azione è irreversibile.</p>
                <div className="flex justify-center space-x-4">
                    <button onClick={() => setShowDeleteConfirm(null)} className="px-6 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 font-semibold">Annulla</button>
                    <button onClick={() => handleDeleteHouse(showDeleteConfirm)} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold">Elimina</button>
                </div>
            </div>
         </div>
      )}
      
      {managingDatesFor && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Gestisci Date Bloccate per <br/>"{managingDatesFor.name}"</h3>
                <p className="text-slate-600 mb-4 text-sm">Seleziona le date da rendere non disponibili per le prenotazioni (es. ferie, manutenzione). Clicca di nuovo su una data per deselezionarla.</p>
                <div className="flex justify-center border bg-slate-50 rounded-md p-2 min-h-[300px]">
                    {DayPicker ? (
                        <DayPicker
                            mode="multiple"
                            min={0} // Allows clearing selection
                            selected={selectedBlockedDays}
                            onSelect={setSelectedBlockedDays as any}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                           <p className="text-slate-500">Caricamento calendario...</p>
                        </div>
                    )}
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={() => setManagingDatesFor(null)} className="px-6 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 font-semibold">Annulla</button>
                    <button onClick={handleSaveBlockedDates} disabled={isSavingDates} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold disabled:bg-slate-400">
                        {isSavingDates ? <i className="fas fa-spinner fa-spin"></i> : 'Salva Date'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;