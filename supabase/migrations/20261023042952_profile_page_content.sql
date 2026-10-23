-- Members' own page content: a Markdown about section, projects, experience, extra links and an
-- accent colour. Shapes inside the JSON are validated by lib/validation.ts; these checks bound size.
alter table public.profile
    add column about text not null default '',
    add column projects jsonb not null default '[]'::jsonb,
    add column experience jsonb not null default '[]'::jsonb,
    add column links jsonb not null default '[]'::jsonb,
    add column accent text not null default 'periwinkle';

-- Mirrors lib/validation.ts (MAX_ABOUT_LENGTH, MAX_PROJECTS, MAX_EXPERIENCE, MAX_LINKS, ACCENTS)
alter table public.profile
    add constraint profile_about_length check (length(about) <= 4000),
    add constraint profile_projects_shape check (jsonb_typeof(projects) = 'array' and jsonb_array_length(projects) <= 6),
    add constraint profile_experience_shape check (jsonb_typeof(experience) = 'array' and jsonb_array_length(experience) <= 8),
    add constraint profile_links_shape check (jsonb_typeof(links) = 'array' and jsonb_array_length(links) <= 5),
    add constraint profile_accent_value check (accent in ('periwinkle', 'line-1', 'line-2', 'line-4', 'streetcar', 'lake'));

grant update (about, projects, experience, links, accent) on table public.profile to authenticated;
