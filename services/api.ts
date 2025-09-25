import { House, Reservation, User } from '../types';

// --- SIMULATED DATABASE (using localStorage) ---

const DB_KEY = 'appState';
const SIMULATED_DELAY = 500; // ms

// --- UTILS ---
const hashPassword = (password: string) => btoa(password);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface AllData {
    users: User[];
    houses: House[];
    reservations: Reservation[];
}

// --- SEED/INITIAL DATA ---
const getInitialData = (): AllData => {
  const gestoreUser: User = {
    id: 1, name: 'Gestore', email: 'gestore@cittafutura.it', passwordHash: hashPassword('Gestore123'), role: 'admin',
  };
  const initialHouses: House[] = [
    { id: 1, name: 'Casa della Pace', description: 'Accogliente dimora nel cuore del borgo antico di Riace Superiore.', longDescription: 'Casa della Pace è una storica abitazione ristrutturata con cura, che offre una vista mozzafiato sulle colline circostanti e sul Mar Ionio. Perfetta per chi cerca tranquillità e un\'immersione nella cultura locale. L\'arredamento unisce tradizione e comfort moderno, creando un\'atmosfera unica e rilassante.', capacity: 4, images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop'], amenities: ['Wi-Fi', 'Cucina Attrezzata', 'Aria Condizionata', 'Vista Panoramica'], blockedDates: [] },
    { id: 2, name: 'Nido dell\'Accoglienza', description: 'Un piccolo rifugio colorato, ideale per coppie e piccole famiglie.', longDescription: 'Situato in un vicolo caratteristico, il Nido dell\'Accoglienza è un appartamento pieno di charme e colore. Le sue pareti vivaci e i dettagli artigianali riflettono lo spirito di unione e creatività di Riace. Dispone di un piccolo balcone da cui godere della brezza serale.', capacity: 3, images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop', 'https://images.unsplash.com/photo-1533779283484-a4746d542544?q=80&w=1939&auto=format&fit=crop', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=2074&auto=format&fit=crop'], amenities: ['Wi-Fi', 'Angolo Cottura', 'Balcone', 'Animali Ammessi'], blockedDates: [] },
    { id: 3, name: 'La Terrazza sul Mondo', description: 'Spaziosa casa con una grande terrazza per ammirare albe e tramonti.', longDescription: 'Questa casa è il luogo ideale per gruppi o famiglie numerose. Il suo punto forte è la magnifica terrazza, un vero e proprio salotto all\'aperto dove poter mangiare, rilassarsi e socializzare. Gli interni sono spaziosi, luminosi e arredati in modo funzionale e accogliente.', capacity: 6, images: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=2070&auto=format&fit=crop', 'https://images.unsplash.com/photo-1560185893-a55de8537e4f?q=80&w=1974&auto=format&fit=crop', 'https://images.unsplash.com/photo-1594563703937-fdc640497dcd?q=80&w=2070&auto=format&fit=crop'], amenities: ['Wi-Fi', 'Cucina Completa', 'Ampia Terrazza', 'Lavatrice', 'BBQ'], blockedDates: ["2024-08-15", "2024-08-16"]},
    { id: 4, name: 'Il Girasole di Riace', description: 'Appartamento luminoso e allegro, ispirato ai colori della natura.', longDescription: 'Come un girasole, questo appartamento è sempre pieno di luce. Arredato con toni caldi del giallo e dell\'arancione, trasmette energia e positività. È una base perfetta per esplorare il paese e le sue bellezze, sentendosi parte della comunità.', capacity: 2, images: ['https://images.unsplash.com/photo-1556912173-35f25c754418?q=80&w=2070&auto=format&fit=crop', 'https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?q=80&w=2080&auto=format&fit=crop', 'https://images.unsplash.com/photo-1615875617238-2708b53216a4?q=80&w=1964&auto=format&fit=crop'], amenities: ['Wi-Fi', 'Cucina', 'Riscaldamento', 'Accesso per disabili'], blockedDates: [] }
  ];
  return { users: [gestoreUser], houses: initialHouses, reservations: [] };
};

// --- API FUNCTIONS ---

// Function to read the entire DB state
const readDb = (): AllData => {
  try {
    const serialized = localStorage.getItem(DB_KEY);
    if (!serialized) {
      const initialData = getInitialData();
      localStorage.setItem(DB_KEY, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(serialized);
  } catch (e) {
    console.error("Failed to read from localStorage, seeding data.", e);
    const initialData = getInitialData();
    localStorage.setItem(DB_KEY, JSON.stringify(initialData));
    return initialData;
  }
};

// Function to write the entire DB state
const writeDb = (data: AllData) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

export const fetchAllData = async (): Promise<AllData> => {
  await delay(SIMULATED_DELAY);
  return readDb();
};

export const authenticateUser = async (email: string, pass: string): Promise<User | null> => {
  await delay(SIMULATED_DELAY);
  const db = readDb();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (user && user.passwordHash === hashPassword(pass)) {
    return user;
  }
  return null;
};

export const registerUser = async (payload: Omit<User, 'id' | 'role' | 'passwordHash'> & { password: string }): Promise<User | null> => {
    await delay(SIMULATED_DELAY);
    const db = readDb();
    if (db.users.some(u => u.email.toLowerCase() === payload.email.toLowerCase())) {
        return null; // Email already exists
    }
    const newUser: User = {
        id: Date.now(),
        name: payload.name,
        email: payload.email,
        passwordHash: hashPassword(payload.password),
        role: 'user',
    };
    db.users.push(newUser);
    writeDb(db);
    return newUser;
};

export const updateUserPassword = async (email: string, newPass: string): Promise<User | null> => {
    await delay(SIMULATED_DELAY);
    const db = readDb();
    const userIndex = db.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (userIndex === -1) {
        return null;
    }
    const updatedUser = { ...db.users[userIndex], passwordHash: hashPassword(newPass) };
    db.users[userIndex] = updatedUser;
    writeDb(db);
    return updatedUser;
}

export const addReservation = async (payload: Omit<Reservation, 'id' | 'status'>): Promise<Reservation> => {
    await delay(SIMULATED_DELAY);
    const db = readDb();
    const newReservation: Reservation = {
        ...payload,
        id: Date.now(),
        status: 'pending',
    };
    db.reservations.push(newReservation);
    writeDb(db);
    return newReservation;
};

export const updateReservationStatus = async (id: number, status: 'confirmed' | 'rejected'): Promise<Reservation> => {
    await delay(SIMULATED_DELAY);
    const db = readDb();
    const resIndex = db.reservations.findIndex(r => r.id === id);
    if (resIndex === -1) throw new Error("Reservation not found");
    
    db.reservations[resIndex].status = status;
    writeDb(db);
    return db.reservations[resIndex];
};

export const addHouse = async (payload: Omit<House, 'id'>): Promise<House> => {
    await delay(SIMULATED_DELAY);
    const db = readDb();
    const newHouse: House = { ...payload, id: Date.now() };
    db.houses.push(newHouse);
    writeDb(db);
    return newHouse;
};

export const editHouse = async (payload: House): Promise<House> => {
    await delay(SIMULATED_DELAY);
    const db = readDb();
    const houseIndex = db.houses.findIndex(h => h.id === payload.id);
    if (houseIndex === -1) throw new Error("House not found");
    db.houses[houseIndex] = payload;
    writeDb(db);
    return payload;
};

export const deleteHouse = async (id: number): Promise<void> => {
    await delay(SIMULATED_DELAY);
    const db = readDb();
    db.houses = db.houses.filter(h => h.id !== id);
    writeDb(db);
};

export const updateBlockedDates = async (houseId: number, blockedDates: string[]): Promise<House> => {
    await delay(SIMULATED_DELAY);
    const db = readDb();
    const houseIndex = db.houses.findIndex(h => h.id === houseId);
    if (houseIndex === -1) throw new Error("House not found");

    db.houses[houseIndex].blockedDates = blockedDates;
    writeDb(db);
    return db.houses[houseIndex];
};