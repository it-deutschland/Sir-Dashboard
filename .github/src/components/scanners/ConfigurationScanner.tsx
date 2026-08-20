import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Gear, ShieldCheck } from '@phosphor-icons/react'

export function ConfigurationScanner() {
  const categories = [
    { name: 'SSL/TLS Configuration', status: 'secure', checks: 12 },
    { name: 'HTTP Headers', status: 'warning', checks: 8 },
    { name: 'Cookie Security', status: 'secure', checks: 5 },
    { name: 'CORS Policy', status: 'secure', checks: 4 },
    { name: 'CSP Configuration', status: 'warning', checks: 6 },
    { name: 'Server Information Disclosure', status: 'critical', checks: 3 }
  ]

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gear className="w-5 h-5 text-primary" weight="duotone" />
            Configuration Security Analysis
          </CardTitle>
          <CardDescription className="font-mono text-xs">
            Automated security configuration assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category.name}
                className="p-4 rounded-md border border-primary/20 bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <ShieldCheck className="w-5 h-5 text-primary" weight="duotone" />
                  <Badge
                    variant={
                      category.status === 'secure'
                        ? 'default'
                        : category.status === 'warning'
                        ? 'secondary'
                        : 'destructive'
                    }
                    className="text-[10px]"
                  >
                    {category.status.toUpperCase()}
                  </Badge>
                </div>
                <h4 className="font-medium text-sm mb-1">{category.name}</h4>
                <p className="text-xs text-muted-foreground font-mono">
                  {category.checks} checks available
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
