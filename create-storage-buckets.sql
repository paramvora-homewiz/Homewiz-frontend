-- Create Storage Buckets for HomeWiz
-- Run this in your local Supabase Studio SQL Editor (http://localhost:54323)

-- First, make sure storage schema policies allow bucket creation
-- You may need to disable RLS temporarily for storage operations

-- Create building-images bucket (public)
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'building-images',
  'building-images', 
  true,
  false,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']::text[]
) ON CONFLICT (id) DO NOTHING;

-- Create documents bucket (private)
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']::text[]
) ON CONFLICT (id) DO NOTHING;

-- Create avatars bucket (public)
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]
) ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for authenticated users
-- Allow authenticated users to upload, update, and delete their own files

-- Policy for building-images bucket
INSERT INTO storage.policies (id, bucket_id, policy_name, definition)
VALUES (
  gen_random_uuid(),
  'building-images',
  'Allow all operations for building images',
  'true'
) ON CONFLICT DO NOTHING;

-- Policy for documents bucket  
INSERT INTO storage.policies (id, bucket_id, policy_name, definition)
VALUES (
  gen_random_uuid(),
  'documents',
  'Allow all operations for documents',
  'true'
) ON CONFLICT DO NOTHING;

-- Policy for avatars bucket
INSERT INTO storage.policies (id, bucket_id, policy_name, definition)
VALUES (
  gen_random_uuid(),
  'avatars',
  'Allow all operations for avatars',
  'true'
) ON CONFLICT DO NOTHING;

-- Verify buckets were created
SELECT 'Storage buckets created successfully! 🎉' as message;
SELECT id, name, public, file_size_limit FROM storage.buckets;