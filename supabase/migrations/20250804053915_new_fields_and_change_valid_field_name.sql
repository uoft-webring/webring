alter table "public"."profile" drop column "valid";

alter table "public"."profile" add column "subdomain" text;

alter table "public"."profile" add column "validated_user_component" text default 'disconnected'::text;


