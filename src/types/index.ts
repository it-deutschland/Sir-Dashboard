export interface User {
  id: string
  username: string
  isOwner: boolean
  createdAt: string
}

export interface ScanConfig {
  id: string
  name: string
  category: 'vulnerability' | 'configuration' | 'advanced'
  scanType: string
  target: string
  depth: 'quick' | 'normal' | 'deep'
  options: Record<string, boolean>
  createdAt: string
}

export interface ScanResult {
  id: string
  configId: string
  status: 'running' | 'completed' | 'failed'
  startedAt: string
  completedAt?: string
  findings: Finding[]
  progress: number
  target?: string
}

export interface Finding {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  title: string
  description: string
  affected: string
  recommendation: string
  cvss?: number
}

export interface Session {
  userId: string
  username: string
  isOwner: boolean
}

export interface StressAttack {
  id: string
  userId: string
  username: string
  host: string
  port: number
  method: string
  time: number
  concurrents: number
  layer: 'L4' | 'L7'
  api: 'fluxstress' | 'netdowner' | 'stresser-master'
  status: 'running' | 'completed' | 'failed'
  startedAt: string
  endTime: string
  timeRemaining: number
  response?: {
    status: string
    message: string
    attack_ids: string[]
    attack_summary?: any[]
    concurrents?: string
  }
}

export interface ApiConfig {
  id: string
  name: string
  apiKey: 'fluxstress' | 'netdowner' | 'stresser-master'
  baseUrl: string
  token: string
  maxConcurrents: number
  enabled: boolean
}
