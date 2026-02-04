-- Add subtopics (JSONB array) and time_spent columns to learning_topics
ALTER TABLE public.learning_topics 
ADD COLUMN IF NOT EXISTS subtopics jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS time_spent integer DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN public.learning_topics.subtopics IS 'Array of subtopics: [{id, title, completed, completedAt}]';
COMMENT ON COLUMN public.learning_topics.time_spent IS 'Time spent on topic in minutes';