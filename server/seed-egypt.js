import { createClient } from '@libsql/client';
import path from 'path';
import crypto from 'crypto';

const dbPath = path.resolve(process.cwd(), '../elgammal.db');
const client = createClient({ url: `file:${dbPath}` });

const egyptData = {
  "القاهرة": ["القاهرة الجديدة", "مدينة نصر", "المعادي", "مصر الجديدة", "الشروق", "الرحاب", "مدينتي", "الزمالك", "شبرا", "حلوان"],
  "الإسكندرية": ["سموحة", "ميامي", "المنتزه", "العجمي", "برج العرب", "سيدي بشر", "السيوف"],
  "الدقهلية": ["المنصورة", "طلخا", "ميت غمر", "دكرنس", "أجا", "السنبلاوين", "بلقاس", "شربين", "منية النصر", "المطرية"],
  "الغربية": ["طنطا", "المحلة الكبرى", "زفتى", "كفر الزيات", "سمنود", "السنطة", "قطور", "بسيون"],
  "الشرقية": ["الزقازيق", "العاشر من رمضان", "منيا القمح", "بلبيس", "فاقوس", "أبو حماد", "ديرب نجم", "أبو كبير", "الحسينية"],
  "المنوفية": ["شبين الكوم", "منوف", "السادات", "قويسنا", "أشمون", "الباجور", "تلا", "الشهداء"],
  "القليوبية": ["بنها", "شبرا الخيمة", "العبور", "قليوب", "الخانكة", "طوخ", "القناطر الخيرية"],
  "البحيرة": ["دمنهور", "كفر الدوار", "رشيد", "إدكو", "أبو المطامير", "وادي النطرون", "كوم حمادة", "الدلنجات"],
  "كفر الشيخ": ["كفر الشيخ", "دسوق", "بيلا", "قلين", "سيدي سالم", "بلطيم", "الرياض", "فوه"],
  "دمياط": ["دمياط", "دمياط الجديدة", "كفر سعد", "فارسكور", "الزرقا", "رأس البر"],
  "بورسعيد": ["بورسعيد", "بورفؤاد"],
  "الإسماعيلية": ["الإسماعيلية", "فايد", "القنطرة شرق", "القنطرة غرب", "التل الكبير"],
  "السويس": ["السويس", "فيصل", "عتاقة", "الجناين"],
  "الجيزة": ["الجيزة", "السادس من أكتوبر", "الشيخ زايد", "الدقي", "المهندسين", "الهرم", "البدرشين", "العياط", "الصف"],
  "الفيوم": ["الفيوم", "سنورس", "إطسا", "طامية", "أبشواي"],
  "بني سويف": ["بني سويف", "الواسطى", "ناصر", "ببا", "الفشن"],
  "المنيا": ["المنيا", "المنيا الجديدة", "مغاغة", "بني مزار", "سمالوط", "أبو قرقاص", "ملوي", "دير مواس"],
  "أسيوط": ["أسيوط", "ديروط", "القوصية", "أبنوب", "منفلوط", "أبو تيج", "الغنايم"],
  "سوهاج": ["سوهاج", "أخميم", "البلينا", "المراغة", "المنشأة", "دار السلام", "جرجا", "طما", "طهطا"],
  "قنا": ["قنا", "نجع حمادي", "دشنا", "قوص", "أبو تشت", "فرشوط", "قفط"],
  "الأقصر": ["الأقصر", "إسنا", "أرمنت", "القرنة"],
  "أسوان": ["أسوان", "إدفو", "كوم أمبو", "دراو", "نصر النوبة"],
  "مطروح": ["مرسى مطروح", "العلمين", "الضبعة", "سيدي براني", "السلوم", "سيوة"],
  "البحر الأحمر": ["الغردقة", "رأس غارب", "سفاجا", "القصير", "مرسى علم"],
  "الوادي الجديد": ["الخارجة", "الداخلة", "الفرافرة", "باريس"],
  "شمال سيناء": ["العريش", "بئر العبد", "الشيخ زويد", "رفح"],
  "جنوب سيناء": ["شرم الشيخ", "دهب", "نويبع", "الطور", "طابا"]
};

async function seed() {
  console.log('Seeding Governorates and Cities...');
  
  // First clear old ones to prevent duplicates/mess (except we shouldn't delete if they are foreign keys, but let's hope no customers exist yet or we update them, actually no we just INSERT OR IGNORE)
  // SQLite doesn't have INSERT OR IGNORE easily via client.execute if we want ID back. Let's do it safely.
  
  const existingGovs = await client.execute('SELECT * FROM governorates');
  const govMap = {};
  for(const g of existingGovs.rows) {
    govMap[g.name] = g.id;
  }

  for (const [govName, cities] of Object.entries(egyptData)) {
    let govId = govMap[govName];
    if (!govId) {
      govId = crypto.randomUUID();
      await client.execute({
        sql: 'INSERT INTO governorates (id, name, is_active) VALUES (?, ?, 1)',
        args: [govId, govName]
      });
      console.log(`Added Governorate: ${govName}`);
    }

    // Now cities
    const existingCities = await client.execute({
      sql: 'SELECT * FROM cities WHERE governorate_id = ?',
      args: [govId]
    });
    const cityMap = {};
    for (const c of existingCities.rows) {
      cityMap[c.name] = c.id;
    }

    for (const cityName of cities) {
      if (!cityMap[cityName]) {
        const cityId = crypto.randomUUID();
        await client.execute({
          sql: 'INSERT INTO cities (id, governorate_id, name, is_active) VALUES (?, ?, ?, 1)',
          args: [cityId, govId, cityName]
        });
        console.log(`   Added City: ${cityName}`);
      }
    }
  }
  
  console.log('Done!');
}

seed().catch(console.error);
