import { useEffect, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import type { StressAttack, ScanResult } from '@/types'

type RealtimeEvent = {
  type: 'attack_update' | 'scan_update' | 'attack_complete' | 'scan_complete'
  data: any
  timestamp: string
}

export function useRealtimeUpdates() {
  const [attacks, setAttacks] = useKV<StressAttack[]>('sir-stress-attacks', [])
  const [scans, setScans] = useKV<ScanResult[]>('sir-scan-results', [])

  const broadcastEvent = useCallback((event: RealtimeEvent) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('realtime-update', { detail: event }))
    }
  }, [])

  useEffect(() => {
    const attackTimer = setInterval(() => {
      setAttacks(current => {
        const currentAttacks = current || []
        let hasChanges = false
        const updated = currentAttacks.map(attack => {
          if (attack.status !== 'running') return attack

          const now = new Date().getTime()
          const endTime = new Date(attack.endTime).getTime()
          const remaining = Math.max(0, Math.floor((endTime - now) / 1000))

          if (remaining <= 0) {
            hasChanges = true
            broadcastEvent({
              type: 'attack_complete',
              data: { id: attack.id, host: attack.host, method: attack.method },
              timestamp: new Date().toISOString()
            })
            return { ...attack, status: 'completed' as const, timeRemaining: 0 }
          }

          if (attack.timeRemaining !== remaining) {
            hasChanges = true
            broadcastEvent({
              type: 'attack_update',
              data: { id: attack.id, timeRemaining: remaining },
              timestamp: new Date().toISOString()
            })
          }

          return { ...attack, timeRemaining: remaining }
        })

        return hasChanges ? updated : currentAttacks
      })
    }, 1000)

    const scanTimer = setInterval(() => {
      setScans(current => {
        const currentScans = current || []
        let hasChanges = false
        const updated = currentScans.map(scan => {
          if (scan.status !== 'running') return scan

          const progress = scan.progress + Math.random() * 5
          
          if (progress >= 100) {
            hasChanges = true
            broadcastEvent({
              type: 'scan_complete',
              data: { id: scan.id, target: scan.target },
              timestamp: new Date().toISOString()
            })
            return { ...scan, status: 'completed' as const, progress: 100 }
          }

          if (scan.progress !== progress) {
            hasChanges = true
            broadcastEvent({
              type: 'scan_update',
              data: { id: scan.id, progress: Math.round(progress) },
              timestamp: new Date().toISOString()
            })
          }

          return { ...scan, progress }
        })

        return hasChanges ? updated : currentScans
      })
    }, 2000)

    return () => {
      clearInterval(attackTimer)
      clearInterval(scanTimer)
    }
  }, [setAttacks, setScans, broadcastEvent])

  return {
    attacks: attacks || [],
    scans: scans || [],
    broadcastEvent
  }
}

export function useRealtimeListener(
  callback: (event: RealtimeEvent) => void
) {
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<RealtimeEvent>
      callback(customEvent.detail)
    }

    window.addEventListener('realtime-update', handler)
    return () => window.removeEventListener('realtime-update', handler)
  }, [callback])
}
