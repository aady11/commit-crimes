import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { GameState, GamePhase, CommitNode, Branch, Tag, Operation, BoardSnapshot } from '../types/game'

const savedProgress = localStorage.getItem('commit-crimes-progress')
const initialCompleted = savedProgress ? JSON.parse(savedProgress) : []

const initialState: GameState = {
  phase: 'title',
  currentLevelId: null,
  completedLevels: initialCompleted,
  commits: [],
  branches: [],
  tags: [],
  operationsUsed: 0,
  undoStack: [],
  moveHistory: [],
  currentBranchName: 'main',
}

type Action =
  | { type: 'SET_PHASE'; phase: GamePhase }
  | { type: 'START_LEVEL'; levelId: number; commits: CommitNode[]; branches: Branch[]; tags: Tag[] }
  | { type: 'COMPLETE_LEVEL'; levelId: number }
  | { type: 'APPLY_OPERATION'; operation: Operation; snapshot: BoardSnapshot }
  | { type: 'UPDATE_COMMITS'; commits: CommitNode[] }
  | { type: 'UPDATE_BRANCHES'; branches: Branch[] }
  | { type: 'UPDATE_TAGS'; tags: Tag[] }
  | { type: 'SET_CURRENT_BRANCH'; branchName: string }
  | { type: 'UNDO' }
  | { type: 'RESET_LEVEL' }
  | { type: 'RESET_GAME' }

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.phase }

    case 'START_LEVEL': {
      const startingBranch = action.branches[0]?.name || 'main'
      return {
        ...state,
        phase: 'playing',
        currentLevelId: action.levelId,
        commits: action.commits,
        branches: action.branches,
        tags: action.tags,
        operationsUsed: 0,
        undoStack: [],
        moveHistory: [],
        currentBranchName: startingBranch,
      }
    }

    case 'COMPLETE_LEVEL': {
      if (state.completedLevels.includes(action.levelId)) return state
      const newCompleted = [...state.completedLevels, action.levelId]
      localStorage.setItem('commit-crimes-progress', JSON.stringify(newCompleted))
      return { ...state, phase: 'success', completedLevels: newCompleted }
    }

    case 'APPLY_OPERATION':
      return {
        ...state,
        operationsUsed: state.operationsUsed + 1,
        moveHistory: [...state.moveHistory, action.operation],
        undoStack: [...state.undoStack, action.snapshot],
      }

    case 'UPDATE_COMMITS':
      return { ...state, commits: action.commits }

    case 'UPDATE_BRANCHES':
      return { ...state, branches: action.branches }

    case 'UPDATE_TAGS':
      return { ...state, tags: action.tags }

    case 'SET_CURRENT_BRANCH':
      return { ...state, currentBranchName: action.branchName }

    case 'UNDO': {
      if (state.undoStack.length === 0) return state
      const previousState = state.undoStack[state.undoStack.length - 1]
      const newStack = state.undoStack.slice(0, -1)
      return {
        ...state,
        commits: previousState.commits,
        branches: previousState.branches,
        tags: previousState.tags,
        currentBranchName: previousState.currentBranchName, // Restore branch on undo!
        operationsUsed: state.operationsUsed - 1,
        moveHistory: state.moveHistory.slice(0, -1),
        undoStack: newStack,
      }
    }

    case 'RESET_LEVEL': {
      const startingBranch = state.branches[0]?.name || 'main'
      return {
        ...state,
        phase: 'playing',
        operationsUsed: 0,
        undoStack: [],
        moveHistory: [],
        currentBranchName: startingBranch,
      }
    }

    case 'RESET_GAME': {
      localStorage.removeItem('commit-crimes-progress')
      return { ...initialState, completedLevels: [] }
    }

    default:
      return state
  }
}

const GameContext = createContext<{
  state: GameState
  dispatch: React.Dispatch<Action>
} | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame must be used within GameProvider')
  return context
}