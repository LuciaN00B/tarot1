/*
  # Move Vector Extension from Public Schema

  ## Changes
  This migration moves the vector extension from the public schema to the extensions schema.
  This is a security best practice to keep extensions separate from application data.

  ### Steps
  1. Create extensions schema if it doesn't exist
  2. Move vector extension to extensions schema
  3. Update function search paths to include extensions schema

  ## Security Notes
  - Keeps the public schema clean for application data
  - Follows PostgreSQL best practices for extension management
  - The vector extension will still be accessible via qualified names
*/

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move vector extension to extensions schema
ALTER EXTENSION vector SET SCHEMA extensions;

-- Grant usage on extensions schema to necessary roles
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Update the search path to include extensions schema
-- This ensures the vector type and functions are accessible without schema qualification
ALTER DATABASE postgres SET search_path TO public, extensions;
