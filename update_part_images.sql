-- ============================================================
-- WrenchLogic — map parts.image_url to the correct JPG files
-- Run in the Supabase dashboard → SQL Editor. Safe to re-run.
-- Files live in wrench-logic/public/images/parts/*.jpg
-- ============================================================

UPDATE public.parts SET image_url='/images/parts/turbo.jpg' WHERE id='wl-tur-001';
UPDATE public.parts SET image_url='/images/parts/clutch.jpg' WHERE id='wl-eng-002';
UPDATE public.parts SET image_url='/images/parts/flywheel.jpg' WHERE id='wl-eng-003';
UPDATE public.parts SET image_url='/images/parts/hpfp.jpg' WHERE id='wl-eng-004';
UPDATE public.parts SET image_url='/images/parts/filter.jpg' WHERE id='wl-int-001';
UPDATE public.parts SET image_url='/images/parts/filter.jpg' WHERE id='wl-int-002';
UPDATE public.parts SET image_url='/images/parts/cold.jpg' WHERE id='wl-int-003';
UPDATE public.parts SET image_url='/images/parts/inlet.jpg' WHERE id='wl-int-004';
UPDATE public.parts SET image_url='/images/parts/milltek.jpg' WHERE id='wl-exh-001';
UPDATE public.parts SET image_url='/images/parts/downpipe.jpg' WHERE id='wl-exh-002';
UPDATE public.parts SET image_url='/images/parts/catback.jpg' WHERE id='wl-exh-003';
UPDATE public.parts SET image_url='/images/parts/resonator.jpg' WHERE id='wl-exh-004';
UPDATE public.parts SET image_url='/images/parts/brakes.jpg' WHERE id='wl-brk-001';
UPDATE public.parts SET image_url='/images/parts/pads.jpg' WHERE id='wl-brk-002';
UPDATE public.parts SET image_url='/images/parts/disc.jpg' WHERE id='wl-brk-003';
UPDATE public.parts SET image_url='/images/parts/brembo.jpg' WHERE id='wl-brk-004';
UPDATE public.parts SET image_url='/images/parts/ferodo.jpg' WHERE name LIKE '%Ferodo%';
UPDATE public.parts SET image_url='/images/parts/kw.jpg' WHERE id='wl-sus-001';
UPDATE public.parts SET image_url='/images/parts/sway.jpg' WHERE id='wl-sus-002';
UPDATE public.parts SET image_url='/images/parts/bush.jpg' WHERE id='wl-sus-003';
UPDATE public.parts SET image_url='/images/parts/springs.jpg' WHERE id='wl-sus-004';
UPDATE public.parts SET image_url='/images/parts/controller.jpg' WHERE id='wl-bst-001';
UPDATE public.parts SET image_url='/images/parts/fmic.jpg' WHERE id='wl-bst-002';
UPDATE public.parts SET image_url='/images/parts/bov.jpg' WHERE id='wl-bst-003';
UPDATE public.parts SET image_url='/images/parts/stage3.jpg' WHERE id='wl-bst-004';
UPDATE public.parts SET image_url='/images/parts/garrett.jpg' WHERE name LIKE '%Garrett%';
UPDATE public.parts SET image_url='/images/parts/hks.jpg' WHERE name LIKE '%HKS%';

-- אימות
SELECT id, name, image_url FROM public.parts ORDER BY id;
