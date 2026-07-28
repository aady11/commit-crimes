import { motion, AnimatePresence } from 'framer-motion'

interface GitCommandToastProps {
  command: string | null
}

export function GitCommandToast({ command }: GitCommandToastProps) {
  return (
    <AnimatePresence>
      {command && (
        <motion.div
          key={command}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="flex items-center gap-3 bg-void-light border border-amber/30 rounded-xl px-5 py-3 shadow-2xl shadow-amber/10">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-crimson" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald" />
            </div>
            <div className="h-4 w-px bg-void-lighter" />
            <span className="font-display text-slate-dim text-xs">$</span>
            <span className="font-display text-amber text-sm font-bold tracking-wide">
              {command}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}