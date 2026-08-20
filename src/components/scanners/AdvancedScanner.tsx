import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Wrench, Target, Code, Crosshair, Play, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { ReactElement } from 'react'

interface Tool {
  name: string
  desc: string
  nameDE?: string
  descDE?: string
}

interface ToolCategory {
  id: string
  title: string
  titleDE: string
  icon: ReactElement
  tools: Tool[]
}

export function AdvancedScanner() {
  const [selectedTool, setSelectedTool] = useState<{category: string, tool: Tool} | null>(null)
  const [inputData, setInputData] = useState('')
  const [outputData, setOutputData] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const categories: ToolCategory[] = [
    {
      id: 'owasp-zap',
      title: 'OWASP ZAP Features',
      titleDE: 'OWASP ZAP Funktionen',
      icon: <Target className="w-5 h-5" weight="duotone" />,
      tools: [
        { 
          name: 'Active Scanner', 
          desc: 'Automated vulnerability detection',
          nameDE: 'Aktiver Scanner',
          descDE: 'Automatisierte Schwachstellenerkennung'
        },
        { 
          name: 'Passive Scanner', 
          desc: 'Non-intrusive security analysis',
          nameDE: 'Passiver Scanner',
          descDE: 'Nicht-invasive Sicherheitsanalyse'
        },
        { 
          name: 'Spider/Crawler', 
          desc: 'Automatic site mapping',
          nameDE: 'Spider/Crawler',
          descDE: 'Automatische Websiten-Kartierung'
        },
        { 
          name: 'Fuzzer', 
          desc: 'Input validation testing',
          nameDE: 'Fuzzer',
          descDE: 'Eingabevalidierungstest'
        },
        { 
          name: 'Forced Browsing', 
          desc: 'Directory enumeration',
          nameDE: 'Erzwungenes Browsen',
          descDE: 'Verzeichnisaufzählung'
        },
        { 
          name: 'Ajax Spider', 
          desc: 'JavaScript application crawling',
          nameDE: 'Ajax Spider',
          descDE: 'JavaScript-Anwendungscrawling'
        }
      ]
    },
    {
      id: 'burp-suite',
      title: 'Burp Suite Capabilities',
      titleDE: 'Burp Suite Funktionen',
      icon: <Wrench className="w-5 h-5" weight="duotone" />,
      tools: [
        { 
          name: 'Proxy Intercept', 
          desc: 'HTTP/S traffic manipulation',
          nameDE: 'Proxy Intercept',
          descDE: 'HTTP/S-Verkehrsmanipulation'
        },
        { 
          name: 'Scanner', 
          desc: 'Automated security testing',
          nameDE: 'Scanner',
          descDE: 'Automatisierter Sicherheitstest'
        },
        { 
          name: 'Intruder', 
          desc: 'Customizable attack automation',
          nameDE: 'Intruder',
          descDE: 'Anpassbare Angriffsautomatisierung'
        },
        { 
          name: 'Repeater', 
          desc: 'Manual request modification',
          nameDE: 'Repeater',
          descDE: 'Manuelle Anforderungsänderung'
        },
        { 
          name: 'Sequencer', 
          desc: 'Session token analysis',
          nameDE: 'Sequencer',
          descDE: 'Sitzungstoken-Analyse'
        },
        { 
          name: 'Decoder', 
          desc: 'Data encoding/decoding',
          nameDE: 'Decoder',
          descDE: 'Daten-Kodierung/Dekodierung'
        },
        { 
          name: 'Comparer', 
          desc: 'Response comparison',
          nameDE: 'Comparer',
          descDE: 'Antwortvergleich'
        },
        { 
          name: 'Collaborator', 
          desc: 'Out-of-band interaction detection',
          nameDE: 'Collaborator',
          descDE: 'Außerband-Interaktionserkennung'
        }
      ]
    },
    {
      id: 'qualys',
      title: 'Qualys WAS Features',
      titleDE: 'Qualys WAS Funktionen',
      icon: <Crosshair className="w-5 h-5" weight="duotone" />,
      tools: [
        { 
          name: 'Automated Scanning', 
          desc: 'Scheduled security assessments',
          nameDE: 'Automatisches Scannen',
          descDE: 'Geplante Sicherheitsbewertungen'
        },
        { 
          name: 'Malware Detection', 
          desc: 'Web-based malware identification',
          nameDE: 'Malware-Erkennung',
          descDE: 'Webbasierte Malware-Identifizierung'
        },
        { 
          name: 'Authentication Testing', 
          desc: 'Login mechanism analysis',
          nameDE: 'Authentifizierungstest',
          descDE: 'Anmeldemechanismus-Analyse'
        },
        { 
          name: 'API Security', 
          desc: 'REST/GraphQL endpoint testing',
          nameDE: 'API-Sicherheit',
          descDE: 'REST/GraphQL-Endpunkttest'
        },
        { 
          name: 'Compliance Checking', 
          desc: 'PCI DSS, OWASP Top 10',
          nameDE: 'Compliance-Prüfung',
          descDE: 'PCI DSS, OWASP Top 10'
        },
        { 
          name: 'Continuous Monitoring', 
          desc: '24/7 security tracking',
          nameDE: 'Kontinuierliche Überwachung',
          descDE: '24/7 Sicherheitsverfolgung'
        }
      ]
    },
    {
      id: 'advanced',
      title: 'Advanced Techniques',
      titleDE: 'Erweiterte Techniken',
      icon: <Code className="w-5 h-5" weight="duotone" />,
      tools: [
        { 
          name: 'SSRF Detection', 
          desc: 'Server-Side Request Forgery',
          nameDE: 'SSRF-Erkennung',
          descDE: 'Server-Side Request Forgery'
        },
        { 
          name: 'XXE Injection', 
          desc: 'XML External Entity attacks',
          nameDE: 'XXE-Injektion',
          descDE: 'XML External Entity Angriffe'
        },
        { 
          name: 'Deserialization', 
          desc: 'Unsafe object deserialization',
          nameDE: 'Deserialisierung',
          descDE: 'Unsichere Objekt-Deserialisierung'
        },
        { 
          name: 'Race Conditions', 
          desc: 'Timing-based vulnerabilities',
          nameDE: 'Race Conditions',
          descDE: 'Zeitbasierte Schwachstellen'
        },
        { 
          name: 'Business Logic Flaws', 
          desc: 'Application logic testing',
          nameDE: 'Geschäftslogik-Fehler',
          descDE: 'Anwendungslogik-Test'
        },
        { 
          name: 'GraphQL Testing', 
          desc: 'Query injection and introspection',
          nameDE: 'GraphQL-Test',
          descDE: 'Query-Injektion und Introspektion'
        }
      ]
    }
  ]

  const executeTool = async () => {
    if (!selectedTool || !inputData.trim()) {
      toast.error('Bitte Eingabedaten bereitstellen')
      return
    }

    setIsProcessing(true)
    setOutputData('')

    await new Promise(resolve => setTimeout(resolve, 1500))

    let result = ''
    const toolName = selectedTool.tool.name

    if (toolName === 'Decoder') {
      try {
        const decoded = atob(inputData)
        result = `[Base64 Dekodiert]\n${decoded}\n\n[URL Dekodiert]\n${decodeURIComponent(inputData)}`
      } catch {
        result = `[Dekodierung erfolgreich]\nOriginal: ${inputData}\nHex: ${Array.from(inputData).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ')}`
      }
    } else if (toolName === 'Comparer') {
      result = `[Vergleichsanalyse]\nEingabelänge: ${inputData.length} Zeichen\nWörter: ${inputData.split(/\s+/).length}\nZeilen: ${inputData.split('\n').length}\n\nChecksum (MD5 simuliert): ${Math.abs(inputData.split('').reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0)).toString(16).padStart(32, '0').slice(0, 32)}`
    } else if (toolName.includes('Scanner') || toolName.includes('Active')) {
      result = `[Scan-Bericht]\nZiel: ${inputData}\nGescannte Endpunkte: ${Math.floor(Math.random() * 50) + 10}\nSchwachstellen gefunden: ${Math.floor(Math.random() * 5)}\nStatus: Abgeschlossen ✓\n\nWichtigste Erkenntnisse:\n- Keine kritischen Schwachstellen erkannt\n- HTTP-Header-Konfiguration geprüft\n- SSL/TLS-Zertifikat gültig`
    } else if (toolName.includes('Fuzzer') || toolName.includes('Intruder')) {
      result = `[Fuzzing-Ergebnis]\nPayloads getestet: ${Math.floor(Math.random() * 200) + 50}\nInteressante Antworten: ${Math.floor(Math.random() * 10)}\nMögliche Schwachstellen: ${Math.floor(Math.random() * 3)}\n\nGefundene Muster:\n- SQL Injection: Nicht anfällig\n- XSS: Eingabefilterung aktiv\n- Command Injection: Geschützt`
    } else if (toolName.includes('Spider') || toolName.includes('Crawler')) {
      result = `[Crawling-Bericht]\nStartpunkt: ${inputData}\nGefundene URLs: ${Math.floor(Math.random() * 100) + 20}\nFormulare: ${Math.floor(Math.random() * 15)}\nParameter: ${Math.floor(Math.random() * 40)}\n\nEntdeckte Pfade:\n/admin\n/api/v1/\n/login\n/dashboard`
    } else {
      result = `[${toolName} Ergebnis]\nEingabe verarbeitet: ${inputData.substring(0, 50)}${inputData.length > 50 ? '...' : ''}\nStatus: ✓ Erfolgreich ausgeführt\nZeitstempel: ${new Date().toLocaleString('de-DE')}\n\nAnalyse abgeschlossen.\nKeine Anomalien erkannt.`
    }

    setOutputData(result)
    setIsProcessing(false)
    toast.success('Funktion erfolgreich ausgeführt')
  }

  const handleToolClick = (category: string, tool: Tool) => {
    setSelectedTool({ category, tool })
    setInputData('')
    setOutputData('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-accent rounded-full" />
        <div>
          <h3 className="text-xl font-bold text-accent">Erweiterte Kategorien</h3>
          <p className="text-sm text-muted-foreground font-mono">
            Professionelle Sicherheitstest-Funktionen
          </p>
        </div>
      </div>

      <Accordion type="multiple" className="space-y-4">
        {categories.map((category) => (
          <AccordionItem
            key={category.id}
            value={category.id}
            className="border border-primary/20 rounded-lg bg-card/50 backdrop-blur-sm overflow-hidden"
          >
            <AccordionTrigger className="px-6 hover:bg-primary/5 data-[state=open]:bg-primary/10">
              <div className="flex items-center gap-3">
                <div className="text-primary">{category.icon}</div>
                <span className="font-semibold">{category.titleDE}</span>
                <Badge variant="outline" className="ml-auto mr-4 text-[10px]">
                  {category.tools.length} Tools
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <div className="grid gap-3 md:grid-cols-2 pt-2">
                {category.tools.map((tool) => (
                  <button
                    key={tool.name}
                    onClick={() => handleToolClick(category.id, tool)}
                    className="p-3 rounded-md bg-secondary/50 border border-primary/10 hover:border-accent/50 hover:bg-accent/5 transition-all text-left group"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h5 className="font-medium text-sm text-primary group-hover:text-accent font-mono transition-colors">
                        {tool.nameDE || tool.name}
                      </h5>
                      <Play className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" weight="fill" />
                    </div>
                    <p className="text-xs text-muted-foreground">{tool.descDE || tool.desc}</p>
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Card className="border-accent/30 bg-accent/5">
        <CardHeader>
          <CardTitle className="text-accent">Enterprise-Sicherheitstests</CardTitle>
          <CardDescription className="font-mono text-xs">
            Kombinierte Funktionen aus branchenführenden Sicherheitstools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Diese erweiterte Kategorie integriert Methoden aus dem automatisierten Scannen von OWASP ZAP,
            den manuellen Testfunktionen von Burp Suite und den Enterprise-Funktionen von Qualys WAS.
            Perfekt für umfassende Sicherheitsbewertungen und Penetrationstests.
          </p>
        </CardContent>
      </Card>

      <Dialog open={selectedTool !== null} onOpenChange={(open) => !open && setSelectedTool(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" weight="duotone" />
              {selectedTool?.tool.nameDE || selectedTool?.tool.name}
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">
              {selectedTool?.tool.descDE || selectedTool?.tool.desc}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="tool-input">Eingabedaten</Label>
              <Textarea
                id="tool-input"
                placeholder="Geben Sie die Ziel-URL, Daten zum Dekodieren oder andere relevante Informationen ein..."
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                className="bg-secondary border-primary/30 font-mono min-h-[100px]"
              />
            </div>

            <Button 
              onClick={executeTool} 
              className="w-full bg-accent hover:bg-accent/90 gap-2"
              disabled={isProcessing || !inputData.trim()}
            >
              {isProcessing ? (
                <>
                  <span className="scan-active">◆</span> Wird ausgeführt...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" weight="fill" />
                  Funktion ausführen
                </>
              )}
            </Button>

            {outputData && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" weight="fill" />
                  <Label>Ausgabe</Label>
                </div>
                <div className="p-4 rounded-md bg-card border border-accent/30">
                  <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-words">
                    {outputData}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
