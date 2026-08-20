import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRealtimeListener } from '@/hooks/use-realtime'
import { Lightning, CheckCircle, Bug } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

export function RealtimeNotifications() {
  const [events, setEvents] = useState<Array<{ id: string; type: string; message: string; timestamp: string }>>([])

  useRealtimeListener((event) => {
    let message = ''
    
    switch (event.type) {
      case 'attack_update':
        return
      case 'attack_complete':
        message = `Attack abgeschlossen: ${event.data.host} (${event.data.method})`
        break
      case 'scan_update':
        return
      case 'scan_complete':
        message = `Scan abgeschlossen: ${event.data.target}`
        break
      default:
        return
    }

    const newEvent = {
      id: `${Date.now()}-${Math.random()}`,
      type: event.type,
      message,
      timestamp: event.timestamp
    }

    setEvents(prev => [newEvent, ...prev].slice(0, 5))

    setTimeout(() => {
      setEvents(prev => prev.filter(e => e.id !== newEvent.id))
    }, 5000)
  })

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 space-y-2">
      <AnimatePresence>
        {events.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Card className="border-primary/30 bg-card/95 backdrop-blur-md shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {event.type.includes('attack') ? (
                    <Lightning className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" weight="fill" />
                  ) : (
                    <Bug className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" weight="fill" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-primary" weight="fill" />
                      <Badge variant="outline" className="text-[10px]">
                        {event.type.includes('attack') ? 'Attack' : 'Scan'}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground font-mono break-words">
                      {event.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                      {new Date(event.timestamp).toLocaleTimeString('de-DE')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
