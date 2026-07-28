import type { CommitNode, Branch, OperationType, LevelValidation } from '../types/game'

export interface ApplyResult {
  commits: CommitNode[]
  branches: Branch[]
  success: boolean
  message?: string
  gitCommand?: string
  newCurrentBranchName?: string
}

export function applyOperation(
  operation: OperationType,
  targetCommitId: string,
  currentCommits: CommitNode[],
  currentBranches: Branch[],
  currentBranchName: string,
  inputValue?: string
): ApplyResult {
  let commits = currentCommits.map(c => ({ ...c }))
  let branches = currentBranches.map(b => ({ ...b }))
  let gitCommand = ''
  let newCurrentBranchName = currentBranchName

  commits.forEach(c => c.isHead = false)

  switch (operation) {
    case 'branch-create': {
      const branchName = inputValue?.trim()
      if (!branchName) return { commits, branches, success: false, message: 'Branch name required' }
      if (branches.find(b => b.name === branchName)) return { commits, branches, success: false, message: 'Branch already exists' }
      
      const targetCommit = commits.find(c => c.id === targetCommitId)
      if (!targetCommit) return { commits, branches, success: false, message: 'Commit not found' }

      branches.push({ name: branchName, color: '#2ecc71', headCommitId: targetCommitId })
      targetCommit.isHead = true
      
      gitCommand = `git branch ${branchName} ${targetCommitId}`
      break
    }

    case 'reset-hard': {
      const targetBranch = branches.find(b => b.name === currentBranchName)
      if (!targetBranch) return { commits, branches, success: false, message: `Not on a valid branch` }
      
      targetBranch.headCommitId = targetCommitId
      const targetCommit = commits.find(c => c.id === targetCommitId)
      if (targetCommit) targetCommit.isHead = true
      
      gitCommand = `git reset --hard ${targetCommitId}`
      break
    }

    case 'commit-amend': {
      const newMessage = inputValue?.trim()
      if (!newMessage) return { commits, branches, success: false, message: 'New message required' }
      
      const commit = commits.find(c => c.id === targetCommitId)
      if (!commit) return { commits, branches, success: false, message: 'Commit not found' }
      
      commit.message = newMessage
      commit.isHead = true
      
      gitCommand = `git commit --amend -m "${newMessage}"`
      break
    }

    case 'reflog-restore': {
      const commit = commits.find(c => c.id === targetCommitId)
      if (!commit) return { commits, branches, success: false, message: 'Commit not found' }
      
      commit.isOrphaned = false
      commit.isHead = true
      
      const headBranch = branches.find(b => b.name === currentBranchName)
      if (headBranch) headBranch.headCommitId = targetCommitId
      
      gitCommand = `git checkout ${targetCommitId}`
      break
    }

    case 'branch-switch': {
      const branchName = inputValue?.trim()
      if (!branchName) return { commits, branches, success: false, message: 'Branch name required' }
      
      const branch = branches.find(b => b.name === branchName)
      if (!branch) return { commits, branches, success: false, message: 'Branch not found' }
      
      const commit = commits.find(c => c.id === branch.headCommitId)
      if (commit) commit.isHead = true
      
      newCurrentBranchName = branchName
      
      gitCommand = `git switch ${branchName}`
      break
    }

    case 'merge': {
      const sourceBranchName = inputValue?.trim()
      if (!sourceBranchName) return { commits, branches, success: false, message: 'Source branch name required' }
      
      const sourceBranch = branches.find(b => b.name === sourceBranchName)
      if (!sourceBranch) return { commits, branches, success: false, message: 'Source branch not found' }
      
      const targetBranch = branches.find(b => b.name === currentBranchName)
      if (!targetBranch) return { commits, branches, success: false, message: 'Current branch not found' }
      
      const mergeCommitId = `m${Date.now()}`
      commits.push({
        id: mergeCommitId,
        message: `merge: ${sourceBranchName} into ${currentBranchName}`,
        branch: currentBranchName,
        parents: [targetBranch.headCommitId, sourceBranch.headCommitId],
        isHead: true,
        color: targetBranch.color,
      })
      
      targetBranch.headCommitId = mergeCommitId
      
      gitCommand = `git merge ${sourceBranchName}`
      break
    }

    case 'branch-delete': {
      const branchName = inputValue?.trim()
      if (!branchName) return { commits, branches, success: false, message: 'Branch name required' }
      if (branchName === currentBranchName) return { commits, branches, success: false, message: 'Cannot delete current branch!' }
      
      branches = branches.filter(b => b.name !== branchName)
      gitCommand = `git branch -D ${branchName}`
      break
    }

    default:
      return { commits, branches, success: false, message: 'Operation not implemented yet' }
  }

  return { commits, branches, success: true, gitCommand, newCurrentBranchName }
}

export function validateLevel(
  commits: CommitNode[],
  branches: Branch[],
  validation: LevelValidation
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (validation.branchesMustExist) {
    validation.branchesMustExist.forEach(name => {
      if (!branches.find(b => b.name === name)) errors.push(`Branch '${name}' must exist`)
    })
  }

  if (validation.branchHeadMustBe) {
    Object.entries(validation.branchHeadMustBe).forEach(([branchName, commitId]) => {
      const branch = branches.find(b => b.name === branchName)
      if (!branch) errors.push(`Branch '${branchName}' doesn't exist`)
      else if (branch.headCommitId !== commitId) errors.push(`Branch '${branchName}' must point to commit ${commitId}`)
    })
  }

  if (validation.commitsMustHaveMessage) {
    validation.commitsMustHaveMessage.forEach(req => {
      const commit = commits.find(c => c.id === req.id)
      if (!commit) errors.push(`Commit ${req.id} is missing`)
      else if (commit.message !== req.message) errors.push(`Commit ${req.id} must have message: "${req.message}"`)
    })
  }

  if (validation.noSensitiveDataInHistory) {
    const mainBranch = branches.find(b => b.name === 'main')
    if (mainBranch) {
      const reachableIds = new Set<string>()
      const traceHistory = (id: string) => {
        if (reachableIds.has(id)) return
        reachableIds.add(id)
        const c = commits.find(c => c.id === id)
        if (c) c.parents.forEach(traceHistory)
      }
      traceHistory(mainBranch.headCommitId)
      
      const sensitiveInMain = commits.find(c => c.isSensitive && reachableIds.has(c.id))
      if (sensitiveInMain) errors.push(`History still contains sensitive data in commit ${sensitiveInMain.id}`)
    } else {
      errors.push("Main branch missing")
    }
  }

  return { isValid: errors.length === 0, errors }
}