-- Tags become their own entity. Existing names are copied as-is (including
-- case and spelling variants) so later cleanup can merge them deliberately.

CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_tags (
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (event_id, tag_id)
);

CREATE TABLE IF NOT EXISTS event_suggestion_tags (
  suggestion_id UUID NOT NULL REFERENCES event_suggestions(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (suggestion_id, tag_id)
);

INSERT INTO tags (name)
SELECT DISTINCT BTRIM(tag)
FROM (
  SELECT UNNEST(tags) AS tag FROM events
  UNION ALL
  SELECT UNNEST(tags) AS tag FROM event_suggestions
) AS all_tags
WHERE BTRIM(tag) <> '';

INSERT INTO event_tags (event_id, tag_id, sort_order)
SELECT DISTINCT ON (e.id, t.id) e.id, t.id, (u.ord - 1)::int
FROM events e
CROSS JOIN LATERAL UNNEST(e.tags) WITH ORDINALITY AS u(tag, ord)
JOIN tags t ON t.name = BTRIM(u.tag)
WHERE BTRIM(u.tag) <> ''
ORDER BY e.id, t.id, u.ord;

INSERT INTO event_suggestion_tags (suggestion_id, tag_id, sort_order)
SELECT DISTINCT ON (s.id, t.id) s.id, t.id, (u.ord - 1)::int
FROM event_suggestions s
CROSS JOIN LATERAL UNNEST(s.tags) WITH ORDINALITY AS u(tag, ord)
JOIN tags t ON t.name = BTRIM(u.tag)
WHERE BTRIM(u.tag) <> ''
ORDER BY s.id, t.id, u.ord;

ALTER TABLE events DROP COLUMN IF EXISTS tags;
ALTER TABLE event_suggestions DROP COLUMN IF EXISTS tags;

CREATE INDEX IF NOT EXISTS event_tags_tag_id_idx ON event_tags (tag_id);
CREATE INDEX IF NOT EXISTS event_suggestion_tags_tag_id_idx ON event_suggestion_tags (tag_id);
