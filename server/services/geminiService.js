import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

// Fallback analiz fonksiyonu (API anahtarı yoksa veya hata olursa)
const fallbackAnalyze = (report) => {
    const eksikler = [];
    const oneriler = [];
    let puan = 100;

    if (!report.icerik.bugunNeYaptin || report.icerik.bugunNeYaptin.length < 50) {
        eksikler.push('Bugün ne yaptığınız çok kısa, daha detaylı yazın.');
        puan -= 15;
    }

    if (!report.icerik.karsilasilanProblem) {
        eksikler.push('Karşılaştığınız zorluklara değinmemişsiniz.');
        puan -= 10;
    }

    if (!report.icerik.nasilCozdun) {
        eksikler.push('Problemi nasıl çözdüğünüzü belirtmemişsiniz.');
        puan -= 10;
    }

    if (!report.dosyalar || report.dosyalar.length === 0) {
        oneriler.push('Kod örneği veya ekran görüntüsü eklemeniz raporunuzu güçlendirir.');
        puan -= 10;
    }

    const allText = `
    ${report.icerik.bugunNeYaptin || ''} 
    ${report.icerik.karsilasilanProblem || ''} 
    ${report.icerik.nasilCozdun || ''}
  `.toLowerCase();

    const techKeywords = ['kod', 'api', 'veritabanı', 'fonksiyon', 'component', 'react', 'node', 'hata'];
    let techCount = 0;
    techKeywords.forEach(kw => {
        if (allText.includes(kw)) techCount++;
    });

    if (techCount < 2) {
        oneriler.push('Teknik detayları daha fazla ekleyin. (Örn: Hangi teknolojileri/fonksiyonları kullandınız?)');
        puan -= 15;
    }

    return {
        ozet: `${report.baslik} başlıklı staj raporu. İçerik uzunluğu ve detayı temel düzeyde kontrol edildi.`,
        eksikler,
        oneriler,
        puan: Math.max(0, puan),
        yazimHatalari: [],
        teknikAnaliz: [
            techCount < 2 ? 'Teknik terim kullanımı yetersiz.' : 'Teknik terim kullanımı kabul edilebilir.'
        ]
    };
};

export const analyzeReport = async(report, previousReports) => {
    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            console.log('Gemini API anahtarı bulunamadı, fallback analiz kullanılıyor.');
            return fallbackAnalyze(report);
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Veya gemini-pro

        const previousReportsText = previousReports && previousReports.length > 0 ?
            previousReports.map((r, i) => `Rapor ${i+1}: ${r.icerik.bugunNeYaptin}`).join(' | ') :
            'Yok';

        const prompt = `
Sen bir staj rapor analiz asistanısın. Görevin raporu ONAYLAMAK veya REDDETMEK değil.
Sadece raporun kalitesini ve tutarlılığını artırmak için önerilerde bulun.

Rapor:
- Başlık: ${report.baslik}
- Bugün ne yaptın: ${report.icerik.bugunNeYaptin}
- Karşılaştığın problem: ${report.icerik.karsilasilanProblem}
- Nasıl çözdün: ${report.icerik.nasilCozdun}
- Yarın planı: ${report.icerik.yarinPlani}
- Eklenen dosya sayısı: ${report.dosyalar?.length || 0}

Öğrencinin önceki raporları: ${previousReportsText}

Aşağıdaki JSON formatında yanıt ver (başka hiçbir şey yazma, sadece JSON, markdown karakterleri ( \`\`\`json ) vb. OLMASIN, düz JSON metni olarak gönder):
{
  "ozet": "Raporun 3 cümlelik özeti",
  "eksikler": ["Eksik olan şeyler listesi"],
  "oneriler": ["İyileştirme önerileri listesi"],
  "puan": 75,
  "yazimHatalari": ["Tespit edilen yazım hataları listesi"],
  "teknikAnaliz": ["Teknik terim kullanımıyla ilgili değerlendirme maddeleri listesi"]
}

Önemli kontrol noktaları:
- Kod örneği veya ekran görüntüsü eklenmemiş mi? Eklenmemişse öner.
- Teknik kısımlar yeterince detaylı mı?
- Karşılaşılan zorluklara değinilmiş mi?
- Rapor yeterince uzun ve detaylı mı?
- Önceki raporlarla çok benzer mi (copy-paste)?
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // JSON parse hatalarını önlemek için temizlik
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const parsedData = JSON.parse(text);
            return parsedData;
        } catch (parseError) {
            console.error('Gemini yanıtı JSON olarak parse edilemedi:', text);
            return fallbackAnalyze(report); // Parse edilemezse fallback kullan
        }

    } catch (error) {
        console.error('Gemini API Hatası:', error);
        return fallbackAnalyze(report); // Hata durumunda fallback kullan
    }
};