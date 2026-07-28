import { motion } from 'framer-motion'
import { useGame } from '../state/GameContext'
import { sounds } from './SoundEngine'

export function TitleScreen() {
  const { dispatch } = useGame()

  const handleStart = () => {
    sounds.click()
    sounds.levelStart()
    dispatch({ type: 'SET_PHASE', phase: 'level-select' })
  }

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center min-h-screen px-4 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* ── Background radial glow ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 45%, var(--color-amber-glow), transparent)`,
        }}
      />

      {/* ── Animated "terminal" lines behind the title ── */}
      <div className="absolute top-1/2 -translate-y-1/2 left-8 right-8 flex flex-col gap-1 opacity-[0.06] font-display text-sm select-none overflow-hidden hidden sm:flex">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.06, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="whitespace-nowrap"
          >
            {fakeLines[i]}
          </motion.div>
        ))}
      </div>

      {/* ── Main Title ── */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-5 sm:gap-6"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Badge */}
        <motion.div
          className="px-3 py-1 rounded-full border border-amber-dim/30 bg-amber/5 text-amber-dim font-display text-xs tracking-widest uppercase"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        >
          git puzzle game
        </motion.div>

        {/* Title */}
        <h1 className="font-display text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight text-center leading-none">
          <span className="text-gradient-amber">COMMIT</span>
          <br />
          <span className="text-crimson">CRIMES</span>
        </h1>

        {/* Subtitle */}
        <motion.p
          className="text-slate text-base sm:text-lg md:text-xl max-w-md text-center leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          Fix Git disasters. No terminal required.
          <br />
          <span className="text-slate-dim">Drag, drop, and save the repo.</span>
        </motion.p>

        {/* ── Start Button ── */}
        <motion.button
          onClick={handleStart}
          className="group relative mt-2 sm:mt-4 px-8 py-3 rounded-lg font-display text-sm font-bold tracking-wider uppercase
                     bg-amber text-void border-2 border-amber
                     hover:bg-amber-dim hover:border-amber-dim
                     active:scale-[0.97] transition-colors duration-150"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onMouseEnter={() => sounds.hover()}
        >
          {/* Glow ring behind button */}
          <div className="absolute -inset-1 rounded-lg bg-amber/20 blur-md group-hover:bg-amber/30 transition-all duration-300" />
          <span className="relative z-10">START MISSION</span>
        </motion.button>

        {/* ── Keyboard hint ── */}
        <motion.span
          className="text-slate-dim/50 font-display text-xs tracking-wider hidden sm:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.4 }}
        >
          press enter ↵
        </motion.span>
      </motion.div>

      {/* ── Bottom decoration ── */}
      <motion.div
        className="absolute bottom-6 sm:bottom-8 flex items-center gap-2 text-slate-dim/40 font-display text-xs tracking-wider"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.4 }}
      >
        <span className="inline-block w-2 h-2 rounded-full bg-emerald animate-pulse-glow" />
        <span>6 levels · browser only · no install</span>
      </motion.div>
    </motion.div>
  )
}

const fakeLines = [
  '$ git log --oneline --graph --all',
  '* abc1234 (HEAD -> main) oops: committed to main directly',
  '* def5678 (feature/auth) add login page',
  '| * ghi9012 (feature/ui) redesign dashboard',
  '|/  ',
  '* jkl3456 initial commit',
  '$ git branch -D feature/auth',
  'error: The branch \'feature/auth\' is not fully merged.',
  '$ git push --force',
  'Everything up-to-date. Force push complete.',
  '$ git merge feature/ui',
  'CONFLICT (content): Merge conflict in App.tsx',
]