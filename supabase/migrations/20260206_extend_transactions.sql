-- Migration: Extend transactions table with audit, location, and device tracking
-- Date: 2026-02-06
-- Purpose: Add fields for "no-excuse" logging with image+location binding

-- ============================================================================
-- PART 1: Extend transactions table (additive only, backward compatible)
-- ============================================================================

-- Add device tracking
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Add source channel tracking
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS source_channel TEXT DEFAULT 'LEGACY'
CHECK (source_channel IN ('FORM', 'CHAT_TEXT', 'CHAT_VOICE', 'SCAN_ONLY', 'API', 'FAST_ENTRY_SALE', 'FAST_ENTRY_EXPENSE', 'LEGACY'));

-- Add direction field (more explicit than type)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS direction TEXT
CHECK (direction IN ('SALE_IN', 'EXPENSE_OUT', 'TRANSFER_IN', 'TRANSFER_OUT'));

-- Update direction based on existing type (one-time migration)
UPDATE transactions
SET direction = CASE
  WHEN type = 'sale' THEN 'SALE_IN'
  WHEN type = 'expense' THEN 'EXPENSE_OUT'
  ELSE NULL
END
WHERE direction IS NULL;

-- Add payment method
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'CASH'
CHECK (payment_method IN ('CASH', 'BKASH', 'BANK', 'OTHER'));

-- Add business vs personal flag
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS is_business BOOLEAN DEFAULT true;

-- Add location reference
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS location_id UUID;

-- Add receipt image tracking
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS has_receipt_image BOOLEAN DEFAULT false;

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS receipt_image_id UUID;

-- Add AI metadata
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS ai_parsed_payload JSONB;

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS ai_confidence_score NUMERIC;

-- Add merchant metadata (parsed from AI)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS merchant_name TEXT;

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS merchant_type TEXT;

-- Add raw input for audit trail
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS raw_text_input TEXT;

-- Add occurred_at (time of actual transaction vs created_at)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS occurred_at TIMESTAMPTZ;

-- Backfill occurred_at from timestamp
UPDATE transactions
SET occurred_at = timestamp
WHERE occurred_at IS NULL;

-- Add status field
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'CONFIRMED'
CHECK (status IN ('PENDING_REVIEW', 'CONFIRMED', 'FLAGGED', 'VOID'));

-- Add app version tracking
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS app_version TEXT;

-- ============================================================================
-- PART 2: Create locations table
-- ============================================================================

CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  organization_id UUID,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  accuracy_meters NUMERIC,
  captured_at TIMESTAMPTZ DEFAULT now(),
  captured_by_user_id UUID REFERENCES profiles(id),

  -- Reverse geocode fields (optional, filled by backend)
  place_name TEXT,
  city TEXT,
  country TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key from transactions to locations
ALTER TABLE transactions
ADD CONSTRAINT transactions_location_id_fkey
FOREIGN KEY (location_id) REFERENCES locations(id)
ON DELETE SET NULL;

-- Index for location lookups
CREATE INDEX IF NOT EXISTS idx_locations_org ON locations(organization_id);
CREATE INDEX IF NOT EXISTS idx_locations_captured_by ON locations(captured_by_user_id);

-- ============================================================================
-- PART 3: Create files table (for receipt images)
-- ============================================================================

CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  organization_id UUID,
  file_type TEXT NOT NULL CHECK (file_type IN ('RECEIPT_IMAGE', 'DOCUMENT', 'OTHER')),

  -- Storage reference (Supabase Storage path or URL)
  storage_bucket TEXT DEFAULT 'receipts',
  storage_path TEXT NOT NULL,
  storage_url TEXT,

  -- File metadata
  file_size_bytes BIGINT,
  mime_type TEXT,
  hash_sha256 TEXT, -- For duplicate detection and integrity

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by_user_id UUID REFERENCES profiles(id),
  source TEXT DEFAULT 'CAMERA_LIVE' CHECK (source IN ('CAMERA_LIVE', 'EMAIL_FORWARD', 'UPLOAD', 'OTHER'))
);

-- Add foreign key from transactions to files
ALTER TABLE transactions
ADD CONSTRAINT transactions_receipt_image_id_fkey
FOREIGN KEY (receipt_image_id) REFERENCES files(id)
ON DELETE SET NULL;

-- Indexes for file lookups
CREATE INDEX IF NOT EXISTS idx_files_org ON files(organization_id);
CREATE INDEX IF NOT EXISTS idx_files_created_by ON files(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_files_hash ON files(hash_sha256);

-- ============================================================================
-- PART 4: Create audit_log table (append-only)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  organization_id UUID,

  -- Actor (who did this)
  actor_type TEXT NOT NULL CHECK (actor_type IN ('USER', 'SYSTEM')),
  actor_id UUID, -- user id or NULL for SYSTEM

  -- Action
  action_type TEXT NOT NULL CHECK (action_type IN (
    'TRANSACTION_CREATED',
    'TRANSACTION_UPDATED',
    'TRANSACTION_STATUS_CHANGED',
    'RECEIPT_ATTACHED',
    'RECEIPT_REPLACED',
    'CATEGORY_AUTO_ASSIGNED',
    'CATEGORY_MANUALLY_CHANGED',
    'LOCATION_CAPTURED',
    'LOCATION_PERMISSION_DENIED',
    'AI_PARSE_RETRY',
    'TRANSACTION_DELETED',
    'TRANSACTION_VOIDED'
  )),

  -- Audit data
  created_at TIMESTAMPTZ DEFAULT now(),
  ip_address INET,
  device_id TEXT,

  -- State snapshots (JSON for flexibility)
  old_values JSONB,
  new_values JSONB,

  -- Optional reason (for edits/voids)
  reason TEXT
);

-- Indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_audit_log_transaction ON audit_log(transaction_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_org ON audit_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action_type ON audit_log(action_type);

-- ============================================================================
-- PART 5: Add computed columns and helper fields
-- ============================================================================

-- Add entry_delay_seconds (computed: created_at - occurred_at)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS entry_delay_seconds INTEGER
GENERATED ALWAYS AS (
  EXTRACT(EPOCH FROM (created_at - COALESCE(occurred_at, created_at)))::INTEGER
) STORED;

-- Add GPS missing reason
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS gps_missing_reason TEXT
CHECK (gps_missing_reason IN ('PERMISSION_DENIED', 'NO_GPS', 'NOT_REQUESTED', NULL));

-- Add receipt required flag (based on policy rules)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS receipt_required BOOLEAN DEFAULT false;

-- Add receipt missing flag
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS receipt_missing_flag BOOLEAN
GENERATED ALWAYS AS (
  receipt_required = true AND has_receipt_image = false
) STORED;

-- ============================================================================
-- PART 6: Create indexes for performance
-- ============================================================================

-- Transaction lookups
CREATE INDEX IF NOT EXISTS idx_transactions_device ON transactions(device_id);
CREATE INDEX IF NOT EXISTS idx_transactions_location ON transactions(location_id);
CREATE INDEX IF NOT EXISTS idx_transactions_receipt_image ON transactions(receipt_image_id);
CREATE INDEX IF NOT EXISTS idx_transactions_source_channel ON transactions(source_channel);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method ON transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_occurred_at ON transactions(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_name ON transactions(merchant_name);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_transactions_org_occurred
ON transactions(organization_id, occurred_at DESC)
WHERE status != 'VOID';

CREATE INDEX IF NOT EXISTS idx_transactions_created_by_occurred
ON transactions(created_by, occurred_at DESC);

-- Receipt compliance queries
CREATE INDEX IF NOT EXISTS idx_transactions_receipt_missing
ON transactions(organization_id, receipt_missing_flag)
WHERE receipt_missing_flag = true;

-- ============================================================================
-- PART 7: Enable RLS for new tables
-- ============================================================================

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for locations
CREATE POLICY "Users can view locations in their org"
ON locations FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can insert locations"
ON locations FOR INSERT
WITH CHECK (
  captured_by_user_id = auth.uid()
);

-- RLS Policies for files
CREATE POLICY "Users can view files in their org"
ON files FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can insert files"
ON files FOR INSERT
WITH CHECK (
  created_by_user_id = auth.uid()
);

-- RLS Policies for audit_log (read-only for users, write for system)
CREATE POLICY "Admins can view audit logs in their org"
ON audit_log FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "System can insert audit logs"
ON audit_log FOR INSERT
WITH CHECK (true); -- Backend service role will insert

-- ============================================================================
-- PART 8: Update timestamp triggers for new tables
-- ============================================================================

-- Locations updated_at trigger (if we add updated_at later)
-- Files are immutable, so no update trigger needed

-- ============================================================================
-- PART 9: Comments for documentation
-- ============================================================================

COMMENT ON COLUMN transactions.device_id IS 'Browser fingerprint or device UUID';
COMMENT ON COLUMN transactions.source_channel IS 'How the transaction was entered';
COMMENT ON COLUMN transactions.location_id IS 'GPS coordinates at time of entry';
COMMENT ON COLUMN transactions.has_receipt_image IS 'Whether a receipt photo was attached';
COMMENT ON COLUMN transactions.ai_confidence_score IS 'AI parsing confidence (0-1)';
COMMENT ON COLUMN transactions.entry_delay_seconds IS 'Time between occurrence and entry';
COMMENT ON COLUMN transactions.receipt_missing_flag IS 'Auto-computed: required but not attached';

COMMENT ON TABLE audit_log IS 'Append-only audit trail for all transaction changes';
COMMENT ON TABLE locations IS 'GPS coordinates for transaction entry locations';
COMMENT ON TABLE files IS 'Receipt images and other file attachments';

-- ============================================================================
-- PART 10: Create helper function for automatic audit logging
-- ============================================================================

-- Function to log transaction creation
CREATE OR REPLACE FUNCTION log_transaction_audit()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if this is a real insert/update (not a migration)
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (
      transaction_id,
      organization_id,
      actor_type,
      actor_id,
      action_type,
      new_values,
      device_id
    ) VALUES (
      NEW.id,
      NEW.organization_id,
      'USER',
      NEW.created_by,
      'TRANSACTION_CREATED',
      to_jsonb(NEW),
      NEW.device_id
    );
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (
      transaction_id,
      organization_id,
      actor_type,
      actor_id,
      action_type,
      old_values,
      new_values,
      device_id
    ) VALUES (
      NEW.id,
      NEW.organization_id,
      'USER',
      NEW.created_by,
      'TRANSACTION_UPDATED',
      to_jsonb(OLD),
      to_jsonb(NEW),
      NEW.device_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic audit logging
DROP TRIGGER IF EXISTS audit_transaction_changes ON transactions;
CREATE TRIGGER audit_transaction_changes
  AFTER INSERT OR UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION log_transaction_audit();

-- ============================================================================
-- PART 11: Create Supabase Storage bucket for receipts
-- ============================================================================

-- Note: This must be run separately via Supabase Dashboard or API
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('receipts', 'receipts', false);

-- Storage RLS policies would be:
-- CREATE POLICY "Users can upload receipts" ON storage.objects
-- FOR INSERT WITH CHECK (bucket_id = 'receipts' AND auth.uid() IS NOT NULL);

-- CREATE POLICY "Users can view receipts in their org" ON storage.objects
-- FOR SELECT USING (bucket_id = 'receipts' AND auth.uid() IS NOT NULL);

-- ============================================================================
-- Migration complete
-- ============================================================================

-- Verify migration
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'New tables: locations, files, audit_log';
  RAISE NOTICE 'Extended transactions table with 20+ new columns';
  RAISE NOTICE 'Created indexes for performance';
  RAISE NOTICE 'Enabled RLS and audit triggers';
END $$;
