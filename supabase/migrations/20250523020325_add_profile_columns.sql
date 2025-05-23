alter table "public"."profile" drop column "domain_txt_record";

alter table "public"."profile" add column "github_url" text;

alter table "public"."profile" add column "image_url" text;

alter table "public"."profile" add column "is_verified" boolean;

alter table "public"."profile" add column "tagline" text;

alter table "public"."profile" add column "tags" text[];


