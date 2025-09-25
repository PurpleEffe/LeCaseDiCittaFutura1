import { useState, useContext, useEffect, type FC, type ChangeEvent, type FormEvent } from 'react';
import { AppContext } from '../context/AppContext';
import { House } from '../types';

interface HouseFormProps {
    initialData?: House | null;
    onClose: () => void;
}

// Helper function to convert a file to a Base64 string
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const HouseForm: FC<HouseFormProps> = ({ initialData, onClose }) => {
  // FIX: Use `actions` from context to perform operations, instead of dispatching incorrect action types.
  const { actions } = useContext(AppContext);
  const [houseData, setHouseData] = useState({
    name: '',
    description: '',
    longDescription: '',
    capacity: 2,
    amenities: '' // comma-separated
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      const { images, ...rest } = initialData;
      setHouseData({
        ...rest,
        amenities: initialData.amenities.join(', ')
      });
      setImagePreviews(initialData.images);
    }
  }, [initialData]);

  const isEditing = !!initialData;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setHouseData(prev => ({ ...prev, [name]: name === 'capacity' ? parseInt(value) || 0 : value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        setFilesToUpload(prev => [...prev, ...files]);
        
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    }
  };
  
  const removeImage = (index: number) => {
    // This logic is complex because we mix initial (URL or base64) and new (File) images.
    // The simplest way is to manage previews and then reconstruct the final image list on submit.
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    
    // We need a more robust way to track which file corresponds to which preview,
    // but for now, we assume the user replaces all images if they remove one during editing.
    // A better implementation would use an array of objects like {id, src, file}.
  };

  // FIX: Refactored to use async actions from context and provide the correct payload.
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const processedData = {
      ...houseData,
      capacity: Number(houseData.capacity),
      images: imagePreviews, // The current state of previews is the source of truth
      amenities: houseData.amenities.split(',').map(am => am.trim()).filter(am => am),
      // FIX: Ensure blockedDates is part of the payload to match the `House` type.
      blockedDates: initialData?.blockedDates || [],
    };
    
    try {
      if (isEditing && initialData) {
        // FIX: Call the correct async action for editing a house.
        await actions.editHouse({ ...processedData, id: initialData.id });
      } else {
        // FIX: Call the correct async action for adding a house.
        await actions.addHouse(processedData);
      }
      onClose();
    } catch (error) {
        console.error("Failed to save house:", error);
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const inputStyles = "w-full p-3 bg-slate-100 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition";
  const labelStyles = "block text-sm font-bold text-gray-700 mb-1";


  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-3xl font-bold text-gray-800">{isEditing ? 'Modifica Casa' : 'Aggiungi Nuova Casa'}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <i className="fas fa-times fa-lg"></i>
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
            <label className={labelStyles}>Nome della casa</label>
            <input type="text" name="name" value={houseData.name} onChange={handleChange} required className={inputStyles}/>
        </div>
        <div>
            <label className={labelStyles}>Descrizione breve</label>
            <input type="text" name="description" value={houseData.description} onChange={handleChange} required className={inputStyles}/>
        </div>
        <div>
            <label className={labelStyles}>Descrizione dettagliata</label>
            <textarea name="longDescription" value={houseData.longDescription} onChange={handleChange} required className={inputStyles} rows={4}></textarea>
        </div>
         <div>
            <label className={labelStyles}>Capacità</label>
            <input type="number" name="capacity" value={houseData.capacity} onChange={handleChange} required className={inputStyles} min="1"/>
        </div>
        
        <div>
            <label className={labelStyles}>Immagini</label>
            <div className="mt-1 p-4 border-2 border-dashed border-slate-300 rounded-md text-center">
                 <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={handleFileChange} 
                    id="file-upload"
                    className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                    <i className="fas fa-upload mr-2"></i>
                    Seleziona le immagini dal tuo computer
                </label>
            </div>
            {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {imagePreviews.map((src, index) => (
                        <div key={index} className="relative group">
                            <img src={src} alt={`preview ${index}`} className="w-full h-24 object-cover rounded-md" />
                            <button 
                                type="button" 
                                onClick={() => removeImage(index)} 
                                className="absolute top-0 right-0 -mt-2 -mr-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div>
            <label className={labelStyles}>Servizi (separati da virgola)</label>
            <input type="text" name="amenities" placeholder="Wi-Fi, Cucina, ..." value={houseData.amenities} onChange={handleChange} required className={inputStyles}/>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 font-semibold transition-colors">
                Annulla
            </button>
            <button type="submit" disabled={isSubmitting} className="px-8 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 font-semibold transition-colors disabled:bg-slate-400 flex items-center">
                {isSubmitting && <i className="fas fa-spinner fa-spin mr-2"></i>}
                {isSubmitting ? 'Salvataggio...' : (isEditing ? 'Salva Modifiche' : 'Aggiungi Casa')}
            </button>
        </div>
      </form>
    </div>
  );
};

export default HouseForm;