import { useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { LoginScreen } from '@/components/LoginScreen'
import { Dashboard } from '@/components/Dashboard'
import type { Session } from '@/types'

function App() {
  const [session, setSession] = useState<Session | null>(null)

  const handleLogin = (newSession: Session) => {
    setSession(newSession)
  }

  const handleLogout = () => {
    setSession(null)
  }

  return (
    <>
      {session ? (
        <Dashboard session={session} onLogout={handleLogout} />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
      <Toaster position="top-right" theme="dark" />
    </>
  )
}

export default App