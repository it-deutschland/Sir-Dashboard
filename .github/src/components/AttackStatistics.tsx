import { useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  ChartLine, 
  Lightning, 
  Target, 
  Clock, 
  Pulse,
  TrendUp,
  FunnelSimple
} from '@phosphor-icons/react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import type { StressAttack } from '@/types'

const COLORS = {
  primary: 'oklch(0.75 0.20 145)',
  accent: 'oklch(0.85 0.22 130)',
  destructive: 'oklch(0.55 0.22 25)',
  secondary: 'oklch(0.70 0.15 195)',
  muted: 'oklch(0.50 0.10 145)',
  L4: '#10b981',
  L7: '#3b82f6'
}

export function AttackStatistics() {
  const [attacks] = useKV<StressAttack[]>('sir-stress-attacks', [])

  const statistics = useMemo(() => {
    if (!attacks || attacks.length === 0) {
      return {
        total: 0,
        completed: 0,
        failed: 0,
        running: 0,
        totalConcurrents: 0,
        totalDuration: 0,
        avgDuration: 0,
        byMethod: {},
        byLayer: { L4: 0, L7: 0 },
        byApi: { fluxstress: 0, netdowner: 0 },
        byHour: [],
        byDay: [],
        timeline: []
      }
    }

    const total = attacks.length
    const completed = attacks.filter(a => a.status === 'completed').length
    const failed = attacks.filter(a => a.status === 'failed').length
    const running = attacks.filter(a => a.status === 'running').length
    const totalConcurrents = attacks.reduce((sum, a) => sum + a.concurrents, 0)
    const totalDuration = attacks.reduce((sum, a) => sum + a.time, 0)
    const avgDuration = total > 0 ? Math.round(totalDuration / total) : 0

    const byMethod: Record<string, number> = {}
    attacks.forEach(a => {
      byMethod[a.method] = (byMethod[a.method] || 0) + 1
    })

    const byLayer = {
      L4: attacks.filter(a => a.layer === 'L4').length,
      L7: attacks.filter(a => a.layer === 'L7').length
    }

    const byApi = {
      fluxstress: attacks.filter(a => a.api === 'fluxstress').length,
      netdowner: attacks.filter(a => a.api === 'netdowner').length
    }

    const hourMap: Record<number, number> = {}
    attacks.forEach(a => {
      const hour = new Date(a.startedAt).getHours()
      hourMap[hour] = (hourMap[hour] || 0) + 1
    })
    const byHour = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      attacks: hourMap[i] || 0
    }))

    const dayMap: Record<string, { attacks: number; concurrents: number }> = {}
    attacks.forEach(a => {
      const date = new Date(a.startedAt)
      const dayKey = `${date.getDate()}.${date.getMonth() + 1}`
      if (!dayMap[dayKey]) {
        dayMap[dayKey] = { attacks: 0, concurrents: 0 }
      }
      dayMap[dayKey].attacks += 1
      dayMap[dayKey].concurrents += a.concurrents
    })

    const sortedDays = Object.entries(dayMap)
      .map(([day, data]) => ({ day, ...data }))
      .slice(-14)

    const sortedAttacks = [...attacks].sort(
      (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
    )

    let cumulativeAttacks = 0
    const timeline = sortedAttacks.map(a => {
      cumulativeAttacks += 1
      const date = new Date(a.startedAt)
      return {
        time: `${date.getDate()}.${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`,
        attacks: cumulativeAttacks,
        concurrents: a.concurrents
      }
    })

    return {
      total,
      completed,
      failed,
      running,
      totalConcurrents,
      totalDuration,
      avgDuration,
      byMethod,
      byLayer,
      byApi,
      byHour,
      byDay: sortedDays,
      timeline
    }
  }, [attacks])

  const methodChartData = Object.entries(statistics.byMethod).map(([method, count]) => ({
    method,
    count,
    fill: COLORS.primary
  }))

  const layerChartData = [
    { name: 'Layer 4', value: statistics.byLayer.L4, fill: COLORS.L4 },
    { name: 'Layer 7', value: statistics.byLayer.L7, fill: COLORS.L7 }
  ]

  const apiChartData = [
    { name: 'Fluxstress', value: statistics.byApi.fluxstress, fill: COLORS.primary },
    { name: 'Netdowner', value: statistics.byApi.netdowner, fill: COLORS.accent }
  ]

  const statusChartData = [
    { name: 'Abgeschlossen', value: statistics.completed, fill: COLORS.primary },
    { name: 'Fehlgeschlagen', value: statistics.failed, fill: COLORS.destructive },
    { name: 'Laufend', value: statistics.running, fill: COLORS.accent }
  ].filter(d => d.value > 0)

  if (!attacks || attacks.length === 0) {
    return (
      <Card className="border-primary/20">
        <CardContent className="py-12">
          <div className="text-center space-y-3">
            <ChartLine className="w-16 h-16 text-muted-foreground mx-auto opacity-50" />
            <div>
              <h3 className="text-lg font-semibold">Keine Statistiken verfügbar</h3>
              <p className="text-sm text-muted-foreground font-mono mt-1">
                Führen Sie Attacks durch, um Trend-Daten zu generieren
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Lightning className="w-4 h-4" />
              Gesamt Attacks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary font-mono">{statistics.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {statistics.completed} abgeschlossen
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4" />
              Gesamt Concurrents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent font-mono">{statistics.totalConcurrents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Über alle Attacks
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Ø Dauer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary font-mono">{statistics.avgDuration}s</div>
            <p className="text-xs text-muted-foreground mt-1">
              Durchschnittliche Attack-Zeit
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Pulse className="w-4 h-4" />
              Aktiv
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent font-mono scan-active">
              {statistics.running}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Laufende Attacks
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-card border border-primary/20">
          <TabsTrigger value="timeline" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Zeitverlauf
          </TabsTrigger>
          <TabsTrigger value="daily" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Täglich
          </TabsTrigger>
          <TabsTrigger value="hourly" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Stündlich
          </TabsTrigger>
          <TabsTrigger value="methods" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Methoden
          </TabsTrigger>
          <TabsTrigger value="distribution" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Verteilung
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendUp className="w-5 h-5 text-primary" weight="duotone" />
                Attack-Trend über Zeit
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                Kumulative Anzahl der Attacks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={statistics.timeline}>
                  <defs>
                    <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.08 145 / 0.2)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="oklch(0.50 0.10 145)"
                    style={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="oklch(0.50 0.10 145)"
                    style={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(0.18 0 0)',
                      border: '1px solid oklch(0.30 0.08 145)',
                      borderRadius: '4px',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '11px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="attacks"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    fill="url(#colorAttacks)"
                    name="Attacks"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartLine className="w-5 h-5 text-primary" weight="duotone" />
                Tägliche Attack-Aktivität
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                Attacks und Concurrents pro Tag (letzte 14 Tage)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statistics.byDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.08 145 / 0.2)" />
                  <XAxis 
                    dataKey="day" 
                    stroke="oklch(0.50 0.10 145)"
                    style={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                  />
                  <YAxis 
                    stroke="oklch(0.50 0.10 145)"
                    style={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(0.18 0 0)',
                      border: '1px solid oklch(0.30 0.08 145)',
                      borderRadius: '4px',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '11px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{
                      fontFamily: 'JetBrains Mono',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="attacks" fill={COLORS.primary} name="Attacks" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="concurrents" fill={COLORS.accent} name="Concurrents" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hourly" className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" weight="duotone" />
                Stündliche Verteilung
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                Attack-Aktivität nach Tageszeit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={statistics.byHour}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.08 145 / 0.2)" />
                  <XAxis 
                    dataKey="hour" 
                    stroke="oklch(0.50 0.10 145)"
                    style={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                    interval={2}
                  />
                  <YAxis 
                    stroke="oklch(0.50 0.10 145)"
                    style={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(0.18 0 0)',
                      border: '1px solid oklch(0.30 0.08 145)',
                      borderRadius: '4px',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '11px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="attacks"
                    stroke={COLORS.accent}
                    strokeWidth={2}
                    dot={{ fill: COLORS.accent, r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Attacks"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods" className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FunnelSimple className="w-5 h-5 text-primary" weight="duotone" />
                Attack-Methoden
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                Verwendung verschiedener Attack-Methoden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={methodChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.08 145 / 0.2)" />
                  <XAxis 
                    type="number"
                    stroke="oklch(0.50 0.10 145)"
                    style={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                  />
                  <YAxis 
                    dataKey="method"
                    type="category"
                    stroke="oklch(0.50 0.10 145)"
                    style={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(0.18 0 0)',
                      border: '1px solid oklch(0.30 0.08 145)',
                      borderRadius: '4px',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="count" name="Anzahl" radius={[0, 4, 4, 0]}>
                    {methodChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? COLORS.primary : COLORS.accent} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm">Layer-Verteilung</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={layerChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {layerChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(0.18 0 0)',
                        border: '1px solid oklch(0.30 0.08 145)',
                        borderRadius: '4px',
                        fontFamily: 'JetBrains Mono',
                        fontSize: '11px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-2 justify-center mt-2">
                  <Badge variant="outline" className="text-xs">
                    L4: {statistics.byLayer.L4}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    L7: {statistics.byLayer.L7}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm">API-Verteilung</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={apiChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {apiChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(0.18 0 0)',
                        border: '1px solid oklch(0.30 0.08 145)',
                        borderRadius: '4px',
                        fontFamily: 'JetBrains Mono',
                        fontSize: '11px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-2 justify-center mt-2">
                  <Badge variant="outline" className="text-xs">
                    Flux: {statistics.byApi.fluxstress}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Net: {statistics.byApi.netdowner}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm">Status-Verteilung</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(0.18 0 0)',
                        border: '1px solid oklch(0.30 0.08 145)',
                        borderRadius: '4px',
                        fontFamily: 'JetBrains Mono',
                        fontSize: '11px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
