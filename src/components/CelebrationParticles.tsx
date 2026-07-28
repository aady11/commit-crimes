import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  velocityX: number
  velocityY: number
}

const COLORS = ['#f5a623', '#2ecc71', '#e74c3c', '#ffd700', '#ff6b6b', '#4ecdc4']

export function CelebrationParticles() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
      y: window.innerHeight / 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 8 + 4,
      velocityX: (Math.random() - 0.5) * 20,
      velocityY: -(Math.random() * 15 + 5),
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ 
            x: p.x, 
            y: p.y, 
            opacity: 1,
            scale: 1,
          }}
          animate={{ 
            x: p.x + p.velocityX * 20, 
            y: p.y + p.velocityY * 15 + 500, 
            opacity: 0,
            scale: 0.2,
            rotate: Math.random() * 720 - 360,
          }}
          transition={{ 
            duration: 1.5 + Math.random() * 1, 
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  )
}