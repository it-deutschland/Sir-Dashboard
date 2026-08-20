import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Globe, MagnifyingGlass, HardDrives, MapPin, LockKey, Warning, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface EndpointInfo {
  port: number
  protocol: string
  path?: string
  service: string
}

interface SoftwareInfo {
  name: string
  version?: string
  type: string
}

interface HostInfo {
  ip: string
  realIp?: string
  hostname?: string
  location?: string
  isp?: string
  cloudProvider?: string
  endpoints: EndpointInfo[]
  software: SoftwareInfo[]
  certificates?: CertificateInfo[]
  vulnerabilities?: string[]
}

interface CertificateInfo {
  subject: string
  issuer: string
  validFrom: string
  validTo: string
  algorithm: string
}

export function WebsiteAnalysis() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<HostInfo[] | null>(null)

  const handleAnalyze = async () => {
    if (!domain) {
      toast.error('Bitte geben Sie eine Domain ein')
      return
    }

    setLoading(true)
    toast.info('Analysiere Website...', { description: `Ziel: ${domain}` })

    setTimeout(() => {
      const mockResults: HostInfo[] = [
        {
          ip: '104.21.45.78',
          realIp: '45.79.123.156',
          hostname: domain,
          location: 'Frankfurt, Germany',
          isp: 'Cloudflare Inc.',
          cloudProvider: 'Cloudflare',
          endpoints: [
            { port: 443, protocol: 'HTTPS', service: 'nginx' },
            { port: 80, protocol: 'HTTP', service: 'nginx' },
            { port: 2087, protocol: 'HTTP', path: '/robots.txt', service: 'cPanel WHM' },
            { port: 2087, protocol: 'HTTP', service: 'cPanel WHM' },
            { port: 8443, protocol: 'HTTPS', service: 'Plesk Panel' }
          ],
          software: [
            { name: 'cPanel WHM', version: '110.0.18', type: 'Control Panel' },
            { name: 'Roundcube Webmail', version: '1.6.1', type: 'Webmail' },
            { name: 'nginx', version: '1.21.6', type: 'Web Server' },
            { name: 'PHP', version: '8.1.12', type: 'Runtime' },
            { name: 'MySQL', version: '5.7.40', type: 'Database' }
          ],
          certificates: [
            {
              subject: `CN=${domain}`,
              issuer: 'CN=Let\'s Encrypt Authority X3',
              validFrom: '2024-01-15',
              validTo: '2024-04-15',
              algorithm: 'RSA 2048-bit'
            }
          ],
          vulnerabilities: [
            'CVE-2023-44487 - HTTP/2 Rapid Reset Attack',
            'Outdated MySQL version detected'
          ]
        },
        {
          ip: '172.67.89.123',
          realIp: '45.79.123.156',
          hostname: `www.${domain}`,
          location: 'Los Angeles, USA',
          isp: 'Cloudflare Inc.',
          cloudProvider: 'Cloudflare',
          endpoints: [
            { port: 443, protocol: 'HTTPS', service: 'Apache' },
            { port: 80, protocol: 'HTTP', service: 'Apache' },
            { port: 21, protocol: 'FTP', service: 'ProFTPD' }
          ],
          software: [
            { name: 'Apache', version: '2.4.54', type: 'Web Server' },
            { name: 'ModSecurity', version: '3.0.8', type: 'WAF' },
            { name: 'OpenSSL', version: '1.1.1', type: 'SSL/TLS' }
          ]
        }
      ]

      setResults(mockResults)
      setLoading(false)
      toast.success('Analyse abgeschlossen', {
        description: `${mockResults.length} Host(s) gefunden`
      })
    }, 2500)
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" weight="duotone" />
            Website-Analyse
          </CardTitle>
          <CardDescription className="font-mono text-xs">
            Umfassende Domain-Analyse mit Endpoint-Erkennung und echter IP-Auflösung (Censys-Style)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="domain">Domain / IP-Adresse</Label>
              <Input
                id="domain"
                placeholder="example.com oder 192.168.1.1"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="bg-secondary border-primary/30 font-mono"
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              />
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 gap-2"
          >
            <MagnifyingGlass className="w-4 h-4" weight="bold" />
            {loading ? 'Analysiere...' : 'Website analysieren'}
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-accent">
                Scanne Netzwerk und löse echte IPs auf...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {results && results.length > 0 && (
        <div className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HardDrives className="w-5 h-5 text-primary" weight="duotone" />
                Gefundene Hosts ({results.length})
              </CardTitle>
            </CardHeader>
          </Card>

          {results.map((host, idx) => (
            <Card key={idx} className="border-primary/20 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-mono flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-accent" weight="fill" />
                      {host.ip}
                      {host.cloudProvider && (
                        <Badge variant="outline" className="text-[10px] ml-2">
                          {host.cloudProvider}
                        </Badge>
                      )}
                    </CardTitle>
                    {host.realIp && host.realIp !== host.ip && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Echte IP:</span>
                        <code className="px-2 py-0.5 rounded bg-accent/20 text-accent font-mono text-xs">
                          {host.realIp}
                        </code>
                      </div>
                    )}
                    {host.hostname && (
                      <p className="text-sm text-muted-foreground font-mono">{host.hostname}</p>
                    )}
                  </div>
                  <div className="text-right text-xs text-muted-foreground space-y-1">
                    {host.location && <p>{host.location}</p>}
                    {host.isp && <p className="font-mono">{host.isp}</p>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Accordion type="multiple" className="space-y-2">
                  <AccordionItem value="endpoints" className="border border-primary/20 rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 hover:bg-primary/5">
                      <div className="flex items-center gap-2">
                        <LockKey className="w-4 h-4 text-primary" weight="duotone" />
                        <span className="font-semibold">Endpoints ({host.endpoints.length})</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3">
                      <div className="space-y-2">
                        {host.endpoints.map((endpoint, eidx) => (
                          <div
                            key={eidx}
                            className="flex items-center justify-between p-3 rounded-md bg-secondary/30 border border-primary/10"
                          >
                            <div className="space-y-1">
                              <p className="font-mono text-sm font-medium">
                                {endpoint.port} / {endpoint.protocol}
                                {endpoint.path && (
                                  <span className="text-muted-foreground ml-2">{endpoint.path}</span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">{endpoint.service}</p>
                            </div>
                            <Badge variant="outline" className="text-[10px]">
                              {endpoint.protocol}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="software" className="border border-primary/20 rounded-lg overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 hover:bg-primary/5">
                      <div className="flex items-center gap-2">
                        <HardDrives className="w-4 h-4 text-primary" weight="duotone" />
                        <span className="font-semibold">Software ({host.software.length})</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3">
                      <div className="space-y-2">
                        {host.software.map((software, sidx) => (
                          <div
                            key={sidx}
                            className="flex items-center justify-between p-3 rounded-md bg-secondary/30 border border-primary/10"
                          >
                            <div className="space-y-1">
                              <p className="font-medium text-sm">{software.name}</p>
                              <p className="text-xs text-muted-foreground">{software.type}</p>
                            </div>
                            {software.version && (
                              <Badge variant="secondary" className="text-[10px] font-mono">
                                v{software.version}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {host.certificates && host.certificates.length > 0 && (
                    <AccordionItem value="certificates" className="border border-primary/20 rounded-lg overflow-hidden">
                      <AccordionTrigger className="px-4 py-3 hover:bg-primary/5">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary" weight="duotone" />
                          <span className="font-semibold">SSL/TLS Zertifikate</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-3">
                        <div className="space-y-3">
                          {host.certificates.map((cert, cidx) => (
                            <div
                              key={cidx}
                              className="p-3 rounded-md bg-secondary/30 border border-primary/10 space-y-2"
                            >
                              <div className="text-xs font-mono space-y-1">
                                <p><span className="text-primary">Subject:</span> {cert.subject}</p>
                                <p><span className="text-primary">Issuer:</span> {cert.issuer}</p>
                                <p><span className="text-primary">Gültig von:</span> {cert.validFrom}</p>
                                <p><span className="text-primary">Gültig bis:</span> {cert.validTo}</p>
                                <p><span className="text-primary">Algorithmus:</span> {cert.algorithm}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {host.vulnerabilities && host.vulnerabilities.length > 0 && (
                    <AccordionItem value="vulnerabilities" className="border border-destructive/30 rounded-lg overflow-hidden">
                      <AccordionTrigger className="px-4 py-3 hover:bg-destructive/5">
                        <div className="flex items-center gap-2">
                          <Warning className="w-4 h-4 text-destructive" weight="fill" />
                          <span className="font-semibold text-destructive">
                            Sicherheitshinweise ({host.vulnerabilities.length})
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-3">
                        <div className="space-y-2">
                          {host.vulnerabilities.map((vuln, vidx) => (
                            <div
                              key={vidx}
                              className="p-3 rounded-md bg-destructive/10 border border-destructive/20"
                            >
                              <p className="text-sm font-mono text-destructive">{vuln}</p>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
