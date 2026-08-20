import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Terminal, Lock } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { api, ApiError } from '@/lib/api'
import type { Session } from '@/types'

interface LoginScreenProps {
  onLogin: (session: Session) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await api.auth.login({ username, password })
      
      if (response.success && response.data) {
        onLogin({
          userId: response.data.id,
          username: response.data.username,
          isOwner: response.data.is_owner
        })
        toast.success('Zugriff gewährt')
      } else {
        toast.error(response.error || 'Login fehlgeschlagen')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error('Verbindung zum Server fehlgeschlagen')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 grid-pattern">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card/30" />
      
      <Card className="w-full max-w-md relative border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="relative">
              <Terminal className="w-16 h-16 text-primary" weight="duotone" />
              <Lock className="w-6 h-6 text-accent absolute -bottom-1 -right-1" weight="fill" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <CardTitle className="text-3xl tracking-tight">
              <span className="text-primary">SIR</span> DASHBOARD
            </CardTitle>
            <CardDescription className="text-muted-foreground font-mono text-xs">
              Sicherheitsoperationszentrum v2.1.0
            </CardDescription>
          </div>
          <div className="border-t border-primary/20 pt-4">
            <pre className="text-[10px] text-primary/60 leading-tight text-center">
{`┌─────────────────────────────┐
│ NUR AUTORISIERTER ZUGRIFF   │
└─────────────────────────────┘`}
            </pre>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-primary/90">Benutzername</Label>
              <Input
                id="username"
                type="text"
                placeholder="Benutzername eingeben"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-secondary border-primary/30 focus:border-primary"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-primary/90">Passwort</Label>
              <Input
                id="password"
                type="password"
                placeholder="Passwort eingeben"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary border-primary/30 focus:border-primary"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="scan-active">◆</span> Authentifizierung...
                </span>
              ) : (
                'Sitzung initialisieren'
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center pt-2 font-mono">
              Demo: Verwenden Sie einen beliebigen Benutzernamen (admin/user1) mit Passwort: admin123
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
