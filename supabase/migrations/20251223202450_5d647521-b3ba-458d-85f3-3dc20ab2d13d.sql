-- Remove foreign key constraint and make token_id nullable (we don't use tokens anymore)
ALTER TABLE charity_votes DROP CONSTRAINT IF EXISTS charity_votes_token_id_fkey;
ALTER TABLE charity_votes ALTER COLUMN token_id DROP NOT NULL;