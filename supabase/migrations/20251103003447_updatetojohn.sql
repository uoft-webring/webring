alter table "public"."profile" drop constraint "profile_slug_key";

drop index if exists "public"."profile_slug_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_uoft_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'auth', 'public'
AS $function$

begin
    if position(reverse('utoronto.ca') in reverse(new.email)) = 1 then
        return new;
    else
        return null;
    end if; -- end if statement
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'auth', 'public'
AS $function$

begin
    insert into public.profile(id, email, name, domain, subdomain)
    values (new.id, new.email, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'domain', gen_random_uuid()::text); -- remember to have the single quotes this!

    return new;
end;
$function$
;


