CREATE TABLE EAV
IF NOT EXISTS (
  entity INTEGER,
  attribute TEXT,
  value TEXT,
  tx INTEGER
);

CREATE UNIQUE INDEX EAV_eav
ON EAV (entity, attribute, value, tx);

CREATE UNIQUE INDEX EAV_aev
ON EAV (attribute, entity, value, tx);

CREATE UNIQUE INDEX EAV_ave
ON EAV (attribute, value, entity, tx);
