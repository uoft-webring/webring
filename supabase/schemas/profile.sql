CREATE TABLE profile (
    user_id UUID PRIMARY KEY,
    user_email TEXT,
    domain TEXT,
    domain_txt_record TEXT,
    name TEXT
);

ALTER TABLE profile ENABLE ROW LEVEL SECURITY;

-- TODO: add RLS policies


