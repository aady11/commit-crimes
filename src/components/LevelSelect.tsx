import { motion, type Variants } from 'framer-motion'
import { useGame } from '../state/GameContext'
import { levels } from '../data/levels'
import { sounds } from './SoundEngine'

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
}

const item: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } },
}

export function LevelSelect() {
  const { state, dispatch } = useGame()

  const isUnlocked = (levelId: number) => {
    if (levelId === 1) return true
    return state.completedLevels.includes(levelId - 1)
  }

  const isCompleted = (levelId: number) => state.completedLevels.includes(levelId)

  const handleSelect = (level: (typeof levels)[number]) => {
    if (!isUnlocked(level.id)) {
      sounds.error()
      return
    }
    sounds.click()
    sounds.levelStart()
    dispatch({
      type: 'START_LEVEL',
      levelId: level.id,
      commits: level.initialCommits,
      branches: level.initialBranches,
      tags: level.initialTags ?? [],
    })
  }

  const handleBack = () => {
    sounds.click()
    dispatch({ type: 'SET_PHASE', phase: 'title' })
  }

  const disasterIcons: Record<string, string> = {
    'direct-commit-to-main': '💥',
    'wrong-message': '💬',
    'deleted-branch': '🗑️',
    'sensitive-commit': '🔑',
    'merge-conflict': '⚔️',
    'force-push': '🚀',
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 50% 40% at 50% 30%, var(--color-amber-glow), transparent)`,
        }}
      />

      <motion.div
        className="relative z-10 text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-2">
          <span className="text-gradient-amber">MISSIONS</span>
        </h2>
        <p className="text-slate-dim text-sm font-display tracking-wider">
          {state.completedLevels.length} / {levels.length} completed
        </p>
      </motion.div>

      <motion.div
        className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {levels.map((level) => {
          const unlocked = isUnlocked(level.id)
          const completed = isCompleted(level.id)

          return (
            <motion.div
              key={level.id}
              variants={item}
              className="group relative"
            >
              <motion.button
                onClick={() => handleSelect(level)}
                disabled={!unlocked}
                className={`
                  relative w-full text-left rounded-xl p-5 border transition-all duration-200
                  ${unlocked
                    ? 'bg-void-light border-void-lighter hover:border-amber/40 cursor-pointer'
                    : 'bg-void-light/50 border-void-lighter/30 cursor-not-allowed opacity-50'
                  }
                  ${completed ? 'border-emerald/30' : ''}
                `}
                whileHover={unlocked ? { y: -4, scale: 1.02 } : {}}
                whileTap={unlocked ? { scale: 0.98 } : {}}
                onMouseEnter={() => unlocked && sounds.hover()}
              >
                {unlocked && (
                  <div className="absolute inset-0 rounded-xl bg-amber/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}

                {completed && (
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald flex items-center justify-center shadow-lg shadow-emerald/30">
                    <span className="text-void text-xs font-bold">✓</span>
                  </div>
                )}

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display text-xs text-slate-dim tracking-widest">
                      MISSION {String(level.id).padStart(2, '0')}
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((d) => (
                        <div
                          key={d}
                          className={`w-1.5 h-1.5 rounded-full ${
                            d <= level.difficulty
                              ? 'bg-amber'
                              : 'bg-void-lighter'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-2xl mt-0.5">
                      {unlocked ? disasterIcons[level.disaster] : '🔒'}
                    </span>
                    <div>
                      <h3
                        className={`font-display text-sm font-bold leading-tight ${
                          unlocked ? 'text-ghost' : 'text-slate-dim'
                        }`}
                      >
                        {unlocked ? level.title : 'CLASSIFIED'}
                      </h3>
                    </div>
                  </div>

                  {unlocked && (
                    <p className="text-slate-dim text-xs leading-relaxed mt-2 line-clamp-2">
                      {level.objective.description}
                    </p>
                  )}

                  {!unlocked && (
                    <p className="text-slate-dim/40 text-xs font-display tracking-wider mt-2">
                      Complete Mission {String(level.id - 1).padStart(2, '0')} to unlock
                    </p>
                  )}
                </div>
              </motion.button>
            </motion.div>
          )
        })}
      </motion.div>

      <motion.button
        onClick={handleBack}
        className="relative z-10 mt-10 px-6 py-2 rounded-lg border border-void-lighter
                   text-slate-dim font-display text-xs tracking-wider uppercase
                   hover:border-slate-dim/30 hover:text-slate transition-colors duration-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
      >
        ← Back
      </motion.button>
    </div>
  )
}