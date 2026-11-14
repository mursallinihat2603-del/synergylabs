CREATE TABLE public.assistant_history (user_id uuid PRIMARY KEY, messages jsonb NOT NULL DEFAULT '[]'::jsonb, updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assistant_history TO authenticated;
GRANT ALL ON public.assistant_history TO service_role;
ALTER TABLE public.assistant_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read their own assistant history" ON public.assistant_history FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "Users create their own assistant history" ON public.assistant_history FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users update their own assistant history" ON public.assistant_history FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users delete their own assistant history" ON public.assistant_history FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);