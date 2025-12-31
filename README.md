Kısa açıklama
----------------
NestJS tabanlı bir API uygulamasıdır. Kullanıcı yönetimi, kimlik doğrulama (JWT, refresh token), medya yükleme ve izin yönetimi gibi temel backend işlevlerini içerir.

Öne çıkan özellikler
-----------------
- Kullanıcı kaydı ve yönetimi
- Lokal kimlik doğrulama ve JWT tabanlı erişim/yenileme token'ları
- Medya yükleme ve izin güncelleme işlemleri
- Modüler NestJS mimarisi (auth, users, media)

Teknoloji
-----------------
- NestJS
- TypeScript
- MongoDB / Mongoose (schema dizinleri mevcut)

Gereksinimler
-----------------
- Node.js (>=16 önerilir)
- npm veya pnpm
- MongoDB

Çalıştırma ve kurulum
-----------------
1. Depoyu klonlayın:

```bash
git clone <repo-url>
cd rodcase
```

2. Bağımlılıkları yükleyin:

```bash
npm install
```

3. Ortam değişkenlerini ayarlayın (örnek `.env`):

- `MONGO_URI` — MongoDB bağlantı dizesi
- `JWT_SECRET` — erişim token'ı için gizli anahtar
- `JWT_REFRESH_SECRET` — refresh token için gizli anahtar
- `PORT` — (opsiyonel) sunucu portu, varsayılan 3000

4. Uygulamayı başlatın:

```bash
npm run start:dev
```


Dosya yapısı
-----------------
- `src/modules/auth` — kimlik doğrulama mantığı, stratejiler ve guard'lar
- `src/modules/users` — kullanıcı CRUD ve DTO'lar
- `src/modules/media` — medya yükleme, schema ve izin güncellemeleri
- `src/main.ts` — uygulama başlangıcı

Kimlik Doğrulama
-----------------
JWT tabanlı. Erişim token'ı kısa ömürlü, refresh token daha uzun ömürlü olacak şekilde yapılandırılmıştır. Guard'lar `src/modules/auth/guards` içinde bulunur.
