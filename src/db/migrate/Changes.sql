CREATE TABLE Changes
IF NOT EXISTS (
  changeId INTEGER PRIMARY KEY,
  actorId TEXT NOT NULL,
  seq INTEGER NOT NULL,
  ops TEXT NOT NULL
);

CREATE UNIQUE INDEX Changes_actor
ON Changes (actorId, seq);
