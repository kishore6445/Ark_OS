'use client'

import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useBrand } from '@/lib/brand-context'
import type { VictoryTarget, PowerMove, Task, Commitment } from '@/components/department-page'
import { calculateDepartmentScore } from '@/lib/score-calculations'
import { TimePeriodSelector } from '@/components/time-period-selector'
import { ExecutionStreak } from '@/components/execution-streak'
import { QuarterSelector, type QuarterOption } from '@/components/quarter-selector'
import { AccountabilitySections } from '@/components/accountability-sections'
import { Flame, Target, CheckCircle2, AlertCircle, XCircle, Zap, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DepartmentExecutionHeroProps {
  departmentName: string
  victoryTargets: VictoryTarget[]
  powerMoves: PowerMove[]
  calculatedScore?: ReturnType<typeof calculateDepartmentScore>
  selectedPeriod: string
  onPeriodChange: (period: string) => void
  currentWeekStart: Date
  onNavigate: (direction: 'prev' | 'next') => void
  onWeeklyReview: () => void
  onAddPowerMove?: () => void
  onAddTask?: () => void
  onAddCommitment?: () => void
  selectedQuarter: QuarterOption
  onQuarterChange: (quarter: QuarterOption) => void
  coreObjective?: {
    title: string
    description: string
  }
}

export function DepartmentExecutionHero({
  departmentName,
  victoryTargets,
  powerMoves,
  calculatedScore,
  selectedPeriod,
  onPeriodChange,
  currentWeekStart,
  onNavigate,
  onWeeklyReview,
  onAddPowerMove,
  onAddTask,
  onAddCommitment,
  selectedQuarter,
  onQuarterChange,
  coreObjective,
}: DepartmentExecutionHeroProps) {
  const { brandConfig, isReady } = useBrand()
  const [showStreak, setShowStreak] = useState(false)

  const companyWIG = brandConfig?.companyWIG

  const score = useMemo(() => {
    if (calculatedScore) return calculatedScore
    return calculateDepartmentScore(victoryTargets, powerMoves)
  }, [calculatedScore, victoryTargets, powerMoves])

  const powerMoveStats = useMemo(() => {
    const completed = powerMoves.filter((pm) => pm.progress >= pm.targetPerCycle).length
    const total = powerMoves.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    return { completed, total, percentage }
  }, [powerMoves])

  const currentStreak = powerMoveStats.percentage >= 70 ? 4 : 0
  const bestStreak = 6
  const weeklyHistory = [45, 52, 68, 72, 78, 85, 72, powerMoveStats.percentage]

  const getQuarterlyTargetData = () => {
    if (selectedQuarter === 'annual') {
      return {
        target: victoryTargets.reduce((sum, vt) => sum + vt.target, 0),
        achieved: victoryTargets.reduce((sum, vt) => sum + vt.achieved, 0),
        greenCount: score.greenCount,
        totalTargets: score.totalTargets,
      }
    }

    const quarterIndex = ['Q1', 'Q2', 'Q3', 'Q4'].indexOf(selectedQuarter)
    let totalTarget = 0
    let totalAchieved = 0
    let greenCount = 0

    victoryTargets.forEach((vt) => {
      const quarters = (vt as any).quarters || []
      const quarterData = quarters[quarterIndex]
      if (quarterData) {
        totalTarget += quarterData.target
        totalAchieved += quarterData.achieved
        const progress = quarterData.target > 0 ? (quarterData.achieved / quarterData.target) * 100 : 0
        if (progress >= 70) greenCount++
      } else {
        totalTarget += Math.round(vt.target / 4)
        totalAchieved += Math.round(vt.achieved / 4)
        const progress = vt.target > 0 ? (vt.achieved / vt.target) * 100 : 0
        if (progress >= 70) greenCount++
      }
    })

    return {
      target: totalTarget,
      achieved: totalAchieved,
      greenCount,
      totalTargets: victoryTargets.length,
    }
  }

  const quarterData = getQuarterlyTargetData()
  const greenTargets = quarterData.greenCount
  const totalTargets = quarterData.totalTargets

  const getExecutionStatus = (): 'winning' | 'at-risk' | 'losing' => {
    if (powerMoveStats.total === 0) return 'losing'
    if (powerMoveStats.percentage >= 70) return 'winning'
    if (powerMoveStats.percentage >= 50) return 'at-risk'
    return 'losing'
  }

  const executionStatus = getExecutionStatus()

  const statusColors = {
    winning: {
      color: '#16A34A',
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      badge: 'ON TRACK',
      borderAccent: 'border-t-[#16A34A]',
      icon: CheckCircle2,
    },
    'at-risk': {
      color: '#F59E0B',
      bg: 'bg-[#F59E0B]',
      text: 'text-white',
      badge: 'CAUTION',
      borderAccent: 'border-t-[#F59E0B]',
      icon: AlertCircle,
    },
    losing: {
      color: '#DC2626',
      bg: 'bg-[#DC2626]',
      text: 'text-white',
      badge: 'TRENDING AT RISK',
      borderAccent: 'border-t-[#DC2626]',
      icon: XCircle,
    },
  }

  const status = statusColors[executionStatus]
  const StatusIcon = status.icon

  // Mock team member data
  const teamMembers = [
    { name: 'Ravi Kumar', score: 92, streak: 21, status: 'on-track' },
    { name: 'Pooja Sharma', score: 78, streak: 14, status: 'on-track' },
    { name: 'Amit Mishra', score: 64, streak: 9, status: 'at-risk' },
    { name: 'Neha Kapoor', score: 48, streak: 6, status: 'at-risk' },
    { name: 'Vijay Singh', score: 36, streak: 3, status: 'at-risk' },
    { name: 'Kavya Bri', score: 28, streak: 2, status: 'losing' },
  ]

  if (!isReady || !companyWIG || !score) {
    return <Card className='shadow-sm'><div className='px-6 py-8'>Loading...</div></Card>
  }

  return (
    <div className='space-y-6'>
      {/* HERO SECTION - 2 Column Layout */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* LEFT: TEAM EXECUTION RATE */}
        <div className='bg-white rounded-2xl border border-stone-200/60 shadow-sm p-8 flex flex-col items-center justify-center min-h-[320px]'>
          <p className='text-xs font-bold uppercase tracking-widest text-stone-500 mb-4'>Team Execution Rate</p>
          
          {/* Giant Score Display */}
          <div className='flex items-center justify-center gap-4 mb-8'>
            <div className='text-7xl font-black text-stone-900'>{powerMoveStats.percentage}%</div>
            <div className='w-40 h-40 relative flex items-center justify-center'>
              <svg className='w-full h-full -rotate-90' viewBox='0 0 100 100'>
                <circle cx='50' cy='50' r='45' fill='none' stroke='#E5E7EB' strokeWidth='4' />
                <circle
                  cx='50'
                  cy='50'
                  r='45'
                  fill='none'
                  stroke={status.color}
                  strokeWidth='4'
                  strokeDasharray={`${2.83 * 45 * (powerMoveStats.percentage / 100)} ${2.83 * 45}`}
                  strokeLinecap='round'
                  className='transition-all duration-700'
                />
              </svg>
            </div>
          </div>

          {/* Status */}
          <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6', status.bg, status.text)}>
            <StatusIcon className='h-4 w-4' />
            <span className='text-sm font-bold'>{status.badge}</span>
          </div>

          {/* Trend */}
          <div className='flex items-center gap-2 text-sm font-semibold text-stone-600 mb-6'>
            <TrendingUp className='h-4 w-4 text-emerald-600' />
            Last 7 Days
          </div>

          {/* Completion Stats */}
          <div className='text-center pt-6 border-t border-stone-200/60'>
            <p className='text-4xl font-black text-stone-900 mb-1'>{powerMoveStats.completed} / {powerMoveStats.total}</p>
            <p className='text-xs font-semibold text-stone-500 uppercase'>Power Moves Completed</p>
          </div>
        </div>

        {/* RIGHT: VICTORY TARGETS */}
        <div className='bg-white rounded-2xl border border-stone-200/60 shadow-sm p-8'>
          <p className='text-xs font-bold uppercase tracking-widest text-stone-500 mb-6'>Department Victory Targets</p>
          <p className='text-xs text-stone-600 mb-6 font-semibold'>Results measured weekly</p>

          <div className='space-y-4'>
            {victoryTargets.slice(0, 3).map((vt, index) => {
              const progress = vt.target > 0 ? (vt.achieved / vt.target) * 100 : 0
              const statusColor = progress >= 70 ? '#22C55E' : progress >= 50 ? '#F59E0B' : '#EF4444'
              const statusLabel = progress >= 70 ? 'On Pace' : progress >= 50 ? 'Needs Momentum' : 'Behind'
              const isPrimary = index === 0

              return (
                <div key={vt.id} className='flex items-start gap-4 pb-4 border-b border-stone-200/60 last:border-0 last:pb-0'>
                  <div className='w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-lg' style={{ backgroundColor: `${statusColor}20` }}>
                    <div className='text-center'>
                      <p className='text-2xl font-black' style={{ color: statusColor }}>{Math.round(progress)}%</p>
                    </div>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2'>
                      <p className='text-sm font-bold text-stone-900'>{(vt as any).title || vt.name}</p>
                      {isPrimary && <span className='text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded'>Primary</span>}
                    </div>
                    <p className='text-xs text-stone-500 mt-1'>{vt.achieved} / {vt.target} {vt.unit || ''}</p>
                    <p className='text-xs font-semibold mt-2' style={{ color: statusColor }}>{statusLabel}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer Stats */}
          <div className='mt-6 pt-6 border-t border-stone-200/60 flex items-center justify-center gap-3'>
            <span className='text-3xl font-black text-stone-900'>{greenTargets}</span>
            <span className='text-stone-400 font-bold'>/</span>
            <span className='text-2xl font-black text-stone-600'>{totalTargets}</span>
            <span className='text-xs font-semibold text-stone-500 ml-2'>On Track</span>
          </div>
        </div>
      </div>

      {/* MOMENTUM STRIP - 4 KPI Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='bg-white p-6 rounded-xl border border-stone-200/60 shadow-sm'>
          <p className='text-xs font-bold text-stone-500 uppercase tracking-wide mb-3'>Weekly Momentum</p>
          <p className='text-3xl font-black text-stone-900 mb-1'>+18%</p>
          <p className='text-xs text-stone-500 font-semibold'>vs last week</p>
        </div>
        <div className='bg-white p-6 rounded-xl border border-stone-200/60 shadow-sm'>
          <p className='text-xs font-bold text-stone-500 uppercase tracking-wide mb-3'>Consistency</p>
          <p className='text-3xl font-black text-emerald-600 mb-1'>92%</p>
          <p className='text-xs text-stone-500 font-semibold'>Great consistency</p>
        </div>
        <div className='bg-white p-6 rounded-xl border border-stone-200/60 shadow-sm'>
          <p className='text-xs font-bold text-stone-500 uppercase tracking-wide mb-3'>Targets On Pace</p>
          <p className='text-3xl font-black text-amber-600 mb-1'>{greenTargets} / {totalTargets}</p>
          <p className='text-xs text-stone-500 font-semibold'>On track</p>
        </div>
        <div className='bg-white p-6 rounded-xl border border-stone-200/60 shadow-sm'>
          <p className='text-xs font-bold text-stone-500 uppercase tracking-wide mb-3'>Execution Trend</p>
          <p className='text-3xl font-black text-blue-600 mb-1'>Rising</p>
          <p className='text-xs text-stone-500 font-semibold'>Last 7 days</p>
        </div>
      </div>

      {/* TEAM MOMENTUM LEADERBOARD */}
      <div className='bg-white rounded-2xl border border-stone-200/60 shadow-sm p-8'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <p className='text-lg font-black uppercase tracking-wide text-stone-900'>Team Momentum</p>
            <p className='text-xs text-stone-500 mt-1 font-semibold'>Ranked by execution score</p>
          </div>
          <Button variant='ghost' size='sm' className='text-blue-600 font-semibold'>View full leaderboard →</Button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4'>
          {teamMembers.map((member, index) => {
            const statusColor = member.status === 'on-track' ? '#22C55E' : member.status === 'at-risk' ? '#F59E0B' : '#EF4444'
            return (
              <div key={member.name} className='flex flex-col items-center text-center p-4 rounded-xl bg-stone-50 border border-stone-200/60'>
                <div className='text-2xl font-black text-stone-400 mb-2'>{index + 1}</div>
                <div className='w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold' style={{ backgroundColor: statusColor }}>
                  {member.name.split(' ')[0][0]}
                </div>
                <p className='text-sm font-bold text-stone-900'>{member.name}</p>
                <p className='text-3xl font-black mt-3' style={{ color: statusColor }}>{member.score}%</p>
                <div className='flex items-center gap-1 mt-3 justify-center'>
                  <Flame className='h-4 w-4 text-orange-500' />
                  <p className='text-xs font-bold text-orange-600'>{member.streak} Day Streak</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* INSIGHT CARDS - 3 Column */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Most Consistent Member */}
        <div className='bg-white rounded-2xl border border-stone-200/60 shadow-sm p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center'>
              <CheckCircle2 className='h-5 w-5 text-emerald-600' />
            </div>
            <p className='text-sm font-black uppercase tracking-wide text-stone-900'>Most Consistent Member</p>
          </div>
          <div className='w-12 h-12 rounded-full mx-auto mb-3 bg-emerald-500 flex items-center justify-center text-white font-bold text-lg'>RK</div>
          <p className='text-center font-bold text-stone-900'>Ravi Kumar</p>
          <p className='text-center text-sm text-stone-500 mt-1 font-semibold'>92% Consistency</p>
          <p className='text-center text-xs text-stone-400 mt-3'>21 Day Execution Streak</p>
        </div>

        {/* At Risk Member */}
        <div className='bg-white rounded-2xl border border-stone-200/60 shadow-sm p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center'>
              <AlertCircle className='h-5 w-5 text-amber-600' />
            </div>
            <p className='text-sm font-black uppercase tracking-wide text-stone-900'>At Risk Member</p>
          </div>
          <div className='w-12 h-12 rounded-full mx-auto mb-3 bg-amber-500 flex items-center justify-center text-white font-bold text-lg'>AM</div>
          <p className='text-center font-bold text-stone-900'>Amit Mishra</p>
          <p className='text-center text-sm text-stone-500 mt-1 font-semibold'>64% Consistency</p>
          <p className='text-center text-xs text-amber-600 mt-3 font-bold'>Needs Momentum</p>
        </div>

        {/* Team Energy */}
        <div className='bg-white rounded-2xl border border-stone-200/60 shadow-sm p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center'>
              <Zap className='h-5 w-5 text-emerald-600' />
            </div>
            <p className='text-sm font-black uppercase tracking-wide text-stone-900'>Team Energy</p>
          </div>
          <div className='text-center'>
            <div className='w-16 h-16 rounded-full mx-auto mb-3 bg-emerald-100 flex items-center justify-center'>
              <div className='text-3xl'>😊</div>
            </div>
            <p className='text-center text-sm font-bold text-stone-900'>High Momentum</p>
            <p className='text-center text-xs text-stone-500 mt-1 font-semibold'>Team is executing well!</p>
          </div>
        </div>
      </div>

      {/* TIME PERIOD & CONTROLS */}
      <div className='bg-white rounded-2xl border border-stone-200/60 shadow-sm p-6'>
        <div className='flex items-center justify-between gap-4 flex-wrap'>
          <TimePeriodSelector 
            selectedPeriod={selectedPeriod}
            onPeriodChange={onPeriodChange}
            currentWeekStart={currentWeekStart}
            onNavigate={onNavigate}
          />
          <div className='flex items-center gap-3'>
            <QuarterSelector value={selectedQuarter} onChange={onQuarterChange} />
            <Button 
              onClick={() => setShowStreak(!showStreak)} 
              size='sm' 
              variant='outline'
              className='gap-1.5 text-xs'
            >
              <Flame className='h-4 w-4' />
              {currentStreak > 0 ? `${currentStreak}w Streak` : 'Streak'}
            </Button>
            <Button 
              onClick={onWeeklyReview} 
              size='sm' 
              variant='outline'
              className='gap-1.5 text-xs'
            >
              <Target className='h-4 w-4' />
              Review
            </Button>
          </div>
        </div>

        {showStreak && (
          <div className='px-5 py-3 border-t border-stone-200 bg-stone-50 mt-4 rounded-lg'>
            <ExecutionStreak currentStreak={currentStreak} bestStreak={bestStreak} weeklyHistory={weeklyHistory} />
          </div>
        )}
      </div>

      {/* POWER MOVES SECTION - Horizontal Cards */}
      <div>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <p className='text-lg font-black uppercase tracking-wide text-stone-900'>Power Moves</p>
            <p className='text-xs text-stone-500 mt-1 font-semibold'>Lead Measures - Recurring Actions</p>
          </div>
          <Button onClick={onAddPowerMove} size='sm' className='gap-1.5'>
            <Zap className='h-4 w-4' />
            Add Power Move
          </Button>
        </div>

        {powerMoves.length === 0 ? (
          <div className='bg-white p-8 rounded-xl border border-stone-200/60 text-center'>
            <p className='text-sm text-stone-500'>No power moves yet for this period.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
            {powerMoves.map((pm, index) => {
              const percentage = pm.targetPerCycle > 0 ? Math.round((pm.progress / pm.targetPerCycle) * 100) : 0
              const isCompleted = pm.progress >= pm.targetPerCycle
              const isPrimary = index < 2

              const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-red-500', 'bg-cyan-500']
              const bgColor = colors[index % colors.length]

              return (
                <div key={pm.id} className='bg-white rounded-xl border border-stone-200/60 shadow-sm p-5 hover:shadow-md transition-all flex flex-col'>
                  <div className='flex items-start justify-between mb-3'>
                    <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold', bgColor)}>
                      {pm.name?.[0]?.toUpperCase() || '○'}
                    </div>
                    {isPrimary && <span className='text-xs font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded'>Primary</span>}
                  </div>
                  
                  <h3 className='text-sm font-bold text-stone-900 mb-1 line-clamp-2'>{pm.name}</h3>
                  <p className='text-xs text-stone-500 font-semibold mb-3'>{pm.frequency}</p>

                  <div className='mb-4'>
                    <div className='flex justify-between items-center mb-1'>
                      <span className='text-xs font-semibold text-stone-600'>{pm.progress}/{pm.targetPerCycle}</span>
                      <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', isCompleted ? 'bg-emerald-100 text-emerald-700' : percentage > 0 ? 'bg-amber-100 text-amber-700' : 'bg-stone-200 text-stone-700')}>
                        {percentage}%
                      </span>
                    </div>
                    <div className='h-1.5 bg-stone-200 rounded-full overflow-hidden'>
                      <div
                        className={cn('h-full transition-all duration-500', isCompleted ? 'bg-emerald-600' : percentage > 0 ? 'bg-amber-500' : 'bg-stone-300')}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  <Button size='sm' disabled={isCompleted} className={cn('w-full text-xs font-bold mt-auto', isCompleted ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-emerald-600 hover:bg-emerald-700 text-white')}>
                    {isCompleted ? '✓ Done' : 'Complete'}
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ACCOUNTABILITY SECTIONS */}
      <AccountabilitySections 
        powerMoves={powerMoves}
        tasks={[]}
        commitments={[]}
        onAddPowerMove={onAddPowerMove}
        onAddTask={onAddTask}
        onAddCommitment={onAddCommitment}
      />
    </div>
  )
}
