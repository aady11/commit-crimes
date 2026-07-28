import { useState } from 'react'
import { motion } from 'framer-motion'
import type { OperationType } from '../types/game'
import { sounds } from './SoundEngine'

interface ActionBarProps {
  availableOperations: OperationType[]
  selectedCommitId: string | null
  onExecute: (operation: OperationType, targetCommitId: string, inputValue?: string) => void
}

const operationInfo: Record<OperationType, { icon: string; label: string; needsInput: boolean; inputLabel: string; inputPlaceholder: string }> = {
  'branch-create': { icon: '🌿', label: 'Create Branch', needsInput: true, inputLabel: 'Branch name', inputPlaceholder: 'e.g. feature/login' },
  'branch-delete': { icon: '✂️', label: 'Delete Branch', needsInput: true, inputLabel: 'Branch to delete', inputPlaceholder: 'e.g. old-branch' },
  'branch-switch': { icon: '🔄', label: 'Switch Branch', needsInput: true, inputLabel: 'Branch name', inputPlaceholder: 'e.g. main' },
  'commit-amend': { icon: '✏️', label: 'Amend Commit', needsInput: true, inputLabel: 'New message', inputPlaceholder: 'e.g. fix: correct typo' },
  'commit-revert': { icon: '↩️', label: 'Revert Commit', needsInput: false, inputLabel: '', inputPlaceholder: '' },
  'reset-soft': { icon: '⏪', label: 'Reset Soft', needsInput: false, inputLabel: '', inputPlaceholder: '' },
  'reset-hard': { icon: '💣', label: 'Reset Hard', needsInput: false, inputLabel: '', inputPlaceholder: '' },
  'cherry-pick': { icon: '🍒', label: 'Cherry Pick', needsInput: false, inputLabel: '', inputPlaceholder: '' },
  'merge': { icon: '🔀', label: 'Merge', needsInput: true, inputLabel: 'Source branch', inputPlaceholder: 'e.g. feature/ui' },
  'rebase': { icon: '📋', label: 'Rebase', needsInput: false, inputLabel: '', inputPlaceholder: '' },
  'tag-create': { icon: '🏷️', label: 'Create Tag', needsInput: true, inputLabel: 'Tag name', inputPlaceholder: 'e.g. v1.0' },
  'tag-delete': { icon: '🗑️', label: 'Delete Tag', needsInput: false, inputLabel: '', inputPlaceholder: '' },
  'force-push': { icon: '🚀', label: 'Force Push', needsInput: false, inputLabel: '', inputPlaceholder: '' },
  'stash': { icon: '📦', label: 'Stash', needsInput: false, inputLabel: '', inputPlaceholder: '' },
  'reflog-restore': { icon: '🔮', label: 'Restore (Reflog)', needsInput: false, inputLabel: '', inputPlaceholder: '' },
}

export function ActionBar({ availableOperations, selectedCommitId, onExecute }: ActionBarProps) {
  const [selectedOp, setSelectedOp] = useState<OperationType | null>(null)
  const [inputValue, setInputValue] = useState('')

  const handleOpClick = (op: OperationType) => {
    sounds.click()
    if (selectedOp === op) {
      setSelectedOp(null)
      return
    }
    setSelectedOp(op)
    setInputValue('')
  }

  const handleExecute = () => {
    if (!selectedOp || !selectedCommitId) return
    onExecute(selectedOp, selectedCommitId, inputValue.trim() || undefined)
    setSelectedOp(null)
    setInputValue('')
  }

  return (
    <div className="bg-void-light border-t border-void-lighter p-4">
      <div className="max-w-5xl mx-auto">
        {/* Operation Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {availableOperations.map(op => {
            const info = operationInfo[op]
            const isActive = selectedOp === op
            return (
              <motion.button
                key={op}
                onClick={() => handleOpClick(op)}
                className={`
                  px-3 py-2 rounded-lg border font-display text-xs tracking-wider flex items-center gap-2
                  transition-colors duration-150
                  ${isActive 
                    ? 'bg-amber/20 border-amber text-amber' 
                    : 'bg-void border-void-lighter text-slate hover:border-slate-dim/50'}
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{info.icon}</span>
                <span>{info.label}</span>
              </motion.button>
            )
          })}
        </div>

        {/* Execution Area */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] font-display text-xs text-slate-dim">
            {selectedCommitId ? (
              <>Target: <span className="text-ghost font-bold">{selectedCommitId}</span></>
            ) : (
              <span className="text-slate-dim/60">↑ Click a commit on the graph to select it</span>
            )}
          </div>
          
          {selectedOp && operationInfo[selectedOp].needsInput && (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={operationInfo[selectedOp].inputPlaceholder}
              className="bg-void border border-void-lighter rounded-lg px-3 py-2 text-ghost font-display text-xs focus:outline-none focus:border-amber/50 w-56"
              onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
            />
          )}

          <motion.button
            onClick={handleExecute}
            disabled={!selectedOp || !selectedCommitId}
            className={`
              px-6 py-2.5 rounded-lg font-display text-xs font-bold tracking-wider uppercase
              transition-colors duration-150
              ${selectedOp && selectedCommitId 
                ? 'bg-amber text-void hover:bg-amber-dim cursor-pointer' 
                : 'bg-void-lighter text-slate-dim/50 cursor-not-allowed'}
            `}
            whileHover={selectedOp && selectedCommitId ? { scale: 1.05 } : {}}
            whileTap={selectedOp && selectedCommitId ? { scale: 0.95 } : {}}
          >
            Execute ⏎
          </motion.button>
        </div>
      </div>
    </div>
  )
}