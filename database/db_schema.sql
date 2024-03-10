-- EXAMPLE DATABASE SCHEMA WITH GEOMETRIES AND TIMESTAMPS

CREATE TABLE organizations (
  id SERIAL,
  name VARCHAR(255),
  website VARCHAR(255),
  PRIMARY KEY(id)
);

CREATE TABLE contacts (
  id SERIAL,
  name VARCHAR(255),
  email VARCHAR(255),
  role VARCHAR(255),
  phone VARCHAR(255),
  organization_id INT REFERENCES organizations (id),
  PRIMARY KEY(id)
);

CREATE TABLE instruments (
  id SERIAL,
  type VARCHAR(255),
  model VARCHAR(255),
  description TEXT,
  PRIMARY KEY(id)
);

CREATE TABLE surveys (
  id SERIAL,
  organization_id INT REFERENCES organizations (id),
  contacts_id INT REFERENCES contacts (id),
  instruments_id INT REFERENCES instruments (id),
  startTimestamp timestamp with time zone,
  endTimestamp timestamp with time zone,
  PRIMARY KEY(id)
);

CREATE TABLE river_catchment_huc (
  id BIGINT, -- HUC ID
  huc_level INT,
  area REAL,
  name VARCHAR(255),
  state VARCHAR(255),
  down_catchment_id BIGINT,
  geometry geometry,
  FOREIGN KEY (down_catchment_id) references river_catchment_huc(id),
  PRIMARY KEY(id)
);