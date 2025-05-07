create table "public"."profile" (
    "id" uuid not null,
    "email" text,
    "domain" text,
    "domain_txt_record" text,
    "name" text
);


alter table "public"."profile" enable row level security;

create policy "Allow user to read access their own profile" on public.profile for select using (auth.uid() = id);
create policy "Allow user to edit their own profile" on public.profile for insert with check (auth.uid() = id);

CREATE UNIQUE INDEX profile_pkey ON public.profile USING btree (id);

alter table "public"."profile" add constraint "profile_pkey" PRIMARY KEY using index "profile_pkey";

alter table "public"."profile" add constraint "profile_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) not valid;

alter table "public"."profile" validate constraint "profile_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_confirmation_sent(user_email text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
    declare 
        confirmation text;
    begin 
        select confirmation_sent_at into confirmation
        from auth.users
        where email = user_email;
        return confirmation;
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
    insert into public.profile(id, email, name) 
    values (new.id, new.email, new.raw_user_meta_data->>'name');

    return new;
end;
$function$
;

create trigger on_auth_new_user 
    after insert on auth.users 
    for each row execute function handle_new_user();

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


