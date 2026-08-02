-- Public catalog only. User accounts are created through Supabase Auth.
insert into public.providers (id, slug, name, website_url, is_active)
values
  ('11111111-1111-4111-8111-111111111111', 'gananza-demo', 'Gananza Demo Network', 'https://gananza.local', true),
  ('22222222-2222-4222-8222-222222222222', 'survey-demo', 'Survey Demo Network', 'https://gananza.local', true),
  ('33333333-3333-4333-8333-333333333333', 'cpx-research', 'CPX Research', 'https://cpx-research.com', true)
on conflict (id) do update set is_active = excluded.is_active;

insert into private.provider_credentials (provider_id, callback_secret)
values
  ('11111111-1111-4111-8111-111111111111', 'replace-this-local-secret'),
  ('22222222-2222-4222-8222-222222222222', 'replace-this-local-survey-secret'),
  ('33333333-3333-4333-8333-333333333333', 'replace-this-cpx-secret')
on conflict (provider_id) do update set callback_secret = excluded.callback_secret;

insert into public.offers (
  id, provider_id, external_offer_id, title, brand, description, category, status,
  country_codes, platform, reward_amount, gross_amount, estimated_minutes,
  validation_label, difficulty_label, badge_label, requirements, tracking_url_template
) values
  ('a0000000-0000-4000-8000-000000000001','11111111-1111-4111-8111-111111111111','kingdom-harbor-12','Llegá al nivel 12','Kingdom Harbor','Construí tu puerto y alcanzá el nivel indicado.','game','active',array['AR'],'Android',4200,7000,35,'Hasta 72 h','Media','Más elegida','["Instalación nueva desde Gananza","Llegar al nivel 12 dentro de 14 días","No usar VPN ni emulador"]','https://example.com/?click_id={{click_id}}&user_id={{user_id}}'),
  ('a0000000-0000-4000-8000-000000000002','22222222-2222-4222-8222-222222222222','habitos-digitales','Encuesta sobre hábitos digitales','Panel Opinión','Respondé una encuesta breve sobre consumo digital.','survey','active',array['AR'],'Web',950,1500,8,'Hasta 24 h','Fácil','Rápida','["Responder con atención","Una participación por persona","Mantener la ventana abierta"]',null),
  ('a0000000-0000-4000-8000-000000000003','11111111-1111-4111-8111-111111111111','aulapro-registro','Creá una cuenta gratuita','AulaPro','Conocé una plataforma educativa y completá el registro.','service','active',array['AR'],'Web',1800,3000,12,'Hasta 48 h','Fácil','Nueva','["Cuenta nueva","Correo válido","Completar el perfil inicial"]','https://example.com/?click_id={{click_id}}'),
  ('a0000000-0000-4000-8000-000000000004','11111111-1111-4111-8111-111111111111','metro-rush-10','Completá diez carreras','Metro Rush','Jugá diez carreras válidas dentro del período de campaña.','game','active',array['AR'],'Android',3100,5200,25,'Hasta 72 h','Media','Gaming','["Instalación nueva","Completar diez carreras","No reinstalar la app"]','https://example.com/?click_id={{click_id}}'),
  ('a0000000-0000-4000-8000-000000000005','22222222-2222-4222-8222-222222222222','delivery-ar','Contanos cómo usás delivery','Encuestas Directas','Encuesta corta sobre hábitos de compra y delivery.','survey','active',array['AR'],'Web',620,1000,6,'Hasta 24 h','Fácil','6 minutos','["Residir en Argentina","Responder una vez","No cerrar antes de finalizar"]',null),
  ('a0000000-0000-4000-8000-000000000006','11111111-1111-4111-8111-111111111111','nubecasa-trial','Activá una prueba gratuita','NubeCasa','Probá durante siete días una herramienta de almacenamiento.','app','active',array['AR'],'Web',2300,3800,15,'Hasta 72 h','Fácil','Servicio','["Usuario nuevo","Activar la prueba gratuita","No cancelar durante las primeras 24 horas"]','https://example.com/?click_id={{click_id}}'),
  ('a0000000-0000-4000-8000-000000000007','11111111-1111-4111-8111-111111111111','fitweek-profile','Completá el perfil inicial','FitWeek','Instalá la app y completá tu perfil de entrenamiento.','app','active',array['AR'],'Android',1250,2100,12,'Hasta 48 h','Fácil','Bienestar','["Instalación nueva","Perfil completo","Sin VPN"]','https://example.com/?click_id={{click_id}}'),
  ('a0000000-0000-4000-8000-000000000008','22222222-2222-4222-8222-222222222222','finanzas-cotidianas','Encuesta sobre gastos cotidianos','Pulso AR','Compartí hábitos generales de consumo.','survey','active',array['AR'],'Web',780,1250,7,'Hasta 24 h','Fácil','Encuesta','["Mayor de 18 años","Una respuesta por cuenta","Respuestas consistentes"]',null)
on conflict (id) do update set status = excluded.status, reward_amount = excluded.reward_amount, gross_amount = excluded.gross_amount;
