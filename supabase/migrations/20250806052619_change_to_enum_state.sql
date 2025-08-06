create type "public"."validation_state" as enum ('disconnected', 'pending', 'connected');

alter table "public"."profile" alter column "validated_user_component" set default 'disconnected'::validation_state;

alter table "public"."profile" alter column "validated_user_component" set data type validation_state using "validated_user_component"::validation_state;


