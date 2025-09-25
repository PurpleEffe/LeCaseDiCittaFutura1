import { useContext } from 'react';
import { AppContext } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HouseList from './components/HouseList';
import HouseDetail from './components/HouseDetail';
import AuthPage from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

const App = () => {
  const { state } = useContext(AppContext);
  const { currentView, selectedHouse, currentUser, loading, error } = state;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex items-center space-x-3">
          <i className="fas fa-spinner fa-spin text-4xl text-orange-500"></i>
          <span className="text-2xl font-semibold text-slate-700">Caricamento...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50 text-red-800">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
          <h2 className="text-2xl font-bold mb-2">Oops! Qualcosa è andato storto.</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    // The key forces a re-render and re-triggers the animation on view change
    const animationWrapper = (content: JSX.Element, key: string) => (
      <div key={key} className="animate-fade-in-slow">
        {content}
      </div>
    );

    if (currentView === 'login') {
      return animationWrapper(<AuthPage />, 'login');
    }
    if (currentUser?.role === 'admin' && currentView === 'adminDashboard') {
      return animationWrapper(<AdminDashboard />, 'admin-dashboard');
    }
    if (selectedHouse) {
      return animationWrapper(<HouseDetail house={selectedHouse} />, `house-${selectedHouse.id}`);
    }
    return animationWrapper(<HouseList />, 'house-list');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-gray-800">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;