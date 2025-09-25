import { useState, useContext, useEffect, useMemo, type FC } from 'react';
import { House } from '../types';
import { AppContext } from '../context/AppContext';
// FIX: Import `DateRange` type for proper state typing with DayPicker in range mode.
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';


// Helper to format date to YYYY-MM-DD
const formatDate = (date: Date | undefined) => {
  if (!date) return '';
  return date.toISOString().split('T')[0];
};

interface ReservationFormProps {
  house: House;
}

const ReservationForm: FC<ReservationFormProps> = ({ house }) => {
  const { state, dispatch, actions } = useContext(AppContext);
  const { currentUser, reservations } = state;

  // FIX: Initialize `range` state to `undefined` and use `DateRange` type to match `DayPicker`'s `selected` prop in range mode.
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guests: '1',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        guestName: currentUser.name,
        guestEmail: currentUser.email
      }));
    } else {
        setFormData(prev => ({
        ...prev,
        guestName: '',
        guestEmail: ''
      }));
    }
  }, [currentUser]);
  
  // Calculate disabled days
  const disabledDays = useMemo(() => {
      const bookedRanges = reservations
        .filter(r => r.houseId === house.id && r.status === 'confirmed')
        .map(r => ({ from: new Date(r.checkIn), to: new Date(r.checkOut) }));
      
      const blockedDates = house.blockedDates.map(dateStr => new Date(dateStr));

      return [
          ...bookedRanges,
          ...blockedDates,
          { before: new Date() } // Disable past dates
      ];
  }, [reservations, house.id, house.blockedDates]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
        alert("Devi effettuare l'accesso per inviare una richiesta.");
        dispatch({ type: 'SET_VIEW', payload: 'login' });
        return;
    }
    // FIX: Check if `range` itself is defined before accessing its properties.
    if (!range || !range.from || !range.to) {
        alert("Per favore, seleziona un intervallo di date dal calendario.");
        return;
    }
    setIsSubmitting(true);
    await actions.addReservation({
      houseId: house.id,
      houseName: house.name,
      userId: currentUser.id,
      checkIn: formatDate(range.from),
      checkOut: formatDate(range.to),
      ...formData,
      guests: parseInt(formData.guests)
    });
    setIsSubmitting(false);
    setSubmitted(true);
  };
  
  if (submitted) {
    return (
      <div className="mt-12 bg-white border-l-4 border-green-500 text-slate-800 p-8 rounded-lg shadow-xl text-center">
        <h3 className="text-3xl font-bold text-gray-800 mb-3">Grazie!</h3>
        <p className="text-lg text-slate-600">La tua richiesta di soggiorno è stata inviata con successo. Verrai ricontattato al più presto dall'associazione per la conferma. La tua richiesta supporta la comunità di Riace.</p>
        <button onClick={() => dispatch({type: 'SELECT_HOUSE', payload: null})} className="mt-6 bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition duration-300 font-bold">
            Torna alla Home
        </button>
      </div>
    );
  }
  
  const modifiers = {
      booked: disabledDays,
  };
  const modifiersStyles = {
      booked: { color: 'red', textDecoration: 'line-through' },
  };

  return (
    <div className="mt-12 bg-white p-8 md:p-10 rounded-xl shadow-2xl">
      <h3 className="text-4xl font-bold text-center text-gray-800 tracking-tight mb-4">Invia una Richiesta di Soggiorno</h3>
      <p className="text-center text-slate-600 mb-8 text-lg">Seleziona le date dal calendario e compila il modulo. Non è richiesta alcuna transazione online.</p>
       {!currentUser && (
        <div className="text-center bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 mb-8 rounded-md">
            <p>Per inviare una richiesta, per favore <button onClick={() => dispatch({type: 'SET_VIEW', payload: 'login'})} className="font-bold underline hover:text-yellow-900">accedi o registrati</button>.</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start max-w-5xl mx-auto">
        {/* Calendar */}
        <div className="bg-slate-50 p-4 rounded-lg flex justify-center border min-h-[300px]">
          <DayPicker
              mode="range"
              selected={range}
              onSelect={setRange}
              disabled={disabledDays}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              numberOfMonths={1}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset disabled={!currentUser || isSubmitting} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" name="guestName" placeholder="Nome e Cognome" value={formData.guestName} onChange={handleChange} required className="p-4 bg-slate-100 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-slate-200 text-lg"/>
              <input type="email" name="guestEmail" placeholder="La tua Email" value={formData.guestEmail} onChange={handleChange} required className="p-4 bg-slate-100 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-slate-200 text-lg"/>
            </div>
            <div>
              <label className="block text-md font-bold text-slate-700 mb-1">Date Selezionate</label>
              <div className="p-4 bg-slate-100 border border-slate-300 rounded-lg text-lg">
                {/* FIX: Check if `range` is defined before accessing its properties. */}
                {range && range.from && range.to ? `${formatDate(range.from)} - ${formatDate(range.to)}` : 'Nessun intervallo selezionato'}
              </div>
            </div>
            <div>
              <label className="block text-md font-bold text-slate-700 mb-1">Numero di Ospiti</label>
              <select name="guests" value={formData.guests} onChange={handleChange} className="w-full p-4 border bg-slate-100 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-lg">
                {[...Array(house.capacity)].map((_, i) => (
                  <option key={i+1} value={i+1}>{i+1}</option>
                ))}
              </select>
            </div>
            <div>
              <textarea name="message" placeholder="Aggiungi un messaggio (facoltativo)" value={formData.message} onChange={handleChange} rows={3} className="w-full p-4 bg-slate-100 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-lg"></textarea>
            </div>
            <div className="text-center pt-2">
                <button type="submit" className="bg-orange-500 text-white font-bold py-3 px-12 rounded-lg hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none text-xl">
                    {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : 'Invia Richiesta'}
                </button>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default ReservationForm;
