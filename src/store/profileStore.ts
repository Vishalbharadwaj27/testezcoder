import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    fontSize: number;
    tabSize: number;
  };
}

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
}

interface ProfileActions {
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearProfile: () => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
}

export const useProfileStore = create<ProfileState & ProfileActions>()(
  persist(
    (set) => ({
      profile: null,
      isLoading: false,
      error: null,
      initialized: false,
      setProfile: (profile) => set({ profile, error: null }),
      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : (updates as UserProfile),
        })),
      clearProfile: () => set({ profile: null, error: null }),
      setError: (error) => set({ error }),
      setInitialized: (initialized) => set({ initialized }),
    }),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
