-- Create profile table 
create table public.profile (
    id uuid references auth.users not null primary key, -- auth.users uuid, will be used to build txt_record
    email text, -- user email
    domain text, -- user domain
    name text, -- user name
    ring_id serial, -- id to identify user domain on the webring
    valid boolean default false, -- check if user domain is "valid"
    tagline text default '',
    image_url text default '',
    is_verified boolean default false,
    github_url text default '',
    tags text[3] default array[]::text[]
);
comment on table public.profile is 'Table to store user data';

-- Enable row level security for public.profile
alter table profile enable row level security;

-- Create RLS policies
create policy "Allow user to read access their own profile" on public.profile 
    for select using (auth.uid() = id);
create policy "Allow user to edit their own profile" on public.profile 
    for update using (auth.uid() = id);





