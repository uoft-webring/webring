alter table "public"."profile" drop column "image_url";

alter table "public"."profile" drop column "subdomain";

alter table "public"."profile" add column "image_key" text default ''::text;

alter table "public"."profile" add column "slug" text;

CREATE UNIQUE INDEX profile_slug_key ON public.profile USING btree (slug);

alter table "public"."profile" add constraint "profile_slug_key" UNIQUE using index "profile_slug_key";


