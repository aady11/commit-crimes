import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../state/GameContext'
import { levels } from '../data/levels'
import { GitGraph } from './GitGraph'
import { ActionBar } from './ActionBar'
import { GitCommandToast } from './GitCommandToast'
import { applyOperation, validateLevel } from '../utils/GameEngine'
import { sounds } from './SoundEngine'
import type { OperationType } from '../types/game'

export function GameBoard() {
  const { state, dispatch } = useGame()
  const [selectedCommitId, setSelectedCommitId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [gitCommand, setGitCommand] = useState<string | null>(null)

  const level = levels.find(l => l.id === state.currentLevelId)
  if (!level) return null

  useEffect(() => {
    if (gitCommand) {
      const timer = setTimeout(() => setGitCommand(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [gitCommand])

  const handleExecute = (operation: OperationType, targetCommitId: string, inputValue?: string) => {
    const snapshot = {
      commits: state.commits,
      branches: state.branches,
      tags: state.tags,
      currentBranchName: state.currentBranchName, // Save current branch for undo!
    }

    const result = applyOperation(
      operation, 
      targetCommitId, 
      state.commits, 
      state.branches,
      state.currentBranchName, // TELL THE ENGINE WHICH BRANCH WE ARE ON!
      inputValue
    )

    if (!result.success) {
      sounds.error()
      setError(result.message || 'Invalid operation')
      setTimeout(() => setError(null), 2500)
      return
    }

    sounds.commit()
    dispatch({ type: 'APPLY_OPERATION', operation: { type: operation, label: '', icon: '', description: '' }, snapshot })
    dispatch({ type: 'UPDATE_COMMITS', commits: result.commits })
    dispatch({ type: 'UPDATE_BRANCHES', branches: result.branches })
    
    // If the operation changed our current branch (like git switch), update it!
    if (result.newCurrentBranchName) {
      dispatch({ type: 'SET_CURRENT_BRANCH', branchName: result.newCurrentBranchName })
    }

    setSelectedCommitId(null)
    
    if (result.gitCommand) setGitCommand(result.gitCommand)

    const validation = validateLevel(result.commits, result.branches, level.validation)
    if (validation.isValid) {
      setTimeout(() => {
        sounds.celebration()
        dispatch({ type: 'COMPLETE_LEVEL', levelId: level.id })
      }, 1000)
    }
  }

  const handleUndo = () => {
    if (state.undoStack.length === 0) return
    sounds.undo()
    dispatch({ type: 'UNDO' })
    setSelectedCommitId(null)
    setGitCommand(null)
  }

  const handleBack = () => {
    sounds.click()
    dispatch({ type: 'SET_PHASE', phase: 'level-select' })
  }

  const handleReset = () => {
    sounds.undo()
    dispatch({
      type: 'START_LEVEL',
      levelId: level.id,
      commits: level.initialCommits,
      branches: level.initialBranches,
      tags: level.initialTags ?? [],
    })
    setSelectedCommitId(null)
    setError(null)
    setGitCommand(null)
  }

  const canUndo = state.undoStack.length > 0

  return (
    <div className="flex flex-col h-screen">
      {/* ── Header ── */}
      <div className="bg-void-light border-b border-void-lighter px-4 py-3 shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="min-w-0">
            <div className="font-display text-[10px] text-slate-dim tracking-widest uppercase truncate">
              Mission {String(level.id).padStart(2, '0')} · {level.disaster.replace(/-/g, ' ')}
            </div>
            <h2 className="font-display text-base sm:text-lg font-bold text-amber truncate">{level.title}</h2>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            
            {/* CURRENT BRANCH INDICATOR */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-void border border-void-lighter">
              <span className="font-display text-[10px] text-slate-dim tracking-widest">ON:</span>
              <span className="font-display text-xs font-bold text-emerald tracking-wider">{state.currentBranchName}</span>
            </div>

            <div className="text-right hidden sm:block">
              <div className="font-display text-[10px] text-slate-dim tracking-wider">OPS</div>
              <div className="font-display text-lg font-bold text-ghost">{state.operationsUsed}</div>
            </div>
            
            <motion.button
              onClick={handleUndo}
              disabled={!canUndo}
              className={`px-3 py-2 rounded-lg border font-display text-xs tracking-wider transition-colors
                ${canUndo ? 'border-amber/30 text-amber hover:bg-amber/10' : 'border-void-lighter text-slate-dim/30 cursor-not-allowed'}`}
              whileHover={canUndo ? { scale: 1.05 } : {}}
              whileTap={canUndo ? { scale: 0.95 } : {}}
            >
              ↩ Undo
            </motion.button>

            <motion.button
              onClick={handleReset}
              className="px-3 py-2 rounded-lg border border-void-lighter text-slate-dim font-display text-xs tracking-wider hover:border-amber/30 hover:text-amber transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ↻ Reset
            </motion.button>
            <motion.button
              onClick={handleBack}
              className="px-3 py-2 rounded-lg border border-void-lighter text-slate-dim font-display text-xs tracking-wider hover:border-crimson/30 hover:text-crimson transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ✕ Exit
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Objective Banner ── */}
      <div className="bg-void-lighter/30 border-b border-void-lighter px-4 py-3 shrink-0">
        <div className="max-w-5xl mx-auto flex items-start gap-3">
          <span className="text-crimson text-lg mt-0.5">⚠️</span>
          <div className="flex-1 min-w-0">
            <p className="text-ghost text-sm font-medium">{level.objective.description}</p>
            <p className="text-emerald text-xs mt-1 font-display tracking-wide">
              GOAL: {level.objective.goal}
            </p>
          </div>
          {level.objective.hint && (
            <div className="text-right hidden md:block shrink-0">
              <p className="text-slate-dim/50 text-[10px] font-display tracking-wider uppercase">HINT</p>
              <p className="text-slate-dim text-xs mt-0.5">{level.objective.hint}</p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <motion.div 
          className="bg-crimson/10 border-b border-crimson/30 px-4 py-2 text-center shrink-0"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="font-display text-xs text-crimson tracking-wider">✕ {error}</p>
        </motion.div>
      )}

      <div className="flex-1 overflow-auto bg-void">
        <GitGraph 
          commits={state.commits}
          branches={state.branches}
          selectedCommitId={selectedCommitId}
          onSelectCommit={(id) => {
            sounds.click()
            setSelectedCommitId(selectedCommitId === id ? null : id)
          }}
        />
      </div>

      <ActionBar 
        availableOperations={level.availableOperations}
        selectedCommitId={selectedCommitId}
        onExecute={handleExecute}
      />

      <GitCommandToast command={gitCommand} />
    </div>
  )
}