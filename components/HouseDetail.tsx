import { useContext, useState, type FC } from 'react';
import { House } from '../types';
import ReservationForm from './ReservationForm';
import HouseForm from './HouseForm';
import { AppContext } from '../context/AppContext';

interface HouseDetailProps {
  house: House;
}

const HouseDetail: FC<HouseDetailProps> = ({ house }) => {
  const [mainImage, setMainImage] = useState(house.images[0]);
  const [showEditForm, setShowEditForm] = useState(false);
  const { state, dispatch } = useContext(AppContext);

  const handleBack = () => {
    dispatch({ type: 'SELECT_HOUSE', payload: null });
  };

  const isAdmin = state.currentUser?.role === 'admin';

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <button onClick={handleBack} className="text-blue-600 hover:text-blue-800 font-bold text-lg flex items-center transition-colors duration-300 group">
          <i className="fas fa-arrow-left mr-2 transform group-hover:-translate-x-1 transition-transform"></i> Torna a tutte le case
        </button>

        {isAdmin && (
           <button 
             onClick={() => setShowEditForm(true)} 
             className="bg-orange-500 text-white font-bold py-2 px-5 rounded-lg hover:bg-orange-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-2">
             <i className="fas fa-pencil-alt"></i>
             <span>Modifica Casa</span>
           </button>
        )}
      </div>


      <div className="bg-white p-8 md:p-10 rounded-xl shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Image Gallery */}
          <div className="lg:col-span-3">
            <div className="mb-4 overflow-hidden rounded-lg shadow-lg">
              <img src={mainImage} alt={house.name} className="w-full h-auto max-h-[500px] object-cover rounded-lg transform hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="flex space-x-3">
              {house.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${house.name} thumbnail ${index + 1}`}
                  className={`w-24 h-24 object-cover rounded-md cursor-pointer border-4 transition-all duration-200 ${mainImage === img ? 'border-blue-500 scale-105 shadow-md' : 'border-transparent hover:border-slate-300'}`}
                  onClick={() => setMainImage(img)}
                />
              ))}
            </div>
          </div>

          {/* House Info */}
          <div className="lg:col-span-2">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-800 tracking-tight mb-3">{house.name}</h2>
            <div className="flex items-center text-slate-600 mb-6 text-lg">
                <i className="fas fa-users mr-2 text-green-600"></i>
                <span className="font-semibold">Fino a {house.capacity} persone</span>
            </div>
            <p className="text-slate-700 mb-8 leading-relaxed text-lg">{house.longDescription}</p>

            <h3 className="text-2xl font-bold text-gray-800 mb-4">Servizi Inclusi</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-slate-600 text-md">
              {house.amenities.map(amenity => (
                <li key={amenity} className="flex items-center">
                  <i className="fas fa-check-circle text-green-500 mr-3"></i> {amenity}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <ReservationForm house={house} />
      
      {showEditForm && (
         <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
             <div className="p-6 md:p-8">
                <HouseForm 
                    initialData={house}
                    onClose={() => setShowEditForm(false)}
                />
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HouseDetail;