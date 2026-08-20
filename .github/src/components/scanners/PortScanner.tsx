import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Network, Play, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface PortResult {
  port: number
  state: 'open' | 'closed' | 'filtered'
  service: string
  version?: string
}

export function PortScanner() {
  const [target, setTarget] = useState('')
  const [portRange, setPortRange] = useState('common')
  const [customPorts, setCustomPorts] = useState('')
  const [results, setResults] = useState<PortResult[]>([])
  const [isScanning, setIsScanning] = useState(false)

  const commonServices = [
    { port: 21, service: 'FTP', version: 'vsftpd 3.0.3' },
    { port: 22, service: 'SSH', version: 'OpenSSH 8.2p1' },
    { port: 80, service: 'HTTP', version: 'nginx 1.18.0' },
    { port: 443, service: 'HTTPS', version: 'nginx 1.18.0' },
    { port: 3306, service: 'MySQL', version: '5.7.32' },
    { port: 3389, service: 'RDP', version: 'Microsoft Terminal Services' },
    { port: 5432, service: 'PostgreSQL', version: '12.5' },
    { port: 8080, service: 'HTTP-Proxy', version: 'Apache 2.4.46' },
    { port: 27017, service: 'MongoDB', version: '4.4.3' }
  ]

  const simulateScan = async () => {
    if (!target.trim()) {
      toast.error('Bitte Ziel-Host eingeben')
      return
    }

    setIsScanning(true)
    setResults([])

    await new Promise(resolve => setTimeout(resolve, 1500))

    let portsToScan: number[] = []

    if (portRange === 'common') {
      portsToScan = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 3306, 3389, 5432, 8080, 27017]
    } else if (portRange === 'all') {
      portsToScan = Array.from({ length: 20 }, (_, i) => Math.floor(Math.random() * 65535) + 1)
    } else if (portRange === 'custom' && customPorts) {
      portsToScan = customPorts.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p))
    }

    const scanResults: PortResult[] = portsToScan.map(port => {
      const serviceInfo = commonServices.find(s => s.port === port)
      const isOpen = Math.random() > 0.5
      const state: 'open' | 'closed' | 'filtered' = isOpen ? 'open' : 'closed'

      if (serviceInfo && isOpen) {
        return {
          port,
          state,
          service: serviceInfo.service,
          version: serviceInfo.version
        }
      } else {
        return {
          port,
          state,
          service: serviceInfo?.service || 'unknown',
          version: isOpen && serviceInfo ? serviceInfo.version : undefined
        }
      }
    }).sort((a, b) => a.port - b.port)

    setResults(scanResults)
    setIsScanning(false)
    toast.success(`Scan abgeschlossen - ${scanResults.filter(r => r.state === 'open').length} offene Ports gefunden`)
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="w-5 h-5 text-primary" weight="duotone" />
          Nmap-Style Port-Scanner
        </CardTitle>
        <CardDescription className="font-mono text-xs">
          Netzwerk-Ports scannen und Dienste identifizieren
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="scan-target">Ziel-Host</Label>
            <Input
              id="scan-target"
              placeholder="192.168.1.1 oder example.com"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="bg-secondary border-primary/30 font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="port-range">Port-Bereich</Label>
            <Select value={portRange} onValueChange={setPortRange}>
              <SelectTrigger id="port-range" className="bg-secondary border-primary/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="common">Häufige Ports (Top 15)</SelectItem>
                <SelectItem value="all">Alle Ports (1-65535)</SelectItem>
                <SelectItem value="custom">Benutzerdefiniert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {portRange === 'custom' && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="custom-ports">Port-Liste (kommagetrennt)</Label>
              <Input
                id="custom-ports"
                placeholder="80,443,8080,3306"
                value={customPorts}
                onChange={(e) => setCustomPorts(e.target.value)}
                className="bg-secondary border-primary/30 font-mono"
              />
            </div>
          )}
        </div>

        <Button 
          onClick={simulateScan}
          className="w-full bg-primary hover:bg-primary/90 gap-2"
          disabled={isScanning}
        >
          {isScanning ? (
            <>
              <span className="scan-active">◆</span> Scannt...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" weight="fill" />
              Port-Scan starten
            </>
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" weight="fill" />
              <Label>Scan-Ergebnisse ({results.length} Ports)</Label>
            </div>
            <div className="border border-primary/20 rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-card hover:bg-card">
                    <TableHead className="font-mono">Port</TableHead>
                    <TableHead className="font-mono">Status</TableHead>
                    <TableHead className="font-mono">Dienst</TableHead>
                    <TableHead className="font-mono">Version</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.port}>
                      <TableCell className="font-mono text-primary">
                        {result.port}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={result.state === 'open' ? 'default' : 'secondary'}
                          className={result.state === 'open' ? 'bg-accent' : ''}
                        >
                          {result.state}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">{result.service}</TableCell>
                      <TableCell className="font-mono text-muted-foreground text-xs">
                        {result.version || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
