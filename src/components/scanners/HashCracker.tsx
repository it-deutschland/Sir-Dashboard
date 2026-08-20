import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { LockKey, Hash, Play, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function HashCracker() {
  const [hashInput, setHashInput] = useState('')
  const [hashType, setHashType] = useState('md5')
  const [wordlist, setWordlist] = useState('')
  const [result, setResult] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const hashTypes = [
    { value: 'md5', label: 'MD5' },
    { value: 'sha1', label: 'SHA-1' },
    { value: 'sha256', label: 'SHA-256' },
    { value: 'sha512', label: 'SHA-512' },
    { value: 'bcrypt', label: 'bcrypt' },
    { value: 'ntlm', label: 'NTLM' }
  ]

  const simulateHashCrack = async () => {
    if (!hashInput.trim()) {
      toast.error('Bitte Hash eingeben')
      return
    }

    setIsProcessing(true)
    setResult('')

    await new Promise(resolve => setTimeout(resolve, 2500))

    const mockPasswords = ['password123', 'admin', 'letmein', 'qwerty', 'welcome', '123456']
    const crackedPassword = mockPasswords[Math.floor(Math.random() * mockPasswords.length)]
    const attempts = Math.floor(Math.random() * 100000) + 10000

    const resultText = `
[Hash-Cracking Bericht]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hash-Typ: ${hashType.toUpperCase()}
Original-Hash: ${hashInput.substring(0, 32)}...

Status: ✓ ERFOLGREICH GEKNACKT
Klartext-Passwort: ${crackedPassword}

Statistik:
- Versuche: ${attempts.toLocaleString('de-DE')}
- Dauer: ${(Math.random() * 5 + 1).toFixed(2)}s
- Wörterbuch: ${wordlist ? 'Benutzerdefiniert' : 'Standard Wörterbuch'}
- Hash/s: ${Math.floor(attempts / 5).toLocaleString('de-DE')}

Empfehlungen:
✓ Verwenden Sie Passwörter mit mindestens 12 Zeichen
✓ Kombinieren Sie Groß-/Kleinbuchstaben, Zahlen und Sonderzeichen
✓ Nutzen Sie einen Passwort-Manager
✓ Aktivieren Sie Zwei-Faktor-Authentifizierung
`

    setResult(resultText)
    setIsProcessing(false)
    toast.success('Hash erfolgreich geknackt')
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LockKey className="w-5 h-5 text-primary" weight="duotone" />
          Hash-Cracker & Passwort-Analyse
        </CardTitle>
        <CardDescription className="font-mono text-xs">
          Passwort-Hashes analysieren und Sicherheit bewerten
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="hash-input">Hash-Wert</Label>
            <Input
              id="hash-input"
              placeholder="5f4dcc3b5aa765d61d8327deb882cf99"
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              className="bg-secondary border-primary/30 font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hash-type">Hash-Algorithmus</Label>
            <Select value={hashType} onValueChange={setHashType}>
              <SelectTrigger id="hash-type" className="bg-secondary border-primary/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {hashTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Hash generieren</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Text"
                className="bg-secondary border-primary/30 font-mono flex-1"
                onBlur={(e) => {
                  if (e.target.value) {
                    const hash = Math.abs(e.target.value.split('').reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0)).toString(16).padStart(32, '0')
                    setHashInput(hash)
                  }
                }}
              />
              <Button size="icon" variant="outline" className="shrink-0">
                <Hash className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="wordlist">Benutzerdefinierte Wörterliste (optional)</Label>
            <Textarea
              id="wordlist"
              placeholder="password&#10;admin&#10;123456&#10;..."
              value={wordlist}
              onChange={(e) => setWordlist(e.target.value)}
              className="bg-secondary border-primary/30 font-mono min-h-[80px]"
            />
          </div>
        </div>

        <Button 
          onClick={simulateHashCrack}
          className="w-full bg-primary hover:bg-primary/90 gap-2"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <span className="scan-active">◆</span> Wird geknackt...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" weight="fill" />
              Hash knacken
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" weight="fill" />
              <Label>Ergebnis</Label>
            </div>
            <div className="p-4 rounded-md bg-card border border-accent/30">
              <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-words">
                {result}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
