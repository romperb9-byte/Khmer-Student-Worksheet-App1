# កម្មវិធីកិច្ចការតេស្តសិស្ស (Khmer Student Worksheet App)

កម្មវិធីកិច្ចការតេស្ត និងវាយតម្លៃសមត្ថភាពសិស្ស (មត្តេយ្យ និង ថ្នាក់ទី១ ដល់ ទី៦) ជាមួយប្រព័ន្ធរក្សាទុកទិន្នន័យពិន្ទុរួមតាមរយៈ **Supabase** និងអាច Deploy តាម **GitHub Pages** ឬ **Vercel** ដោយឥតគិតថ្លៃ។

---

## 🚀 របៀបរៀបចំ Supabase ដើម្បីរក្សាទុកទិន្នន័យ (Supabase Setup)

### ជំហានទី ១៖ បង្កើតគម្រោងលើ Supabase
1. ចូលទៅកាន់ [supabase.com](https://supabase.com) ហើយចុះឈ្មោះ/ចូលគណនី (Sign in)។
2. ចុច **"New Project"** -> ដាក់ឈ្មោះគម្រោង (ឧ. `khmer-worksheet-db`) -> កំណត់ Password -> ជ្រើសរើសតំបន់ (Singapore) -> ចុច **"Create new project"**។

### ជំហានទី ២៖ បង្កើតតារាងទិន្នន័យ (Run SQL Schema)
1. នៅលើផ្ទាំងបញ្ជា Supabase ខាងឆ្វេងដៃ ចុចលើ **"SQL Editor"**។
2. ចុច **"New query"**។
3. បើកឯកសារ `supabase_schema.sql` នៅក្នុងគម្រោងនេះ រួចចម្លង (Copy) កូដទាំងអស់មកបិទភ្ជាប់ (Paste) ក្នុង SQL Editor។
4. ចុចប៊ូតុង **"Run"** (Ctrl + Enter)។ 
*(តារាង `submissions` រួមជាមួយ Row Level Security (RLS) និង Realtime Sync នឹងត្រូវបានបង្កើតដោយស្វ័យប្រវត្តិ)*

### ជំហានទី ៣៖ យក URL និង API Key
1. ចុចលើ **Project Settings** (រូបកង់ធ្មេញនៅខាងឆ្វេងដៃ) -> ជ្រើសរើស **API** (ឬ **Data API**)。
2. ចម្លងតម្លៃ៖
   - **Project URL** (ឧ. `https://xxxxxx.supabase.co`)
   - **Project API keys** -> `anon` / `public` key (eyJhbGciOi...)

### ជំហានទី ៤៖ កំណត់ក្នុងកម្មវិធី
អ្នកអាចជ្រើសរើសវិធីមួយក្នុងចំណោមពីរ៖
- **វិធីទី ១ (ងាយស្រួលបំផុត):** បើកដំណើរការកម្មវិធី -> ចុចលើប៊ូតុង **Database** (រូប Database នៅជ្រុងខាងស្តាំខាងលើ) -> បិទភ្ជាប់ Supabase URL និង Anon Key -> ចុច **"រក្សាទុក & ភ្ជាប់"**។
- **វិធីទី ២:** បង្កើតឯកសារ `.env.local` នៅក្នុងកូដគម្រោង រួចដាក់៖
  ```env
  VITE_SUPABASE_URL=https://your-project-id.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key-here
  ```

---

## 📦 របៀបដាក់ឱ្យដំណើរការលើ GitHub (Deploy to GitHub)

### ជំហានទី ១៖ បង្កើត Git Repository
បើក PowerShell ឬ Terminal នៅក្នុង Folder គម្រោងនេះ ហើយដំណើរការ៖
```bash
git init
git add .
git commit -m "Initial release with Supabase database and GitHub Pages workflow"
git branch -M main
```

### ជំហានទី ២៖ រុញឡើងទៅកាន់ GitHub (Push to GitHub)
1. បង្កើត Repository ថ្មីមួយនៅលើ [GitHub](https://github.com/new) (ដាក់ឈ្មោះថា `Remix-Khmer-Student-Worksheet-App1`)។
2. ភ្ជាប់ Git Remote រួច Push:
```bash
git remote add origin https://github.com/YOUR_USERNAME/Remix-Khmer-Student-Worksheet-App1.git
git push -u origin main
```

### ជំហានទី ៣៖ បើកដំណើរការ GitHub Pages (Deploy)
1. នៅលើ GitHub Repository របស់អ្នក ចូលទៅកាន់ **Settings** -> **Pages** (នៅខាងឆ្វេងដៃ)។
2. នៅត្រង់ **Build and deployment** > **Source**:
   - ជ្រើសរើសយក **GitHub Actions**។
3. ចូលទៅកាន់ **Settings** -> **Secrets and variables** -> **Actions** -> ចុច **New repository secret**:
   - Secret 1: `VITE_SUPABASE_URL` = (Supabase URL របស់អ្នក)
   - Secret 2: `VITE_SUPABASE_ANON_KEY` = (Supabase Anon Key របស់អ្នក)
4. GitHub Actions នឹងដំណើរការ Build និង Deploy ដោយស្វ័យប្រវត្តិតាមរយៈ workflow `.github/workflows/deploy.yml`។
5. អ្នកនឹងទទួលបានតំណភ្ជាប់វេបសាយ (ឧ. `https://YOUR_USERNAME.github.io/Remix-Khmer-Student-Worksheet-App1/`)។

---

## 💻 ដំណើរការនៅលើម៉ាស៊ីនផ្ទាល់ខ្លួន (Run Locally)

```bash
# ១. ដំឡើង dependencies
npm install

# ២. ដំណើរការ local dev server
npm run dev

# ៣. ធ្វើការ Build សាកល្បង
npm run build
```

---

## ✨ លក្ខណៈពិសេសចម្បង (Key Features)
- 📝 សន្លឹកកិច្ចការតេស្តសិស្សគ្រប់កម្រិត (មត្តេយ្យ, ថ្នាក់ទី១ ដល់ ទី៦)
- ☁️ **Supabase Real-time Cloud Database**៖ រក្សាទុកពិន្ទុ និងទិន្នន័យរួម ធ្វើសមកាលកម្មទូទាំងសាលា
- 📶 **Offline Backup Support**៖ បន្តដំណើរការ និងរក្សាទុកក្នុង LocalStorage ទោះបីដាច់អ៊ីនធឺណិត
- 📊 តារាងបូកសរុបពិន្ទុតាមថ្នាក់ និងទាញយកជាឯកសារ Excel (.csv)
- ⚙️ ផ្ទាំង Database Settings អាចផ្លាស់ប្តូរ Supabase credentials បានភ្លាមៗលើ Browser
- 🌓 គាំទ្រ Dark Mode & Light Mode
