-- Create profile table 
create table public.profile (
    id uuid references auth.users not null primary key, -- auth.users uuid, will be used to build txt_record
    email text, -- user email
    domain text default '', -- user domain
    name text, -- user name
    ring_id serial, -- id to identify user domain on the webring
    validated_user_component text default 'disconnected', -- check if user domain is "valid", contains either "disconnected", "pending" or "connected"
    tagline text default '',
    image_url text default '',
    is_verified boolean default false,
    github_url text default '',
    tags text[3] default array[]::text[],
    graduation_year int,
    program text,
    subdomain text
);
comment on table public.profile is 'Table to store user data';

-- Enable row level security for public.profile
alter table profile enable row level security;

-- Create RLS policies
create policy "Allow user to read access their own profile" on public.profile 
    for select using (auth.uid() = id);
create policy "Allow user to edit their own profile" on public.profile 
    for update using (auth.uid() = id);

-- Start ring_id sequence at 0
alter sequence profile_ring_id_seq minvalue 0 start 0 restart with 0;





