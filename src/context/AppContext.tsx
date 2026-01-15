import React, { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Case } from '../types';
import { MOCK_LEDGER, USERS as INITIAL_USERS } from '../data/mockData';

interface AppContextType {
  user: User | null;
  users: User[];
  setUser: (user: User | null) => void;
  registerUser: (newUser: User) => void;
  cases: Case[];
  addCase: (newCase: Case) => void;
  updateCaseEvidence: (caseId: string, evidence: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // 1. Load Data on Startup
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load Cases
        const storedCases = await AsyncStorage.getItem('cases');
        if (storedCases) {
          setCases(JSON.parse(storedCases));
        } else {
          setCases(MOCK_LEDGER); // First time? Load Mock Data
        }

        // Load Users
        const storedUsers = await AsyncStorage.getItem('users');
        if (storedUsers) {
          setUsers(JSON.parse(storedUsers));
        } else {
          setUsers(INITIAL_USERS); // First time? Load Mock Users
          await AsyncStorage.setItem('users', JSON.stringify(INITIAL_USERS));
        }
      } catch (e) {
        console.error("Failed to load persistence", e);
      }
    };
    loadData();
  }, []);

  // 2. Register New User (Persisted)
  const registerUser = async (newUser: User) => {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  // 3. Add New Case (Persisted)
  const addCase = async (newCase: Case) => {
    const block: Case = {
      ...newCase,
      timestamp: new Date().toISOString(),
      blockchainHash: '0x' + Math.random().toString(16).substr(2, 64),
    };
    const updatedCases = [block, ...cases];
    setCases(updatedCases);
    await AsyncStorage.setItem('cases', JSON.stringify(updatedCases));
  };

  // 4. Update Evidence (Persisted)
  const updateCaseEvidence = async (caseId: string, newEvidence: any) => {
    const updatedCases = cases.map(c => {
      if (c.caseId === caseId) {
        return { ...c, evidence: [...c.evidence, newEvidence] };
      }
      return c;
    });
    setCases(updatedCases);
    await AsyncStorage.setItem('cases', JSON.stringify(updatedCases));
  };

  return (
    <AppContext.Provider value={{ user, setUser, users, registerUser, cases, addCase, updateCaseEvidence }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};