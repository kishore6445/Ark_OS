export type Brand = string
export type Department = "marketing" | "sales" | "accounts" | "team-tools" | "execution" | "rd" | "leadership"
export type Quarter = "Q1" | "Q2" | "Q3" | "Q4"

export interface QuarterlyTarget {
  quarter: Quarter
  target: number
  achieved: number
}

export interface DepartmentData {
  id: Department
  name: string
  icon: string
  coreObjective?: {
    title: string
    description: string
  }
  victoryTargets: VictoryTarget[]
  powerMoves: PowerMove[]
  tasks: Task[]
  teamMembers: TeamMember[]
  commitments?: Commitment[]
}

export interface VictoryTarget {
  id: string
  name: string
  target: number
  achieved: number
  unit: string
  owner: string
  linkedPowerMoves: string[]
  quarters?: QuarterlyTarget[]
}

export interface PowerMove {
  id: string
  name: string
  frequency: "daily" | "weekly" | "monthly"
  target: number
  actual: number
  owner: string
  linkedVictoryTarget: string
}

export interface Task {
  id: string
  title: string
  dueDate: string
  owner: string
  status: "pending" | "completed"
  priority: "high" | "medium" | "low"
}

export interface Commitment {
  id: string
  title: string
  dueDate: string
  owner: string
  status: "pending" | "completed"
}

export interface TeamMember {
  id: string
  name: string
  role: string
  email: string
  avatar?: string
}

export interface CompanyWIG {
  goal: string
  description: string
  deadline: string
  yearTarget: number
  yearAchieved: number
  unit: string
  quarters: QuarterlyTarget[]
}

export interface BrandStructure {
  brand: Brand
  departments: Record<Department, DepartmentData>
}

export const BRAND_DEPARTMENTS: Record<Brand, Partial<Record<Department, DepartmentData>>> = {
  "warrior-systems": {
    marketing: {
      id: "marketing",
      name: "Marketing",
      icon: "📱",
      coreObjective: {
        title: "Lead Generation",
        description: "Create predictable, qualified demand for Sales",
      },
      victoryTargets: [
        {
          id: "vt-ws-m-1",
          name: "Qualified Conversations Touched",
          target: 1500,
          achieved: 1350,
          unit: "conversations",
          owner: "Sarah M.",
          linkedPowerMoves: ["pm-ws-m-1", "pm-ws-m-2"],
          quarters: [
            { quarter: "Q1", target: 375, achieved: 380 },
            { quarter: "Q2", target: 375, achieved: 370 },
            { quarter: "Q3", target: 375, achieved: 350 },
            { quarter: "Q4", target: 375, achieved: 250 },
          ],
        },
        {
          id: "vt-ws-m-2",
          name: "Demo Requests Generated",
          target: 100,
          achieved: 92,
          unit: "requests",
          owner: "Mike R.",
          linkedPowerMoves: ["pm-ws-m-3"],
          quarters: [
            { quarter: "Q1", target: 25, achieved: 28 },
            { quarter: "Q2", target: 25, achieved: 26 },
            { quarter: "Q3", target: 25, achieved: 22 },
            { quarter: "Q4", target: 25, achieved: 16 },
          ],
        },
      ],
      powerMoves: [
        {
          id: "pm-ws-m-1",
          name: "Webinars Conducted",
          frequency: "weekly",
          target: 3,
          actual: 3,
          owner: "Sarah M.",
          linkedVictoryTarget: "vt-ws-m-1",
        },
        {
          id: "pm-ws-m-2",
          name: "LinkedIn Outreach Sessions",
          frequency: "daily",
          target: 5,
          actual: 5,
          owner: "Sarah M.",
          linkedVictoryTarget: "vt-ws-m-1",
        },
        {
          id: "pm-ws-m-3",
          name: "Landing Page A/B Tests",
          frequency: "weekly",
          target: 2,
          actual: 2,
          owner: "Mike R.",
          linkedVictoryTarget: "vt-ws-m-2",
        },
        {
          id: "pm-ws-m-4",
          name: "Blog Posts Written",
          frequency: "weekly",
          target: 4,
          actual: 4,
          owner: "Lisa K.",
          linkedVictoryTarget: "vt-ws-m-3",
        },
      ],
      tasks: [
        {
          id: "t-ws-m-1",
          title: "Finalize Q1 campaign strategy",
          dueDate: "Today",
          owner: "Sarah M.",
          status: "completed",
          priority: "high",
        },
        {
          id: "t-ws-m-2",
          title: "Review social media analytics",
          dueDate: "Tomorrow",
          owner: "Mike R.",
          status: "pending",
          priority: "medium",
        },
        {
          id: "t-ws-m-3",
          title: "Update brand guidelines document",
          dueDate: "Friday",
          owner: "Lisa K.",
          status: "pending",
          priority: "low",
        },
      ],
      commitments: [
        {
          id: "c-ws-m-1",
          title: "Launch new email nurture sequence",
          dueDate: "Jan 20, 2026",
          owner: "Sarah M.",
          status: "pending",
        },
        {
          id: "c-ws-m-2",
          title: "Complete competitor analysis report",
          dueDate: "Jan 22, 2026",
          owner: "Mike R.",
          status: "completed",
        },
      ],
      teamMembers: [
        { id: "tm-ws-m-1", name: "Sarah M.", role: "Marketing Lead", email: "sarah@warriorsystems.com" },
        { id: "tm-ws-m-2", name: "Mike R.", role: "Digital Marketing Specialist", email: "mike@warriorsystems.com" },
        { id: "tm-ws-m-3", name: "Lisa K.", role: "Content Manager", email: "lisa@warriorsystems.com" },
      ],
    },
    sales: {
      id: "sales",
      name: "Sales",
      icon: "💼",
      coreObjective: {
        title: "Revenue Conversion",
        description: "Convert qualified demand into paying customers with predictable velocity",
      },
      victoryTargets: [
        {
          id: "vt-ws-s-1",
          name: "New Client Contracts Closed",
          target: 30,
          achieved: 27,
          unit: "contracts",
          owner: "Amit P.",
          linkedPowerMoves: ["pm-ws-s-1", "pm-ws-s-2"],
          quarters: [
            { quarter: "Q1", target: 7, achieved: 7 },
            { quarter: "Q2", target: 7, achieved: 7 },
            { quarter: "Q3", target: 7, achieved: 7 },
            { quarter: "Q4", target: 9, achieved: 9 },
          ],
        },
        {
          id: "vt-ws-s-2",
          name: "Qualified Leads in Pipeline",
          target: 100,
          achieved: 95,
          unit: "leads",
          owner: "Neha M.",
          linkedPowerMoves: ["pm-ws-s-3"],
          quarters: [
            { quarter: "Q1", target: 25, achieved: 25 },
            { quarter: "Q2", target: 25, achieved: 25 },
            { quarter: "Q3", target: 25, achieved: 25 },
            { quarter: "Q4", target: 25, achieved: 25 },
          ],
        },
      ],
      powerMoves: [
        {
          id: "pm-ws-s-1",
          name: "Client Meetings",
          frequency: "daily",
          target: 5,
          actual: 5,
          owner: "Amit P.",
          linkedVictoryTarget: "vt-ws-s-1",
        },
        {
          id: "pm-ws-s-2",
          name: "Proposal Presentations",
          frequency: "weekly",
          target: 5,
          actual: 5,
          owner: "Amit P.",
          linkedVictoryTarget: "vt-ws-s-1",
        },
        {
          id: "pm-ws-s-3",
          name: "Follow-up Calls",
          frequency: "daily",
          target: 10,
          actual: 10,
          owner: "Neha M.",
          linkedVictoryTarget: "vt-ws-s-2",
        },
      ],
      tasks: [
        {
          id: "t-ws-s-1",
          title: "Prepare quarterly sales forecast",
          dueDate: "Today",
          owner: "Amit P.",
          status: "completed",
          priority: "high",
        },
        {
          id: "t-ws-s-2",
          title: "Update CRM pipeline status",
          dueDate: "Today",
          owner: "Neha M.",
          status: "completed",
          priority: "high",
        },
        {
          id: "t-ws-s-3",
          title: "Send proposals to 5 qualified prospects",
          dueDate: "Tomorrow",
          owner: "Amit P.",
          status: "pending",
          priority: "high",
        },
      ],
      commitments: [
        {
          id: "c-ws-s-1",
          title: "Close 3 enterprise deals by month end",
          dueDate: "Jan 31, 2026",
          owner: "Amit P.",
          status: "pending",
        },
        {
          id: "c-ws-s-2",
          title: "Achieve 95% pipeline accuracy",
          dueDate: "Jan 25, 2026",
          owner: "Neha M.",
          status: "completed",
        },
      ],
      teamMembers: [
        { id: "tm-ws-s-1", name: "Amit P.", role: "Sales Director", email: "amit@warriorsystems.com" },
        { id: "tm-ws-s-2", name: "Neha M.", role: "Account Executive", email: "neha@warriorsystems.com" },
      ],
    },
    accounts: {
      id: "accounts",
      name: "Accounts / Compliance / Finance",
      icon: "📊",
      coreObjective: {
        title: "Financial Integrity",
        description: "Sustain cash flow, ensure compliance, enable informed financial decisions",
      },
      victoryTargets: [
        {
          id: "vt-ws-a-1",
          name: "Revenue Target Hit",
          target: 5000000,
          achieved: 4750000,
          unit: "INR",
          owner: "Priya K.",
          linkedPowerMoves: ["pm-ws-a-1"],
          quarters: [
            { quarter: "Q1", target: 1250000, achieved: 1250000 },
            { quarter: "Q2", target: 1250000, achieved: 1250000 },
            { quarter: "Q3", target: 1250000, achieved: 1250000 },
            { quarter: "Q4", target: 1250000, achieved: 1250000 },
          ],
        },
        {
          id: "vt-ws-a-2",
          name: "Invoice Collection Rate",
          target: 95,
          achieved: 93,
          unit: "%",
          owner: "Rahul S.",
          linkedPowerMoves: ["pm-ws-a-2"],
          quarters: [
            { quarter: "Q1", target: 23.75, achieved: 23.75 },
            { quarter: "Q2", target: 23.75, achieved: 23.75 },
            { quarter: "Q3", target: 23.75, achieved: 23.75 },
            { quarter: "Q4", target: 23.75, achieved: 23.75 },
          ],
        },
      ],
      powerMoves: [
        {
          id: "pm-ws-a-1",
          name: "Invoice Follow-ups",
          frequency: "weekly",
          target: 5,
          actual: 5,
          owner: "Priya K.",
          linkedVictoryTarget: "vt-ws-a-1",
        },
        {
          id: "pm-ws-a-2",
          name: "Revenue Forecasting Sessions",
          frequency: "weekly",
          target: 2,
          actual: 2,
          owner: "Priya K.",
          linkedVictoryTarget: "vt-ws-a-1",
        },
        {
          id: "pm-ws-a-3",
          name: "Financial Audits",
          frequency: "weekly",
          target: 1,
          actual: 1,
          owner: "Rahul S.",
          linkedVictoryTarget: "vt-ws-a-2",
        },
      ],
      tasks: [
        {
          id: "t-ws-a-1",
          title: "Complete Q4 financial review and projections",
          dueDate: "Today",
          owner: "Priya K.",
          status: "completed",
          priority: "high",
        },
        {
          id: "t-ws-a-2",
          title: "Process all pending invoices for December",
          dueDate: "Tomorrow",
          owner: "Rahul S.",
          status: "pending",
          priority: "high",
        },
        {
          id: "t-ws-a-3",
          title: "Review and update compliance documentation",
          dueDate: "Friday",
          owner: "Priya K.",
          status: "pending",
          priority: "medium",
        },
      ],
      commitments: [
        {
          id: "c-ws-a-1",
          title: "Achieve 98% invoice accuracy",
          dueDate: "Jan 31, 2026",
          owner: "Priya K.",
          status: "pending",
        },
        {
          id: "c-ws-a-2",
          title: "Complete annual audit preparation",
          dueDate: "Jan 25, 2026",
          owner: "Rahul S.",
          status: "completed",
        },
      ],
      teamMembers: [
        { id: "tm-ws-a-1", name: "Priya K.", role: "Finance Lead", email: "priya@warriorsystems.com" },
        { id: "tm-ws-a-2", name: "Rahul S.", role: "Accounts Manager", email: "rahul@warriorsystems.com" },
      ],
    },
    "team-tools": {
      id: "team-tools",
      name: "Team Tools & SOPs",
      icon: "🔧",
      coreObjective: {
        title: "Operational Efficiency",
        description: "Build systems that scale, reduce friction, enable teams to execute consistently",
      },
      victoryTargets: [
        {
          id: "vt-ws-t-1",
          name: "SOPs Documented",
          target: 100,
          achieved: 92,
          unit: "SOPs",
          owner: "Ravi T.",
          linkedPowerMoves: ["pm-ws-t-1"],
          quarters: [
            { quarter: "Q1", target: 25, achieved: 25 },
            { quarter: "Q2", target: 25, achieved: 25 },
            { quarter: "Q3", target: 25, achieved: 25 },
            { quarter: "Q4", target: 25, achieved: 25 },
          ],
        },
        {
          id: "vt-ws-t-2",
          name: "Team Training Sessions",
          target: 24,
          achieved: 22,
          unit: "sessions",
          owner: "Anna P.",
          linkedPowerMoves: ["pm-ws-t-2"],
          quarters: [
            { quarter: "Q1", target: 6, achieved: 6 },
            { quarter: "Q2", target: 6, achieved: 6 },
            { quarter: "Q3", target: 6, achieved: 6 },
            { quarter: "Q4", target: 6, achieved: 6 },
          ],
        },
        {
          id: "vt-ws-t-3",
          name: "Process Improvement Initiatives",
          target: 12,
          achieved: 11,
          unit: "initiatives",
          owner: "Ravi T.",
          linkedPowerMoves: ["pm-ws-t-3"],
          quarters: [
            { quarter: "Q1", target: 3, achieved: 3 },
            { quarter: "Q2", target: 3, achieved: 3 },
            { quarter: "Q3", target: 3, achieved: 3 },
            { quarter: "Q4", target: 3, achieved: 3 },
          ],
        },
      ],
      powerMoves: [
        {
          id: "pm-ws-t-1",
          name: "SOP Creation Sessions",
          frequency: "weekly",
          target: 5,
          actual: 5,
          owner: "Ravi T.",
          linkedVictoryTarget: "vt-ws-t-1",
        },
        {
          id: "pm-ws-t-2",
          name: "Team Training Workshops",
          frequency: "weekly",
          target: 2,
          actual: 2,
          owner: "Anna P.",
          linkedVictoryTarget: "vt-ws-t-2",
        },
        {
          id: "pm-ws-t-3",
          name: "Process Review Meetings",
          frequency: "weekly",
          target: 1,
          actual: 1,
          owner: "Ravi T.",
          linkedVictoryTarget: "vt-ws-t-3",
        },
      ],
      tasks: [
        {
          id: "t-ws-t-1",
          title: "Complete onboarding process documentation",
          dueDate: "Today",
          owner: "Ravi T.",
          status: "completed",
          priority: "high",
        },
        {
          id: "t-ws-t-2",
          title: "Conduct quarterly team performance reviews",
          dueDate: "Friday",
          owner: "Anna P.",
          status: "pending",
          priority: "medium",
        },
        {
          id: "t-ws-t-3",
          title: "Update client handoff procedures",
          dueDate: "Thursday",
          owner: "Ravi T.",
          status: "pending",
          priority: "medium",
        },
      ],
      commitments: [
        {
          id: "c-ws-t-1",
          title: "Launch new project management workflow",
          dueDate: "Jan 25, 2026",
          owner: "Ravi T.",
          status: "completed",
        },
        {
          id: "c-ws-t-2",
          title: "Complete all department SOPs",
          dueDate: "Jan 31, 2026",
          owner: "Anna P.",
          status: "pending",
        },
      ],
      teamMembers: [
        { id: "tm-ws-t-1", name: "Ravi T.", role: "Operations Lead", email: "ravi@warriorsystems.com" },
        { id: "tm-ws-t-2", name: "Anna P.", role: "Training Coordinator", email: "anna@warriorsystems.com" },
      ],
    },
    execution: {
      id: "execution",
      name: "Execution & Operations",
      icon: "⚙️",
      coreObjective: {
        title: "Accountability & Cadence",
        description: "Ensure commitments are tracked, bottlenecks removed, execution is visible",
      },
      victoryTargets: [
        {
          id: "vt-ws-e-1",
          name: "Weekly Commitment Completion Rate",
          target: 95,
          achieved: 94,
          unit: "%",
          owner: "Mike R.",
          linkedPowerMoves: ["pm-ws-e-1"],
          quarters: [
            { quarter: "Q1", target: 23.75, achieved: 23.75 },
            { quarter: "Q2", target: 23.75, achieved: 23.75 },
            { quarter: "Q3", target: 23.75, achieved: 23.75 },
            { quarter: "Q4", target: 23.75, achieved: 23.75 },
          ],
        },
        {
          id: "vt-ws-e-2",
          name: "Operational Bottlenecks Resolved",
          target: 50,
          achieved: 48,
          unit: "bottlenecks",
          owner: "Operations",
          linkedPowerMoves: ["pm-ws-e-2"],
          quarters: [
            { quarter: "Q1", target: 12.5, achieved: 12.5 },
            { quarter: "Q2", target: 12.5, achieved: 12.5 },
            { quarter: "Q3", target: 12.5, achieved: 12.5 },
            { quarter: "Q4", target: 12.5, achieved: 12.5 },
          ],
        },
        {
          id: "vt-ws-e-3",
          name: "Process Automation Implemented",
          target: 15,
          achieved: 14,
          unit: "automations",
          owner: "Mike R.",
          linkedPowerMoves: ["pm-ws-e-3"],
          quarters: [
            { quarter: "Q1", target: 3.75, achieved: 3.75 },
            { quarter: "Q2", target: 3.75, achieved: 3.75 },
            { quarter: "Q3", target: 3.75, achieved: 3.75 },
            { quarter: "Q4", target: 3.75, achieved: 3.75 },
          ],
        },
      ],
      powerMoves: [
        {
          id: "pm-ws-e-1",
          name: "Daily Standup Meetings",
          frequency: "daily",
          target: 5,
          actual: 5,
          owner: "All Leads",
          linkedVictoryTarget: "vt-ws-e-1",
        },
        {
          id: "pm-ws-e-2",
          name: "Bottleneck Analysis Sessions",
          frequency: "weekly",
          target: 3,
          actual: 3,
          owner: "Mike R.",
          linkedVictoryTarget: "vt-ws-e-2",
        },
        {
          id: "pm-ws-e-3",
          name: "WIG Review Meetings",
          frequency: "weekly",
          target: 7,
          actual: 7,
          owner: "Operations",
          linkedVictoryTarget: "vt-ws-e-1",
        },
      ],
      tasks: [
        {
          id: "t-ws-e-1",
          title: "Complete all department WIG updates by Wednesday",
          dueDate: "Wednesday",
          owner: "All Leads",
          status: "completed",
          priority: "high",
        },
        {
          id: "t-ws-e-2",
          title: "Resolve 5 operational bottlenecks identified",
          dueDate: "Thursday",
          owner: "Operations",
          status: "completed",
          priority: "high",
        },
        {
          id: "t-ws-e-3",
          title: "Implement new project management workflow",
          dueDate: "Friday",
          owner: "Mike R.",
          status: "pending",
          priority: "medium",
        },
      ],
      commitments: [
        {
          id: "c-ws-e-1",
          title: "Achieve 95% WIG completion rate",
          dueDate: "Jan 31, 2026",
          owner: "All Leads",
          status: "pending",
        },
        {
          id: "c-ws-e-2",
          title: "Zero critical operational issues",
          dueDate: "Jan 25, 2026",
          owner: "Mike R.",
          status: "completed",
        },
      ],
      teamMembers: [{ id: "tm-ws-e-1", name: "Mike R.", role: "Operations Manager", email: "mike@warriorsystems.com" }],
    },
    rd: {
      id: "rd",
      name: "R&D / Risk",
      icon: "🔬",
      coreObjective: {
        title: "Innovation & Risk Management",
        description: "Test new bets, validate learnings, mitigate threats before they escalate",
      },
      victoryTargets: [
        {
          id: "vt-ws-r-1",
          name: "Experiments Launched",
          target: 12,
          achieved: 11,
          unit: "experiments",
          owner: "Anna K.",
          linkedPowerMoves: ["pm-ws-r-1"],
          quarters: [
            { quarter: "Q1", target: 3, achieved: 3 },
            { quarter: "Q2", target: 3, achieved: 3 },
            { quarter: "Q3", target: 3, achieved: 3 },
            { quarter: "Q4", target: 3, achieved: 3 },
          ],
        },
        {
          id: "vt-ws-r-2",
          name: "Experiments Validated",
          target: 10,
          achieved: 9,
          unit: "experiments",
          owner: "James L.",
          linkedPowerMoves: ["pm-ws-r-2"],
          quarters: [
            { quarter: "Q1", target: 2.5, achieved: 2.5 },
            { quarter: "Q2", target: 2.5, achieved: 2.5 },
            { quarter: "Q3", target: 2.5, achieved: 2.5 },
            { quarter: "Q4", target: 2.5, achieved: 2.5 },
          ],
        },
        {
          id: "vt-ws-r-3",
          name: "Innovation Ideas Generated",
          target: 50,
          achieved: 48,
          unit: "ideas",
          owner: "Anna K.",
          linkedPowerMoves: ["pm-ws-r-1"],
          quarters: [
            { quarter: "Q1", target: 12.5, achieved: 12.5 },
            { quarter: "Q2", target: 12.5, achieved: 12.5 },
            { quarter: "Q3", target: 12.5, achieved: 12.5 },
            { quarter: "Q4", target: 12.5, achieved: 12.5 },
          ],
        },
      ],
      powerMoves: [
        {
          id: "pm-ws-r-1",
          name: "Experiment Design Sessions",
          frequency: "weekly",
          target: 3,
          actual: 3,
          owner: "Anna K.",
          linkedVictoryTarget: "vt-ws-r-1",
        },
        {
          id: "pm-ws-r-2",
          name: "Risk Analysis Reviews",
          frequency: "weekly",
          target: 2,
          actual: 2,
          owner: "James L.",
          linkedVictoryTarget: "vt-ws-r-2",
        },
      ],
      tasks: [
        {
          id: "t-ws-r-1",
          title: "Complete risk assessment for new product launch",
          dueDate: "Friday",
          owner: "James L.",
          status: "completed",
          priority: "high",
        },
        {
          id: "t-ws-r-2",
          title: "Document experiment results from Q4",
          dueDate: "Thursday",
          owner: "Anna K.",
          status: "pending",
          priority: "medium",
        },
      ],
      commitments: [
        {
          id: "c-ws-r-1",
          title: "Launch 3 new experiments by month end",
          dueDate: "Jan 31, 2026",
          owner: "Anna K.",
          status: "pending",
        },
        {
          id: "c-ws-r-2",
          title: "Complete all risk mitigation plans",
          dueDate: "Jan 25, 2026",
          owner: "James L.",
          status: "completed",
        },
      ],
      teamMembers: [
        { id: "tm-ws-r-1", name: "Anna K.", role: "R&D Lead", email: "anna@warriorsystems.com" },
        { id: "tm-ws-r-2", name: "James L.", role: "Risk Analyst", email: "james@warriorsystems.com" },
      ],
    },
    leadership: {
      id: "leadership",
      name: "You (Leadership & Strategy)",
      icon: "👑",
      coreObjective: {
        title: "Strategy Management, Functional Management Systems & People Management Systems",
        description: "Set direction, remove friction, develop leaders, sustain execution",
      },
      victoryTargets: [
        {
          id: "vt-ws-l-1",
          name: "Strategic Initiatives Completed",
          target: 8,
          achieved: 7,
          unit: "initiatives",
          owner: "CEO",
          linkedPowerMoves: ["pm-ws-l-1"],
          quarters: [
            { quarter: "Q1", target: 2, achieved: 2 },
            { quarter: "Q2", target: 2, achieved: 2 },
            { quarter: "Q3", target: 2, achieved: 2 },
            { quarter: "Q4", target: 2, achieved: 1 },
          ],
        },
        {
          id: "vt-ws-l-2",
          name: "Team Alignment Score",
          target: 90,
          achieved: 88,
          unit: "%",
          owner: "CEO",
          linkedPowerMoves: ["pm-ws-l-2"],
          quarters: [
            { quarter: "Q1", target: 22.5, achieved: 22.5 },
            { quarter: "Q2", target: 22.5, achieved: 22.5 },
            { quarter: "Q3", target: 22.5, achieved: 22.5 },
            { quarter: "Q4", target: 22.5, achieved: 22.5 },
          ],
        },
      ],
      powerMoves: [
        {
          id: "pm-ws-l-1",
          name: "Strategy Review Sessions",
          frequency: "weekly",
          target: 2,
          actual: 2,
          owner: "CEO",
          linkedVictoryTarget: "vt-ws-l-1",
        },
        {
          id: "pm-ws-l-2",
          name: "1-on-1 Leadership Meetings",
          frequency: "weekly",
          target: 5,
          actual: 5,
          owner: "CEO",
          linkedVictoryTarget: "vt-ws-l-2",
        },
      ],
      tasks: [
        {
          id: "t-ws-l-1",
          title: "Complete annual strategy review",
          dueDate: "Friday",
          owner: "CEO",
          status: "completed",
          priority: "high",
        },
        {
          id: "t-ws-l-2",
          title: "Finalize Q1 OKRs with leadership team",
          dueDate: "Thursday",
          owner: "CEO",
          status: "pending",
          priority: "high",
        },
      ],
      commitments: [
        {
          id: "c-ws-l-1",
          title: "Achieve company-wide WIG alignment",
          dueDate: "Jan 31, 2026",
          owner: "CEO",
          status: "pending",
        },
        {
          id: "c-ws-l-2",
          title: "Complete all 1-on-1s with department heads",
          dueDate: "Jan 20, 2026",
          owner: "CEO",
          status: "completed",
        },
      ],
      teamMembers: [{ id: "tm-ws-l-1", name: "John Doe", role: "CEO & Founder", email: "john@warriorsystems.com" }],
    },
  },
  "story-marketing": {
    marketing: {
      id: "marketing",
      name: "Marketing",
      icon: "📱",
      victoryTargets: [
        {
          id: "vt-sm-m-1",
          name: "Content Pieces Published",
          target: 50,
          achieved: 48,
          unit: "pieces",
          owner: "John D.",
          linkedPowerMoves: ["pm-sm-m-1", "pm-sm-m-2"],
          quarters: [
            { quarter: "Q1", target: 12.5, achieved: 12.5 },
            { quarter: "Q2", target: 12.5, achieved: 12.5 },
            { quarter: "Q3", target: 12.5, achieved: 12.5 },
            { quarter: "Q4", target: 12.5, achieved: 12.5 },
          ],
        },
        {
          id: "vt-sm-m-2",
          name: "Social Media Engagement Rate",
          target: 5,
          achieved: 4.8,
          unit: "%",
          owner: "Emily R.",
          linkedPowerMoves: ["pm-sm-m-3"],
          quarters: [
            { quarter: "Q1", target: 1.25, achieved: 1.25 },
            { quarter: "Q2", target: 1.25, achieved: 1.25 },
            { quarter: "Q3", target: 1.25, achieved: 1.25 },
            { quarter: "Q4", target: 1.25, achieved: 1.25 },
          ],
        },
        {
          id: "vt-sm-m-3",
          name: "Brand Awareness Score",
          target: 80,
          achieved: 78,
          unit: "%",
          owner: "John D.",
          linkedPowerMoves: ["pm-sm-m-1"],
          quarters: [
            { quarter: "Q1", target: 20, achieved: 20 },
            { quarter: "Q2", target: 20, achieved: 20 },
            { quarter: "Q3", target: 20, achieved: 20 },
            { quarter: "Q4", target: 20, achieved: 20 },
          ],
        },
      ],
      powerMoves: [
        {
          id: "pm-sm-m-1",
          name: "Story Scripts Written",
          frequency: "daily",
          target: 5,
          actual: 5,
          owner: "John D.",
          linkedVictoryTarget: "vt-sm-m-1",
        },
        {
          id: "pm-sm-m-2",
          name: "Video Production Sessions",
          frequency: "weekly",
          target: 3,
          actual: 3,
          owner: "John D.",
          linkedVictoryTarget: "vt-sm-m-1",
        },
        {
          id: "pm-sm-m-3",
          name: "Social Media Campaigns",
          frequency: "weekly",
          target: 2,
          actual: 2,
          owner: "Emily R.",
          linkedVictoryTarget: "vt-sm-m-2",
        },
      ],
      tasks: [
        {
          id: "t-sm-m-1",
          title: "Finalize Story Marketing campaign brief",
          dueDate: "Today",
          owner: "John D.",
          status: "completed",
          priority: "high",
        },
        {
          id: "t-sm-m-2",
          title: "Review content calendar for next month",
          dueDate: "Tomorrow",
          owner: "Emily R.",
          status: "pending",
          priority: "medium",
        },
      ],
      commitments: [
        {
          id: "c-sm-m-1",
          title: "Launch new Warrior Systems marketing campaign",
          dueDate: "Dec 28, 2026",
          owner: "John D.",
          status: "pending",
        },
        {
          id: "c-sm-m-2",
          title: "Complete Story Marketing brand guidelines",
          dueDate: "Dec 30, 2026",
          owner: "Emily R.",
          status: "pending",
        },
      ],
      teamMembers: [
        { id: "tm-sm-m-1", name: "John D.", role: "Content Lead", email: "john@storymarketing.com" },
        { id: "tm-sm-m-2", name: "Emily R.", role: "Social Media Manager", email: "emily@storymarketing.com" },
      ],
    },
    sales: {
      id: "sales",
      name: "Sales",
      icon: "💼",
      victoryTargets: [
        {
          id: "vt-sm-s-1",
          name: "Story Retainer Clients Signed",
          target: 30,
          achieved: 28,
          unit: "clients",
          owner: "Mike R.",
          linkedPowerMoves: ["pm-sm-s-1"],
          quarters: [
            { quarter: "Q1", target: 7.5, achieved: 7.5 },
            { quarter: "Q2", target: 7.5, achieved: 7.5 },
            { quarter: "Q3", target: 7.5, achieved: 7.5 },
            { quarter: "Q4", target: 7.5, achieved: 7.5 },
          ],
        },
        {
          id: "vt-sm-s-2",
          name: "Monthly Recurring Revenue",
          target: 1000000,
          achieved: 950000,
          unit: "INR",
          owner: "Mike R.",
          linkedPowerMoves: ["pm-sm-s-2"],
          quarters: [
            { quarter: "Q1", target: 250000, achieved: 250000 },
            { quarter: "Q2", target: 250000, achieved: 250000 },
            { quarter: "Q3", target: 250000, achieved: 250000 },
            { quarter: "Q4", target: 250000, achieved: 250000 },
          ],
        },
      ],
      powerMoves: [
        {
          id: "pm-sm-s-1",
          name: "Client Discovery Calls",
          frequency: "daily",
          target: 5,
          actual: 5,
          owner: "Mike R.",
          linkedVictoryTarget: "vt-sm-s-1",
        },
        {
          id: "pm-sm-s-2",
          name: "Proposal Presentations",
          frequency: "weekly",
          target: 4,
          actual: 4,
          owner: "Mike R.",
          linkedVictoryTarget: "vt-sm-s-2",
        },
      ],
      tasks: [
        {
          id: "t-sm-s-1",
          title: "Follow up with 10 warm leads from last week",
          dueDate: "Monday",
          owner: "Amit P.",
          status: "completed",
          priority: "high",
        },
        {
          id: "t-sm-s-2",
          title: "Send proposals to 5 qualified prospects",
          dueDate: "Wednesday",
          owner: "Neha M.",
          status: "pending",
          priority: "high",
        },
      ],
      commitments: [
        {
          id: "c-sm-s-1",
          title: "Close 5 retainer clients by month end",
          dueDate: "Jan 31, 2026",
          owner: "Mike R.",
          status: "pending",
        },
      ],
      teamMembers: [
        { id: "tm-sm-s-1", name: "Mike R.", role: "Sales Lead", email: "mike@storymarketing.com" },
        { id: "tm-sm-s-2", name: "Amit P.", role: "Account Executive", email: "amit@storymarketing.com" },
        { id: "tm-sm-s-3", name: "Neha M.", role: "Sales Coordinator", email: "neha@storymarketing.com" },
      ],
    },
    accounts: {
      id: "accounts",
      name: "Accounts / Compliance / Finance",
      icon: "📊",
      coreObjective: {
        title: "Financial Integrity",
        description: "Sustain cash flow, ensure compliance, enable informed financial decisions",
      },
      victoryTargets: [
        {
          id: "vt-sm-a-1",
          name: "Monthly Revenue Target",
          target: 2000000,
          achieved: 1900000,
          unit: "INR",
          owner: "Priya K.",
          linkedPowerMoves: ["pm-sm-a-1"],
          quarters: [
            { quarter: "Q1", target: 500000, achieved: 500000 },
            { quarter: "Q2", target: 500000, achieved: 500000 },
            { quarter: "Q3", target: 500000, achieved: 500000 },
            { quarter: "Q4", target: 500000, achieved: 500000 },
          ],
        },
      ],
      powerMoves: [
        {
          id: "pm-sm-a-1",
          name: "Client Invoice Processing",
          frequency: "weekly",
          target: 10,
          actual: 10,
          owner: "Priya K.",
          linkedVictoryTarget: "vt-sm-a-1",
        },
      ],
      tasks: [
        {
          id: "t-sm-a-1",
          title: "Complete monthly financial reconciliation",
          dueDate: "Friday",
          owner: "Priya K.",
          status: "completed",
          priority: "high",
        },
      ],
      commitments: [],
      teamMembers: [{ id: "tm-sm-a-1", name: "Priya K.", role: "Finance Manager", email: "priya@storymarketing.com" }],
    },
  },
  "meta-gurukul": {
    marketing: {
      id: "marketing",
      name: "Marketing",
      icon: "📱",
      victoryTargets: [
        {
          id: "vt-mg-m-1",
          name: "Course Enrollments",
          target: 500,
          achieved: 480,
          unit: "enrollments",
          owner: "Raj S.",
          linkedPowerMoves: ["pm-mg-m-1"],
          quarters: [
            { quarter: "Q1", target: 125, achieved: 125 },
            { quarter: "Q2", target: 125, achieved: 125 },
            { quarter: "Q3", target: 125, achieved: 125 },
            { quarter: "Q4", target: 125, achieved: 125 },
          ],
        },
        {
          id: "vt-mg-m-2",
          name: "Webinar Attendees",
          target: 1000,
          achieved: 950,
          unit: "attendees",
          owner: "Raj S.",
          linkedPowerMoves: ["pm-mg-m-2"],
          quarters: [
            { quarter: "Q1", target: 250, achieved: 250 },
            { quarter: "Q2", target: 250, achieved: 250 },
            { quarter: "Q3", target: 250, achieved: 250 },
            { quarter: "Q4", target: 250, achieved: 250 },
          ],
        },
      ],
      powerMoves: [
        {
          id: "pm-mg-m-1",
          name: "Educational Content Published",
          frequency: "daily",
          target: 3,
          actual: 3,
          owner: "Raj S.",
          linkedVictoryTarget: "vt-mg-m-1",
        },
        {
          id: "pm-mg-m-2",
          name: "Live Webinars Conducted",
          frequency: "weekly",
          target: 2,
          actual: 2,
          owner: "Raj S.",
          linkedVictoryTarget: "vt-mg-m-2",
        },
      ],
      tasks: [
        {
          id: "t-mg-m-1",
          title: "Launch new course promotion campaign",
          dueDate: "Today",
          owner: "Raj S.",
          status: "completed",
          priority: "high",
        },
      ],
      commitments: [],
      teamMembers: [{ id: "tm-mg-m-1", name: "Raj S.", role: "Marketing Lead", email: "raj@metagurukul.com" }],
    },
    sales: {
      id: "sales",
      name: "Sales",
      icon: "💼",
      victoryTargets: [
        {
          id: "vt-mg-s-1",
          name: "Premium Course Sales",
          target: 100,
          achieved: 95,
          unit: "sales",
          owner: "Vikram P.",
          linkedPowerMoves: ["pm-mg-s-1"],
          quarters: [
            { quarter: "Q1", target: 25, achieved: 25 },
            { quarter: "Q2", target: 25, achieved: 25 },
            { quarter: "Q3", target: 25, achieved: 25 },
            { quarter: "Q4", target: 25, achieved: 25 },
          ],
        },
      ],
      powerMoves: [
        {
          id: "pm-mg-s-1",
          name: "Sales Calls with Interested Leads",
          frequency: "daily",
          target: 10,
          actual: 10,
          owner: "Vikram P.",
          linkedVictoryTarget: "vt-mg-s-1",
        },
      ],
      tasks: [
        {
          id: "t-mg-s-1",
          title: "Complete follow-ups with trial users",
          dueDate: "Tomorrow",
          owner: "Vikram P.",
          status: "pending",
          priority: "high",
        },
      ],
      commitments: [],
      teamMembers: [{ id: "tm-mg-s-1", name: "Vikram P.", role: "Sales Lead", email: "vikram@metagurukul.com" }],
    },
    accounts: {
      id: "accounts",
      name: "Accounts / Compliance / Finance",
      icon: "📊",
      coreObjective: {
        title: "Financial Integrity",
        description: "Sustain cash flow, ensure compliance, enable informed financial decisions",
      },
      victoryTargets: [
        {
          id: "vt-mg-a-1",
          name: "Course Revenue",
          target: 3000000,
          achieved: 2850000,
          unit: "INR",
          owner: "Anita R.",
          linkedPowerMoves: ["pm-mg-a-1"],
          quarters: [
            { quarter: "Q1", target: 750000, achieved: 750000 },
            { quarter: "Q2", target: 750000, achieved: 750000 },
            { quarter: "Q3", target: 750000, achieved: 750000 },
            { quarter: "Q4", target: 750000, achieved: 750000 },
          ],
        },
      ],
      powerMoves: [
        {
          id: "pm-mg-a-1",
          name: "Revenue Tracking Updates",
          frequency: "daily",
          target: 1,
          actual: 1,
          owner: "Anita R.",
          linkedVictoryTarget: "vt-mg-a-1",
        },
      ],
      tasks: [],
      commitments: [],
      teamMembers: [{ id: "tm-mg-a-1", name: "Anita R.", role: "Finance Lead", email: "anita@metagurukul.com" }],
    },
    "team-tools": {
      id: "team-tools",
      name: "Team Tools & SOPs",
      icon: "🔧",
      coreObjective: {
        title: "Operational Efficiency",
        description: "Build systems that scale, reduce friction, enable teams to execute consistently",
      },
      victoryTargets: [
        {
          id: "vt-mg-t-1",
          name: "Course Content Modules Created",
          target: 50,
          achieved: 48,
          unit: "modules",
          owner: "Ravi T.",
          linkedPowerMoves: ["pm-mg-t-1"],
          quarters: [
            { quarter: "Q1", target: 12.5, achieved: 12.5 },
            { quarter: "Q2", target: 12.5, achieved: 12.5 },
            { quarter: "Q3", target: 12.5, achieved: 12.5 },
            { quarter: "Q4", target: 12.5, achieved: 12.5 },
          ],
        },
      ],
      powerMoves: [
        {
          id: "pm-mg-t-1",
          name: "Course Module Creation Sessions",
          frequency: "weekly",
          target: 5,
          actual: 5,
          owner: "Ravi T.",
          linkedVictoryTarget: "vt-mg-t-1",
        },
      ],
      tasks: [
        {
          id: "t-mg-t-1",
          title: "Update Meta Gurukul course content",
          dueDate: "Friday",
          owner: "Ravi T.",
          status: "pending",
          priority: "medium",
        },
      ],
      commitments: [],
      teamMembers: [
        { id: "tm-mg-t-1", name: "Ravi T.", role: "Content Operations Lead", email: "ravi@metagurukul.com" },
      ],
    },
    execution: {
      id: "execution",
      name: "Execution & Operations",
      icon: "⚙️",
      coreObjective: {
        title: "Accountability & Cadence",
        description: "Ensure commitments are tracked, bottlenecks removed, execution is visible",
      },
      victoryTargets: [
        {
          id: "vt-mg-e-1",
          name: "Course Delivery Completion Rate",
          target: 98,
          achieved: 97,
          unit: "%",
          owner: "Operations",
          linkedPowerMoves: ["pm-mg-e-1"],
          quarters: [
            { quarter: "Q1", target: 24.5, achieved: 24.5 },
            { quarter: "Q2", target: 24.5, achieved: 24.5 },
            { quarter: "Q3", target: 24.5, achieved: 24.5 },
            { quarter: "Q4", target: 24.5, achieved: 24.5 },
          ],
        },
      ],
      powerMoves: [
        {
          id: "pm-mg-e-1",
          name: "Course Quality Reviews",
          frequency: "weekly",
          target: 5,
          actual: 5,
          owner: "Operations",
          linkedVictoryTarget: "vt-mg-e-1",
        },
      ],
      tasks: [],
      commitments: [],
      teamMembers: [],
    },
    rd: {
      id: "rd",
      name: "R&D / Risk",
      icon: "🔬",
      coreObjective: {
        title: "Innovation & Risk Management",
        description: "Test new bets, validate learnings, mitigate threats before they escalate",
      },
      victoryTargets: [
        {
          id: "vt-mg-r-1",
          name: "New Course Experiments",
          target: 6,
          achieved: 6,
          unit: "experiments",
          owner: "R&D Team",
          linkedPowerMoves: ["pm-mg-r-1"],
          quarters: [
            { quarter: "Q1", target: 1.5, achieved: 1.5 },
            { quarter: "Q2", target: 1.5, achieved: 1.5 },
            { quarter: "Q3", target: 1.5, achieved: 1.5 },
            { quarter: "Q4", target: 1.5, achieved: 1.5 },
          ],
        },
      ],
      powerMoves: [
        {
          id: "pm-mg-r-1",
          name: "Course Innovation Sessions",
          frequency: "weekly",
          target: 2,
          actual: 2,
          owner: "R&D Team",
          linkedVictoryTarget: "vt-mg-r-1",
        },
      ],
      tasks: [],
      commitments: [],
      teamMembers: [],
    },
    leadership: {
      id: "leadership",
      name: "You (Leadership & Strategy)",
      icon: "👑",
      coreObjective: {
        title: "Strategy Management, Functional Management Systems & People Management Systems",
        description: "Set direction, remove friction, develop leaders, sustain execution",
      },
      victoryTargets: [
        {
          id: "vt-mg-l-1",
          name: "Strategic Partnerships Formed",
          target: 5,
          achieved: 5,
          unit: "partnerships",
          owner: "CEO",
          linkedPowerMoves: ["pm-mg-l-1"],
          quarters: [
            { quarter: "Q1", target: 1.25, achieved: 1.25 },
            { quarter: "Q2", target: 1.25, achieved: 1.25 },
            { quarter: "Q3", target: 1.25, achieved: 1.25 },
            { quarter: "Q4", target: 1.25, achieved: 1.25 },
          ],
        },
      ],
      powerMoves: [
        {
          id: "pm-mg-l-1",
          name: "Partnership Development Meetings",
          frequency: "weekly",
          target: 3,
          actual: 3,
          owner: "CEO",
          linkedVictoryTarget: "vt-mg-l-1",
        },
      ],
      tasks: [],
      commitments: [],
      teamMembers: [],
    },
  },
}

export function getDepartmentData(brand: Brand, department: Department): DepartmentData | null {
  return BRAND_DEPARTMENTS[brand]?.[department] || null
}

export function getBrandDepartments(brand: Brand): DepartmentData[] {
  const deptRecord = BRAND_DEPARTMENTS[brand] || {}
  return Object.values(deptRecord).filter((d): d is DepartmentData => d !== undefined)
}

export function getCurrentQuarter(): Quarter {
  const month = new Date().getMonth() // 0-11
  if (month < 3) return "Q1"
  if (month < 6) return "Q2"
  if (month < 9) return "Q3"
  return "Q4"
}

export function getQuarterDates(quarter: Quarter, year: number = new Date().getFullYear()): { start: Date; end: Date } {
  const quarters = {
    Q1: { start: new Date(year, 0, 1), end: new Date(year, 2, 31) },
    Q2: { start: new Date(year, 3, 1), end: new Date(year, 5, 30) },
    Q3: { start: new Date(year, 6, 1), end: new Date(year, 8, 30) },
    Q4: { start: new Date(year, 9, 1), end: new Date(year, 11, 31) },
  }
  return quarters[quarter]
}
