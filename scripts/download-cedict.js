const fs = require('fs');
const path = require('path');
const https = require('https');

const url = 'https://raw.githubusercontent.com/mzyy94/cc-cedict-json/master/cedict.json';
const dest = path.join(__dirname, 'cedict.json');

console.log('Đang tải từ điển CC-CEDICT (120,000+ từ)... Vui lòng đợi...');

https.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Lỗi tải file: ${res.statusCode}`);
    return;
  }
  const file = fs.createWriteStream(dest);
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('✅ Đã tải xong từ điển CC-CEDICT! File lưu tại: ' + dest);
  });
}).on('error', (err) => {
  console.error('Lỗi kết nối:', err.message);
});
