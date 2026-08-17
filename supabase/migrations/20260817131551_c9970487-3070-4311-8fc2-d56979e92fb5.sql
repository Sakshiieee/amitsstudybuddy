CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Amit',
  xp integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_streak_date date,
  onboarded boolean NOT NULL DEFAULT false,
  settings jsonb NOT NULL DEFAULT '{"dayMap":{"0":"sunday","1":"weekday","2":"alternate","3":"online","4":"online","5":"weekday","6":"saturday"},"minActivePct":70,"sounds":true,"notifications":true,"parentAccess":false}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.default_schedule_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_type text NOT NULL,
  start_min integer NOT NULL,
  end_min integer NOT NULL,
  title text NOT NULL,
  subject text NOT NULL,
  kind text NOT NULL,
  xp integer NOT NULL DEFAULT 0,
  note text NOT NULL DEFAULT '',
  requires_reflection boolean NOT NULL DEFAULT false
);
GRANT SELECT ON public.default_schedule_tasks TO authenticated;
GRANT ALL ON public.default_schedule_tasks TO service_role;
ALTER TABLE public.default_schedule_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read defaults" ON public.default_schedule_tasks FOR SELECT TO authenticated USING (true);

CREATE TABLE public.schedule_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  day_type text NOT NULL,
  start_min integer NOT NULL,
  end_min integer NOT NULL,
  title text NOT NULL,
  subject text NOT NULL DEFAULT 'General',
  kind text NOT NULL DEFAULT 'study',
  xp integer NOT NULL DEFAULT 50,
  note text NOT NULL DEFAULT '',
  requires_reflection boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX schedule_tasks_user_day ON public.schedule_tasks(user_id, day_type);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schedule_tasks TO authenticated;
GRANT ALL ON public.schedule_tasks TO service_role;
ALTER TABLE public.schedule_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tasks" ON public.schedule_tasks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.task_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.schedule_tasks ON DELETE CASCADE,
  log_date date NOT NULL,
  status text NOT NULL DEFAULT 'active',
  active_seconds integer NOT NULL DEFAULT 0,
  interruptions integer NOT NULL DEFAULT 0,
  reflection text,
  rating integer,
  reason text,
  xp_awarded integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, task_id, log_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_logs TO authenticated;
GRANT ALL ON public.task_logs TO service_role;
ALTER TABLE public.task_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own logs" ON public.task_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  subject text NOT NULL,
  test_date date NOT NULL,
  syllabus text NOT NULL DEFAULT '',
  priority text NOT NULL DEFAULT 'medium',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tests TO authenticated;
GRANT ALL ON public.tests TO service_role;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tests" ON public.tests FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  code text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.achievements TO authenticated;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own achievements" ON public.achievements FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.xp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  amount integer NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.xp_events TO authenticated;
GRANT ALL ON public.xp_events TO service_role;
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own xp" ON public.xp_events FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.focus_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  log_id uuid REFERENCES public.task_logs ON DELETE CASCADE,
  event_type text NOT NULL,
  seconds_away integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.focus_events TO authenticated;
GRANT ALL ON public.focus_events TO service_role;
ALTER TABLE public.focus_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own focus" ON public.focus_events FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.coach_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coach_messages TO authenticated;
GRANT ALL ON public.coach_messages TO service_role;
ALTER TABLE public.coach_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own coach" ON public.coach_messages FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

INSERT INTO public.default_schedule_tasks (day_type,start_min,end_min,title,subject,kind,xp,note,requires_reflection) VALUES
('weekday',360,390,'Exercise','General','exercise',20,'Move your body. No skipping.',false),
('weekday',390,435,'Revise for any test','SST / Science','study',50,'Revise SST or Science for upcoming tests.',true),
('weekday',435,990,'School','School','school',0,'School hours.',false),
('weekday',990,1080,'Schoolwork + project','School','study',60,'Homework, project work + anything extra.',true),
('weekday',1080,1110,'Go out for refreshment','Break','break',15,'Gadget-free outdoor break.',false),
('weekday',1125,1230,'Allen Practice','PCMB','study',100,'Same-day Allen practice. PCMB.',true),
('weekday',1230,1260,'Dinner','Break','meal',0,'Eat properly.',false),
('weekday',1260,1380,'SST or Eng/Kannada','SST','study',100,'SST -> min. 6 questions. Eng/Kannada -> full chapter.',true),
('weekday',1380,1395,'Wrap up / notes','General','wrap',10,'Note what worked, what did not.',false),
('weekday',1395,1410,'Sleep','General','sleep',20,'Sleep on time. Non-negotiable.',false),
('alternate',360,390,'Exercise','General','exercise',20,'Move your body. No skipping.',false),
('alternate',390,435,'Revise SST or tutorial','SST','study',50,'Revise SST or any tutorial.',true),
('alternate',435,990,'School','School','school',0,'School hours.',false),
('alternate',990,1080,'Schoolwork','School','study',60,'Homework and pending work.',true),
('alternate',1080,1110,'Go out','Break','break',15,'Gadget-free outdoor break.',false),
('alternate',1125,1230,'Allen Practice','PCMB','study',100,'Same-day Allen practice.',true),
('alternate',1230,1260,'Dinner','Break','meal',0,'Eat properly.',false),
('alternate',1260,1320,'Science','Science','study',100,'Today''s assigned Science work.',true),
('alternate',1320,1380,'Maths','Maths','study',100,'Today''s assigned Maths practice.',true),
('alternate',1380,1395,'Wrap up / notes','General','wrap',10,'Quick review of the day.',false),
('alternate',1395,1410,'Sleep','General','sleep',20,'Sleep on time.',false),
('online',360,390,'Exercise','General','exercise',20,'Morning movement.',false),
('online',390,435,'Revision','SST / Science','study',50,'Revise for any test.',true),
('online',1035,1095,'Walk / go out','Break','break',15,'Gadget-free walk before class.',false),
('online',1095,1155,'Online class','School','class',30,'Attend and take notes.',false),
('online',1165,1230,'Class revision','School','study',100,'Revise and practise what the class covered.',true),
('online',1230,1260,'Dinner','Break','meal',0,'Eat properly.',false),
('online',1260,1320,'Eng / SST','English','study',100,'English or SST. Full chapter / 6 questions.',true),
('online',1320,1335,'Wrap up / notes','General','wrap',10,'Log the day.',false),
('online',1335,1350,'Sleep','General','sleep',20,'Sleep on time.',false),
('saturday',360,390,'Exercise','General','exercise',20,'Start strong.',false),
('saturday',390,435,'SST revise','SST','study',50,'Revise SST.',true),
('saturday',480,570,'Volleyball','Break','break',30,'If no school. Go play.',false),
('saturday',630,750,'Allen Practice','Chemistry','study',100,'Chemistry or Biology practice.',true),
('saturday',750,780,'Watch TV','Break','break',0,'Earned downtime.',false),
('saturday',780,840,'Kannada','Kannada','study',60,'Kannada chapter work.',true),
('saturday',840,900,'Lunch','Break','meal',0,'Refuel.',false),
('saturday',900,960,'Sleep / nap','General','break',10,'Short recovery nap.',false),
('saturday',960,990,'Allen — next class prep','PCMB','study',50,'Prep for the next Allen class.',true),
('saturday',1020,1200,'Allen coaching','PCMB','coaching',100,'Allen coaching 5-8 PM.',false),
('saturday',1200,1260,'Dinner','Break','meal',0,'Eat properly.',false),
('saturday',1260,1350,'Maths / Physics','Maths','study',100,'Maths or Physics practice.',true),
('saturday',1350,1365,'Wrap up / notes','General','wrap',10,'Log the day.',false),
('saturday',1365,1380,'Sleep','General','sleep',20,'Sleep on time.',false),
('sunday',480,930,'Allen coaching','PCMB','coaching',150,'Full-day Allen coaching.',false),
('sunday',1020,1110,'SST','SST','study',100,'SST — minimum 6 questions.',true),
('sunday',1110,1170,'Go out','Break','break',15,'Gadget-free outdoor time.',false),
('sunday',1185,1230,'Kannada','Kannada','study',60,'Kannada chapter work.',true),
('sunday',1230,1260,'Dinner','Break','meal',0,'Eat properly.',false),
('sunday',1260,1320,'Prep for next week''s tests','General','study',100,'Plan and revise for upcoming tests.',true),
('sunday',1320,1335,'Wrap up / notes','General','wrap',10,'Set up the week.',false),
('sunday',1335,1350,'Sleep','General','sleep',20,'Sleep on time.',false);

CREATE OR REPLACE FUNCTION public.ensure_setup(p_name text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  INSERT INTO public.profiles (id, name)
  VALUES (uid, COALESCE(NULLIF(p_name, ''), 'Amit'))
  ON CONFLICT (id) DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM public.schedule_tasks WHERE user_id = uid) THEN
    INSERT INTO public.schedule_tasks (user_id, day_type, start_min, end_min, title, subject, kind, xp, note, requires_reflection)
    SELECT uid, d.day_type, d.start_min, d.end_min, d.title, d.subject, d.kind, d.xp, d.note, d.requires_reflection
    FROM public.default_schedule_tasks d;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_setup(text) TO authenticated;