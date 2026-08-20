import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Terminal, SignOut, UserGear } from '@phosphor-icons/react'
import { VulnerabilityScanner } from './scanners/VulnerabilityScanner'
import { ConfigurationScanner } from './scanners/ConfigurationScanner'
import { AdvancedScanner } from './scanners/AdvancedScanner'
import { PenTestTools } from './scanners/PenTestTools'
import { WebsiteAnalysis } from './scanners/WebsiteAnalysis'
import { AdminPanel } from './AdminPanel'
import { ScanHistory } from './ScanHistory'
import { AttackHistory } from './AttackHistory'
import { AttackStatistics } from './AttackStatistics'
import { StresserTest } from './StresserTest'
import { RealtimeNotifications } from './RealtimeNotifications'
import { useRealtimeUpdates } from '@/hooks/use-realtime'
import type { Session } from '@/types'

interface DashboardProps {
  session: Session
  onLogout: () => void
}

export function Dashboard({ session, onLogout }: DashboardProps) {
  const [view, setView] = useState<'scanner' | 'scan-history' | 'attack-history' | 'attack-statistics' | 'admin'>('scanner')
  useRealtimeUpdates()

  return (
    <div className="min-h-screen bg-background">
      <RealtimeNotifications />
      <header className="border-b border-primary/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="w-8 h-8 text-primary" weight="duotone" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                <span className="text-primary">SIR</span> DASHBOARD
              </h1>
              <p className="text-[10px] text-muted-foreground font-mono">
                Sicherheitsoperationszentrum
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-primary font-mono">
                {session.username}
                {session.isOwner && (
                  <span className="ml-2 text-[10px] text-accent">[OWNER]</span>
                )}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">
                SITZUNG_AKTIV
              </p>
            </div>

            <div className="flex gap-2">
              {session.isOwner && (
                <Button
                  variant={view === 'admin' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('admin')}
                  className="gap-2"
                >
                  <UserGear className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="gap-2 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <SignOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {view === 'admin' && session.isOwner ? (
          <AdminPanel onBack={() => setView('scanner')} />
        ) : (
          <>
            <div className="mb-6 flex gap-4">
              <Button
                variant={view === 'scanner' ? 'default' : 'outline'}
                onClick={() => setView('scanner')}
              >
                Sicherheitsscanner
              </Button>
              <Button
                variant={view === 'scan-history' ? 'default' : 'outline'}
                onClick={() => setView('scan-history')}
              >
                Scan-Verlauf
              </Button>
              <Button
                variant={view === 'attack-history' ? 'default' : 'outline'}
                onClick={() => setView('attack-history')}
              >
                Attack-Verlauf
              </Button>
              <Button
                variant={view === 'attack-statistics' ? 'default' : 'outline'}
                onClick={() => setView('attack-statistics')}
              >
                Attack-Statistiken
              </Button>
            </div>

            {view === 'scanner' ? (
              <Tabs defaultValue="vulnerability" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 lg:w-auto lg:inline-grid bg-card border border-primary/20">
                  <TabsTrigger value="vulnerability" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Schwachstellenbewertung
                  </TabsTrigger>
                  <TabsTrigger value="configuration" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Konfigurationsanalyse
                  </TabsTrigger>
                  <TabsTrigger value="website" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Website-Analyse
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Erweiterte Kategorien
                  </TabsTrigger>
                  <TabsTrigger value="pentest" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Pentest-Werkzeuge
                  </TabsTrigger>
                  <TabsTrigger value="stresser" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Stresser Test
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="vulnerability">
                  <VulnerabilityScanner />
                </TabsContent>

                <TabsContent value="configuration">
                  <ConfigurationScanner />
                </TabsContent>

                <TabsContent value="website">
                  <WebsiteAnalysis />
                </TabsContent>

                <TabsContent value="advanced">
                  <AdvancedScanner />
                </TabsContent>

                <TabsContent value="pentest">
                  <PenTestTools />
                </TabsContent>

                <TabsContent value="stresser">
                  <StresserTest session={session} />
                </TabsContent>
              </Tabs>
            ) : view === 'scan-history' ? (
              <ScanHistory />
            ) : view === 'attack-history' ? (
              <AttackHistory />
            ) : (
              <AttackStatistics />
            )}
          </>
        )}
      </main>
    </div>
  )
}
