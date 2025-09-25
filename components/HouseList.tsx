import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import HouseCard from './HouseCard';

const HouseList: React.FC = () => {
  const { state } = useContext(AppContext);

  return (
    <div>
        <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-800 mb-4 tracking-tight">Benvenuti a Riace</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Scoprite le nostre case, nate dal progetto di accoglienza dell'Associazione Città Futura. Ogni soggiorno supporta la nostra comunità e i nostri valori di unione e solidarietà.
            </p>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {state.houses.map((house, index) => (
          <div key={house.id} style={{ animationDelay: `${index * 100}ms` }} className="animate-fade-in opacity-0">
            <HouseCard house={house} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HouseList;