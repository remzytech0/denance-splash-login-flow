-- Add unique constraint to username field to prevent duplicate usernames
ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);