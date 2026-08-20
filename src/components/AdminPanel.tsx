import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { CaretLeft, UserPlus, Users, Key, Plugs } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { api, ApiError, type User as ApiUser } from '@/lib/api'
import type { ApiConfig } from '@/types'

interface AdminPanelProps {
  onBack: () => void
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [apiConfigs, setApiConfigs] = useKV<ApiConfig[]>('sir-api-configs', [])
  const [users, setUsers] = useState<ApiUser[]>([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('admin123')
  const [isOwner, setIsOwner] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)

  const apiConfigsList = apiConfigs || []

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setIsLoadingUsers(true)
    try {
      const response = await api.users.list()
      if (response.success && response.data) {
        setUsers(response.data)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error('Fehler beim Laden der Benutzer', {
          description: error.message
        })
      }
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      toast.error('Benutzername erforderlich')
      return
    }

    if (!password.trim()) {
      toast.error('Passwort erforderlich')
      return
    }

    setIsLoading(true)
    try {
      const response = await api.users.create(username.trim(), password, isOwner)
      if (response.success && response.data) {
        toast.success(`Benutzer ${username} erfolgreich erstellt`)
        setUsername('')
        setPassword('admin123')
        setIsOwner(false)
        await loadUsers()
      } else {
        toast.error(response.error || 'Fehler beim Erstellen des Benutzers')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error('Fehler beim Erstellen des Benutzers', {
          description: error.message
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await api.users.delete(userId)
      if (response.success) {
        toast.success('Benutzer gelöscht')
        await loadUsers()
      } else {
        toast.error(response.error || 'Fehler beim Löschen')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error('Fehler beim Löschen', {
          description: error.message
        })
      }
    }
  }

  const handleUpdateApiToken = (apiId: string, newToken: string) => {
    setApiConfigs(current =>
      (current || []).map(api =>
        api.id === apiId ? { ...api, token: newToken } : api
      )
    )
    toast.success('API-Token aktualisiert')
  }

  const handleUpdateApiMaxConc = (apiId: string, maxConc: number) => {
    setApiConfigs(current =>
      (current || []).map(api =>
        api.id === apiId ? { ...api, maxConcurrents: maxConc } : api
      )
    )
    toast.success('Max Concurrents aktualisiert')
  }

  const handleToggleApiEnabled = (apiId: string) => {
    setApiConfigs(current =>
      (current || []).map(api =>
        api.id === apiId ? { ...api, enabled: !api.enabled } : api
      )
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <CaretLeft className="w-4 h-4" />
          Zurück
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-primary">Verwaltungspanel</h2>
          <p className="text-sm text-muted-foreground font-mono">Nur Inhaber-Zugriff</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            Benutzer
          </TabsTrigger>
          <TabsTrigger value="apis" className="gap-2">
            <Plugs className="w-4 h-4" />
            API-Konfiguration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-primary" />
                  Benutzerkonto erstellen
                </CardTitle>
                <CardDescription className="font-mono text-xs">
                  Neue Operatoren für die Sicherheitsplattform registrieren
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-username">Benutzername</Label>
                    <Input
                      id="new-username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="operator_name"
                      className="bg-secondary border-primary/30 font-mono"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">Passwort</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Passwort eingeben"
                      className="bg-secondary border-primary/30 font-mono"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-md bg-secondary/50 border border-primary/20">
                    <div className="space-y-0.5">
                      <Label htmlFor="owner-switch" className="text-sm">Inhaber-Rechte</Label>
                      <p className="text-xs text-muted-foreground font-mono">
                        Admin-Zugriff und Benutzerverwaltung gewähren
                      </p>
                    </div>
                    <Switch
                      id="owner-switch"
                      checked={isOwner}
                      onCheckedChange={setIsOwner}
                      disabled={isLoading}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {isLoading ? 'Erstelle...' : 'Konto erstellen'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Registrierte Benutzer ({users.length})
                </CardTitle>
                <CardDescription className="font-mono text-xs">
                  Aktive Operator-Konten
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-auto">
                  {isLoadingUsers ? (
                    <p className="text-sm text-muted-foreground text-center py-8 font-mono">
                      Lädt Benutzer...
                    </p>
                  ) : users.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8 font-mono">
                      Noch keine Benutzer registriert
                    </p>
                  ) : (
                    users.map((user, index) => (
                      <div key={user.id}>
                        {index > 0 && <Separator className="my-2" />}
                        <div className="flex items-center justify-between p-3 rounded-md bg-secondary/50 border border-primary/20">
                          <div>
                            <p className="font-medium text-primary font-mono">{user.username}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              ID: {user.id}
                              {user.is_owner && <span className="ml-2 text-accent">[INHABER]</span>}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            Löschen
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="apis" className="space-y-6 mt-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                API-Konfigurationen
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                Verwalte API-Tokens und Limits (in Datenbank gespeichert)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiConfigsList.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8 font-mono">
                    Keine API-Konfigurationen gefunden
                  </p>
                ) : (
                  apiConfigsList.map((api, index) => (
                    <div key={api.id}>
                      {index > 0 && <Separator className="my-4" />}
                      <div className="space-y-4 p-4 rounded-md bg-secondary/30 border border-primary/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-primary font-mono flex items-center gap-2">
                              {api.name}
                              <Badge variant={api.enabled ? "default" : "secondary"} className="text-[10px]">
                                {api.enabled ? "Aktiv" : "Deaktiviert"}
                              </Badge>
                            </h3>
                            <p className="text-xs text-muted-foreground font-mono">
                              API Key: {api.apiKey}
                            </p>
                          </div>
                          <Switch
                            checked={api.enabled}
                            onCheckedChange={() => handleToggleApiEnabled(api.id)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`token-${api.id}`} className="text-xs">API Token</Label>
                          <div className="flex gap-2">
                            <Input
                              id={`token-${api.id}`}
                              type="password"
                              defaultValue={api.token}
                              onBlur={(e) => {
                                if (e.target.value !== api.token) {
                                  handleUpdateApiToken(api.id, e.target.value)
                                }
                              }}
                              className="bg-secondary border-primary/30 font-mono text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`base-url-${api.id}`} className="text-xs">Base URL</Label>
                            <Input
                              id={`base-url-${api.id}`}
                              value={api.baseUrl}
                              readOnly
                              className="bg-muted border-primary/20 font-mono text-xs"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`max-conc-${api.id}`} className="text-xs">Max Concurrents</Label>
                            <Input
                              id={`max-conc-${api.id}`}
                              type="number"
                              defaultValue={api.maxConcurrents}
                              onBlur={(e) => {
                                const val = parseInt(e.target.value)
                                if (!isNaN(val) && val !== api.maxConcurrents) {
                                  handleUpdateApiMaxConc(api.id, val)
                                }
                              }}
                              className="bg-secondary border-primary/30 font-mono text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
