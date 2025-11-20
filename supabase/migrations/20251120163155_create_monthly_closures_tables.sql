/*
  # Create Monthly Closures Tables

  1. New Tables
    - `monthly_closures`
      - `id` (uuid, primary key) - Unique identifier for the closure
      - `month` (integer) - Month number (1-12)
      - `year` (integer) - Year (e.g., 2024)
      - `status` (text) - Status: 'open', 'reviewing', 'closed'
      - `total_hours` (numeric) - Total hours worked in the month
      - `total_exceeded_hours` (numeric) - Total exceeded hours across all employees
      - `total_employees` (integer) - Number of employees in this closure
      - `employees_exceeded` (integer) - Number of employees who exceeded limits
      - `allowed_monthly_hours` (numeric) - The configured monthly hours limit at time of closure
      - `notes` (text, nullable) - General notes about the closure
      - `closed_at` (timestamptz, nullable) - When the month was closed
      - `closed_by` (text, nullable) - Who closed the month
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp
    
    - `monthly_closure_details`
      - `id` (uuid, primary key) - Unique identifier for the detail record
      - `closure_id` (uuid, foreign key) - References monthly_closures
      - `user_id` (text) - Employee user ID
      - `user_name` (text) - Employee name (snapshot at closure time)
      - `user_email` (text) - Employee email (snapshot)
      - `total_monthly_hours` (numeric) - Total hours worked by employee in month
      - `allowed_hours` (numeric) - Monthly hours limit for this employee
      - `exceeded_hours` (numeric) - Hours exceeded (0 if not exceeded)
      - `total_clockings` (integer) - Number of clockings in the month
      - `status` (text) - 'normal' or 'exceeded'
      - `notes` (text, nullable) - Notes specific to this employee
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Indexes
    - Index on monthly_closures (month, year) for fast lookups
    - Index on monthly_closures (status) for filtering
    - Index on monthly_closure_details (closure_id) for joins
    - Index on monthly_closure_details (user_id) for employee lookups
    - Unique constraint on monthly_closures (month, year)

  3. Security
    - Enable RLS on both tables
    - Add policies for RRHH and SYSTEM_ADMIN roles to read/write
    - Add policies for EMPLOYEE role to read their own details only
*/

-- Create monthly_closures table
CREATE TABLE IF NOT EXISTS monthly_closures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL CHECK (year >= 2000 AND year <= 2100),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'closed')),
  total_hours numeric NOT NULL DEFAULT 0,
  total_exceeded_hours numeric NOT NULL DEFAULT 0,
  total_employees integer NOT NULL DEFAULT 0,
  employees_exceeded integer NOT NULL DEFAULT 0,
  allowed_monthly_hours numeric NOT NULL DEFAULT 160,
  notes text,
  closed_at timestamptz,
  closed_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(month, year)
);

-- Create monthly_closure_details table
CREATE TABLE IF NOT EXISTS monthly_closure_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  closure_id uuid NOT NULL REFERENCES monthly_closures(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  user_name text NOT NULL,
  user_email text NOT NULL,
  total_monthly_hours numeric NOT NULL DEFAULT 0,
  allowed_hours numeric NOT NULL DEFAULT 160,
  exceeded_hours numeric NOT NULL DEFAULT 0,
  total_clockings integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'normal' CHECK (status IN ('normal', 'exceeded')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_monthly_closures_month_year ON monthly_closures(month, year);
CREATE INDEX IF NOT EXISTS idx_monthly_closures_status ON monthly_closures(status);
CREATE INDEX IF NOT EXISTS idx_monthly_closure_details_closure_id ON monthly_closure_details(closure_id);
CREATE INDEX IF NOT EXISTS idx_monthly_closure_details_user_id ON monthly_closure_details(user_id);

-- Enable Row Level Security
ALTER TABLE monthly_closures ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_closure_details ENABLE ROW LEVEL SECURITY;

-- Policies for monthly_closures
CREATE POLICY "RRHH and Admins can view all closures"
  ON monthly_closures
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND (
        raw_app_meta_data->>'role' IN ('RRHH', 'SYSTEM_ADMIN')
        OR raw_user_meta_data->>'role' IN ('RRHH', 'SYSTEM_ADMIN')
      )
    )
  );

CREATE POLICY "RRHH and Admins can insert closures"
  ON monthly_closures
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND (
        raw_app_meta_data->>'role' IN ('RRHH', 'SYSTEM_ADMIN')
        OR raw_user_meta_data->>'role' IN ('RRHH', 'SYSTEM_ADMIN')
      )
    )
  );

CREATE POLICY "RRHH and Admins can update closures"
  ON monthly_closures
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND (
        raw_app_meta_data->>'role' IN ('RRHH', 'SYSTEM_ADMIN')
        OR raw_user_meta_data->>'role' IN ('RRHH', 'SYSTEM_ADMIN')
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND (
        raw_app_meta_data->>'role' IN ('RRHH', 'SYSTEM_ADMIN')
        OR raw_user_meta_data->>'role' IN ('RRHH', 'SYSTEM_ADMIN')
      )
    )
  );

CREATE POLICY "Only SYSTEM_ADMIN can delete closures"
  ON monthly_closures
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND (
        raw_app_meta_data->>'role' = 'SYSTEM_ADMIN'
        OR raw_user_meta_data->>'role' = 'SYSTEM_ADMIN'
      )
    )
  );

-- Policies for monthly_closure_details
CREATE POLICY "RRHH and Admins can view all closure details"
  ON monthly_closure_details
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND (
        raw_app_meta_data->>'role' IN ('RRHH', 'SYSTEM_ADMIN')
        OR raw_user_meta_data->>'role' IN ('RRHH', 'SYSTEM_ADMIN')
      )
    )
  );

CREATE POLICY "Employees can view their own closure details"
  ON monthly_closure_details
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "RRHH and Admins can insert closure details"
  ON monthly_closure_details
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND (
        raw_app_meta_data->>'role' IN ('RRHH', 'SYSTEM_ADMIN')
        OR raw_user_meta_data->>'role' IN ('RRHH', 'SYSTEM_ADMIN')
      )
    )
  );

CREATE POLICY "RRHH and Admins can update closure details"
  ON monthly_closure_details
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND (
        raw_app_meta_data->>'role' IN ('RRHH', 'SYSTEM_ADMIN')
        OR raw_user_meta_data->>'role' IN ('RRHH', 'SYSTEM_ADMIN')
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND (
        raw_app_meta_data->>'role' IN ('RRHH', 'SYSTEM_ADMIN')
        OR raw_user_meta_data->>'role' IN ('RRHH', 'SYSTEM_ADMIN')
      )
    )
  );

CREATE POLICY "Only SYSTEM_ADMIN can delete closure details"
  ON monthly_closure_details
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND (
        raw_app_meta_data->>'role' = 'SYSTEM_ADMIN'
        OR raw_user_meta_data->>'role' = 'SYSTEM_ADMIN'
      )
    )
  );
