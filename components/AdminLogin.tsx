import { useState, useContext, type FormEvent } from 'react';
import { AppContext } from '../context/AppContext';

type AuthMode = 'login' | 'register' | 'forgotPassword';

const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const { actions } = useContext(AppContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // FIX: Make handler async and await the action promise for proper error handling.
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await actions.login(email, password);
    if (!success) {
      setError('Credenziali non valide. Riprova.');
    }
  };

  // FIX: Correctly call the `register` action from context instead of dispatching a non-existent action.
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (password !== confirmPassword) {
      setError('Le password non coincidono.');
      return;
    }
    // FIX: Use the `register` action from context and await its result.
    const success = await actions.register({ name, email, password });
    if (success) {
      setMessage('Registrazione avvenuta con successo! Ora puoi effettuare il login.');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setMode('login');
    } else {
      // The context action shows an alert, but setting state is better for UI feedback.
      setError('Questa email è già stata registrata.');
    }
  };
  
  // FIX: Make handler async and await the action promise for proper feedback.
  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    // Note: In a real app, this would send an email. We simulate an instant password change.
    const success = await actions.updatePassword(email, password);
    if (success) {
        setMessage('Password aggiornata con successo! Ora puoi effettuare il login.');
        setEmail('');
        setPassword('');
        setMode('login');
    } else {
        setError("Nessun utente trovato con questa email.");
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setError('');
    setMessage('');
    setMode(newMode);
  }
  
  const inputStyles = "mt-1 block w-full p-3 bg-slate-100 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition";
  const labelStyles = "block text-sm font-bold text-gray-700";
  const primaryButtonStyles = "w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors";
  const secondaryButtonStyles = "font-bold text-blue-600 hover:text-orange-500 transition-colors";


  const renderForm = () => {
    switch (mode) {
      case 'register':
        return (
          <>
            <h2 className="text-3xl font-extrabold text-center text-gray-800 tracking-tight mb-6">Crea un Account</h2>
            <form onSubmit={handleRegister} className="space-y-4">
               <div>
                <label className={labelStyles}>Nome</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputStyles} />
              </div>
              <div>
                <label className={labelStyles}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputStyles} />
              </div>
              <div>
                <label className={labelStyles}>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputStyles} />
              </div>
               <div>
                <label className={labelStyles}>Conferma Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputStyles} />
              </div>
              <button type="submit" className={primaryButtonStyles}>Registrati</button>
            </form>
            <p className="mt-6 text-center text-sm">
              Hai già un account? <button onClick={() => switchMode('login')} className={secondaryButtonStyles}>Accedi</button>
            </p>
          </>
        );
      case 'forgotPassword':
        return (
          <>
            <h2 className="text-3xl font-extrabold text-center text-gray-800 tracking-tight mb-6">Recupera Password</h2>
             <p className="text-center text-sm text-slate-600 mb-4">Inserisci la tua email e una nuova password.</p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className={labelStyles}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputStyles} />
              </div>
              <div>
                <label className={labelStyles}>Nuova Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputStyles} />
              </div>
              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors">Imposta Nuova Password</button>
            </form>
            <p className="mt-6 text-center text-sm">
              Torni sui tuoi passi? <button onClick={() => switchMode('login')} className={secondaryButtonStyles}>Torna al Login</button>
            </p>
          </>
        );
      case 'login':
      default:
        return (
          <>
            <h2 className="text-3xl font-extrabold text-center text-gray-800 tracking-tight mb-6">Accedi</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={labelStyles}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputStyles} />
              </div>
              <div>
                <label className={labelStyles}>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputStyles} />
              </div>
              <div className="text-right text-sm">
                <button type="button" onClick={() => switchMode('forgotPassword')} className={secondaryButtonStyles}>Password dimenticata?</button>
              </div>
              <button type="submit" className={primaryButtonStyles}>Accedi</button>
            </form>
             <p className="mt-6 text-center text-sm">
              Non hai un account? <button onClick={() => switchMode('register')} className={secondaryButtonStyles}>Registrati</button>
            </p>
          </>
        );
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg bg-white p-8 md:p-10 rounded-xl shadow-2xl">
        {error && <p className="text-red-800 text-sm text-center bg-red-100 p-3 rounded-md mb-4 animate-fade-in">{error}</p>}
        {message && <p className="text-green-800 text-sm text-center bg-green-100 p-3 rounded-md mb-4 animate-fade-in">{message}</p>}
        {renderForm()}
      </div>
    </div>
  );
};

export default AuthPage;