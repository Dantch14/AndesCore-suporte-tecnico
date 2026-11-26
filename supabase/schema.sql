create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'cliente' check (role in ('cliente', 'admin'))
);

create table if not exists public.chamados (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome text not null check (length(trim(nome)) >= 2),
  setor text not null check (length(trim(setor)) >= 2),
  descricao text not null check (length(trim(descricao)) >= 10),
  urgencia text check (urgencia in ('baixa', 'media', 'alta')),
  status text not null default 'aberto' check (status in ('aberto', 'em-andamento', 'resolvido')),
  tecnico text not null default '',
  criado_em timestamptz not null default now()
);

-- Urgência começa vazia: quem define é o administrador.
alter table public.chamados alter column urgencia drop not null;

alter table public.profiles enable row level security;
alter table public.chamados enable row level security;

-- Todo usuário novo nasce cliente.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Perfil: cada um lê só o próprio. Ninguém altera o próprio papel pelo site.
drop policy if exists "ler o proprio perfil" on public.profiles;
create policy "ler o proprio perfil" on public.profiles
  for select to authenticated using (id = auth.uid());

-- Chamados: cliente vê e cria os seus; admin vê todos e é o único que altera.
drop policy if exists "ver chamados" on public.chamados;
create policy "ver chamados" on public.chamados
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists "abrir chamado" on public.chamados;
create policy "abrir chamado" on public.chamados
  for insert to authenticated
  with check (user_id = auth.uid() and status = 'aberto' and tecnico = '' and urgencia is null);
drop policy if exists "admin altera chamado" on public.chamados;
create policy "admin altera chamado" on public.chamados
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Desde 2026 o Supabase não expõe tabelas novas automaticamente: libere o acesso.
-- (As policies acima continuam decidindo quem vê e altera cada linha.)
grant usage on schema public to authenticated;
grant select on public.profiles to authenticated;
grant select, insert, update on public.chamados to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on function public.is_admin() to authenticated;

-- Cria o perfil das contas que já existirem sem ele.
insert into public.profiles (id) select id from auth.users on conflict (id) do nothing;

-- Para virar administrador: crie a conta pelo site e depois rode (troque o e-mail):
-- update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'seu@email.com');
