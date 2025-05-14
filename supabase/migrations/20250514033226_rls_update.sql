drop policy "Allow user to edit their own profile" on "public"."profile";

drop function if exists "public"."get_confirmation_sent"(user_email text);

alter table "public"."profile" add column "ring_id" integer;

alter table "public"."profile" add column "valid" boolean;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'auth', 'public'
AS $function$

begin
    insert into public.profile(id, email, name) 
    values (new.id, new.email, new.raw_user_meta_data->>'name'); -- remember to have the single quotes this!

    return new;
end;
$function$
;

create policy "Allow user to edit their own profile"
on "public"."profile"
as permissive
for update
to public
using ((auth.uid() = id));



