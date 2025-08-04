import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types'

interface UserStore {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, firstName: string, lastName: string) => void
  logout: () => void
}

const generateId = () => Math.random().toString(36).substr(2, 9)

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      
      login: (email, firstName, lastName) => {
        const user: User = {
          id: generateId(),
          email,
          firstName,
          lastName,
          createdAt: new Date(),
        }
        set({ user, isAuthenticated: true })
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'prescription-manager-user',
      version: 1,
    }
  )
)
