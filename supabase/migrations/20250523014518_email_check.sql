set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_uoft_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'auth', 'public'
AS $function$

begin
    if right(new.email, position('@' in reverse(new.email))) = '@mail.utoronto.ca' then
        return new;
    else
        return null;
    end if; -- end if statement
end;
$function$
;

create trigger on_user_sign_up
    before insert on auth.users
    for each row execute function check_uoft_email();


