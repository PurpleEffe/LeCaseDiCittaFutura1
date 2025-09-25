import { House, Reservation, User } from '../types';

// --- CONSTANTS ---
const SIMULATED_DELAY = 200; // ms
const LS_USERS_KEY = 'cittafutura_users';
const LS_HOUSES_KEY = 'cittafutura_houses';
const LS_RESERVATIONS_KEY = 'cittafutura_reservations';
const LS_DELETED_HOUSES_KEY = 'cittafutura_deleted_houses';


// --- UTILS ---
const hashPassword = (password: string) => btoa(password);
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface AllData {
    users: User[];
    houses: House[];
    reservations: Reservation[];
}

// --- DATA HELPERS ---

async function fetchSeedData<T>(path: string): Promise<T[]> {
    // Prepend the base URL provided by Vite to ensure correct path on GitHub Pages
    // FIX: Hardcoded the base URL from vite.config.ts to resolve TypeScript errors with import.meta.env.
    const url = `/LeCaseDiCittaFutura1/${path}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`Could not fetch seed data from ${url}. This is expected if the file doesn't exist. Returning empty array.`);
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching seed data from ${url}:`, error);
        return [];
    }
}

function getLocalData<T>(key: string): T[] {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error(`Failed to read ${key} from localStorage`, e);
        return [];
    }
}

function setLocalData<T>(key: string, data: T[]): void {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch(e) {
        console.error(`Failed to write ${key} to localStorage`, e);
    }
}


// --- API FUNCTIONS ---

export const fetchAllData = async (): Promise<AllData> => {
    await delay(SIMULATED_DELAY);

    const [seedUsers, seedHouses, seedReservations] = await Promise.all([
        fetchSeedData<User>('data/users.json'),
        fetchSeedData<House>('data/houses.json'),
        fetchSeedData<Reservation>('data/reservations.json'),
    ]);

    const localUsers = getLocalData<User>(LS_USERS_KEY);
    const localHouses = getLocalData<House>(LS_HOUSES_KEY);
    const localReservations = getLocalData<Reservation>(LS_RESERVATIONS_KEY);
    const deletedHouseIds = getLocalData<number>(LS_DELETED_HOUSES_KEY);

    // Merge users: local overrides seed based on email
    const userMap = new Map<string, User>();
    seedUsers.forEach(u => userMap.set(u.email.toLowerCase(), u));
    localUsers.forEach(u => userMap.set(u.email.toLowerCase(), u));
    const allUsers = Array.from(userMap.values());

    // Merge houses: local overrides seed, and deleted list removes houses
    const houseMap = new Map<number, House>();
    seedHouses.forEach(h => houseMap.set(h.id, h));
    localHouses.forEach(h => houseMap.set(h.id, h));
    deletedHouseIds.forEach(id => houseMap.delete(id));
    const allHouses = Array.from(houseMap.values());

    // Merge reservations: local overrides seed
    const reservationMap = new Map<number, Reservation>();
    seedReservations.forEach(r => reservationMap.set(r.id, r));
    localReservations.forEach(r => reservationMap.set(r.id, r));
    const allReservations = Array.from(reservationMap.values());
    
    return { users: allUsers, houses: allHouses, reservations: allReservations };
};

export const authenticateUser = async (email: string, pass: string): Promise<User | null> => {
    await delay(SIMULATED_DELAY);
    const { users } = await fetchAllData();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && user.passwordHash === hashPassword(pass)) {
        return user;
    }
    return null;
};

export const registerUser = async (payload: Omit<User, 'id' | 'role' | 'passwordHash'> & { password: string }): Promise<User | null> => {
    await delay(SIMULATED_DELAY);
    const { users } = await fetchAllData();
    if (users.some(u => u.email.toLowerCase() === payload.email.toLowerCase())) {
        return null; // Email already exists
    }
    const localUsers = getLocalData<User>(LS_USERS_KEY);
    const newUser: User = {
        id: Date.now(),
        name: payload.name,
        email: payload.email,
        passwordHash: hashPassword(payload.password),
        role: 'user',
    };
    setLocalData<User>(LS_USERS_KEY, [...localUsers, newUser]);
    return newUser;
};

export const updateUserPassword = async (email: string, newPass: string): Promise<User | null> => {
    await delay(SIMULATED_DELAY);
    const { users } = await fetchAllData();
    const userToUpdate = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!userToUpdate) return null;

    const updatedUser = { ...userToUpdate, passwordHash: hashPassword(newPass) };
    const localUsers = getLocalData<User>(LS_USERS_KEY);
    const userIndex = localUsers.findIndex(u => u.id === updatedUser.id || u.email.toLowerCase() === updatedUser.email.toLowerCase());

    if (userIndex > -1) {
        localUsers[userIndex] = updatedUser;
    } else {
        localUsers.push(updatedUser);
    }
    setLocalData(LS_USERS_KEY, localUsers);
    return updatedUser;
}

export const addReservation = async (payload: Omit<Reservation, 'id' | 'status'>): Promise<Reservation> => {
    await delay(SIMULATED_DELAY);
    const localReservations = getLocalData<Reservation>(LS_RESERVATIONS_KEY);
    const newReservation: Reservation = {
        ...payload,
        id: Date.now(),
        status: 'pending',
    };
    setLocalData<Reservation>(LS_RESERVATIONS_KEY, [...localReservations, newReservation]);
    return newReservation;
};

export const updateReservationStatus = async (id: number, status: 'confirmed' | 'rejected'): Promise<Reservation> => {
    await delay(SIMULATED_DELAY);
    const { reservations } = await fetchAllData();
    const resToUpdate = reservations.find(r => r.id === id);
    if (!resToUpdate) throw new Error("Reservation not found");
    
    const updatedReservation = { ...resToUpdate, status };
    const localReservations = getLocalData<Reservation>(LS_RESERVATIONS_KEY);
    const resIndex = localReservations.findIndex(r => r.id === id);

    if (resIndex > -1) {
        localReservations[resIndex] = updatedReservation;
    } else {
        localReservations.push(updatedReservation);
    }
    setLocalData(LS_RESERVATIONS_KEY, localReservations);
    return updatedReservation;
};

export const addHouse = async (payload: Omit<House, 'id'>): Promise<House> => {
    await delay(SIMULATED_DELAY);
    const localHouses = getLocalData<House>(LS_HOUSES_KEY);
    const newHouse: House = { ...payload, id: Date.now() };
    setLocalData<House>(LS_HOUSES_KEY, [...localHouses, newHouse]);
    return newHouse;
};

export const editHouse = async (payload: House): Promise<House> => {
    await delay(SIMULATED_DELAY);
    const localHouses = getLocalData<House>(LS_HOUSES_KEY);
    const houseIndex = localHouses.findIndex(h => h.id === payload.id);
    if (houseIndex > -1) {
        localHouses[houseIndex] = payload;
    } else {
        localHouses.push(payload);
    }
    setLocalData<House>(LS_HOUSES_KEY, localHouses);
    return payload;
};

export const deleteHouse = async (id: number): Promise<void> => {
    await delay(SIMULATED_DELAY);
    // Remove from local overrides if it exists
    const localHouses = getLocalData<House>(LS_HOUSES_KEY);
    setLocalData<House>(LS_HOUSES_KEY, localHouses.filter(h => h.id !== id));

    // Add to the deleted list to hide it even if it's in the seed data
    const deletedIds = getLocalData<number>(LS_DELETED_HOUSES_KEY);
    if (!deletedIds.includes(id)) {
        setLocalData<number>(LS_DELETED_HOUSES_KEY, [...deletedIds, id]);
    }
};

export const updateBlockedDates = async (houseId: number, blockedDates: string[]): Promise<House> => {
    await delay(SIMULATED_DELAY);
    const { houses } = await fetchAllData();
    const houseToUpdate = houses.find(h => h.id === houseId);
    if (!houseToUpdate) throw new Error("House not found");

    const updatedHouse = { ...houseToUpdate, blockedDates };
    await editHouse(updatedHouse); // Reuse editHouse logic
    return updatedHouse;
};