# 📋 Staj Rapor Yönetim Sistemi

Öğrencilerin staj raporlarını yazmasını, danışmanların değerlendirmesini ve yöneticilerin süreci takip etmesini sağlayan full-stack bir web uygulamasıdır. **Google Gemini AI** entegrasyonu sayesinde raporlar otomatik olarak analiz edilir ve öğrencilere geri bildirim sunulur.

## ✨ Özellikler

### 👨‍🎓 Öğrenci
- Staj raporu yazma ve düzenleme (taslak kaydetme desteği)
- Rapora dosya ekleme (kod örnekleri, ekran görüntüleri)
- AI destekli rapor analizi ve geri bildirim alma
- Raporları PDF olarak dışa aktarma
- İstatistik ve grafik görüntüleme
- Bildirim sistemi ile danışman geri bildirimlerini takip etme

### 👨‍🏫 Danışman
- Öğrenci raporlarını görüntüleme ve değerlendirme
- Raporları onaylama veya düzeltme isteme
- Raporlara yorum ekleme
- Öğrenci istatistiklerini takip etme

### 🔧 Admin
- Tüm kullanıcıları yönetme (oluşturma, silme, rol değiştirme)
- Sistemdeki tüm raporları görüntüleme
- Genel istatistikleri takip etme

### 🤖 AI Analiz (Google Gemini)
- Rapor içeriğinin otomatik analizi
- Eksiklerin ve iyileştirme önerilerinin tespiti
- Yazım hatası kontrolü
- Teknik terim kullanımı değerlendirmesi
- 0-100 arası kalite puanı
- Önceki raporlarla benzerlik kontrolü (kopya tespiti)

## 🛠️ Teknoloji Yığını

### Frontend
| Teknoloji | Açıklama |
|---|---|
| **React 18** | Kullanıcı arayüzü |
| **Vite 5** | Build aracı ve geliştirme sunucusu |
| **React Router v6** | Sayfa yönlendirme |
| **Axios** | HTTP istekleri |
| **Chart.js** | İstatistik grafikleri |
| **jsPDF** | PDF oluşturma ve dışa aktarma |
| **React Icons** | İkon kütüphanesi |

### Backend
| Teknoloji | Açıklama |
|---|---|
| **Node.js** | Çalışma ortamı |
| **Express.js** | Web framework |
| **MongoDB & Mongoose** | Veritabanı ve ODM |
| **JWT** | Kimlik doğrulama |
| **bcryptjs** | Şifre hashleme |
| **Multer** | Dosya yükleme |
| **Google Gemini AI** | Rapor analizi |

## 📁 Proje Yapısı

```
staj_2_proje/
├── client/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/         # Yeniden kullanılabilir bileşenler
│   │   │   ├── AIFeedback.jsx      # AI analiz sonuçları bileşeni
│   │   │   ├── Calendar.jsx         # Takvim bileşeni
│   │   │   ├── FileUpload.jsx       # Dosya yükleme bileşeni
│   │   │   ├── Layout.jsx           # Ana sayfa düzeni
│   │   │   ├── NotificationToast.jsx# Bildirim toast bileşeni
│   │   │   ├── ProtectedRoute.jsx   # Korumalı rota bileşeni
│   │   │   ├── ReportCard.jsx       # Rapor kartı bileşeni
│   │   │   ├── Sidebar.jsx          # Yan menü bileşeni
│   │   │   └── StatCard.jsx         # İstatistik kartı bileşeni
│   │   ├── context/            # React Context (global state)
│   │   │   ├── AuthContext.jsx      # Kimlik doğrulama context
│   │   │   └── NotificationContext.jsx # Bildirim context
│   │   ├── pages/              # Sayfa bileşenleri
│   │   │   ├── AdminLogin.jsx       # Admin giriş sayfası
│   │   │   ├── AdminPanel.jsx       # Admin yönetim paneli
│   │   │   ├── AdvisorPanel.jsx     # Danışman paneli
│   │   │   ├── Dashboard.jsx        # Ana panel
│   │   │   ├── Login.jsx            # Giriş sayfası
│   │   │   ├── PDFExport.jsx        # PDF dışa aktarma
│   │   │   ├── Register.jsx         # Kayıt sayfası
│   │   │   ├── ReportView.jsx       # Rapor görüntüleme
│   │   │   ├── ReportWrite.jsx      # Rapor yazma/düzenleme
│   │   │   └── Statistics.jsx       # İstatistikler sayfası
│   │   ├── services/
│   │   │   └── api.js               # API istek servisi
│   │   ├── App.jsx                  # Ana uygulama bileşeni
│   │   ├── main.jsx                 # Uygulama giriş noktası
│   │   └── index.css                # Global stiller
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Backend (Node.js + Express)
│   ├── config/
│   │   └── db.js                    # MongoDB bağlantı yapılandırması
│   ├── middleware/
│   │   └── auth.js                  # JWT doğrulama ve rol kontrolü
│   ├── models/
│   │   ├── User.js                  # Kullanıcı modeli
│   │   ├── Report.js                # Rapor modeli
│   │   └── Notification.js          # Bildirim modeli
│   ├── routes/
│   │   ├── auth.js                  # Kimlik doğrulama rotaları
│   │   ├── reports.js               # Rapor CRUD rotaları
│   │   ├── advisor.js               # Danışman rotaları
│   │   ├── notifications.js         # Bildirim rotaları
│   │   ├── stats.js                 # İstatistik rotaları
│   │   └── admin.js                 # Admin rotaları
│   ├── services/
│   │   └── geminiService.js         # Google Gemini AI servisi
│   ├── uploads/                     # Yüklenen dosyalar
│   ├── server.js                    # Sunucu giriş noktası
│   ├── .env.example                 # Ortam değişkenleri örneği
│   └── package.json
│
└── README.md
```

## 🚀 Kurulum

### Gereksinimler

- [Node.js](https://nodejs.org/) (v18 veya üzeri)
- [MongoDB](https://www.mongodb.com/) (Atlas veya yerel kurulum)
- [Google Gemini API Key](https://aistudio.google.com/apikey) (isteğe bağlı, AI analiz için)

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/durmusali9/staj-2-.git
cd staj-2-
```

### 2. Backend Kurulumu

```bash
cd server
npm install
```

`server/` dizininde `.env` dosyası oluşturun:



> **Not:** `GEMINI_API_KEY` belirtilmezse AI analizi fallback (kural tabanlı) moda geçer ve uygulama çalışmaya devam eder.

### 3. Frontend Kurulumu

```bash
cd client
npm install
```

### 4. Uygulamayı Başlatın

**Backend** (ayrı terminalde):
```bash
cd server
npm run dev
```

**Frontend** (ayrı terminalde):
```bash
cd client
npm run dev
```

Uygulama varsayılan olarak şu adreslerde çalışır:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

### 5. Demo Kullanıcıları Oluşturun

Uygulama çalıştıktan sonra tarayıcı konsolundan veya Postman ile aşağıdaki isteği gönderin:

```bash
curl -X POST http://localhost:5000/api/seed
```

Bu komut aşağıdaki demo kullanıcıları oluşturur:

| Rol | E-posta | Şifre |
|---|---|---|
| Öğrenci | `ogrenci@test.com` | `123456` |
| Danışman | `danisman@test.com` | `123456` |
| Admin | `admin@test.com` | `.env` dosyasındaki değer |

## 📡 API Endpointleri

### Kimlik Doğrulama
| Metot | Endpoint | Açıklama |
|---|---|---|
| `POST` | `/api/auth/register` | Yeni kullanıcı kaydı |
| `POST` | `/api/auth/login` | Kullanıcı girişi |

### Raporlar
| Metot | Endpoint | Açıklama |
|---|---|---|
| `GET` | `/api/reports` | Kullanıcının raporlarını listele |
| `POST` | `/api/reports` | Yeni rapor oluştur |
| `GET` | `/api/reports/:id` | Rapor detayı görüntüle |
| `PUT` | `/api/reports/:id` | Raporu güncelle |
| `DELETE` | `/api/reports/:id` | Raporu sil |

### Danışman
| Metot | Endpoint | Açıklama |
|---|---|---|
| `GET` | `/api/advisor/reports` | Tüm öğrenci raporlarını listele |
| `PUT` | `/api/advisor/reports/:id/approve` | Raporu onayla |
| `PUT` | `/api/advisor/reports/:id/revision` | Düzeltme iste |

### Bildirimler
| Metot | Endpoint | Açıklama |
|---|---|---|
| `GET` | `/api/notifications` | Bildirimleri listele |
| `PUT` | `/api/notifications/:id/read` | Bildirimi okundu olarak işaretle |

### İstatistikler
| Metot | Endpoint | Açıklama |
|---|---|---|
| `GET` | `/api/stats` | Kullanıcı istatistikleri |

### Admin
| Metot | Endpoint | Açıklama |
|---|---|---|
| `GET` | `/api/admin/users` | Tüm kullanıcıları listele |
| `POST` | `/api/admin/users` | Yeni kullanıcı oluştur |
| `DELETE` | `/api/admin/users/:id` | Kullanıcı sil |

## 🔒 Güvenlik

- Şifreler **bcrypt** ile hashlenerek saklanır
- API istekleri **JWT (Bearer Token)** ile doğrulanır
- Rol tabanlı erişim kontrolü (öğrenci, danışman, admin)
- CORS politikası ile yalnızca izin verilen originler kabul edilir
- Dosya yükleme **Multer** ile güvenli şekilde yönetilir

## 📄 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.
