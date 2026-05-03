alter table newsletter_settings
  add column if not exists accent_color text not null default '#ff4500',
  add column if not exists show_scores boolean not null default true,
  add column if not exists intro_text text;
