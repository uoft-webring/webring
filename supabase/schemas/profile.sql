-- Create profile table 
create table public.profile (
    id uuid references auth.users not null primary key,
    email text,
    domain text,
    domain_txt_record text, -- uuid? 
    name text
);
comment on table public.profile is 'Table to store user data';

-- Enable row level security for public.profile
alter table profile enable row level security;

-- TODO: Create RLS policies
create policy "Allow user to read access their own profile" on public.profile for select using (auth.uid() = id);
create policy "Allow user to edit their own profile" on public.profile for insert with check (auth.uid() = id);



