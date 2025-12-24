import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types'

interface UserStore {
  user: User | null
  users: User[]
  isAuthenticated: boolean
  register: (email: string, firstName: string, lastName: string, password: string) => Promise<boolean>
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const generateId = () => Math.random().toString(36).substr(2, 9)

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      users: [],
      isAuthenticated: false,
      
      register: async (email, firstName, lastName, password) => {
        const { users } = get()
        
        // Check if user already exists
        const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase())
        if (existingUser) {
          return false // User already exists
        }
        
        const newUser: User = {
          id: generateId(),
          email: email.toLowerCase(),
          firstName,
          lastName,
          password, // In a real app, this would be hashed
          createdAt: new Date(),
        }
        
        set(state => ({
          users: [...state.users, newUser],
          user: newUser,
          isAuthenticated: true
        }))
        
        return true
      },
      
      login: async (email, password) => {
        const { users } = get()
        
        const user = users.find(u => 
          u.email.toLowerCase() === email.toLowerCase() && u.password === password
        )
        
        if (user) {
          set({ user, isAuthenticated: true })
          return true
        }
        
        return false
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
