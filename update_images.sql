-- ============================================================
-- WrenchLogic — Repoint part images to local files
-- Run this in the Supabase dashboard → SQL Editor.
--
-- Updates parts.image_url for every part to a LOCAL image under
-- public/images/parts/ (downloaded from Wikimedia Commons), so the
-- catalog/part pages render in every environment without relying on
-- Wikimedia hotlinking (which is ORB-blocked in some browsers).
--
-- One representative image per category. Matches by category slug,
-- so it covers the original seed, supabase_fixes.sql, and seed_parts.sql.
-- Safe to re-run.
-- ============================================================

UPDATE public.parts SET image_url = '/images/parts/engine.jpg'
  WHERE category_id = (SELECT id FROM public.categories WHERE slug = 'engine');

UPDATE public.parts SET image_url = '/images/parts/intake.jpg'
  WHERE category_id = (SELECT id FROM public.categories WHERE slug = 'intake');

UPDATE public.parts SET image_url = '/images/parts/exhaust.jpg'
  WHERE category_id = (SELECT id FROM public.categories WHERE slug = 'exhaust');

UPDATE public.parts SET image_url = '/images/parts/brakes.jpg'
  WHERE category_id = (SELECT id FROM public.categories WHERE slug = 'brakes');

UPDATE public.parts SET image_url = '/images/parts/suspension.jpg'
  WHERE category_id = (SELECT id FROM public.categories WHERE slug = 'suspension');

UPDATE public.parts SET image_url = '/images/parts/boost.jpg'
  WHERE category_id = (SELECT id FROM public.categories WHERE slug = 'boost');

-- Sanity check: list what each part now points at.
-- SELECT p.id, c.slug, p.image_url
--   FROM public.parts p JOIN public.categories c ON c.id = p.category_id
--   ORDER BY c.slug, p.id;
