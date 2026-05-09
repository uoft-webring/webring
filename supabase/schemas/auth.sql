-- Create user profile when a new user is created in auth.users
create function handle_new_user()
returns trigger as $$

begin
    insert into public.profile(id, email, name, domain, slug)
    values (new.id, new.email, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'domain', gen_random_uuid()::text); -- remember to have the single quotes this!

    return new;
end;
$$ language plpgsql security definer set search_path = auth, public;

-- Create trigger that will activate handle_new_user whenever new row is added into auth.users
create trigger on_auth_new_user
    after insert on auth.users
    for each row execute function handle_new_user();

-- Only UofT emails may sign up: utoronto.ca and its mail/alum/alumni subdomains
create function check_uoft_email()
returns trigger as $$
begin
    if lower(new.email) ~ '^[^@[:space:]]+@((mail|alum|alumni)\.)?utoronto\.ca$' then
        return new;
    end if;
    return null;
end;
$$ language plpgsql security definer set search_path = '';

-- Create trigger that will activate check_uoft_email before new row is added into auth.users
create trigger on_user_sign_up
    before insert on auth.users
    for each row execute function check_uoft_email();
