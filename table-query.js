const schema = `
CREATE TABLE IF NOT EXISTS Trim (
  id INTEGER PRIMARY KEY,
  name TEXT,
  price INTEGER,
  image_src TEXT
);

CREATE TABLE IF NOT EXISTS Powertrain (
  id INTEGER PRIMARY KEY,
  name TEXT,
  image_src TEXT,
  price INTEGER,
  detail_id INTEGER,
  comment TEXT,
  FOREIGN KEY (detail_id) REFERENCES Detail(id)
);

CREATE TABLE IF NOT EXISTS Bodytype (
  id INTEGER PRIMARY KEY,
  name TEXT,
  image_src TEXT,
  price INTEGER,
  detail_id INTEGER,
  comment TEXT,
  FOREIGN KEY (detail_id) REFERENCES Detail(id)
);

CREATE TABLE IF NOT EXISTS Driving_System (
  id INTEGER PRIMARY KEY,
  name TEXT,
  image_src TEXT,
  price INTEGER,
  detail_id INTEGER,
  comment TEXT,
  FOREIGN KEY (detail_id) REFERENCES Detail(id)
);

CREATE TABLE IF NOT EXISTS Model (
  id INTEGER PRIMARY KEY,
  trim_id INTEGER,
  powertrain_id INTEGER,
  bodytype_id INTEGER,
  driving_system_id INTEGER,
  price INTEGER,
  FOREIGN KEY (trim_id) REFERENCES Trim(id),
  FOREIGN KEY (powertrain_id) REFERENCES Powertrain(id),
  FOREIGN KEY (bodytype_id) REFERENCES Bodytype(id),
  FOREIGN KEY (driving_system_id) REFERENCES Driving_System(id)
);

CREATE TABLE IF NOT EXISTS Trim_Exterior (
  id INTEGER PRIMARY KEY,
  trim_id INTEGER,
  exterior_color_id INTEGER,
  FOREIGN KEY (trim_id) REFERENCES Trim(id),
  FOREIGN KEY (exterior_color_id) REFERENCES Exterior_Color(id)
);

CREATE TABLE IF NOT EXISTS Exterior_Color (
  id INTEGER PRIMARY KEY,
  name TEXT,
  price INTEGER,
  color_code TEXT,
  image_src TEXT,
  comment TEXT
);

CREATE TABLE IF NOT EXISTS Interior_Color (
  id INTEGER PRIMARY KEY,
  exterior_color_id INTEGER,
  name TEXT,
  price INTEGER,
  icon_src TEXT,
  image_src TEXT,
  comment TEXT,
  FOREIGN KEY (exterior_color_id) REFERENCES Exterior_Color(id)
);

CREATE TABLE IF NOT EXISTS Sales (
  id INTEGER PRIMARY KEY,
  model_id INTEGER,
  exterior_color_id INTEGER,
  interior_color_id INTEGER,
  wheel_id INTEGER,
  age INTEGER,
  gender TEXT,
  tag1 INTEGER,
  tag2 INTEGER,
  tag3 INTEGER,
  FOREIGN KEY (model_id) REFERENCES Model(id),
  FOREIGN KEY (exterior_color_id) REFERENCES Exterior_Color(id),
  FOREIGN KEY (interior_color_id) REFERENCES Interior_Color(id),
  FOREIGN KEY (wheel_id) REFERENCES Wheel(id),
  FOREIGN KEY (tag1) REFERENCES Tag(id),
  FOREIGN KEY (tag2) REFERENCES Tag(id),
  FOREIGN KEY (tag3) REFERENCES Tag(id)
);

CREATE TABLE IF NOT EXISTS Sales_options (
  id INTEGER PRIMARY KEY,
  sales_id INTEGER,
  additional_option_id INTEGER,
  FOREIGN KEY (sales_id) REFERENCES Sales(id),
  FOREIGN KEY (additional_option_id) REFERENCES Additional_Option(id)
);

CREATE TABLE IF NOT EXISTS Additional_Option (
  id INTEGER PRIMARY KEY,
  name TEXT,
  top_option_id INTEGER,
  detail_id INTEGER,
  parts_src TEXT,
  price INTEGER,
  image_src TEXT,
  flag TEXT,
  category TEXT
);

CREATE TABLE IF NOT EXISTS Tag (
  id INTEGER PRIMARY KEY,
  name TEXT
);

CREATE TABLE IF NOT EXISTS Cardb (
  id INTEGER PRIMARY KEY,
  keyword TEXT,
  description TEXT,
  image_src TEXT
);

CREATE TABLE IF NOT EXISTS Detail (
  id INTEGER PRIMARY KEY,
  title TEXT,
  description TEXT,
  image_src TEXT,
  info TEXT
);

CREATE TABLE IF NOT EXISTS Wheel (
  id INTEGER PRIMARY KEY,
  name TEXT,
  detail_id INTEGER,
  parts_src TEXT,
  price INTEGER,
  image_src TEXT,
  flag TEXT,
  FOREIGN KEY (detail_id) REFERENCES Detail(id)
);

CREATE TABLE IF NOT EXISTS Tag_Powertrain (
  id INTEGER PRIMARY KEY,
  tag_id INTEGER,
  powertrain_id INTEGER,
  FOREIGN KEY (tag_id) REFERENCES Tag(id),
  FOREIGN KEY (powertrain_id) REFERENCES Powertrain(id)
);

CREATE TABLE IF NOT EXISTS Tag_Driving_System (
  id INTEGER PRIMARY KEY,
  tag_id INTEGER,
  driving_system_id INTEGER,
  FOREIGN KEY (tag_id) REFERENCES Tag(id),
  FOREIGN KEY (driving_system_id) REFERENCES Driving_System(id)
);

CREATE TABLE IF NOT EXISTS Tag_Bodytype (
  id INTEGER PRIMARY KEY,
  tag_id INTEGER,
  bodytype_id INTEGER,
  FOREIGN KEY (tag_id) REFERENCES Tag(id),
  FOREIGN KEY (bodytype_id) REFERENCES Bodytype(id)
);

CREATE TABLE IF NOT EXISTS Tag_Wheel (
  id INTEGER PRIMARY KEY,
  tag_id INTEGER,
  wheel_id INTEGER,
  FOREIGN KEY (tag_id) REFERENCES Tag(id),
  FOREIGN KEY (wheel_id) REFERENCES Wheel(id)
);

CREATE TABLE IF NOT EXISTS Tag_Additional_Option (
  id INTEGER PRIMARY KEY,
  tag_id INTEGER,
  additional_option_id INTEGER,
  FOREIGN KEY (tag_id) REFERENCES Tag(id),
  FOREIGN KEY (additional_option_id) REFERENCES Additional_Option(id)
);

CREATE TRIGGER IF NOT EXISTS "Tag_Additional_Option_ref_check"
BEFORE INSERT ON "Tag_Additional_Option"
FOR EACH ROW
BEGIN
  SELECT RAISE(ROLLBACK, 'insert on table "Tag_Additional_Option" violates foreign key constraint "Tag_Additional_Option_ref_check"') WHERE NEW."id" IS NOT NULL AND (
    SELECT "id" FROM "Tag" WHERE "id" = NEW."tag_id"
  ) IS NULL;
  SELECT RAISE(ROLLBACK, 'insert on table "Tag_Additional_Option" violates foreign key constraint "Tag_Additional_Option_ref_check"') WHERE NEW."id" IS NOT NULL AND (
    SELECT "id" FROM "Additional_Option" WHERE "id" = NEW."additional_option_id"
  ) IS NULL;
END;
`;

module.exports = schema;
