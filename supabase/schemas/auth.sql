-- create function get_confirmation_sent(user_email text) returns text as $$
--     declare
--         confirmation text;
--     begin
--         select confirmation_sent_at into confirmation
--         from auth.users
--         where email = user_email;
--         return confirmation;
--     end;
-- $$ language plpgsql;

-- IMPORTANT: Used for confirmation time
create view public.users as select * from auth.users;
revoke all on public.users from anon, authenticated;
grant select on table public.users to service_role;

-- Create user profile when a new user is created in auth.users
create function handle_new_user()
returns trigger as $$

begin
    insert into public.profile(id, email, name, domain, subdomain)
    values (new.id, new.email, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'domain', gen_random_uuid()::text); -- remember to have the single quotes this!

    return new;
end;
$$ language plpgsql security definer set search_path = auth, public;

-- Create trigger that will activate handle_new_user whenever new row is added into auth.users
create trigger on_auth_new_user
    after insert on auth.users
    for each row execute function handle_new_user();

-- Create function to check if user inputted email is a uoft email
create function check_uoft_email()
returns trigger as $$

begin
    if position(reverse('utoronto.ca') in reverse(new.email)) = 1 then
        return new;
    else
        return null;
    end if; -- end if statement
end;
$$ language plpgsql security definer set search_path = auth, public;

-- Create trigger that will activate check_uoft_email before new row is added into auth.users
create trigger on_user_sign_up
    before insert on auth.users
    for each row execute function check_uoft_email();
