import { useState, useEffect } from 'react'
import { Login } from './Login'
import { Register } from './Register'

export function AuthContainer() {
  const [isLogin, setIsLogin] = useState(true)

  useEffect(() => {
    // Force light mode for auth pages
    document.body.classList.remove('dark')
  }, [])
  return isLogin ? (
    <Login onSwitchToRegister={() => setIsLogin(false)} />
  ) : (
    <Register onSwitchToLogin={() => setIsLogin(true)} />
  )
}
