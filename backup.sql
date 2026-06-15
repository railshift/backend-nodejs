--
-- PostgreSQL database dump
--

\restrict 1eGaWY6lE61r2DrEsI6pQhcq14GBcSqAd1EHBgd77kofr5Xm9oSETBKYFTiW8DO

-- Dumped from database version 17.10 (98a80fa)
-- Dumped by pg_dump version 17.10 (Ubuntu 17.10-1.pgdg24.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DutyLogType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."DutyLogType" AS ENUM (
    'SIGN_ON',
    'TAKE_OVER',
    'DEPARTURE',
    'MILESTONE',
    'ALERT_7HR',
    'ALERT_8HR',
    'ALERT_9HR',
    'ALERT_10HR',
    'ALERT_11HR',
    'ALERT_14HR',
    'RELIEF_PLANNED',
    'RELIEF_NOT_REQUIRED',
    'CREW_RELIEVED',
    'CREW_NOT_BOOKED',
    'KEEP_ON_DUTY',
    'CREW_ALREADY_RELIEVED',
    'RELEASE'
);


ALTER TYPE public."DutyLogType" OWNER TO neondb_owner;

--
-- Name: NotificationStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."NotificationStatus" AS ENUM (
    'PENDING',
    'SENT',
    'ACKNOWLEDGED',
    'FAILED'
);


ALTER TYPE public."NotificationStatus" OWNER TO neondb_owner;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."NotificationType" AS ENUM (
    'DUTY_8HR',
    'DUTY_9HR',
    'DUTY_11HR',
    'DUTY_12HR',
    'DUTY_14HR',
    'RELIEF_PLANNED',
    'SHIFT_COMPLETED',
    'CUSTOM'
);


ALTER TYPE public."NotificationType" OWNER TO neondb_owner;

--
-- Name: ShiftStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ShiftStatus" AS ENUM (
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'RELIEF_PLANNED',
    'CANCELLED'
);


ALTER TYPE public."ShiftStatus" OWNER TO neondb_owner;

--
-- Name: StaffStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."StaffStatus" AS ENUM (
    'AVAILABLE',
    'ON_DUTY',
    'ON_LEAVE',
    'RELIEVED',
    'INACTIVE'
);


ALTER TYPE public."StaffStatus" OWNER TO neondb_owner;

--
-- Name: StaffType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."StaffType" AS ENUM (
    'LOCO_PILOT',
    'TRAIN_MANAGER'
);


ALTER TYPE public."StaffType" OWNER TO neondb_owner;

--
-- Name: UserDesignation; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."UserDesignation" AS ENUM (
    'X',
    'Y',
    'Z'
);


ALTER TYPE public."UserDesignation" OWNER TO neondb_owner;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."UserRole" AS ENUM (
    'SUPERADMIN',
    'ADMIN',
    'USER'
);


ALTER TYPE public."UserRole" OWNER TO neondb_owner;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED'
);


ALTER TYPE public."UserStatus" OWNER TO neondb_owner;

--
-- Name: dutyType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."dutyType" AS ENUM (
    'SP',
    'WR',
    'LR'
);


ALTER TYPE public."dutyType" OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO neondb_owner;

--
-- Name: duty_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.duty_logs (
    id text NOT NULL,
    "shiftId" text NOT NULL,
    "staffId" text NOT NULL,
    "logType" public."DutyLogType" NOT NULL,
    "logTime" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dutyHoursAtLog" double precision,
    remarks text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.duty_logs OWNER TO neondb_owner;

--
-- Name: locomotives; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.locomotives (
    id text NOT NULL,
    "locomotiveNo" text NOT NULL,
    status text DEFAULT 'ACTIVE'::text,
    "autoCreated" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.locomotives OWNER TO neondb_owner;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "shiftId" text NOT NULL,
    type public."NotificationType" NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "dutyHours" double precision NOT NULL,
    status public."NotificationStatus" DEFAULT 'PENDING'::public."NotificationStatus" NOT NULL,
    "sentAt" timestamp(3) without time zone,
    "acknowledgedAt" timestamp(3) without time zone,
    "responseAction" text,
    "responseTime" timestamp(3) without time zone,
    "responseBy" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    "targetDivision" text,
    "targetUsers" text[]
);


ALTER TABLE public.notifications OWNER TO neondb_owner;

--
-- Name: shifts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.shifts (
    id text NOT NULL,
    "trainNumber" text NOT NULL,
    "trainName" text,
    "locomotiveId" text NOT NULL,
    "locoPilotId" text NOT NULL,
    "trainManagerId" text NOT NULL,
    "timeOfTO" timestamp(3) without time zone,
    "signOnStation" text NOT NULL,
    "signOffStation" text,
    section text NOT NULL,
    "dutyType" public."dutyType",
    "dutyHours" double precision,
    status public."ShiftStatus" DEFAULT 'SCHEDULED'::public."ShiftStatus" NOT NULL,
    "reliefRequired" boolean DEFAULT false NOT NULL,
    "reliefPlanned" boolean DEFAULT false NOT NULL,
    "reliefTime" timestamp(3) without time zone,
    "reliefReason" text,
    "createdById" text NOT NULL,
    "updatedById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "alert10HrResponse" text,
    "alert10HrSent" boolean DEFAULT false NOT NULL,
    "alert10HrSentAt" timestamp(3) without time zone,
    "alert11HrResponse" text,
    "alert11HrSent" boolean DEFAULT false NOT NULL,
    "alert11HrSentAt" timestamp(3) without time zone,
    "alert14HrResponse" text,
    "alert14HrSent" boolean DEFAULT false NOT NULL,
    "alert14HrSentAt" timestamp(3) without time zone,
    "alert7HrSent" boolean DEFAULT false NOT NULL,
    "alert7HrSentAt" timestamp(3) without time zone,
    "alert8HrResponse" text,
    "alert8HrSent" boolean DEFAULT false NOT NULL,
    "alert8HrSentAt" timestamp(3) without time zone,
    "alert9HrResponse" text,
    "alert9HrSent" boolean DEFAULT false NOT NULL,
    "alert9HrSentAt" timestamp(3) without time zone,
    "departureDateTime" timestamp(3) without time zone,
    "signOffDateTime" timestamp(3) without time zone,
    "signOnDateTime" timestamp(3) without time zone NOT NULL,
    "trainArrivalDateTime" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.shifts OWNER TO neondb_owner;

--
-- Name: staff; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.staff (
    id text NOT NULL,
    "employeeId" text NOT NULL,
    name text NOT NULL,
    "staffType" public."StaffType" NOT NULL,
    phone text,
    email text,
    "homeStation" text,
    status public."StaffStatus" DEFAULT 'AVAILABLE'::public."StaffStatus" NOT NULL,
    "autoCreated" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    division text
);


ALTER TABLE public.staff OWNER TO neondb_owner;

--
-- Name: system_config; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.system_config (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    description text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.system_config OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id text NOT NULL,
    "employeeId" text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    password text NOT NULL,
    role public."UserRole" DEFAULT 'USER'::public."UserRole" NOT NULL,
    status public."UserStatus" DEFAULT 'INACTIVE'::public."UserStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "lastLogin" timestamp(3) without time zone,
    division text,
    "isVerified" boolean DEFAULT false NOT NULL,
    "rejectedAt" timestamp(3) without time zone,
    "rejectedBy" text,
    "rejectionReason" text,
    "verifiedAt" timestamp(3) without time zone,
    "verifiedBy" text,
    "resetOtp" text,
    "resetOtpExpiry" timestamp(3) without time zone,
    priority integer DEFAULT 0 NOT NULL,
    designation public."UserDesignation"
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
b03ce1c0-7480-4eb4-8251-d87d8fecf8d0	22dfd37905f49140b3878fc79d9483fd72ba5e9fd22fff34bf84ec804344bdd6	2026-05-02 16:34:17.728852+00	20251124133119_init_postgresql	\N	\N	2026-05-02 16:34:17.279251+00	1
73327aa8-cb46-4ad5-aa02-10971d8afe1a	90371144e2f54731d51f2e480b4d62d18ab8cbb9a74f4015c4288773792fd2e8	2026-05-02 16:34:18.164455+00	20251127135335_add_user_verification_fields	\N	\N	2026-05-02 16:34:17.851488+00	1
97de1484-b748-45b2-b09b-de6c870e8f90	3a9b7339ece4262fa245d0cb08192118ffa2da352f18e10ea1c855c86cf297de	2026-05-02 16:34:18.611519+00	20251127160252_add_alert_tracking	\N	\N	2026-05-02 16:34:18.288018+00	1
073388fe-d631-4457-85dc-4ff35faa1dc4	ef3f1b19aa7946cca14a61a2e4f53fc0ae7a84f3607d8b542a8be2b7e86a477d	2026-05-02 16:34:19.043067+00	20251202132610_remove_lobby_sign_fields	\N	\N	2026-05-02 16:34:18.734171+00	1
7c4acac9-5741-4889-934b-215c316baae8	b5858775bbd75b12bb068182b438e102f53968879a7b790ff0ef1699348c58ab	2026-05-02 16:34:19.479119+00	20251202140003_consolidate_datetime_fields	\N	\N	2026-05-02 16:34:19.165847+00	1
9d912a05-2e68-4f4d-8b5f-16f87a58d31f	e0e01e098e3c3daf573118381b3858d6d76f06894d7cd6545ff63a2dc89e42c5	2026-05-02 16:34:19.910754+00	20260307182253_add_password_reset_fields	\N	\N	2026-05-02 16:34:19.601675+00	1
9865c0d7-4545-4992-8c69-89a1b06c998a	39b84b99d27e881d07fe18eff4b41024a7c61d21d5d118eb39693470112930dc	2026-05-02 16:34:20.34334+00	20260307190025_add_division_priority_fields	\N	\N	2026-05-02 16:34:20.033214+00	1
9cb2c5c8-7ce9-41a3-8f44-4e9a5ba6bfbb	7f87390cddfd22a049a2516d693444cf0f681d82c05597b3615deed8fef7f1e6	2026-05-02 16:34:20.777336+00	20260318191053_made_dutytype_optional	\N	\N	2026-05-02 16:34:20.46651+00	1
\.


--
-- Data for Name: duty_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.duty_logs (id, "shiftId", "staffId", "logType", "logTime", "dutyHoursAtLog", remarks, metadata, "createdAt") FROM stdin;
54896c02-586e-43e3-bf1a-b0a128224099	95890fd1-f07a-41bd-b4b8-88dd5305657f	481e8e59-3ad2-496d-bd02-551199aedad8	SIGN_ON	2026-06-13 05:37:45.446	0	Shift started	\N	2026-06-13 05:37:45.446
10c6b67c-e8c9-4e41-a28e-756bd1eda634	95890fd1-f07a-41bd-b4b8-88dd5305657f	340f4f7d-fb98-4fcd-a23e-103ca3affb9b	SIGN_ON	2026-06-13 05:37:45.593	0	Shift started	\N	2026-06-13 05:37:45.593
239375db-2306-4d1b-bfff-85113c599dd3	74795ec6-7c0c-43c7-87c5-ca74dcc1f36b	68e0bffc-d2f4-46ad-81cc-babef1875519	SIGN_ON	2026-06-15 06:56:54.059	0	Shift started	\N	2026-06-15 06:56:54.059
5285f952-cb70-4640-a704-1e091c992d67	74795ec6-7c0c-43c7-87c5-ca74dcc1f36b	e2e471e6-d842-4c8f-a921-149b708980dd	SIGN_ON	2026-06-15 06:56:54.202	0	Shift started	\N	2026-06-15 06:56:54.202
\.


--
-- Data for Name: locomotives; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.locomotives (id, "locomotiveNo", status, "autoCreated", "createdAt", "updatedAt") FROM stdin;
f2813ea9-72f6-4aec-8591-a12046e75530	33456	ACTIVE	t	2026-06-13 05:37:43.815	2026-06-13 05:37:43.815
7948622b-d61e-414a-ba68-fa3d9db87480	42463	ACTIVE	t	2026-06-15 06:56:52.458	2026-06-15 06:56:52.458
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notifications (id, "shiftId", type, title, message, "dutyHours", status, "sentAt", "acknowledgedAt", "responseAction", "responseTime", "responseBy", metadata, "createdAt", "updatedAt", priority, "targetDivision", "targetUsers") FROM stdin;
\.


--
-- Data for Name: shifts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.shifts (id, "trainNumber", "trainName", "locomotiveId", "locoPilotId", "trainManagerId", "timeOfTO", "signOnStation", "signOffStation", section, "dutyType", "dutyHours", status, "reliefRequired", "reliefPlanned", "reliefTime", "reliefReason", "createdById", "updatedById", "createdAt", "updatedAt", "alert10HrResponse", "alert10HrSent", "alert10HrSentAt", "alert11HrResponse", "alert11HrSent", "alert11HrSentAt", "alert14HrResponse", "alert14HrSent", "alert14HrSentAt", "alert7HrSent", "alert7HrSentAt", "alert8HrResponse", "alert8HrSent", "alert8HrSentAt", "alert9HrResponse", "alert9HrSent", "alert9HrSentAt", "departureDateTime", "signOffDateTime", "signOnDateTime", "trainArrivalDateTime") FROM stdin;
95890fd1-f07a-41bd-b4b8-88dd5305657f	N/E	N/E/BNDM	f2813ea9-72f6-4aec-8591-a12046e75530	481e8e59-3ad2-496d-bd02-551199aedad8	340f4f7d-fb98-4fcd-a23e-103ca3affb9b	2026-06-12 03:00:00	HTE	\N	HTE-BNDM	\N	27.07	COMPLETED	f	f	\N	\N	c5149b48-867e-41d2-a67e-6f9fe6cd880e	c5149b48-867e-41d2-a67e-6f9fe6cd880e	2026-06-13 05:37:44.534	2026-06-13 05:41:30.964	\N	f	\N	\N	f	\N	\N	f	\N	f	\N	\N	f	\N	\N	f	\N	2026-06-12 04:52:00	\N	2026-06-12 02:35:00	2026-06-11 22:50:00
74795ec6-7c0c-43c7-87c5-ca74dcc1f36b	pp/boy/e/kmpd	pp/boy/e/kmpd	7948622b-d61e-414a-ba68-fa3d9db87480	68e0bffc-d2f4-46ad-81cc-babef1875519	e2e471e6-d842-4c8f-a921-149b708980dd	\N	muri	\N	muri-hte	\N	4.23	IN_PROGRESS	f	f	\N	\N	13105d47-0f31-4392-994d-ece88976a8df	\N	2026-06-15 06:56:53.159	2026-06-15 07:14:00.915	\N	f	\N	\N	f	\N	\N	f	\N	f	\N	\N	f	\N	\N	f	\N	\N	\N	2026-06-15 03:00:00	2026-06-15 02:55:00
\.


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.staff (id, "employeeId", name, "staffType", phone, email, "homeStation", status, "autoCreated", "createdAt", "updatedAt", division) FROM stdin;
481e8e59-3ad2-496d-bd02-551199aedad8	HTE1234	A KUMAR	LOCO_PILOT	9654238324	\N	\N	ON_DUTY	t	2026-06-13 05:37:44.103	2026-06-13 05:37:45.664	\N
340f4f7d-fb98-4fcd-a23e-103ca3affb9b	HTE23455	A biswas	TRAIN_MANAGER	8863814515	\N	\N	ON_DUTY	t	2026-06-13 05:37:44.323	2026-06-13 05:37:45.664	\N
68e0bffc-d2f4-46ad-81cc-babef1875519	HTE1552	niranjan kumar-2/hte	LOCO_PILOT	9771448942	\N	\N	ON_DUTY	t	2026-06-15 06:56:52.738	2026-06-15 06:56:54.272	\N
e2e471e6-d842-4c8f-a921-149b708980dd	HTE1818	s. s. ekka	TRAIN_MANAGER	9771484397	\N	\N	ON_DUTY	t	2026-06-15 06:56:52.95	2026-06-15 06:56:54.272	\N
\.


--
-- Data for Name: system_config; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.system_config (id, key, value, description, "updatedAt") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, "employeeId", name, email, phone, password, role, status, "createdAt", "updatedAt", "lastLogin", division, "isVerified", "rejectedAt", "rejectedBy", "rejectionReason", "verifiedAt", "verifiedBy", "resetOtp", "resetOtpExpiry", priority, designation) FROM stdin;
3ec0f48a-9547-4595-b28f-a18718b8481e	ABCDEFG	VIKAS KUMAR	vikashirsee@gmail.com	9771484720	$2b$12$SL5gU3oK30sDpvW3PrQkDeuObzIyHsXF9Hb3Ce5Wi1S9PF7Ro.e5m	USER	ACTIVE	2026-06-11 13:29:41.332	2026-06-11 13:30:03.119	\N	CENTRAL	t	\N	\N	\N	2026-06-11 13:30:03.118	EMP1	\N	\N	0	X
bc5785c7-8d1e-4cfc-88cb-15552e444251	HPEXWO	vikas	ebbnad@gmail.com	9654238324	$2b$12$Bbym9po1QqEueScjCR1REON8A5VmbNeepn6Fo74OKBCpoFkLKPITe	ADMIN	ACTIVE	2026-06-13 06:20:41.121	2026-06-13 06:21:13.011	\N	CENTRAL	t	\N	\N	\N	2026-06-13 06:21:13.009	EMP1	\N	\N	0	X
96fbbbf4-85eb-4a20-bc85-099dcddf6958	YWQKRR1	Bibhuti Narayan Sharma	bibhutins@gmail.com	9771484901	$2b$12$qXBY6umgurmR/OHcYs8CteR6DRHOWVVZOxtR40TlPjH06P7TlLSUC	USER	ACTIVE	2026-06-14 05:19:23.505	2026-06-15 04:32:50.413	\N	CENTRAL	t	\N	\N	\N	2026-06-15 04:32:50.412	EMP1	\N	\N	0	X
052f9a16-448c-4a71-b21f-8a7109beb768	IXKLUK1971	Govind Sharma	sharmagovind6480@gmail.com	9771448931	$2b$12$Zp9PKpm2HEApc9yljpKNmuRRAM.FRF2YV7v0KqhZMDg7I6Qa86gwK	USER	ACTIVE	2026-06-14 05:15:05.491	2026-06-15 04:33:07.02	\N	CENTRAL	t	\N	\N	\N	2026-06-15 04:33:07.019	EMP1	\N	\N	0	Y
13105d47-0f31-4392-994d-ece88976a8df	QKHQCF	Asif Iqbal	asif7867iqbal@gmail.com	8507804815	$2b$12$ijf.F24cxpdH032FdtSjP.KtlI0g7n7yP/TEJ0NSNAGvlwWnUAqCm	ADMIN	ACTIVE	2026-06-13 06:35:30.517	2026-06-15 04:34:54.172	2026-06-15 04:34:54.171	CENTRAL	t	\N	\N	\N	2026-06-14 04:17:06.993	EMP1	\N	\N	0	Z
c5149b48-867e-41d2-a67e-6f9fe6cd880e	EMP1	Super Admin	superadmin@railway.com	9876543210	$2b$12$t4eYmsyZ0c0Og1.I53vsuuEKS1sfNC85O2u12e6YrN26ivc/ict.O	SUPERADMIN	ACTIVE	2026-06-10 14:33:44.639	2026-06-15 07:11:23.533	2026-06-15 07:11:23.53	CENTRAL	t	\N	\N	\N	\N	\N	\N	\N	0	X
ef62b96f-eee6-4a31-ab37-d1739ae5b16c	EQBEMY	Ajay Kumar Gupta	rajajaygupta@gmail.com	9771484320	$2b$12$wQzLM3PCOZXFDFu48dhbtu07Ky/5o7nhk3PCCVV/qSfVG/rz2X6BW	USER	ACTIVE	2026-06-14 02:50:56.495	2026-06-14 04:16:45.98	\N	CENTRAL	t	\N	\N	\N	2026-06-14 04:16:45.979	EMP1	\N	\N	0	X
dfdaed29-d966-457e-b4b4-4dd5d7f3cd4a	BEYXSS	Y N Gupta	guptajitlc@gmail.com	9771484044	$2b$12$qtZ8eaummJsxCk8.KeSNDu8Fz9oC/StEcB.pmW7nPdIDapyDnzY2K	USER	ACTIVE	2026-06-14 02:09:42.973	2026-06-14 04:16:50.074	\N	CENTRAL	t	\N	\N	\N	2026-06-14 04:16:50.073	EMP1	\N	\N	0	Y
c23ccc14-19c6-450b-8abe-ab25134da99f	PNEKHM	Sanjay Kumar Bara	sanjaykumarbara30@gmail.com	9771484690	$2b$12$zDLEDh5NadigYxpbKmLZ3uI7jjKgAPkl8phgpW5WvpyMIgXsEzk46	ADMIN	ACTIVE	2026-06-13 06:36:06.194	2026-06-14 04:17:11.04	\N	CENTRAL	t	\N	\N	\N	2026-06-14 04:17:11.039	EMP1	\N	\N	0	Y
270b1cd7-12c7-4521-bfed-ba6a033c21fe	APKHJH	Vishal kumar	vishalvidhan81@gmail.com	9771484754	$2b$12$4cAjBM3JcbXlA.ksN9gO5OkXiQdRFeCg7lzyZASrfL/hZ/6AGlYGC	ADMIN	ACTIVE	2026-06-13 06:36:41.237	2026-06-14 04:17:15.098	\N	CENTRAL	t	\N	\N	\N	2026-06-14 04:17:15.097	EMP1	\N	\N	0	Z
fb1432f7-cee6-4bd2-b888-8a75209bce3d	HTEDEW	TLC RANCHI	ctlcrnc1234@gmail.com	9102990660	$2b$12$9uACnpnhdwF4iEBn8Sr3Ru8jgeyBrEQ9GZ1robvZg8w1r78XDfBAy	USER	ACTIVE	2026-06-13 06:59:26.845	2026-06-14 04:17:23.346	\N	CENTRAL	t	\N	\N	\N	2026-06-14 04:17:23.345	EMP1	\N	\N	0	Y
a5688c7d-a865-44f2-9554-0e458eceee93	KXMBAU1969	Anand Kumar Shandilya	anandshandilya69@gmail.com	9771469903	$2b$12$LZzf/TiV30b0tx9a04ZprOkXOQaeqrw8P12knfB3/w19baCP8ZUsu	USER	ACTIVE	2026-06-13 07:24:02.94	2026-06-14 05:05:47.018	2026-06-14 05:05:47.017	CENTRAL	t	\N	\N	\N	2026-06-14 04:17:33.557	EMP1	\N	\N	0	Z
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: duty_logs duty_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.duty_logs
    ADD CONSTRAINT duty_logs_pkey PRIMARY KEY (id);


--
-- Name: locomotives locomotives_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.locomotives
    ADD CONSTRAINT locomotives_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: shifts shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_pkey PRIMARY KEY (id);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- Name: system_config system_config_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: duty_logs_logTime_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "duty_logs_logTime_idx" ON public.duty_logs USING btree ("logTime");


--
-- Name: duty_logs_logType_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "duty_logs_logType_idx" ON public.duty_logs USING btree ("logType");


--
-- Name: duty_logs_shiftId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "duty_logs_shiftId_idx" ON public.duty_logs USING btree ("shiftId");


--
-- Name: duty_logs_staffId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "duty_logs_staffId_idx" ON public.duty_logs USING btree ("staffId");


--
-- Name: locomotives_locomotiveNo_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "locomotives_locomotiveNo_idx" ON public.locomotives USING btree ("locomotiveNo");


--
-- Name: locomotives_locomotiveNo_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "locomotives_locomotiveNo_key" ON public.locomotives USING btree ("locomotiveNo");


--
-- Name: notifications_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "notifications_createdAt_idx" ON public.notifications USING btree ("createdAt");


--
-- Name: notifications_shiftId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "notifications_shiftId_idx" ON public.notifications USING btree ("shiftId");


--
-- Name: notifications_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX notifications_status_idx ON public.notifications USING btree (status);


--
-- Name: notifications_type_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX notifications_type_idx ON public.notifications USING btree (type);


--
-- Name: shifts_locoPilotId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "shifts_locoPilotId_idx" ON public.shifts USING btree ("locoPilotId");


--
-- Name: shifts_signOnDateTime_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "shifts_signOnDateTime_idx" ON public.shifts USING btree ("signOnDateTime");


--
-- Name: shifts_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX shifts_status_idx ON public.shifts USING btree (status);


--
-- Name: shifts_trainArrivalDateTime_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "shifts_trainArrivalDateTime_idx" ON public.shifts USING btree ("trainArrivalDateTime");


--
-- Name: shifts_trainManagerId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "shifts_trainManagerId_idx" ON public.shifts USING btree ("trainManagerId");


--
-- Name: shifts_trainNumber_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "shifts_trainNumber_idx" ON public.shifts USING btree ("trainNumber");


--
-- Name: staff_employeeId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "staff_employeeId_idx" ON public.staff USING btree ("employeeId");


--
-- Name: staff_employeeId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "staff_employeeId_key" ON public.staff USING btree ("employeeId");


--
-- Name: staff_name_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX staff_name_idx ON public.staff USING btree (name);


--
-- Name: staff_staffType_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "staff_staffType_idx" ON public.staff USING btree ("staffType");


--
-- Name: staff_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX staff_status_idx ON public.staff USING btree (status);


--
-- Name: system_config_key_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX system_config_key_key ON public.system_config USING btree (key);


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_employeeId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "users_employeeId_idx" ON public.users USING btree ("employeeId");


--
-- Name: users_employeeId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "users_employeeId_key" ON public.users USING btree ("employeeId");


--
-- Name: users_isVerified_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "users_isVerified_idx" ON public.users USING btree ("isVerified");


--
-- Name: users_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX users_status_idx ON public.users USING btree (status);


--
-- Name: duty_logs duty_logs_shiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.duty_logs
    ADD CONSTRAINT "duty_logs_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES public.shifts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: duty_logs duty_logs_staffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.duty_logs
    ADD CONSTRAINT "duty_logs_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notifications notifications_shiftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES public.shifts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shifts shifts_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT "shifts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: shifts shifts_locoPilotId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT "shifts_locoPilotId_fkey" FOREIGN KEY ("locoPilotId") REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: shifts shifts_locomotiveId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT "shifts_locomotiveId_fkey" FOREIGN KEY ("locomotiveId") REFERENCES public.locomotives(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: shifts shifts_trainManagerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT "shifts_trainManagerId_fkey" FOREIGN KEY ("trainManagerId") REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: shifts shifts_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT "shifts_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict 1eGaWY6lE61r2DrEsI6pQhcq14GBcSqAd1EHBgd77kofr5Xm9oSETBKYFTiW8DO

