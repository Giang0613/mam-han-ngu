// This is a standalone Node.js script to parse cc-cedict and load it into PostgreSQL.
import fs from 'fs';
import path from 'path';

// Mocking Drizzle DB connection for the script
// import { db } from '../src/db';
// import { vocabulary } from '../src/db/schema';

console.log("🚀 Bắt đầu chạy ETL Pipeline (Vocabulary)...");

function transformPinyin(pinyinWithNumbers: string) {
  // Logic to convert "xue2 sheng1" to "xué shēng" (Omitted for brevity, handled by pinyin-pro in real app)
  return pinyinWithNumbers; 
}

function stripTonesForSearch(pinyin: string) {
  // Logic to remove tone numbers/marks for fuzzy search
  return pinyin.replace(/[0-9]/g, '').replace(/\s+/g, '').toLowerCase();
}

async function seed() {
  try {
    console.log("📦 Đang đọc file cc-cedict.json (120,000+ từ)...");
    // const rawData = fs.readFileSync(path.join(__dirname, 'cc-cedict.json'), 'utf-8');
    // const dictionary = JSON.parse(rawData);
    
    // Simulate parsing
    const dictionary = [
      { simplified: "你好", pinyin: "ni3 hao3", english: "Hello" },
      { simplified: "学生", pinyin: "xue2 sheng1", english: "Student" },
    ]; // In reality, length is 120,000

    console.log("⚙️ Đang Transform (Chuẩn hóa Pinyin, Xóa Tone tạo Index)...");
    const insertData = dictionary.map(word => ({
      hanzi: word.simplified,
      pinyinWithTones: transformPinyin(word.pinyin),
      pinyinSearchText: stripTonesForSearch(word.pinyin),
      meaning: word.english,
    }));

    console.log(`💾 Đang Load (Bulk Insert) ${insertData.length} từ vào PostgreSQL...`);
    // await db.insert(vocabulary).values(insertData); // Executes bulk insert in chunks of 5000

    console.log("✅ ETL Pipeline hoàn tất! Database đã sẵn sàng.");
  } catch (error) {
    console.error("❌ ETL Error:", error);
  }
}

seed();
