-- Diagrams now use the shared workspace folders table.
-- If folder_id still points to diagram_folders, creating or moving a diagram
-- into a new workspace folder fails in PostgREST with HTTP 409.

BEGIN;

ALTER TABLE public.folders
ADD COLUMN IF NOT EXISTS icon text,
ADD COLUMN IF NOT EXISTS parent_id uuid;

INSERT INTO public.folders (id, user_id, name, created_at)
SELECT diagram_folders.id,
       COALESCE(diagram_folders.user_id, diagram_owner.user_id),
       diagram_folders.name,
       diagram_folders.created_at
FROM public.diagram_folders
LEFT JOIN LATERAL (
  SELECT diagrams.user_id
  FROM public.diagrams
  WHERE diagrams.folder_id = diagram_folders.id
    AND diagrams.user_id IS NOT NULL
  LIMIT 1
) AS diagram_owner ON true
WHERE COALESCE(diagram_folders.user_id, diagram_owner.user_id) IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.folders
    WHERE folders.id = diagram_folders.id
  );

DO $$
DECLARE
  constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT DISTINCT pg_constraint.conname
    FROM pg_constraint
    JOIN pg_attribute
      ON pg_attribute.attrelid = pg_constraint.conrelid
     AND pg_attribute.attnum = ANY(pg_constraint.conkey)
    WHERE pg_constraint.conrelid = 'public.diagrams'::regclass
      AND pg_constraint.contype = 'f'
      AND pg_attribute.attname = 'folder_id'
      AND pg_constraint.confrelid <> 'public.folders'::regclass
  LOOP
    EXECUTE format('ALTER TABLE public.diagrams DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END $$;

UPDATE public.diagrams
SET folder_id = NULL
WHERE folder_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.folders
    WHERE folders.id = diagrams.folder_id
  );

CREATE INDEX IF NOT EXISTS diagrams_folder_id_idx ON public.diagrams(folder_id);
CREATE INDEX IF NOT EXISTS notes_folder_id_idx ON public.notes(folder_id);
CREATE INDEX IF NOT EXISTS folders_parent_id_idx ON public.folders(parent_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    JOIN pg_attribute
      ON pg_attribute.attrelid = pg_constraint.conrelid
     AND pg_attribute.attnum = ANY(pg_constraint.conkey)
    WHERE pg_constraint.conrelid = 'public.diagrams'::regclass
      AND pg_constraint.confrelid = 'public.folders'::regclass
      AND pg_constraint.contype = 'f'
      AND pg_attribute.attname = 'folder_id'
  ) THEN
    ALTER TABLE public.diagrams
    ADD CONSTRAINT diagrams_folder_id_fkey
    FOREIGN KEY (folder_id)
    REFERENCES public.folders(id)
    ON DELETE SET NULL;
  END IF;
END $$;

DO $$
DECLARE
  constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT DISTINCT pg_constraint.conname
    FROM pg_constraint
    JOIN pg_attribute
      ON pg_attribute.attrelid = pg_constraint.conrelid
     AND pg_attribute.attnum = ANY(pg_constraint.conkey)
    WHERE pg_constraint.conrelid = 'public.notes'::regclass
      AND pg_constraint.contype = 'f'
      AND pg_attribute.attname = 'folder_id'
      AND pg_constraint.confrelid <> 'public.folders'::regclass
  LOOP
    EXECUTE format('ALTER TABLE public.notes DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    JOIN pg_attribute
      ON pg_attribute.attrelid = pg_constraint.conrelid
     AND pg_attribute.attnum = ANY(pg_constraint.conkey)
    WHERE pg_constraint.conrelid = 'public.notes'::regclass
      AND pg_constraint.confrelid = 'public.folders'::regclass
      AND pg_constraint.contype = 'f'
      AND pg_attribute.attname = 'folder_id'
  ) THEN
    UPDATE public.notes
    SET folder_id = NULL
    WHERE folder_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM public.folders
        WHERE folders.id = notes.folder_id
      );

    ALTER TABLE public.notes
    ADD CONSTRAINT notes_folder_id_fkey
    FOREIGN KEY (folder_id)
    REFERENCES public.folders(id)
    ON DELETE SET NULL;
  END IF;
END $$;

DO $$
DECLARE
  constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT DISTINCT pg_constraint.conname
    FROM pg_constraint
    JOIN pg_attribute
      ON pg_attribute.attrelid = pg_constraint.conrelid
     AND pg_attribute.attnum = ANY(pg_constraint.conkey)
    WHERE pg_constraint.conrelid = 'public.folders'::regclass
      AND pg_constraint.contype = 'f'
      AND pg_attribute.attname = 'parent_id'
      AND pg_constraint.confrelid <> 'public.folders'::regclass
  LOOP
    EXECUTE format('ALTER TABLE public.folders DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    JOIN pg_attribute
      ON pg_attribute.attrelid = pg_constraint.conrelid
     AND pg_attribute.attnum = ANY(pg_constraint.conkey)
    WHERE pg_constraint.conrelid = 'public.folders'::regclass
      AND pg_constraint.confrelid = 'public.folders'::regclass
      AND pg_constraint.contype = 'f'
      AND pg_attribute.attname = 'parent_id'
  ) THEN
    UPDATE public.folders
    SET parent_id = NULL
    WHERE parent_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM public.folders parent_folder
        WHERE parent_folder.id = folders.parent_id
      );

    ALTER TABLE public.folders
    ADD CONSTRAINT folders_parent_id_fkey
    FOREIGN KEY (parent_id)
    REFERENCES public.folders(id)
    ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'folders_parent_id_not_self'
      AND conrelid = 'public.folders'::regclass
  ) THEN
    UPDATE public.folders
    SET parent_id = NULL
    WHERE parent_id = id;

    ALTER TABLE public.folders
    ADD CONSTRAINT folders_parent_id_not_self
    CHECK (parent_id IS NULL OR parent_id <> id);
  END IF;
END $$;

UPDATE public.diagrams
SET title = 'Untitled Diagram'
WHERE title IS NULL;

ALTER TABLE public.diagrams
ALTER COLUMN title SET DEFAULT 'Untitled Diagram',
ALTER COLUMN title SET NOT NULL;

NOTIFY pgrst, 'reload schema';

COMMIT;
