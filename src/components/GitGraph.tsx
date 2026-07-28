import { motion } from 'framer-motion'
import type { CommitNode, Branch } from '../types/game'

interface GitGraphProps {
  commits: CommitNode[]
  branches: Branch[]
  selectedCommitId: string | null
  onSelectCommit: (id: string) => void
}

interface PositionedCommit extends CommitNode {
  x: number
  y: number
  laneName: string
}

export function GitGraph({ commits, branches, selectedCommitId, onSelectCommit }: GitGraphProps) {
  const NODE_SPACING_X = 160
  const LANE_SPACING_Y = 90
  const PADDING_X = 100
  const PADDING_Y = 60

  // Assign lanes (Y positions) to branches
  const lanes: Record<string, number> = {}
  let laneIndex = 0
  
  // Main always gets the first lane
  if (branches.some(b => b.name === 'main')) {
    lanes['main'] = laneIndex
    laneIndex++
  }
  
  // Other branches get their own lanes
  branches.forEach(b => {
    if (b.name !== 'main' && !(b.name in lanes)) {
      lanes[b.name] = laneIndex
      laneIndex++
    }
  })
  
  // Orphaned commits get their own lane
  if (commits.some(c => c.isOrphaned) && !('orphaned' in lanes)) {
    lanes['orphaned'] = laneIndex
    laneIndex++
  }

  // Topological sort for X positioning
  const visited = new Set<string>()
  const ordered: CommitNode[] = []

  function visit(id: string) {
    if (visited.has(id)) return
    const commit = commits.find(c => c.id === id)
    if (!commit) return
    visited.add(id)
    commit.parents.forEach(pid => visit(pid))
    ordered.push(commit)
  }

  // Visit all commits in a stable order
  commits.forEach(c => visit(c.id))
  // Add any unvisited (shouldn't happen, but safety)
  commits.forEach(c => {
    if (!ordered.find(o => o.id === c.id)) ordered.push(c)
  })

  // Position commits
  const positioned: PositionedCommit[] = ordered.map((c, index) => {
    const laneName = c.isOrphaned ? 'orphaned' : c.branch
    const lane = lanes[laneName] ?? 0
    return {
      ...c,
      x: PADDING_X + index * NODE_SPACING_X,
      y: PADDING_Y + lane * LANE_SPACING_Y,
      laneName,
    }
  })

  const svgWidth = Math.max(600, (ordered.length + 1) * NODE_SPACING_X + PADDING_X)
  const svgHeight = (laneIndex + 1) * LANE_SPACING_Y + PADDING_Y

  return (
    <div className="relative w-full overflow-x-auto py-8">
      <svg 
        width={svgWidth} 
        height={svgHeight}
        className="mx-auto"
        style={{ minWidth: svgWidth }}
      >
        {/* Lane background stripes */}
        {Object.entries(lanes).map(([name, lane]) => (
          <g key={`lane-${name}`}>
            <rect
              x={0}
              y={PADDING_Y + lane * LANE_SPACING_Y - 30}
              width={svgWidth}
              height={60}
              fill={lane % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent'}
              rx={8}
            />
            <text 
              x={16} 
              y={PADDING_Y + lane * LANE_SPACING_Y + 5} 
              className="font-display"
              fontSize={11}
              fill="rgba(138,146,164,0.3)"
              fontWeight={600}
            >
              {name === 'orphaned' ? 'lost & found' : name}
            </text>
          </g>
        ))}

        {/* Lines connecting commits */}
        {positioned.map(commit => 
          commit.parents.map(parentId => {
            const parent = positioned.find(c => c.id === parentId)
            if (!parent) return null
            
            // Determine line color based on branch
            const lineColor = commit.isOrphaned ? '#5a6275' : (commit.color || '#5a6275')
            
            return (
              <motion.line
                key={`line-${commit.id}-${parentId}`}
                x1={parent.x}
                y1={parent.y}
                x2={commit.x}
                y2={commit.y}
                stroke={lineColor}
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray={commit.isOrphaned ? '6 4' : 'none'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              />
            )
          })
        )}

        {/* Commit Nodes */}
        {positioned.map(commit => {
          const isSelected = selectedCommitId === commit.id
          const isHead = branches.some(b => b.headCommitId === commit.id)
          const nodeColor = commit.isSensitive ? '#e74c3c' : commit.isOrphaned ? '#5a6275' : (commit.color || '#f5a623')

          return (
            <g 
              key={commit.id} 
              onClick={() => onSelectCommit(commit.id)} 
              style={{ cursor: 'pointer' }}
            >
              {/* Selection ring */}
              {isSelected && (
                <motion.circle
                  cx={commit.x}
                  cy={commit.y}
                  r={22}
                  fill="none"
                  stroke={nodeColor}
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.8 }}
                  transition={{ duration: 0.3 }}
                />
              )}
              
              {/* Outer glow */}
              <circle
                cx={commit.x}
                cy={commit.y}
                r={18}
                fill={nodeColor}
                opacity={0.1}
              />

              {/* Main node circle */}
              <motion.circle
                cx={commit.x}
                cy={commit.y}
                r={14}
                fill={nodeColor}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                whileHover={{ scale: 1.25 }}
                style={{ cursor: 'pointer' }}
              />

              {/* Inner dot for HEAD */}
              {isHead && (
                <circle
                  cx={commit.x}
                  cy={commit.y}
                  r={4}
                  fill="#08080c"
                />
              )}

              {/* HEAD label */}
              {isHead && (
                <motion.text
                  x={commit.x}
                  y={commit.y - 26}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={700}
                  fontFamily="var(--font-display)"
                  fill="#f5a623"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  HEAD
                </motion.text>
              )}

              {/* Sensitive indicator */}
              {commit.isSensitive && (
                <text 
                  x={commit.x} 
                  y={commit.y + 5} 
                  textAnchor="middle" 
                  fontSize={12}
                >
                  🔑
                </text>
              )}

              {/* Commit ID label */}
              <text
                x={commit.x}
                y={commit.y + 32}
                textAnchor="middle"
                fontSize={9}
                fontFamily="var(--font-display)"
                fill="rgba(138,146,164,0.5)"
              >
                {commit.id}
              </text>

              {/* Commit Message label */}
              <text
                x={commit.x}
                y={commit.y + 46}
                textAnchor="middle"
                fontSize={10}
                fontFamily="var(--font-display)"
                fill="rgba(232,230,227,0.6)"
              >
                {commit.message.length > 24 ? commit.message.slice(0, 24) + '...' : commit.message}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}