-- =========================================================================
-- សេចក្តីណែនាំបង្កើតតារាងសម្រាប់ Supabase (Khmer Student Worksheet App)
-- =========================================================================
-- ចុចលើផ្ទាំង "SQL Editor" នៅក្នុង Supabase Console រួចចម្លងកូដខាងក្រោមនេះដាក់ចូល ហើយចុច "Run"

-- ១. បង្កើតតារាង submissions សម្រាប់ផ្ទុកទិន្នន័យលទ្ធផលលំហាត់សិស្ស
create table if not exists public.submissions (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
    student_info jsonb not null default '{}'::jsonb,
    total_score numeric not null default 0,
    detailed_scores jsonb not null default '{}'::jsonb,
    selections jsonb not null default '{}'::jsonb
);

-- ២. បង្កើត Index ដើម្បីឱ្យការស្វែងរក និងទាញទិន្នន័យបានលឿន
create index if not exists idx_submissions_timestamp on public.submissions (timestamp desc);

-- ៣. បើកដំណើរការ Row Level Security (RLS)
alter table public.submissions enable row level security;

-- ៤. បង្កើត Policy ដើម្បីអនុញ្ញាតឱ្យសិស្ស និងគ្រូអាច អាន(Read) បញ្ជូន(Insert) និងលុប(Delete) បានដោយសេរី (Anonymous / Public)
-- ក. អនុញ្ញាតឱ្យអានទិន្នន័យទាំងអស់ (Read / Select)
create policy "Allow public read access"
on public.submissions for select
to public
using (true);

-- ខ. អនុញ្ញាតឱ្យបញ្ចូលទិន្នន័យថ្មី (Insert)
create policy "Allow public insert access"
on public.submissions for insert
to public
with check (true);

-- គ. អនុញ្ញាតឱ្យកែប្រែទិន្នន័យ (Update)
create policy "Allow public update access"
on public.submissions for update
to public
using (true);

-- ឃ. អនុញ្ញាតឱ្យលុបទិន្នន័យ (Delete)
create policy "Allow public delete access"
on public.submissions for delete
to public
using (true);

-- ៥. បើក Realtime ដើម្បីឱ្យទិន្នន័យធ្វើសមកាលកម្ម (Sync) ភ្លាមៗរវាងឧបករណ៍ទាំងអស់
alter publication supabase_realtime add table public.submissions;
