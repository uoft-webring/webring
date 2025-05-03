create table "public"."profile" (
    "user_id" uuid not null,
    "user_email" text,
    "domain" text,
    "domain_txt_record" text,
    "name" text
);


alter table "public"."profile" enable row level security;

CREATE UNIQUE INDEX profile_pkey ON public.profile USING btree (user_id);

alter table "public"."profile" add constraint "profile_pkey" PRIMARY KEY using index "profile_pkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_confirmation_sent(user_email text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
    DECLARE 
        confirmation TEXT;
    BEGIN 
        SELECT confirmation_sent_at INTO confirmation
        FROM auth.users
        WHERE email = user_email;
        RETURN confirmation;
    END;
$function$
;

create or replace view "public"."users" as  SELECT users.instance_id,
    users.id,
    users.aud,
    users.role,
    users.email,
    users.encrypted_password,
    users.email_confirmed_at,
    users.invited_at,
    users.confirmation_token,
    users.confirmation_sent_at,
    users.recovery_token,
    users.recovery_sent_at,
    users.email_change_token_new,
    users.email_change,
    users.email_change_sent_at,
    users.last_sign_in_at,
    users.raw_app_meta_data,
    users.raw_user_meta_data,
    users.is_super_admin,
    users.created_at,
    users.updated_at,
    users.phone,
    users.phone_confirmed_at,
    users.phone_change,
    users.phone_change_token,
    users.phone_change_sent_at,
    users.confirmed_at,
    users.email_change_token_current,
    users.email_change_confirm_status,
    users.banned_until,
    users.reauthentication_token,
    users.reauthentication_sent_at,
    users.is_sso_user,
    users.deleted_at,
    users.is_anonymous
   FROM auth.users;


grant delete on table "public"."profile" to "anon";

grant insert on table "public"."profile" to "anon";

grant references on table "public"."profile" to "anon";

grant select on table "public"."profile" to "anon";

grant trigger on table "public"."profile" to "anon";

grant truncate on table "public"."profile" to "anon";

grant update on table "public"."profile" to "anon";

grant delete on table "public"."profile" to "authenticated";

grant insert on table "public"."profile" to "authenticated";

grant references on table "public"."profile" to "authenticated";

grant select on table "public"."profile" to "authenticated";

grant trigger on table "public"."profile" to "authenticated";

grant truncate on table "public"."profile" to "authenticated";

grant update on table "public"."profile" to "authenticated";

grant delete on table "public"."profile" to "service_role";

grant insert on table "public"."profile" to "service_role";

grant references on table "public"."profile" to "service_role";

grant select on table "public"."profile" to "service_role";

grant trigger on table "public"."profile" to "service_role";

grant truncate on table "public"."profile" to "service_role";

grant update on table "public"."profile" to "service_role";


