import { create } from 'zustand'

interface ThemeState {
  theme: 'light' | 'dark' | 'system'
}

interface ThemeActions {
  setTheme: (theme: ThemeState['theme']) => void
}

export const useTheme = create<ThemeState & ThemeActions>((set) => ({
  theme: 'system',
  setTheme: (theme) => set({ theme })
}))
