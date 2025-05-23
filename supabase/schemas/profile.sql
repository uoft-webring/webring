-- Create profile table 
create table public.profile (
    id uuid references auth.users not null primary key, -- auth.users uuid, will be used to build txt_record
    email text, -- user email
    domain text, -- user domain
    name text, -- user name
    ring_id serial, -- id to identify user domain on the webring
    valid boolean, -- check if user domain is "valid"
    tagline text,
    image_url text,
    is_verified boolean,
    github_url text,
    tags text[3]
);
comment on table public.profile is 'Table to store user data';

-- Enable row level security for public.profile
alter table profile enable row level security;

-- Create RLS policies
create policy "Allow user to read access their own profile" on public.profile 
    for select using (auth.uid() = id);
create policy "Allow user to edit their own profile" on public.profile 
    for update using (auth.uid() = id);





