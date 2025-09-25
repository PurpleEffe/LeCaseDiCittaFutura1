import React, { createContext, useReducer, ReactNode, useEffect } from 'react';
import { House, Reservation, User } from '../types';
import * as apiService from '../services/api';

// --- INITIAL STATE ---
const initialAppState: AppState = {
  users: [],
  houses: [],
  reservations: [],
  currentUser: null,
  currentView: 'home',
  selectedHouse: null,
  loading: true,
  error: null,
};

// --- INTERFACES & TYPES ---
interface AppState {
  users: User[];
  houses: House[];
  reservations: Reservation[];
  currentUser: User | null;
  currentView: 'home' | 'login' | 'adminDashboard' | 'userDashboard';
  selectedHouse: House | null;
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: 'FETCH_DATA_START' }
  | { type: 'FETCH_DATA_SUCCESS'; payload: apiService.AllData }
  | { type: 'FETCH_DATA_FAILURE'; payload: string }
  | { type: 'LOGIN_USER'; payload: User }
  | { type: 'LOGOUT_USER' }
  | { type: 'REGISTER_USER_SUCCESS'; payload: User }
  | { type: 'UPDATE_PASSWORD_SUCCESS'; payload: User }
  | { type: 'SET_VIEW'; payload: AppState['currentView'] }
  | { type: 'SELECT_HOUSE'; payload: House | null }
  | { type: 'ADD_RESERVATION_SUCCESS'; payload: Reservation }
  | { type: 'UPDATE_RESERVATION_STATUS_SUCCESS'; payload: Reservation }
  | { type: 'ADD_HOUSE_SUCCESS'; payload: House }
  | { type: 'EDIT_HOUSE_SUCCESS'; payload: House }
  | { type: 'DELETE_HOUSE_SUCCESS'; payload: number }
  | { type: 'UPDATE_BLOCKED_DATES_SUCCESS'; payload: { houseId: number; blockedDates: string[] }};


// --- REDUCER ---
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'FETCH_DATA_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_DATA_SUCCESS':
      return { ...state, loading: false, ...action.payload };
    case 'FETCH_DATA_FAILURE':
      return { ...state, loading: false, error: action.payload };
    
    case 'LOGIN_USER':
      return { ...state, currentUser: action.payload, currentView: action.payload.role === 'admin' ? 'adminDashboard' : 'home', selectedHouse: null };
    case 'LOGOUT_USER':
      return { ...state, currentUser: null, currentView: 'home' };
    
    case 'REGISTER_USER_SUCCESS':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_PASSWORD_SUCCESS':
        return { ...state, users: state.users.map(u => u.id === action.payload.id ? action.payload : u) };
        
    case 'SET_VIEW':
      return { ...state, currentView: action.payload, selectedHouse: action.payload === 'home' ? null : state.selectedHouse };
    case 'SELECT_HOUSE':
      return { ...state, selectedHouse: action.payload, currentView: 'home' };
      
    case 'ADD_RESERVATION_SUCCESS':
      return { ...state, reservations: [...state.reservations, action.payload] };
    case 'UPDATE_RESERVATION_STATUS_SUCCESS':
        return { ...state, reservations: state.reservations.map(r => r.id === action.payload.id ? action.payload : r) };
        
    case 'ADD_HOUSE_SUCCESS':
        return { ...state, houses: [...state.houses, action.payload] };
    case 'EDIT_HOUSE_SUCCESS':
        return { ...state, houses: state.houses.map(h => h.id === action.payload.id ? action.payload : h) };
    case 'DELETE_HOUSE_SUCCESS':
        return { ...state, houses: state.houses.filter(h => h.id !== action.payload) };

    case 'UPDATE_BLOCKED_DATES_SUCCESS':
        return { ...state, houses: state.houses.map(h => h.id === action.payload.houseId ? { ...h, blockedDates: action.payload.blockedDates } : h)};

    default:
      return state;
  }
};

// --- CONTEXT ---
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  actions: {
    login: (email: string, pass: string) => Promise<boolean>;
    register: (payload: Omit<User, 'id' | 'role' | 'passwordHash'> & { password: string }) => Promise<boolean>;
    updatePassword: (email: string, newPass: string) => Promise<boolean>;
    addReservation: (payload: Omit<Reservation, 'id' | 'status'>) => Promise<void>;
    updateReservationStatus: (id: number, status: 'confirmed' | 'rejected') => Promise<void>;
    addHouse: (payload: Omit<House, 'id'>) => Promise<void>;
    editHouse: (payload: House) => Promise<void>;
    deleteHouse: (id: number) => Promise<void>;
    updateBlockedDates: (houseId: number, blockedDates: string[]) => Promise<void>;
  }
}

export const AppContext = createContext<AppContextType>({
  state: initialAppState,
  dispatch: () => null,
  actions: {
    login: async () => false,
    register: async () => false,
    updatePassword: async () => false,
    addReservation: async () => {},
    updateReservationStatus: async () => {},
    addHouse: async () => {},
    editHouse: async () => {},
    deleteHouse: async () => {},
    updateBlockedDates: async () => {},
  }
});


// --- PROVIDER ---
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  useEffect(() => {
    const loadData = async () => {
      dispatch({ type: 'FETCH_DATA_START' });
      try {
        const data = await apiService.fetchAllData();
        dispatch({ type: 'FETCH_DATA_SUCCESS', payload: data });
      } catch (e) {
        dispatch({ type: 'FETCH_DATA_FAILURE', payload: 'Impossibile caricare i dati.' });
      }
    };
    loadData();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
      const user = await apiService.authenticateUser(email, pass);
      if (user) {
          dispatch({ type: 'LOGIN_USER', payload: user });
          return true;
      }
      return false;
  }

  const register = async (payload: Omit<User, 'id' | 'role' | 'passwordHash'> & { password: string }): Promise<boolean> => {
      const newUser = await apiService.registerUser(payload);
      if (newUser) {
          dispatch({ type: 'REGISTER_USER_SUCCESS', payload: newUser });
          return true;
      }
      alert('Email già registrata.');
      return false;
  }
  
  const updatePassword = async (email: string, newPass: string): Promise<boolean> => {
      const updatedUser = await apiService.updateUserPassword(email, newPass);
      if (updatedUser) {
          dispatch({type: 'UPDATE_PASSWORD_SUCCESS', payload: updatedUser});
          return true;
      }
      return false;
  }

  const addReservation = async (payload: Omit<Reservation, 'id' | 'status'>) => {
      const newReservation = await apiService.addReservation(payload);
      dispatch({type: 'ADD_RESERVATION_SUCCESS', payload: newReservation});
  }

  const updateReservationStatus = async (id: number, status: 'confirmed' | 'rejected') => {
      const updatedReservation = await apiService.updateReservationStatus(id, status);
      dispatch({type: 'UPDATE_RESERVATION_STATUS_SUCCESS', payload: updatedReservation});
  }

  const addHouse = async (payload: Omit<House, 'id'>) => {
      const newHouse = await apiService.addHouse(payload);
      dispatch({type: 'ADD_HOUSE_SUCCESS', payload: newHouse});
  }

  const editHouse = async (payload: House) => {
      const updatedHouse = await apiService.editHouse(payload);
      dispatch({type: 'EDIT_HOUSE_SUCCESS', payload: updatedHouse});
  }

  const deleteHouse = async (id: number) => {
      await apiService.deleteHouse(id);
      dispatch({type: 'DELETE_HOUSE_SUCCESS', payload: id});
  }

  const updateBlockedDates = async (houseId: number, blockedDates: string[]) => {
      const updatedHouse = await apiService.updateBlockedDates(houseId, blockedDates);
      dispatch({type: 'UPDATE_BLOCKED_DATES_SUCCESS', payload: { houseId: updatedHouse.id, blockedDates: updatedHouse.blockedDates }})
  }

  return (
    <AppContext.Provider value={{ 
      state, 
      dispatch, 
      actions: { 
        login, 
        register,
        updatePassword,
        addReservation,
        updateReservationStatus,
        addHouse,
        editHouse,
        deleteHouse,
        updateBlockedDates
      } 
    }}>
      {children}
    </AppContext.Provider>
  );
};