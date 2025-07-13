-- Fix the activation_code column to be nullable since we now assign codes after signup
ALTER TABLE public.profiles 
ALTER COLUMN activation_code DROP NOT NULL;