-- =====================================================
-- ARKMEDIS OPERATING SYSTEM - SUPABASE SCHEMA
-- =====================================================
-- A 4DX (Four Disciplines of Execution) platform for
-- multi-brand business execution tracking
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE brand_type AS ENUM ('warrior-systems', 'story-marketing', 'meta-gurukul');

CREATE TYPE department_type AS ENUM ('marketing', 'sales', 'accounts', 'team-tools', 'execution', 'rd', 'leadership');

CREATE TYPE department_code AS ENUM ('M', 'A', 'S', 'T', 'E', 'R', 'Y');

CREATE TYPE quarter_type AS ENUM ('Q1', 'Q2', 'Q3', 'Q4');

CREATE TYPE user_role AS ENUM ('super_admin', 'company_admin', 'member', 'viewer');

CREATE TYPE user_status AS ENUM ('active', 'invited', 'disabled');

CREATE TYPE permission_type AS ENUM ('admin', 'member', 'view');

CREATE TYPE frequency_type AS ENUM ('daily', 'weekly', 'monthly');

CREATE TYPE priority_type AS ENUM ('high', 'medium', 'low');

CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed');

CREATE TYPE commitment_status AS ENUM ('pending', 'in_progress', 'completed');

CREATE TYPE client_origin AS ENUM ('Existing', 'Planned', 'Bonus');

CREATE TYPE client_status AS ENUM ('active', 'dropped');

CREATE TYPE bpr_status AS ENUM ('WINNING', 'AT_RISK', 'BEHIND');

-- =====================================================
-- CORE TABLES
-- =====================================================

-- BRANDS TABLE
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug brand_type UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  wig_goal TEXT, -- Wildly Important Goal
  wig_description TEXT,
  wig_deadline DATE,
  wig_year_target INTEGER,
  wig_year_achieved INTEGER DEFAULT 0,
  wig_unit VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DEPARTMENTS TABLE
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug department_type UNIQUE NOT NULL,
  code department_code UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(10), -- emoji icon
  core_objective_title VARCHAR(500),
  core_objective_description TEXT,
  is_restricted BOOLEAN DEFAULT false, -- For Accounts/Leadership
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- USERS TABLE (extends Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'member',
  status user_status NOT NULL DEFAULT 'invited',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER DEPARTMENT ACCESS (Many-to-Many with permissions)
CREATE TABLE user_department_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  permission permission_type NOT NULL DEFAULT 'view',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, department_id)
);

-- USER BRAND ACCESS (Which brands a user can access)
CREATE TABLE user_brand_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, brand_id)
);

-- =====================================================
-- VICTORY TARGETS (LAG MEASURES)
-- =====================================================

CREATE TABLE victory_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES company_brands(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  target INTEGER NOT NULL, -- Annual target
  achieved INTEGER NOT NULL DEFAULT 0, -- Annual achieved
  unit VARCHAR(100) NOT NULL, -- 'conversations', 'clients', 'revenue', etc.
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  owner_name VARCHAR(255), -- Fallback if user not in system
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VICTORY TARGET QUARTERLY BREAKDOWN
CREATE TABLE victory_target_quarters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  victory_target_id UUID NOT NULL REFERENCES victory_targets(id) ON DELETE CASCADE,
  quarter quarter_type NOT NULL,
  target INTEGER NOT NULL,
  achieved INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(victory_target_id, quarter)
);

-- =====================================================
-- POWER MOVES (LEAD MEASURES)
-- =====================================================

CREATE TABLE power_moves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES company_brands(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  linked_victory_target_id UUID REFERENCES victory_targets(id) ON DELETE SET NULL,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  frequency frequency_type NOT NULL,
  target_per_cycle INTEGER NOT NULL, -- Target per frequency cycle
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  owner_name VARCHAR(255), -- Fallback if user not in system
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- POWER MOVE TRACKING (Daily/Weekly/Monthly actuals)
CREATE TABLE power_move_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  power_move_id UUID NOT NULL REFERENCES power_moves(id) ON DELETE CASCADE,
  period_date DATE NOT NULL, -- The date of the period (start of week for weekly, start of month for monthly)
  target INTEGER NOT NULL,
  actual INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(power_move_id, period_date)
);

-- POWER MOVE - VICTORY TARGET LINKS (Many-to-Many)
CREATE TABLE power_move_victory_target_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  power_move_id UUID NOT NULL REFERENCES power_moves(id) ON DELETE CASCADE,
  victory_target_id UUID NOT NULL REFERENCES victory_targets(id) ON DELETE CASCADE,
  contribution_weight DECIMAL(3,2) DEFAULT 1.00, -- How much this PM contributes to VT
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(power_move_id, victory_target_id)
);

-- =====================================================
-- TASKS (ONE-TIME ACTIVITIES)
-- =====================================================

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  linked_power_move_id UUID REFERENCES power_moves(id) ON DELETE SET NULL,
  linked_victory_target_id UUID REFERENCES victory_targets(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  owner_name VARCHAR(255),
  status task_status NOT NULL DEFAULT 'pending',
  priority priority_type NOT NULL DEFAULT 'medium',
  due_date DATE NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COMMITMENTS (TEAM PROMISES FROM WEEKLY CALLS)
-- =====================================================

CREATE TABLE commitments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  linked_power_move_id UUID REFERENCES power_moves(id) ON DELETE SET NULL,
  linked_victory_target_id UUID REFERENCES victory_targets(id) ON DELETE SET NULL,
  weekly_review_id UUID, -- Will reference weekly_reviews after it's created
  title VARCHAR(500) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  owner_name VARCHAR(255),
  status commitment_status NOT NULL DEFAULT 'pending',
  due_date DATE NOT NULL,
  frequency VARCHAR(50), -- 'This week', 'Next 2 weeks', etc.
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- WEEKLY REVIEWS (CADENCE OF ACCOUNTABILITY)
-- =====================================================

CREATE TABLE weekly_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL, -- Monday of the week
  wins TEXT, -- What went well
  misses TEXT, -- What didn't go as planned
  blockers TEXT, -- What's blocking progress
  commitments_summary TEXT, -- Summary of commitments made
  execution_score INTEGER, -- 0-100 score for the week
  bpr_status bpr_status, -- WINNING/AT_RISK/BEHIND
  conducted_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(department_id, week_start_date)
);

-- Add foreign key for commitments -> weekly_reviews
ALTER TABLE commitments 
ADD CONSTRAINT fk_commitment_weekly_review 
FOREIGN KEY (weekly_review_id) REFERENCES weekly_reviews(id) ON DELETE SET NULL;

-- =====================================================
-- EXECUTION STREAKS
-- =====================================================

CREATE TABLE execution_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0, -- Current consecutive weeks at 70%+
  best_streak INTEGER DEFAULT 0, -- All-time best streak
  last_qualified_week DATE, -- Last week that qualified (70%+)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(department_id, brand_id)
);

-- =====================================================
-- CLIENTS (COMPANY PERFORMANCE)
-- =====================================================

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  monthly_fee DECIMAL(12, 2) NOT NULL,
  origin client_origin NOT NULL DEFAULT 'Planned',
  status client_status NOT NULL DEFAULT 'active',
  join_month VARCHAR(20) NOT NULL, -- 'Jan 2026', 'Feb 2026', etc.
  drop_month VARCHAR(20),
  drop_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- BPR NOTES (QUARTERLY BUSINESS PERFORMANCE REVIEW)
-- =====================================================

CREATE TABLE bpr_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE, -- NULL for company-level
  quarter quarter_type NOT NULL,
  year INTEGER NOT NULL,
  verdict bpr_status NOT NULL,
  what_went_wrong TEXT,
  decision_made TEXT,
  next_changes TEXT,
  created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, department_id, quarter, year)
);

-- =====================================================
-- ACHIEVEMENTS & GAMIFICATION
-- =====================================================

CREATE TABLE achievement_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50), -- emoji or icon name
  badge_color VARCHAR(50), -- Tailwind color class
  threshold_type VARCHAR(50), -- 'streak', 'score', 'count', etc.
  threshold_value INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_type_id UUID NOT NULL REFERENCES achievement_types(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  context JSONB, -- Additional context (e.g., which department, what value)
  UNIQUE(user_id, achievement_type_id)
);

-- =====================================================
-- DAILY REPORTS
-- =====================================================

CREATE TABLE daily_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  power_moves_completed JSONB, -- Array of {power_move_id, count}
  tasks_completed JSONB, -- Array of task_ids
  blockers TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, report_date)
);

-- =====================================================
-- COMMITMENT TEMPLATES
-- =====================================================

CREATE TABLE commitment_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  suggested_frequency VARCHAR(50),
  is_global BOOLEAN DEFAULT false, -- Available to all departments
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- QUARTERLY TARGETS (COMPANY LEVEL)
-- =====================================================

CREATE TABLE quarterly_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE, -- NULL for company-wide
  quarter quarter_type NOT NULL,
  year INTEGER NOT NULL,
  planned_clients INTEGER NOT NULL DEFAULT 0,
  actual_clients INTEGER NOT NULL DEFAULT 0,
  planned_mrr DECIMAL(12, 2),
  actual_mrr DECIMAL(12, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, quarter, year)
);

-- =====================================================
-- AUDIT LOG
-- =====================================================

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'complete', etc.
  entity_type VARCHAR(100) NOT NULL, -- 'power_move', 'task', 'client', etc.
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- User access
CREATE INDEX idx_user_dept_access_user ON user_department_access(user_id);
CREATE INDEX idx_user_dept_access_dept ON user_department_access(department_id);
CREATE INDEX idx_user_brand_access_user ON user_brand_access(user_id);
CREATE INDEX idx_user_brand_access_brand ON user_brand_access(brand_id);

-- Victory targets
CREATE INDEX idx_victory_targets_brand ON victory_targets(brand_id);
CREATE INDEX idx_victory_targets_dept ON victory_targets(department_id);
CREATE INDEX idx_victory_targets_owner ON victory_targets(owner_id);
CREATE INDEX idx_victory_targets_year ON victory_targets(year);

-- Power moves
CREATE INDEX idx_power_moves_brand ON power_moves(brand_id);
CREATE INDEX idx_power_moves_dept ON power_moves(department_id);
CREATE INDEX idx_power_moves_owner ON power_moves(owner_id);
CREATE INDEX idx_power_moves_vt ON power_moves(linked_victory_target_id);

-- Power move tracking
CREATE INDEX idx_pm_tracking_power_move ON power_move_tracking(power_move_id);
CREATE INDEX idx_pm_tracking_date ON power_move_tracking(period_date);
CREATE INDEX idx_pm_tracking_pm_date ON power_move_tracking(power_move_id, period_date);

-- Tasks
CREATE INDEX idx_tasks_brand ON tasks(brand_id);
CREATE INDEX idx_tasks_dept ON tasks(department_id);
CREATE INDEX idx_tasks_owner ON tasks(owner_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Commitments
CREATE INDEX idx_commitments_brand ON commitments(brand_id);
CREATE INDEX idx_commitments_dept ON commitments(department_id);
CREATE INDEX idx_commitments_owner ON commitments(owner_id);
CREATE INDEX idx_commitments_status ON commitments(status);

-- Weekly reviews
CREATE INDEX idx_weekly_reviews_dept ON weekly_reviews(department_id);
CREATE INDEX idx_weekly_reviews_date ON weekly_reviews(week_start_date);

-- Clients
CREATE INDEX idx_clients_brand ON clients(brand_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_origin ON clients(origin);

-- Audit log
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_department_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_brand_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE victory_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE victory_target_quarters ENABLE ROW LEVEL SECURITY;
ALTER TABLE power_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE power_move_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Super admins can do everything
CREATE POLICY "Super admins have full access to users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Users can read victory targets in their departments
CREATE POLICY "Users can read victory targets in their departments" ON victory_targets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_department_access uda
      WHERE uda.user_id = auth.uid() 
      AND uda.department_id = victory_targets.department_id
    )
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Users can read power moves in their departments
CREATE POLICY "Users can read power moves in their departments" ON power_moves
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_department_access uda
      WHERE uda.user_id = auth.uid() 
      AND uda.department_id = power_moves.department_id
    )
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Users can update power move tracking for their assigned moves
CREATE POLICY "Users can update own power move tracking" ON power_move_tracking
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM power_moves pm
      WHERE pm.id = power_move_tracking.power_move_id
      AND pm.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'company_admin')
    )
  );

-- Users can read tasks assigned to them or in their department
CREATE POLICY "Users can read relevant tasks" ON tasks
  FOR SELECT USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_department_access uda
      WHERE uda.user_id = auth.uid() 
      AND uda.department_id = tasks.department_id
    )
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Users can update their own tasks
CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'company_admin')
    )
  );

-- Users can read their own daily reports
CREATE POLICY "Users can manage own daily reports" ON daily_reports
  FOR ALL USING (user_id = auth.uid());

-- Clients are visible to super_admins and company_admins only
CREATE POLICY "Admins can read clients" ON clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'company_admin')
    )
  );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_victory_targets_updated_at BEFORE UPDATE ON victory_targets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_power_moves_updated_at BEFORE UPDATE ON power_moves
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commitments_updated_at BEFORE UPDATE ON commitments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_reviews_updated_at BEFORE UPDATE ON weekly_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate execution score for a week
CREATE OR REPLACE FUNCTION calculate_weekly_execution_score(
  p_department_id UUID,
  p_week_start DATE
)
RETURNS INTEGER AS $$
DECLARE
  total_target INTEGER;
  total_actual INTEGER;
  score INTEGER;
BEGIN
  SELECT 
    COALESCE(SUM(pmt.target), 0),
    COALESCE(SUM(pmt.actual), 0)
  INTO total_target, total_actual
  FROM power_move_tracking pmt
  JOIN power_moves pm ON pm.id = pmt.power_move_id
  WHERE pm.department_id = p_department_id
    AND pmt.period_date >= p_week_start
    AND pmt.period_date < p_week_start + INTERVAL '7 days';
  
  IF total_target = 0 THEN
    RETURN 0;
  END IF;
  
  score := ROUND((total_actual::DECIMAL / total_target) * 100);
  RETURN LEAST(score, 100); -- Cap at 100
END;
$$ LANGUAGE plpgsql;

-- Function to get BPR status from score
CREATE OR REPLACE FUNCTION get_bpr_status(score INTEGER)
RETURNS bpr_status AS $$
BEGIN
  IF score >= 70 THEN
    RETURN 'WINNING';
  ELSIF score >= 50 THEN
    RETURN 'AT_RISK';
  ELSE
    RETURN 'BEHIND';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEED DATA - DEPARTMENTS
-- =====================================================

INSERT INTO departments (slug, code, name, icon, core_objective_title, core_objective_description, is_restricted) VALUES
('marketing', 'M', 'Marketing', '📱', 'Lead Generation', 'Create predictable, qualified demand for Sales', false),
('accounts', 'A', 'Accounts/Finance', '📊', 'Financial Health', 'Maintain healthy cash flow and accurate books', true),
('sales', 'S', 'Sales', '📈', 'Revenue Generation', 'Convert qualified leads into paying clients', false),
('team-tools', 'T', 'Team Tools & SOPs', '⚙️', 'Operational Excellence', 'Build and maintain systems that enable team productivity', false),
('execution', 'E', 'Execution/Ops', '🎯', 'Delivery Excellence', 'Execute client work on time and above expectations', false),
('rd', 'R', 'R&D/Risk', '🧪', 'Innovation & Protection', 'Identify risks and develop new capabilities', false),
('leadership', 'Y', 'Leadership', '👑', 'Strategic Direction', 'Set vision, make decisions, remove blockers', true);

-- =====================================================
-- SEED DATA - BRANDS
-- =====================================================

INSERT INTO brands (slug, name, description, wig_goal, wig_description, wig_deadline, wig_year_target, wig_unit) VALUES
('warrior-systems', 'Warrior Systems', 'Business systems and automation for coaches', 'Acquire 30 new clients', 'Build a client roster of 30 high-value coaching businesses', '2026-12-31', 30, 'clients'),
('story-marketing', 'Story Marketing', 'Content and storytelling for personal brands', 'Acquire 10 new clients', 'Establish presence with 10 premium personal brands', '2026-12-31', 10, 'clients'),
('meta-gurukul', 'Meta Gurukul', 'Educational technology and learning platforms', 'Launch platform', 'Build and launch the learning management system', '2026-12-31', 1, 'platform');

-- =====================================================
-- SEED DATA - ACHIEVEMENT TYPES
-- =====================================================

INSERT INTO achievement_types (name, description, icon, badge_color, threshold_type, threshold_value) VALUES
('First Blood', 'Complete your first Power Move', '🎯', 'bg-blue-500', 'count', 1),
('On Fire', 'Achieve 3-week execution streak', '🔥', 'bg-orange-500', 'streak', 3),
('Unstoppable', 'Achieve 8-week execution streak', '⚡', 'bg-purple-500', 'streak', 8),
('Century Club', 'Hit 100% execution in a week', '💯', 'bg-emerald-500', 'score', 100),
('Closer', 'Complete 10 client acquisitions', '🤝', 'bg-green-500', 'count', 10),
('Iron Will', 'Never miss a daily report for 30 days', '🛡️', 'bg-slate-500', 'streak', 30);

-- =====================================================
-- SEED DATA - COMMITMENT TEMPLATES
-- =====================================================

INSERT INTO commitment_templates (title, description, suggested_frequency, is_global) VALUES
('Review and update SOPs', 'Audit existing SOPs for accuracy and completeness', 'Monthly', true),
('Team 1:1 meetings', 'Conduct individual check-ins with team members', 'Weekly', true),
('Client health check', 'Review client satisfaction and engagement metrics', 'Weekly', false),
('Content calendar review', 'Plan and approve next week content schedule', 'Weekly', false),
('Pipeline review', 'Analyze sales pipeline and forecast', 'Weekly', false),
('Financial reconciliation', 'Match transactions and update books', 'Weekly', false);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Department summary view
CREATE OR REPLACE VIEW department_summary AS
SELECT 
  d.id,
  d.slug,
  d.name,
  d.code,
  COUNT(DISTINCT vt.id) as victory_target_count,
  COUNT(DISTINCT pm.id) as power_move_count,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'pending') as pending_tasks,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'pending') as pending_commitments
FROM departments d
LEFT JOIN victory_targets vt ON vt.department_id = d.id AND vt.is_active = true
LEFT JOIN power_moves pm ON pm.department_id = d.id AND pm.is_active = true
LEFT JOIN tasks t ON t.department_id = d.id
LEFT JOIN commitments c ON c.department_id = d.id
GROUP BY d.id, d.slug, d.name, d.code;

-- Company performance view
CREATE OR REPLACE VIEW company_performance AS
SELECT 
  b.slug as brand,
  b.name as brand_name,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'active') as active_clients,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'dropped') as dropped_clients,
  SUM(c.monthly_fee) FILTER (WHERE c.status = 'active') as current_mrr,
  COUNT(DISTINCT c.id) FILTER (WHERE c.origin = 'Existing' AND c.status = 'active') as existing_clients,
  COUNT(DISTINCT c.id) FILTER (WHERE c.origin = 'Planned' AND c.status = 'active') as planned_clients,
  COUNT(DISTINCT c.id) FILTER (WHERE c.origin = 'Bonus' AND c.status = 'active') as bonus_clients
FROM brands b
LEFT JOIN clients c ON c.brand_id = b.id
GROUP BY b.id, b.slug, b.name;
