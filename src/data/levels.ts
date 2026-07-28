import type { Level } from '../types/game'

export const levels: Level[] = [
  {
    id: 1,
    slug: 'direct-commit',
    title: 'Direct Commit to Main',
    disaster: 'direct-commit-to-main',
    objective: {
      description: 'You committed a feature directly to main instead of a branch. Classic rookie move.',
      goal: 'Move the commit onto a feature branch and reset main.',
      hint: 'Create a branch here, switch to main, then reset main.',
    },
    initialCommits: [
      { id: 'a1', message: 'init: project setup', branch: 'main', parents: [], color: '#f5a623' },
      { id: 'b2', message: 'add: base components', branch: 'main', parents: ['a1'], color: '#f5a623' },
      { id: 'c3', message: 'feat: add login button', branch: 'main', parents: ['b2'], isHead: true, color: '#f5a623' },
    ],
    initialBranches: [
      { name: 'main', color: '#f5a623', headCommitId: 'c3' },
    ],
    availableOperations: ['branch-create', 'branch-switch', 'reset-hard'],
    validation: {
      branchesMustExist: ['feature/login'],
      branchHeadMustBe: { 'main': 'b2', 'feature/login': 'c3' },
    },
    difficulty: 1,
  },
  {
    id: 2,
    slug: 'wrong-message',
    title: 'Wrong Commit Message',
    disaster: 'wrong-message',
    objective: {
      description: 'Your last commit says "fix stuff". Your lead engineer is not amused.',
      goal: 'Change the commit message to something meaningful.',
      hint: 'Amend lets you rewrite the last commit message.',
    },
    initialCommits: [
      { id: 'a1', message: 'init: project setup', branch: 'main', parents: [], color: '#f5a623' },
      { id: 'b2', message: 'fix stuff', branch: 'main', parents: ['a1'], isHead: true, color: '#f5a623' },
    ],
    initialBranches: [
      { name: 'main', color: '#f5a623', headCommitId: 'b2' },
    ],
    availableOperations: ['commit-amend'],
    validation: {
      commitsMustHaveMessage: [{ id: 'b2', message: 'fix: resolve null pointer in auth handler' }],
    },
    difficulty: 1,
  },
  {
    id: 3,
    slug: 'deleted-branch',
    title: 'Deleted Branch',
    disaster: 'deleted-branch',
    objective: {
      description: 'You accidentally deleted the feature/auth branch. The commits are still out there... somewhere.',
      goal: 'Recover the deleted branch by finding the orphaned commits.',
      hint: 'Orphaned commits aren\'t gone. Find the tip of the branch and create a new branch pointing to it.',
    },
    initialCommits: [
      { id: 'a1', message: 'init: project setup', branch: 'main', parents: [], color: '#f5a623' },
      { id: 'b2', message: 'add: base components', branch: 'main', parents: ['a1'], color: '#f5a623' },
      { id: 'd4', message: 'feat: add auth module', branch: '', parents: ['b2'], isOrphaned: true, color: '#e74c3c' },
      { id: 'e5', message: 'feat: add login page', branch: '', parents: ['d4'], isOrphaned: true, isHead: true, color: '#e74c3c' },
    ],
    initialBranches: [
      { name: 'main', color: '#f5a623', headCommitId: 'b2' },
    ],
    availableOperations: ['branch-create'],
    validation: {
      branchesMustExist: ['feature/auth'],
      branchHeadMustBe: { 'feature/auth': 'e5' },
    },
    difficulty: 2,
  },
  {
    id: 4,
    slug: 'sensitive-commit',
    title: 'Sensitive Data Committed',
    disaster: 'sensitive-commit',
    objective: {
      description: 'You committed your AWS keys to the repo. The internet is forever — unless you act fast.',
      goal: 'Remove the sensitive commit from main\'s history.',
      hint: 'Switch to main, reset hard before the bad commit.',
    },
    initialCommits: [
      { id: 'a1', message: 'init: project setup', branch: 'main', parents: [], color: '#f5a623' },
      { id: 'b2', message: 'add: config with API keys 🔑', branch: 'main', parents: ['a1'], isSensitive: true, color: '#e74c3c' },
      { id: 'c3', message: 'feat: add dashboard', branch: 'main', parents: ['b2'], color: '#f5a623' },
      { id: 'd4', message: 'feat: add user profile', branch: 'main', parents: ['c3'], isHead: true, color: '#f5a623' },
    ],
    initialBranches: [
      { name: 'main', color: '#f5a623', headCommitId: 'd4' },
    ],
    availableOperations: ['branch-create', 'branch-switch', 'reset-hard'],
    validation: {
      noSensitiveDataInHistory: true,
      headMustBeOn: 'main',
    },
    difficulty: 2,
  },
  {
    id: 5,
    slug: 'merge-conflict',
    title: 'Merge Conflict',
    disaster: 'merge-conflict',
    objective: {
      description: 'Two branches diverged. Now they can\'t agree on the same file. Classic team disaster.',
      goal: 'Switch to main, then merge feature/ui into main.',
      hint: 'Make sure you are on main before you merge!',
    },
    initialCommits: [
      { id: 'a1', message: 'init: project setup', branch: 'main', parents: [], color: '#f5a623' },
      { id: 'b2', message: 'add: base components', branch: 'main', parents: ['a1'], color: '#f5a623' },
      { id: 'c3', message: 'feat: update header', branch: 'main', parents: ['b2'], color: '#f5a623' },
      { id: 'd4', message: 'feat: update footer', branch: 'feature/ui', parents: ['b2'], color: '#2ecc71' },
      { id: 'e5', message: 'feat: add sidebar', branch: 'feature/ui', parents: ['d4'], color: '#2ecc71' },
    ],
    initialBranches: [
      { name: 'main', color: '#f5a623', headCommitId: 'c3' },
      { name: 'feature/ui', color: '#2ecc71', headCommitId: 'e5' },
    ],
    availableOperations: ['branch-switch', 'merge'],
    validation: {
      branchesMustExist: ['feature/ui', 'main'],
    },
    difficulty: 3,
  },
  {
    id: 6,
    slug: 'force-push',
    title: 'Force Push Disaster',
    disaster: 'force-push',
    objective: {
      description: 'Your teammate force-pushed and overwrote your commits. Three days of work — gone. Or is it?',
      goal: 'Recover the lost commits and create a feature/payments branch pointing to them.',
      hint: 'Find the tip of your lost work (e5) and create a branch pointing to it.',
    },
    initialCommits: [
      { id: 'a1', message: 'init: project setup', branch: 'main', parents: [], color: '#f5a623' },
      { id: 'bp', message: 'teammate: "fix typo"', branch: 'main', parents: ['a1'], color: '#f5a623' },
      { id: 'c3', message: 'feat: add payment flow', branch: '', parents: ['a1'], isOrphaned: true, color: '#e74c3c' },
      { id: 'd4', message: 'feat: add checkout', branch: '', parents: ['c3'], isOrphaned: true, color: '#e74c3c' },
      { id: 'e5', message: 'feat: add receipt page', branch: '', parents: ['d4'], isOrphaned: true, color: '#e74c3c' },
    ],
    initialBranches: [
      { name: 'main', color: '#f5a623', headCommitId: 'bp' },
    ],
    availableOperations: ['branch-create', 'branch-switch'],
    validation: {
      branchesMustExist: ['feature/payments'],
      branchHeadMustBe: { 'feature/payments': 'e5', 'main': 'bp' }, // FIXED: Merged into one line!
    },
    difficulty: 3,
  },
]