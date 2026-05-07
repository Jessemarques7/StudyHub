ALTER TABLE public.folders
ADD COLUMN IF NOT EXISTS icon text,
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.folders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS folders_parent_id_idx ON public.folders(parent_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'folders_parent_id_not_self'
      AND conrelid = 'public.folders'::regclass
  ) THEN
    ALTER TABLE public.folders
    ADD CONSTRAINT folders_parent_id_not_self
    CHECK (parent_id IS NULL OR parent_id <> id);
  END IF;
END $$;

INSERT INTO public.folders (id, user_id, name, created_at)
SELECT diagram_folders.id, diagram_folders.user_id, diagram_folders.name, diagram_folders.created_at
FROM public.diagram_folders
WHERE diagram_folders.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.folders
    WHERE folders.id = diagram_folders.id
  );

NOTIFY pgrst, 'reload schema';
