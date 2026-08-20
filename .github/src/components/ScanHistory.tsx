import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Clock, Bug, CheckCircle, XCircle, Warning, Eye, Trash, ShieldCheck } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { ScanResult } from '@/types'

export function ScanHistory() {
  const [scans, setScans] = useKV<ScanResult[]>('sir-scan-results', [])
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const handleViewDetails = (scan: ScanResult) => {
    setSelectedScan(scan)
    setShowDetailsDialog(true)
  }

  const handleDeleteScan = (scanId: string) => {
    setScans((current) => (current || []).filter(s => s.id !== scanId))
    toast.success('Scan gelöscht')
  }

  const getScanDuration = (scan: ScanResult) => {
    if (!scan.completedAt) return 'Läuft...'
    const start = new Date(scan.startedAt).getTime()
    const end = new Date(scan.completedAt).getTime()
    const duration = Math.floor((end - start) / 1000)
    if (duration < 60) return `${duration}s`
    const mins = Math.floor(duration / 60)
    const secs = duration % 60
    return `${mins}m ${secs}s`
  }

  const getSeverityStats = (findings: any[]) => {
    const stats = { critical: 0, high: 0, medium: 0, low: 0, info: 0 }
    findings.forEach(f => {
      if (stats.hasOwnProperty(f.severity)) {
        stats[f.severity as keyof typeof stats]++
      }
    })
    return stats
  }

  if (!scans || scans.length === 0) {
    return (
      <Card className="border-primary/20">
        <CardContent className="py-12">
          <div className="text-center space-y-3">
            <Bug className="w-16 h-16 text-muted-foreground mx-auto opacity-50" />
            <div>
              <h3 className="text-lg font-semibold">Kein Scan-Verlauf</h3>
              <p className="text-sm text-muted-foreground font-mono mt-1">
                Führen Sie Ihren ersten Sicherheitsscan durch, um hier Ergebnisse zu sehen
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" weight="duotone" />
                Scan-Verlauf
              </CardTitle>
              <CardDescription className="font-mono text-xs mt-1">
                Vollständige Aufzeichnung aller Sicherheitsbewertungen
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono">
              {scans.length} {scans.length === 1 ? 'Scan' : 'Scans'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...scans].reverse().map((scan) => {
              const stats = getSeverityStats(scan.findings || [])
              return (
                <Card key={scan.id} className="border-primary/20 bg-secondary/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        {scan.status === 'completed' && (
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" weight="fill" />
                        )}
                        {scan.status === 'running' && (
                          <Clock className="w-5 h-5 text-accent scan-active flex-shrink-0" weight="fill" />
                        )}
                        {scan.status === 'failed' && (
                          <XCircle className="w-5 h-5 text-destructive flex-shrink-0" weight="fill" />
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm font-semibold text-primary">
                              Scan-ID: {scan.id.split('_')[1]}
                            </span>
                            {scan.target && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-sm text-foreground truncate">
                                  {scan.target}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-mono">
                            <span>{formatDate(scan.startedAt)}</span>
                            <span>•</span>
                            <span>Dauer: {getScanDuration(scan)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {scan.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(scan)}
                            className="h-8 text-primary hover:text-primary hover:bg-primary/10"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteScan(scan.id)}
                          className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      <div className="flex flex-col items-center p-2 rounded bg-card/50 border border-destructive/30">
                        <span className="text-xs text-muted-foreground mb-1">Critical</span>
                        <span className="text-lg font-bold text-destructive font-mono">{stats.critical}</span>
                      </div>
                      <div className="flex flex-col items-center p-2 rounded bg-card/50 border border-destructive/20">
                        <span className="text-xs text-muted-foreground mb-1">High</span>
                        <span className="text-lg font-bold text-destructive/80 font-mono">{stats.high}</span>
                      </div>
                      <div className="flex flex-col items-center p-2 rounded bg-card/50 border border-accent/30">
                        <span className="text-xs text-muted-foreground mb-1">Medium</span>
                        <span className="text-lg font-bold text-accent font-mono">{stats.medium}</span>
                      </div>
                      <div className="flex flex-col items-center p-2 rounded bg-card/50 border border-primary/30">
                        <span className="text-xs text-muted-foreground mb-1">Low</span>
                        <span className="text-lg font-bold text-primary font-mono">{stats.low}</span>
                      </div>
                      <div className="flex flex-col items-center p-2 rounded bg-card/50 border border-muted">
                        <span className="text-xs text-muted-foreground mb-1">Info</span>
                        <span className="text-lg font-bold text-muted-foreground font-mono">{stats.info}</span>
                      </div>
                    </div>

                    {scan.findings && scan.findings.length > 0 && scan.status === 'completed' && (
                      <div className="mt-3 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(scan)}
                          className="text-primary border-primary/30 hover:bg-primary/10"
                        >
                          <ShieldCheck className="w-4 h-4 mr-2" />
                          Details anzeigen ({scan.findings.length})
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="bg-card border-primary/30 max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-primary" weight="duotone" />
              Scan-Details
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">
              {selectedScan && (
                <div className="flex items-center gap-3 mt-2">
                  <span>ID: {selectedScan.id.split('_')[1]}</span>
                  <span>•</span>
                  <span>{selectedScan.target}</span>
                  <span>•</span>
                  <span>{formatDate(selectedScan.startedAt)}</span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2">
            {selectedScan && selectedScan.findings && selectedScan.findings.length > 0 ? (
              <div className="space-y-3">
                {selectedScan.findings.map((finding) => (
                  <Card key={finding.id} className="border-primary/20 bg-secondary/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-2 flex-1">
                          <Warning className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" weight="fill" />
                          <div>
                            <h4 className="font-semibold text-sm mb-1">{finding.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {finding.description}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={getSeverityColor(finding.severity) as any} 
                          className="text-[10px] ml-2"
                        >
                          {finding.severity.toUpperCase()}
                        </Badge>
                      </div>

                      <Separator className="my-3" />

                      <div className="space-y-2 text-sm font-mono">
                        <div className="flex items-start gap-2">
                          <span className="text-primary font-semibold min-w-[100px]">Betroffen:</span>
                          <span className="text-foreground break-all">{finding.affected}</span>
                        </div>
                        {finding.cvss && (
                          <div className="flex items-start gap-2">
                            <span className="text-primary font-semibold min-w-[100px]">CVSS Score:</span>
                            <Badge variant="outline" className="font-mono">
                              {finding.cvss}
                            </Badge>
                          </div>
                        )}
                        <div className="flex items-start gap-2 pt-2 border-t border-primary/10">
                          <span className="text-accent font-semibold min-w-[100px]">Empfehlung:</span>
                          <span className="text-muted-foreground">{finding.recommendation}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bug className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">Keine Schwachstellen gefunden</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
