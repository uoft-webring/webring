alter table "public"."profile" alter column "github_url" set default ''::text;

alter table "public"."profile" alter column "image_url" set default ''::text;

alter table "public"."profile" alter column "is_verified" set default false;

alter table "public"."profile" alter column "tagline" set default ''::text;

alter table "public"."profile" alter column "tags" set default ARRAY[]::text[];

alter table "public"."profile" alter column "valid" set default false;

-- Start ring_id sequence at 0
alter sequence profile_ring_id_seq minvalue 0 start 0 restart with 0;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'auth', 'public'
AS $function$

begin
    insert into public.profile(id, email, name, domain) 
    values (new.id, new.email, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'domain'); -- remember to have the single quotes this!

    return new;
end;
$function$
;


