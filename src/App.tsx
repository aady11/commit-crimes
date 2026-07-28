import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GameProvider, useGame } from './state/GameContext'
import { TitleScreen } from './components/TitleScreen'
import { LevelSelect } from './components/LevelSelect'
import { GameBoard } from './components/GameBoard'
import { GrainOverlay } from './components/GrainOverlay'
import { sounds } from './components/SoundEngine'

function SuccessScreen() {
  const { state, dispatch } = useGame()

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div 
        className="text-center"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="font-display text-4xl font-bold text-emerald mb-2">MISSION COMPLETE</h2>
        <p className="text-slate text-sm mb-8">Operations used: {state.operationsUsed}</p>
        <div className="flex gap-4 justify-center">
          <motion.button
            onClick={() => {
              sounds.click()
              dispatch({ type: 'SET_PHASE', phase: 'level-select' })
            }}
            className="px-6 py-3 rounded-lg bg-void-light border border-void-lighter text-ghost font-display text-xs tracking-wider hover:border-emerald/30 transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            NEXT MISSION
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

function GameShell() {
  const { state, dispatch } = useGame()

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && state.phase === 'title') {
        dispatch({ type: 'SET_PHASE', phase: 'level-select' })
      }
      if (e.key === 'Escape' && state.phase === 'level-select') {
        dispatch({ type: 'SET_PHASE', phase: 'title' })
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [state.phase, dispatch])

  return (
    <div className="relative min-h-screen bg-void overflow-hidden">
      <GrainOverlay />

      <AnimatePresence mode="wait">
        {state.phase === 'title' && (
          <motion.div key="title" exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            <TitleScreen />
          </motion.div>
        )}

        {state.phase === 'level-select' && (
          <motion.div 
            key="level-select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <LevelSelect />
          </motion.div>
        )}

        {state.phase === 'playing' && (
          <motion.div 
            key="playing" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="h-screen"
          >
            <GameBoard />
          </motion.div>
        )}

        {state.phase === 'success' && (
          <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SuccessScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  return (
    <GameProvider>
      <GameShell />
    </GameProvider>
  )
}