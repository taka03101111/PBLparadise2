drop extension if exists "pg_net";

create sequence "public"."courses_id_seq";

create sequence "public"."timetable_id_seq";


  create table "public"."courses" (
    "id" integer not null default nextval('public.courses_id_seq'::regclass),
    "grade" integer,
    "term" character varying(10),
    "name" text,
    "description" text,
    "flow" text,
    "homework" text,
    "evaluation" text,
    "difficulty" text,
    "summary" text
      );



  create table "public"."posts" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "username" text not null default '投稿者名'::text,
    "grade" text not null default '学年'::text,
    "comment" text default 'コメント'::text,
    "file_url" text not null default '画像/ファイルURL'::text,
    "created_at" timestamp with time zone
      );


alter table "public"."posts" enable row level security;


  create table "public"."timetable" (
    "id" integer not null default nextval('public.timetable_id_seq'::regclass),
    "year" integer not null,
    "semester" character varying(10) not null,
    "day_of_week" character varying(10) not null,
    "period" integer not null,
    "class_type" character varying(5),
    "subject_name" character varying(255),
    "is_final" boolean default false,
    "is_alternate" boolean default false
      );


alter table "public"."timetable" enable row level security;

alter sequence "public"."courses_id_seq" owned by "public"."courses"."id";

alter sequence "public"."timetable_id_seq" owned by "public"."timetable"."id";

CREATE UNIQUE INDEX courses_pkey ON public.courses USING btree (id);

CREATE UNIQUE INDEX posts_pkey ON public.posts USING btree (id, username, grade, file_url);

CREATE UNIQUE INDEX timetable_pkey ON public.timetable USING btree (id);

alter table "public"."courses" add constraint "courses_pkey" PRIMARY KEY using index "courses_pkey";

alter table "public"."posts" add constraint "posts_pkey" PRIMARY KEY using index "posts_pkey";

alter table "public"."timetable" add constraint "timetable_pkey" PRIMARY KEY using index "timetable_pkey";

grant delete on table "public"."courses" to "anon";

grant insert on table "public"."courses" to "anon";

grant references on table "public"."courses" to "anon";

grant select on table "public"."courses" to "anon";

grant trigger on table "public"."courses" to "anon";

grant truncate on table "public"."courses" to "anon";

grant update on table "public"."courses" to "anon";

grant delete on table "public"."courses" to "authenticated";

grant insert on table "public"."courses" to "authenticated";

grant references on table "public"."courses" to "authenticated";

grant select on table "public"."courses" to "authenticated";

grant trigger on table "public"."courses" to "authenticated";

grant truncate on table "public"."courses" to "authenticated";

grant update on table "public"."courses" to "authenticated";

grant delete on table "public"."courses" to "service_role";

grant insert on table "public"."courses" to "service_role";

grant references on table "public"."courses" to "service_role";

grant select on table "public"."courses" to "service_role";

grant trigger on table "public"."courses" to "service_role";

grant truncate on table "public"."courses" to "service_role";

grant update on table "public"."courses" to "service_role";

grant delete on table "public"."posts" to "anon";

grant insert on table "public"."posts" to "anon";

grant references on table "public"."posts" to "anon";

grant select on table "public"."posts" to "anon";

grant trigger on table "public"."posts" to "anon";

grant truncate on table "public"."posts" to "anon";

grant update on table "public"."posts" to "anon";

grant delete on table "public"."posts" to "authenticated";

grant insert on table "public"."posts" to "authenticated";

grant references on table "public"."posts" to "authenticated";

grant select on table "public"."posts" to "authenticated";

grant trigger on table "public"."posts" to "authenticated";

grant truncate on table "public"."posts" to "authenticated";

grant update on table "public"."posts" to "authenticated";

grant delete on table "public"."posts" to "service_role";

grant insert on table "public"."posts" to "service_role";

grant references on table "public"."posts" to "service_role";

grant select on table "public"."posts" to "service_role";

grant trigger on table "public"."posts" to "service_role";

grant truncate on table "public"."posts" to "service_role";

grant update on table "public"."posts" to "service_role";

grant delete on table "public"."timetable" to "anon";

grant insert on table "public"."timetable" to "anon";

grant references on table "public"."timetable" to "anon";

grant select on table "public"."timetable" to "anon";

grant trigger on table "public"."timetable" to "anon";

grant truncate on table "public"."timetable" to "anon";

grant update on table "public"."timetable" to "anon";

grant delete on table "public"."timetable" to "authenticated";

grant insert on table "public"."timetable" to "authenticated";

grant references on table "public"."timetable" to "authenticated";

grant select on table "public"."timetable" to "authenticated";

grant trigger on table "public"."timetable" to "authenticated";

grant truncate on table "public"."timetable" to "authenticated";

grant update on table "public"."timetable" to "authenticated";

grant delete on table "public"."timetable" to "service_role";

grant insert on table "public"."timetable" to "service_role";

grant references on table "public"."timetable" to "service_role";

grant select on table "public"."timetable" to "service_role";

grant trigger on table "public"."timetable" to "service_role";

grant truncate on table "public"."timetable" to "service_role";

grant update on table "public"."timetable" to "service_role";


  create policy "Add policy"
  on "public"."posts"
  as permissive
  for insert
  to anon
with check (true);



  create policy "yomidasiPolicy"
  on "public"."posts"
  as permissive
  for select
  to anon
using (true);



  create policy "Allow anon uploads 1l5pqdv_0"
  on "storage"."objects"
  as permissive
  for insert
  to anon
with check (((bucket_id = 'rishu-files'::text) AND true));



  create policy "yomidasiPolisy 1l5pqdv_0"
  on "storage"."objects"
  as permissive
  for select
  to anon
using (((bucket_id = 'rishu-files'::text) AND true));



