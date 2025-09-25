import { useContext, type FC } from 'react';
import { House } from '../types';
import { AppContext } from '../context/AppContext';

interface HouseCardProps {
  house: House;
}

const HouseCard: FC<HouseCardProps> = ({ house }) => {
  const { dispatch } = useContext(AppContext);

  const handleSelectHouse = () => {
    dispatch({ type: 'SELECT_HOUSE', payload: house });
  };

  return (
    <div 
        onClick={handleSelectHouse} 
        className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-400 group flex flex-col h-full"
    >
      <div className="relative">
        <img src={house.images[0]} alt={house.name} className="w-full h-60 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-5">
             <h3 className="text-2xl font-bold text-white">{house.name}</h3>
        </div>
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <p className="text-slate-600 mb-4 flex-grow">{house.description}</p>
        <div className="flex items-center text-slate-500 text-sm mb-5">
            <i className="fas fa-users mr-2 text-green-600"></i>
            <span className="font-semibold">Fino a {house.capacity} persone</span>
        </div>
        <button className="mt-auto w-full bg-orange-500 text-white py-2.5 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-300 font-bold text-lg shadow-md hover:shadow-lg transform group-hover:scale-105">
            Scopri di più
        </button>
      </div>
    </div>
  );
};

export default HouseCard;