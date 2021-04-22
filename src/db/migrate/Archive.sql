CREATE TABLE Archive
IF NOT EXISTS (
  archiveId INTEGER PRIMARY KEY,
  hash TEXT NOT NULL,
  content TEXT NOT NULL
);

CREATE UNIQUE INDEX Archive_hash
ON Archive (hash);
