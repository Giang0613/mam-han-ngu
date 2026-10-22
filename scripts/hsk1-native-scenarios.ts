import type {NativeMaterialBlock,NativeMaterialItem} from '../src/lib/hsk/materials-catalog';
type Make=(zh:string,vi:string,py?:string)=>NativeMaterialItem;
// Text descriptions checked against the supplied pages. They replace the
// exercise photographs, keeping A/B/C/D order and question numbering.
const phraseChoices:Record<number,string[][]>={
 23:[['Người làm việc cạnh xe tải','Phụ nữ đứng trong phòng','Trẻ em ngồi trên giường'],['Bé gái','Bé trai','Hai phụ nữ'],['Gia đình ba người','Hai trẻ em','Hai chiếc cốc']],
 32:[['Hai người chạy bộ','Phụ nữ đọc sách','Hai người nấu ăn'],['Nhóm bác sĩ','Giáo viên và học sinh','Ba người dùng bữa'],['Lịch tháng 6, ngày 3','Lịch tháng 6, ngày 12','Lịch tháng 6, ngày 21']],
 40:[['Điện thoại bàn','Điện thoại di động','Ô tô'],['Ba cốc đồ uống','Một cốc sữa','Một bình và cốc nước quả'],['Người đàn ông ăn cơm','Hai người nấu ăn','Người phụ nữ ăn mì']],
 49:[['Đồng hồ 4:10','Đồng hồ 1:35','Đồng hồ 8:00'],['Học trên lớp','Chơi bóng trên sân','Người làm việc tại bàn'],['Người hát và chơi guitar','Trẻ em đọc sách','Người mua rau']],
 58:[['Nhóm học sinh trong lớp','Quầy rau ở chợ','Thư viện'],['Mèo trên ghế','Mèo dưới ghế','Mèo cạnh ghế'],['Phụ nữ làm việc','Bố và con ngoài đồng','Người đang ngủ']],
 67:[['Sân bóng','Gia đình trong phòng khách','Rạp chiếu phim'],['Hai cuốn sách','Điện thoại bàn','Một cuốn sách mở'],['Người đọc sách','Người gọi điện thoại','Người hát']],
 76:[['Rau cải','Quầy hoa quả','Bánh mì'],['Một đôi giày','Một chồng sách','Nhiều quần dài'],['Một đĩa rau','Phụ nữ mua cốc','Chăn gấp']],
 85:[['Người đọc sách','Hành khách trò chuyện','Người lái ô tô'],['Người ôm đầu','Hai người vui vẻ','Phụ nữ đứng chống hông'],['Hai học sinh làm bài','Giáo viên chỉ bài','Nhóm người dùng bữa']],
 94:[['Bãi biển trời nắng','Trời âm u','Điều hòa trong phòng'],['Đồi xanh','Cánh đồng hoa','Rừng có tuyết'],['Người lau mồ hôi','Người mặc áo ấm trong tuyết','Người nghỉ trên võng']],
 103:[['Một bát mì','Một bát cơm','Một đĩa bánh bao nước'],['Người lớn đưa đồ cho trẻ','Rót trà vào cốc','Ba người nói chuyện'],['Phụ nữ xem điện thoại','Hai người nói chuyện','Người đàn ông đứng chào']],
 112:[['Người đọc sách','Nhóm bạn ăn cùng nhau','Phụ nữ ra hiệu im lặng'],['Phụ nữ nhìn điện thoại','Nhóm bạn nhìn điện thoại','Người viết chữ Hán'],['Hai người đi xe đạp','Hành khách ngồi cạnh cửa sổ','Phụ nữ đi tàu điện']],
 121:[['Bộ ấm chén','Gia đình ăn hoa quả','Một tách đồ uống'],['Người lên ô tô','Người đi máy bay','Người đi tàu'],['Bố mẹ đọc cùng trẻ','Gia đình ngồi trong phòng','Nhóm người ăn tại bàn']],
};
const dialogueChoices:Record<number,string[]>={
 24:['Hai người đàn ông bắt tay','Một bé gái','Người giới thiệu một đôi nam nữ','Giáo viên đứng trước bảng'],
 33:['Hai người đàn ông bắt tay','Lịch tháng 6 đánh dấu ngày 3','Một đĩa thức ăn','Máy tính xách tay'],
 41:['Hai người đàn ông bắt tay','Nhà hàng','Hai người trao đổi thông tin trên điện thoại','Giáo viên dạy trong lớp'],
 50:['Hai người đàn ông bắt tay','Sách và đồng hồ trên bàn','Bánh bao','Taxi'],
 59:['Hai người đàn ông bắt tay','Thư viện','Nhóm học sinh dùng bữa','Người đàn ông làm việc'],
 68:['Hai người đàn ông bắt tay','Người đọc sách ở thư viện','Người mua rau','Chó con trong phòng'],
 77:['Hai người đàn ông bắt tay','Bốn quả táo','Ba chiếc cốc','Phụ nữ lựa chọn hàng'],
 86:['Hai người đàn ông bắt tay','Người đang ngủ','Người đàn ông đứng cầm tài liệu','Một căn phòng'],
 95:['Hai người đàn ông bắt tay','Người đàn ông có vẻ bị bệnh','Trời mưa','Bác sĩ khám bệnh'],
 104:['Hai người đàn ông bắt tay','Rót trà tại bàn ăn','Một quả óc chó trong tay','Hai người nói chuyện tại quầy'],
 113:['Hai người đàn ông bắt tay','Người dùng máy tính tại bàn','Người đàn ông vươn vai','Người nhìn ra cửa sổ'],
 122:['Hai người đàn ông bắt tay','Bộ trà','Phong cảnh thành phố','Người đứng chọn quần áo'],
};
const readingChoices:Record<number,string[]>={
 26:['Phụ nữ đọc sách','Một người đàn ông trẻ','Học sinh chào giáo viên','Gia đình bốn người'],
 35:['Phụ nữ đọc sách','Bé trai đang học','Người nằm nghỉ','Học sinh vẫy chào giáo viên'],
 43:['Phụ nữ đọc sách','Tờ ghi chú: thứ ba','Máy tính xách tay','Siêu thị'],
 52:['Phụ nữ đọc sách','Phụ nữ mua hàng','Đồng hồ 7:00','Lớp học'],
 61:['Phụ nữ đọc sách','Điện thoại đặt trên bàn','Bác sĩ và bệnh nhân','Học sinh dùng bữa'],
 70:['Phụ nữ đọc sách','Phụ nữ cầm máy tính','Mèo đứng ngoài cửa sổ','Bé gái chơi cùng chó con'],
 79:['Phụ nữ đọc sách','Một khay táo','Bánh bao','Quần áo của nam'],
 88:['Phụ nữ đọc sách','Mẹ và con ở ngoài trời','Mẹ nấu ăn','Nhóm bạn vui chơi'],
 97:['Phụ nữ đọc sách','Đường phố có tuyết','Người xem tivi','Bé gái bị bệnh'],
 106:['Phụ nữ đọc sách','Táo cắt một nửa','Người gọi điện thoại','Rót sữa vào cốc'],
 115:['Phụ nữ đọc sách','Hành khách đọc sách và ngủ trên tàu','Người đàn ông bị bệnh','Người đàn ông gọi điện'],
 124:['Phụ nữ đọc sách','Khu vui chơi','Chữ Hán và pinyin','Gia đình năm người'],
};
const descriptionTasks:Record<number,{context:string;sentences:string[]}>={
 40:{context:'1. Một gia đình ngồi trước nhà: bố, mẹ và ba người con. 2. Hai người lớn tuổi ngồi cạnh nhau, là bố mẹ của Lý Văn.',sentences:['他家有＿＿＿。|Gia đình anh ấy có … .','这是李文的＿＿＿和＿＿＿。|Đây là … và … của Lý Văn.']},
 48:{context:'1. Lịch tháng 9 năm 2025 đánh dấu Chủ nhật ngày 7. 2. Dương Đồng Lạc đang nấu ăn. 3. Trên bàn có hai món ăn. 4. Lịch tháng 5 năm 2025 đánh dấu thứ năm ngày 1.',sentences:['今天＿＿＿。|Hôm nay … .','杨同乐会＿＿＿。|Dương Đồng Lạc biết … .','我＿＿＿两个菜。|Tôi … hai món ăn.','今天是＿＿＿年＿＿＿月1号，＿＿＿。|Hôm nay là ngày 1 tháng … năm …, thứ … .']},
 56:{context:'1. Một người đang dùng điện thoại di động. 2. Xe mua hàng trong siêu thị và quầy có nhiều hộp sữa.',sentences:['她的＿＿＿是多少？|… của cô ấy là bao nhiêu?','我想＿＿＿超市＿＿＿牛奶。|Tôi muốn … siêu thị … sữa.']},
 67:{context:'1. Đồng hồ báo thức chỉ khoảng 7:20. 2. Đồng hồ treo tường chỉ 10:10. 3. Đồng hồ chỉ 9:00 vào buổi tối. 4. Đồng hồ chỉ 2:00. Hoàn thành câu theo thời điểm và hoạt động phù hợp.',sentences:['现在是＿＿＿点＿＿＿分。|Bây giờ là … giờ … phút.','我们上午＿＿＿吧。|Buổi sáng chúng ta … nhé.','我今天晚上＿＿＿还＿＿＿呢。|Tối nay tôi … còn … nữa.','妹妹＿＿＿有课。|Em gái có lớp vào … .']},
 75:{context:'1. Hai bác sĩ đứng cùng nhau. 2. Một thư viện. 3. Người phụ nữ mua hàng ở siêu thị. 4. Con mèo ngồi trên bàn.',sentences:['医生＿＿＿。|Bác sĩ … .','我们在＿＿＿见吧。|Chúng ta gặp ở … nhé.','你＿＿＿去＿＿＿吗？|Bạn … đi … không?','桌子上＿＿＿。|Trên bàn … .']},
 82:{context:'1. Bàn có sách, cốc và chai nước. 2. Các con xem tivi ở nhà. 3. Hai chú chó con. 4. Một cửa hàng bán thực phẩm ở bên ngoài trường học.',sentences:['桌子上＿＿＿。|Trên bàn … .','孩子们＿＿＿在家里＿＿＿。|Các con … ở nhà … .','＿＿＿一只小狗是我的，＿＿＿二只小狗是她的。|Chú chó thứ … là của tôi, chú chó thứ … là của cô ấy.','学校外边是一家小店，＿＿＿。|Bên ngoài trường là một cửa hàng nhỏ, … .']},
 92:{context:'1. Những quả táo. 2. Một cảnh trong phim. 3. Các cốc nhiều màu. 4. Một chiếc áo sơ mi. Luyện hỏi giá và nhận xét; câu hỏi mở có nhiều cách trả lời.',sentences:['这儿的苹果＿＿＿。|Táo ở đây … .','这个电影＿＿＿？|Bộ phim này …?','那些杯子＿＿＿，非常＿＿＿。|Những chiếc cốc đó …, rất … .','这件衣服＿＿＿，一件＿＿＿块。|Chiếc áo này …, mỗi chiếc … tệ.']},
 100:{context:'1. Mẹ và con đang mua sắm. 2. Một chiếc bàn không có sách. 3. Em trai đang làm bài. 4. Một người đang đọc sách.',sentences:['我们＿＿＿。|Chúng tôi … .','桌子上＿＿＿书？|Trên bàn … sách không?','弟弟＿＿＿睡觉，在学习呢，他明天＿＿＿。|Em trai … ngủ, đang học; ngày mai em ấy … .','她＿＿＿看电视，＿＿＿。|Cô ấy … xem tivi, … .']},
 107:{context:'1. Trời mưa. 2. Trời nắng. 3. Dương Đồng Lạc nằm trên giường, có vẻ bị bệnh. 4. Bác sĩ đang trao đổi với bệnh nhân.',sentences:['昨天＿＿＿。|Hôm qua … .','今天＿＿＿。|Hôm nay … .','杨同乐＿＿＿了，他昨天去＿＿＿，今天来＿＿＿。|Dương Đồng Lạc đã …; hôm qua anh ấy đi …, hôm nay tới … .','医生对杨同乐说：“今天＿＿＿，回家＿＿＿。”|Bác sĩ nói: Hôm nay …, về nhà … .']},
 116:{context:'1. Học sinh giơ tay đặt câu hỏi. 2. Một bạn đứng cạnh bàn muốn ngồi xuống. 3. Người rót nước nóng vào cốc. 4. Một đĩa thức ăn tại nhà hàng.',sentences:['我＿＿＿？|Tôi …?','你好！我＿＿＿坐这儿吗？|Xin chào! Tôi … ngồi đây được không?','我＿＿＿热水，请＿＿＿我＿＿＿。|Tôi … nước nóng, xin … tôi … .','服务员：请问＿＿＿？刘明：我要＿＿＿。|Nhân viên: Xin hỏi …? Lưu Minh: Tôi muốn … .']},
 125:{context:'1. Chị gái và em trai mang cặp đi học. 2. Nhóm học sinh cùng học trong lớp.',sentences:['姐姐和弟弟＿＿＿。|Chị gái và em trai … .','我们昨天＿＿＿，没去看电影。|Hôm qua chúng tôi …, không đi xem phim.']},
 133:{context:'1. Một xửng bánh bao. 2. Vạn Lý Trường Thành. 3. Chị của Vương Nhất Phi đang vẫy chào. 4. Cô Vương trong lớp. Dùng thêm 还/也 để nối ý.',sentences:['我爱吃面包，＿＿＿。|Tôi thích ăn bánh mì, … .','去年我去＿＿＿。|Năm ngoái tôi đi … .','王一飞的姐姐＿＿＿。|Chị của Vương Nhất Phi … .','王老师是＿＿＿人，她＿＿＿。|Cô Vương là người …, cô ấy … .']},
};
const sourceNumbers=(title:string,from:number,to:number,m:Make,id:string)=>Array.from({length:to-from+1},(_,i)=>({...m(`第${from+i}题`,`${title}: chọn A, B, C${to===8?' hoặc D':''}.`),label:String(from+i),responseKey:`native-${id}-question-${from+i}`}));
export function applyNativeScenarios(id:string,blocks:NativeMaterialBlock[],m:Make){
 const n=Number(id.split('-')[1]),book=id.split('-')[0];
 if(book==='workbook')for(const b of blocks){
  if(phraseChoices[n]&&b.items.some(i=>/听短语.*图片/.test(i.zh))){b.title='Câu 1–3 · Nghe và chọn tình huống';b.context='Các lựa chọn dưới đây mô tả nội dung tranh bằng chữ. Cần bản thu bài tập tương ứng; bộ MP3 hiện có là bản thu bài học.';b.table={columns:['Câu','A','B','C'],rows:phraseChoices[n].map((r,i)=>[String(i+1),...r])};b.items=[m('例如：三个苹果。','Ví dụ: ba quả táo. Trong mẫu, A là sách, B là máy tính, C là ba quả táo; chọn C.'),...sourceNumbers('Nghe',1,3,m,id)];}
  if(dialogueChoices[n]&&b.items.some(i=>/听对话.*图片/.test(i.zh))){b.title='Câu 6–8 · Nghe hội thoại và ghép tình huống';b.context='Dùng A–D bên dưới thay cho tranh; cần bản thu bài tập tương ứng.';b.table={columns:['Lựa chọn','Tình huống'],rows:dialogueChoices[n].map((s,i)=>['ABCD'[i],s])};b.items=sourceNumbers('Nghe hội thoại',6,8,m,id);}
  if(readingChoices[n]&&b.items.some(i=>/选择与句子.*图片/.test(i.zh))){b.title='Câu 11–13 · Ghép câu với tình huống';b.context='Chọn mô tả phù hợp với từng câu. Ví dụ “我很喜欢这本书。” ứng với A.';b.table={columns:['Lựa chọn','Tình huống'],rows:readingChoices[n].map((s,i)=>['ABCD'[i],s])};b.items=b.items.filter(i=>!i.zh.includes('图片'));let q=11;for(const item of b.items){if(/例如/.test(item.zh))continue;item.label=String(q);item.responseKey=`native-${id}-question-${q++}`;}}
 }
 // Warm-up picture matching becomes matching the same Chinese words to their
 // Vietnamese meanings. A deterministic rotation prevents answer order hints.
 if(book==='textbook')for(const b of blocks)if(b.items[0]?.zh.includes('给下面')&&b.items[0].zh.includes('图片')){
  b.title='Khởi động · Ghép từ với nghĩa';b.context='Viết chữ cái A–F tương ứng với từng mô tả. Có thể mở bản dịch nếu cần gợi ý.';
  const ws=b.items.slice(1).filter(i=>/^[\p{Script=Han}0-9]{1,8}$/u.test(i.zh));
  if(ws.length){b.table={columns:['Mô tả','Nghĩa tiếng Việt'],rows:ws.map((_,i)=>[String(i+1),ws[(i+2)%ws.length].vi])};b.items=ws.map((w,i)=>({...w,label:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[i]}));for(let i=0;i<ws.length;i++)b.items.push({...m(`第${i+1}题`,`Chọn chữ cái ứng với mô tả ${i+1}.`),responseKey:`native-${id}-warmup-${i}`,label:String(i+1)});}
  if(n===60){b.title='Khởi động · Nói giờ bằng tiếng Trung';b.context='Viết sáu thời điểm bằng tiếng Trung. Có thể dùng 点、分、半、刻 khi phù hợp. Các giờ này tương ứng với sáu đồng hồ trong bài.';b.items=['10:10','12:30','13:45','15:20','18:00','8:15'].map((time,i)=>({...m(`${time} → ＿＿＿`,'Viết cách nói giờ bằng tiếng Trung.',time),label:String(i+1),responseKey:`native-${id}-warmup-${i}`,audio:false}));}
 }
 if(book==='textbook'&&descriptionTasks[n])for(const b of blocks)if(b.items.some(i=>/用本课.*描述图片/.test(i.zh))){const d=descriptionTasks[n];b.title='Hoàn thành câu theo tình huống';b.context=d.context;b.items=d.sentences.map((s,i)=>({...m(...s.split('|') as [string,string]),label:String(i+1),responseKey:`native-${id}-scenario-${i}`}));}
 for(const b of blocks)for(const item of b.items){if(/看图片，先跟读/.test(item.zh)){item.zh=item.zh.replace('看图片，','');item.pinyin='';item.vi=item.vi.replace(/Xem tranh,?\s*/i,'');}if(/根据老师给出的图片/.test(item.zh)){item.vi='Làm theo cặp: dựa vào tình huống giáo viên đưa ra, hỏi và đáp theo mẫu hội thoại.';item.translation='edited';}}
 return blocks;
}
