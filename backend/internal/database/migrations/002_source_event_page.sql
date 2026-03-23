ALTER TABLE events ADD COLUMN IF NOT EXISTS source_event_page TEXT;
ALTER TABLE event_suggestions ADD COLUMN IF NOT EXISTS source_event_page TEXT;
