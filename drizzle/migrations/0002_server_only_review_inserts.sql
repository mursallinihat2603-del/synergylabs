DROP POLICY IF EXISTS "Anyone can submit a review" ON public.site_reviews;
REVOKE INSERT ON public.site_reviews FROM anon, authenticated;