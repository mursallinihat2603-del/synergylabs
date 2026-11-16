CREATE TABLE public.site_reviews(
 id uuid primary key default gen_random_uuid(),
 first_name text not null check (char_length(first_name) between 1 and 60),
 last_name text not null check (char_length(last_name) between 1 and 60),
 country text not null check (char_length(country) between 1 and 80),
 age int not null check (age between 5 and 120),
 work_or_education text not null check (char_length(work_or_education) between 1 and 150),
 likes text not null check (char_length(likes) between 1 and 2000),
 improvements text not null check (char_length(improvements) between 1 and 2000),
 created_at timestamptz not null default now()
);
GRANT INSERT ON public.site_reviews TO anon, authenticated;
GRANT ALL ON public.site_reviews TO service_role;
ALTER TABLE public.site_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a review" ON public.site_reviews FOR INSERT TO anon, authenticated WITH CHECK (true);