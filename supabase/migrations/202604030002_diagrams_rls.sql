ALTER TABLE public.diagrams ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.diagram_folders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS diagrams_user_id_idx ON public.diagrams(user_id);
CREATE INDEX IF NOT EXISTS diagram_folders_user_id_idx ON public.diagram_folders(user_id);

ALTER TABLE public.diagrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagram_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own diagrams" ON public.diagrams
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own diagram folders" ON public.diagram_folders
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
