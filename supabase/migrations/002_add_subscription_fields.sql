-- Add Stripe subscription fields to businesses table
-- This migration adds columns to track subscription status for billing

-- Add subscription-related columns to businesses table
ALTER TABLE businesses
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN stripe_subscription_id TEXT,
ADD COLUMN subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN subscription_current_period_end TIMESTAMPTZ;

-- Create index for Stripe customer lookups
CREATE INDEX idx_businesses_stripe_customer ON businesses(stripe_customer_id);

-- Add comment for documentation
COMMENT ON COLUMN businesses.stripe_customer_id IS 'Stripe customer ID for this business';
COMMENT ON COLUMN businesses.stripe_subscription_id IS 'Active Stripe subscription ID';
COMMENT ON COLUMN businesses.subscription_status IS 'Subscription status: inactive, active, past_due, canceled';
COMMENT ON COLUMN businesses.subscription_current_period_end IS 'When the current billing period ends';
