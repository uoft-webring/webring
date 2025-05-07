create table public.profile (
    id uuid references auth.users not null primary key,
    email text,
    domain text,
    domain_txt_record text, -- uuid? 
    name text
);

alter table profile enable row level security;

-- todo: add rls policies
create policy "Allow user to read access their own profile" on public.profile for select using (auth.uid() = id);
create policy "Allow user to edit their own profile" on public.profile for insert with check (auth.uid() = id);



