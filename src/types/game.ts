// src/types/game.ts

export type CommitId = string

export interface CommitNode {
  id: CommitId
  message: string
  branch: string
  parents: CommitId[]
  tags?: string[]
  isHead?: boolean
  isOrphaned?: boolean
  isSensitive?: boolean
  color?: string
}

export interface Branch {
  name: string
  color: string
  headCommitId: CommitId
  isDeleted?: boolean
  isRemote?: boolean
}

export interface Tag {
  name: string
  commitId: CommitId
}

export type OperationType =
  | 'branch-create'
  | 'branch-delete'
  | 'branch-switch'
  | 'commit-amend'
  | 'commit-revert'
  | 'reset-soft'
  | 'reset-hard'
  | 'cherry-pick'
  | 'merge'
  | 'rebase'
  | 'tag-create'
  | 'tag-delete'
  | 'force-push'
  | 'stash'
  | 'reflog-restore'

export interface Operation {
  type: OperationType
  label: string
  icon: string
  description: string
  targetCommitId?: CommitId
  targetBranch?: string
  sourceBranch?: string
}

export type DisasterType =
  | 'direct-commit-to-main'
  | 'deleted-branch'
  | 'force-push'
  | 'merge-conflict'
  | 'sensitive-commit'
  | 'wrong-message'
  | 'diverged-branches'
  | 'detached-head'
  | 'unwanted-file-committed'

export interface LevelObjective {
  description: string
  goal: string
  hint?: string
}

export interface LevelValidation {
  branchesMustExist?: string[]
  branchesMustNotExist?: string[]
  headMustBeOn?: string
  branchHeadMustBe?: Record<string, CommitId>
  commitsMustHaveMessage?: { id: CommitId; message: string }[] // <-- THE FIX: Added [] here!
  commitsMustNotExist?: CommitId[]
  noSensitiveDataInHistory?: boolean
  tagsMustExist?: { name: string; commitId: CommitId }[]
  tagsMustNotExist?: string[]
  mainMustBeClean?: boolean
}

export interface Level {
  id: number
  slug: string
  title: string
  disaster: DisasterType
  objective: LevelObjective
  initialCommits: CommitNode[]
  initialBranches: Branch[]
  initialTags?: Tag[]
  availableOperations: OperationType[]
  validation: LevelValidation
  difficulty: 1 | 2 | 3
}

export interface BoardSnapshot {
  commits: CommitNode[]
  branches: Branch[]
  tags: Tag[]
  currentBranchName: string
}

export type GamePhase = 'title' | 'level-select' | 'playing' | 'success' | 'game-over'

export interface GameState {
  phase: GamePhase
  currentLevelId: number | null
  completedLevels: number[]
  commits: CommitNode[]
  branches: Branch[]
  tags: Tag[]
  operationsUsed: number
  undoStack: BoardSnapshot[]
  moveHistory: Operation[]
  currentBranchName: string
}