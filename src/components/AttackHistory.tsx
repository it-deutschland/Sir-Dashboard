import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Lightning, CheckCircle, XCircle, Clock } from '@phosphor-icons/react'
import type { StressAttack } from '@/types'

export function AttackHistory() {
  const [attacks] = useKV<StressAttack[]>('sir-stress-attacks', [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!attacks || attacks.length === 0) {
    return (
      <Card className="border-primary/20">
        <CardContent className="py-12">
          <div className="text-center space-y-3">
            <Lightning className="w-16 h-16 text-muted-foreground mx-auto opacity-50" />
            <div>
              <h3 className="text-lg font-semibold">Keine Attack-Historie</h3>
              <p className="text-sm text-muted-foreground font-mono mt-1">
                Führen Sie Ihren ersten Stresser Test durch
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightning className="w-5 h-5 text-primary" weight="duotone" />
            Attack-Verlauf ({attacks.length})
          </CardTitle>
          <CardDescription className="font-mono text-xs">
            Vollständige Aufzeichnung aller Stresser Tests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-4">
            {[...attacks].reverse().map((attack) => (
              <AccordionItem
                key={attack.id}
                value={attack.id}
                className="border border-primary/20 rounded-lg bg-card/50 backdrop-blur-sm overflow-hidden"
              >
                <AccordionTrigger className="px-6 hover:bg-primary/5">
                  <div className="flex items-center gap-4 w-full">
                    {attack.status === 'completed' && (
                      <CheckCircle className="w-5 h-5 text-primary" weight="fill" />
                    )}
                    {attack.status === 'running' && (
                      <Clock className="w-5 h-5 text-accent scan-active" weight="fill" />
                    )}
                    {attack.status === 'failed' && (
                      <XCircle className="w-5 h-5 text-destructive" weight="fill" />
                    )}
                    <div className="flex-1 text-left space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium font-mono text-sm">
                          {attack.host}:{attack.port}
                        </p>
                        <Badge variant="outline" className="text-[10px]">
                          {attack.method}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {attack.layer}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(attack.startedAt)} • von {attack.username}
                      </p>
                    </div>
                    <Badge variant="default" className="text-[10px] bg-accent text-accent-foreground">
                      {attack.concurrents}x Conc
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                      <div className="p-3 rounded-md bg-secondary/30 border border-primary/20">
                        <p className="text-muted-foreground mb-1">Ziel</p>
                        <p className="text-primary font-semibold">{attack.host}:{attack.port}</p>
                      </div>
                      <div className="p-3 rounded-md bg-secondary/30 border border-primary/20">
                        <p className="text-muted-foreground mb-1">Methode</p>
                        <p className="text-primary font-semibold">{attack.method}</p>
                      </div>
                      <div className="p-3 rounded-md bg-secondary/30 border border-primary/20">
                        <p className="text-muted-foreground mb-1">Dauer</p>
                        <p className="text-primary font-semibold">{attack.time} Sekunden</p>
                      </div>
                      <div className="p-3 rounded-md bg-secondary/30 border border-primary/20">
                        <p className="text-muted-foreground mb-1">Concurrents</p>
                        <p className="text-primary font-semibold">{attack.concurrents}</p>
                      </div>
                      <div className="p-3 rounded-md bg-secondary/30 border border-primary/20">
                        <p className="text-muted-foreground mb-1">Layer</p>
                        <p className="text-primary font-semibold">{attack.layer}</p>
                      </div>
                      <div className="p-3 rounded-md bg-secondary/30 border border-primary/20">
                        <p className="text-muted-foreground mb-1">API</p>
                        <p className="text-primary font-semibold capitalize">{attack.api}</p>
                      </div>
                      <div className="p-3 rounded-md bg-secondary/30 border border-primary/20">
                        <p className="text-muted-foreground mb-1">Benutzer</p>
                        <p className="text-primary font-semibold">{attack.username}</p>
                      </div>
                      <div className="p-3 rounded-md bg-secondary/30 border border-primary/20">
                        <p className="text-muted-foreground mb-1">Status</p>
                        <p className="text-primary font-semibold capitalize">{attack.status}</p>
                      </div>
                    </div>

                    {attack.response && (
                      <div className="p-4 rounded-md bg-secondary/30 border border-primary/20">
                        <p className="text-primary font-semibold mb-2 text-xs">API Response:</p>
                        <div className="font-mono text-[11px] space-y-1">
                          <p><span className="text-muted-foreground">Status:</span> <span className="text-accent">{attack.response.status}</span></p>
                          <p><span className="text-muted-foreground">Message:</span> {attack.response.message}</p>
                          {attack.response.attack_ids && attack.response.attack_ids.length > 0 && (
                            <p><span className="text-muted-foreground">Attack IDs:</span> {attack.response.attack_ids.join(', ')}</p>
                          )}
                          {attack.response.attack_summary && attack.response.attack_summary.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-primary/20">
                              <p className="text-primary mb-1">Attack Summary:</p>
                              {attack.response.attack_summary.map((summary: any, idx: number) => (
                                <div key={idx} className="ml-2 mt-1 text-muted-foreground">
                                  <p>• Server: {summary.server}</p>
                                  <p>• Send Time: {summary.send_time_ms}</p>
                                  {summary.timestamp && <p>• Start: {summary.timestamp}</p>}
                                  {summary.end_time && <p>• End: {summary.end_time}</p>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
