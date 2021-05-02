CREATE TABLE Messages
IF NOT EXISTS (
  messageId UUID PRIMARY KEY,
  rootId UUID,
  subject TEXT,
  body TEXT
);

CREATE TABLE References
IF NOT EXISTS (
  messageId UUID,
  parentId UUID,
);

CREATE UNIQUE INDEX References_parent
ON References (parentId, messageId);

CREATE INDEX Messages_root
ON Messages (rootId);
