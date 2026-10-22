import type {NativeMaterialBlock,NativeMaterialItem} from '../src/lib/hsk/materials-catalog';
import {readingFor} from '../src/lib/chinese-reading';
type Make=(zh:string,vi:string,py?:string)=>NativeMaterialItem;
type Edit=(m:Make)=>NativeMaterialBlock[];
const block=(title:string,kind:NativeMaterialBlock['kind'],items:NativeMaterialItem[]=[],extra:Partial<NativeMaterialBlock>={}):NativeMaterialBlock=>({id:'',title,kind,items,...extra});
const explanation=(m:Make,zh:string,vi:string)=>({...m(zh,vi),role:'explanation' as const});
const table=(title:string,rows:string[][],columns:string[],readingColumn=1)=>block(title,'grammar',[],{table:{columns,rows,readings:rows.map(r=>r.map((cell,i)=>i===readingColumn?readingFor(cell):''))}});
const speaking=(m:Make,speaker:string,zh:string,vi:string)=>({...m(zh,vi),speaker});
const pair=(m:Make,values:string[])=>values.map(p=>m(...p.split('|') as [string,string]));
const zhDigit=['零','一','二','三','四','五','六','七','八','九'];
const zhNumber=(n:number)=>n<10?zhDigit[n]:(n<20?'':zhDigit[Math.floor(n/10)])+'十'+(n%10?zhDigit[n%10]:'');
const knownNumbers=[...Array.from({length:12},(_,i)=>i),19,20,22,28,30,33,37,40,44,46,50,55,60,64,66,70,73,77,80,82,88,90,91,99];
export const nativeLayoutEdits:Record<string,Edit>={
 'textbook-035':m=>[
  block('Đọc ví dụ với 有 / 没有','reading',pair(m,['她有二十个学生。|Cô ấy có hai mươi học sinh.','她有一个姐姐。|Cô ấy có một chị gái.','我没/没有姐姐。|Tôi không có chị gái.'])),
  block('Cách viết và đọc số','grammar',[explanation(m,'汉语中，数字有阿拉伯数字和汉字两种写法，例如“1”和“一”。','Số có thể viết bằng chữ số Ả Rập hoặc chữ Hán, ví dụ 1 và 一. Với số từ 10 đến 99, 十 chỉ hàng chục; số từ chỉ hàng đơn vị đứng sau 十.')]),
  table('Các số đã cho trong bảng',knownNumbers.map(n=>[String(n),zhNumber(n),`Số ${n}`]),['Chữ số','Chữ Hán & pinyin','Nghĩa']),
  block('Hoàn thành các ô số còn trống','exercise',Array.from({length:100},(_,i)=>i).filter(n=>!knownNumbers.includes(n)).map(n=>({...m(`${n} → ＿＿＿`,`Viết số ${n} bằng chữ Hán.`),audio:false,responseKey:`native-textbook-035-number-${n}`})),{context:'Điền chữ Hán cho những số còn trống trong bảng. Ví dụ 12 → 十二. Các ô được chia nhỏ để bạn thực hành ngay trên web.'}),
 ],
 'textbook-036':m=>[
  table('Số từ 100 đến dưới 10.000',[['100','一百','Một trăm'],['208','二百零八','Hai trăm linh tám'],['999','九百九十九','Chín trăm chín mươi chín'],['1.000','一千','Một nghìn'],['1.528','一千五百二十八','Một nghìn năm trăm hai mươi tám'],['9.999','九千九百九十九','Chín nghìn chín trăm chín mươi chín']],['Chữ số','Chữ Hán & pinyin','Nghĩa']),
  block('Phân biệt 二 và 两','grammar',[explanation(m,'数字“2”写作、读作“二（èr）”或“两（liǎng）”。一般情况下，在序数词里用“二”，如“第二”；在量词前用“两”。','二 (èr) dùng khi đọc chữ số hoặc tạo số thứ tự, ví dụ 第二. Trước lượng từ, thường dùng 两 (liǎng), ví dụ 两个人. Cần phân biệt cách đọc số với cách nói số lượng.')]),
  table('Đọc số và số lượng',[['12','十二','Mười hai'],['22','二十二','Hai mươi hai'],['122','一百二十二','Một trăm hai mươi hai'],['2 người','两个人','Hai người'],['2 thành viên gia đình','两口人','Hai thành viên trong gia đình'],['2 quyển sách','两本书','Hai quyển sách']],['Chữ số / số lượng','Cách nói','Nghĩa']),
  block('Nghe hội thoại 2','exercise',[{...m('在公司里，王一雪和杨同乐休息时聊天儿。','Trong giờ nghỉ ở công ty, Vương Nhất Tuyết và Dương Đồng Lạc trò chuyện.','zài gōng sī lǐ，wáng yī xuě hé yáng tóng lè xiū xi shí liáo tiānr。'),role:'instruction'},...['杨同乐有一个＿＿＿。|Dương Đồng Lạc có một … .','杨同乐家有＿＿＿。|Gia đình Dương Đồng Lạc có … .'].map((p,i)=>({...m(...p.split('|') as [string,string]),id:`textbook-036-${i===0?49:57}`,label:String(i+1),responseKey:`native-textbook-036-${i===0?49:57}`}))],{id:'textbook-036-block-4',responseKey:'native-textbook-036-block-4',context:'Nghe bản thu 04-3 hai lần rồi chọn A, B hoặc C cho từng câu.',table:{columns:['Câu','A','B','C'],rows:[['1','妹妹 · em gái','姐姐 · chị gái','哥哥 · anh trai'],['2','两口人 · hai người','四口人 · bốn người','五口人 · năm người']]}}),
 ],
 'textbook-044':m=>[
  block('Thứ tự diễn đạt ngày tháng','grammar',[explanation(m,'汉语日期、星期的表达顺序是：年 → 月 → 日/号 → 星期。','Tiếng Trung diễn đạt theo thứ tự năm → tháng → ngày → thứ. 日 thường dùng trong văn viết; 号 thường dùng khi nói ngày trong tháng.')]),
  table('Đọc ngày tháng theo thứ tự',[['1992年5月16日，星期六','一九九二年五月十六日，星期六','Thứ bảy, ngày 16 tháng 5 năm 1992'],['2024年10月22日，星期二','二零二四年十月二十二日，星期二','Thứ ba, ngày 22 tháng 10 năm 2024']],['Cách viết','Cách đọc bằng chữ Hán','Nghĩa']),
  table('Mười hai tháng',Array.from({length:12},(_,i)=>[String(i+1),`${zhNumber(i+1)}月`,`Tháng ${i+1}`]),['Tháng','Tiếng Trung','Nghĩa']),
  table('Bảy ngày trong tuần',[...Array.from({length:6},(_,i)=>[String(i+1),`星期${zhNumber(i+1)}`,`Thứ ${i+2}`]),['7','星期日 / 星期天','Chủ nhật']],['Ngày','Tiếng Trung','Nghĩa']),
  block('Đọc ví dụ','reading',pair(m,['今天9月8号。|Hôm nay là ngày 8 tháng 9.','今天是2025年5月22号。|Hôm nay là ngày 22 tháng 5 năm 2025.','明天是2024年8月18号，星期天。|Ngày mai là Chủ nhật, ngày 18 tháng 8 năm 2024.'])),
  block('Câu có vị ngữ danh từ','grammar',[explanation(m,'名词谓语句的谓语部分只有名词或名词性成分，这部分词语一般是表达时间、日期、年龄等的词语。','Vị ngữ có thể là danh từ hoặc cụm danh từ, thường chỉ thời gian, ngày tháng hay tuổi tác. Trong những mẫu này, không cần thêm 是 một cách máy móc.')]),
 ],
 'textbook-062':m=>[
  block('Nói thời điểm bằng 点 và 分','grammar',[explanation(m,'“点、分”表示具体时间点。整点使用“点”，不是整点时使用“分”，“分”可以省略。但是，当时间为“十分”时，不能省略“分”；当分钟数小于十时，要读出“零”。','点 chỉ giờ, 分 chỉ phút. Trong một số cách nói giờ, có thể bỏ 分; riêng khi số phút là 10 thì giữ 分 để tránh nhầm. Với số phút dưới 10, đọc thêm 零 trước số phút.')]),
  table('Đọc giờ chính xác',[['9:00','九点','Chín giờ'],['20:00','二十点','Hai mươi giờ'],['15:40','十五点四十','Mười lăm giờ bốn mươi phút'],['21:10','二十一点十分','Hai mươi mốt giờ mười phút'],['22:05','二十二点零五','Hai mươi hai giờ năm phút']],['Cách viết','Cách đọc tiếng Trung','Nghĩa']),
  block('Xác định buổi trong ngày','grammar',[explanation(m,'“上午、中午、下午、晚上”等时间名词可以表达时间段。这些时间名词后还可以直接加时间点。','Dùng 上午, 中午, 下午, 晚上 để xác định buổi sáng, trưa, chiều, tối; sau đó đặt thời điểm cụ thể.')]),
  table('Đọc các cụm thời gian',[['上午','上午','Buổi sáng'],['12:00 trưa','中午十二点','Mười hai giờ trưa'],['14:30','下午两点半','Hai giờ rưỡi chiều'],['21:10','晚上九点十分','Chín giờ mười phút tối']],['Thời gian','Tiếng Trung','Nghĩa']),
  block('Trợ từ 吧 để đề nghị','grammar',[explanation(m,'本课语气助词“吧”读轻声 ba，在句子末尾，表示建议、商量、劝告、请求。','吧 đọc thanh nhẹ ba và đặt cuối câu; dùng để đề nghị, bàn bạc, khuyên nhủ hoặc yêu cầu nhẹ nhàng. Trong nhiều tình huống có thể dịch là “nhé”.')]),
 ],
 'textbook-087':m=>[
  block('Đơn vị tiền và cách nói số tiền','grammar',[explanation(m,'中国的货币叫人民币。人民币的单位由大到小是“元、角、分”，口语中也分别说“块、毛、分”。表达顺序是：元/块 → 角/毛 → 分。','Tiền tệ của Trung Quốc là nhân dân tệ. 元 (tệ) là đơn vị cơ bản; 1 元 = 10 角 = 100 分. Trong khẩu ngữ, 元 gọi là 块, 角 gọi là 毛. Nói số tiền theo thứ tự tệ → hào → phân.')]),
  table('Giữ đúng dấu thập phân',[['0.02 元','两分','0,02 tệ — hai phân'],['0.2 元','两毛','0,2 tệ — hai hào'],['3 元','三块','3 tệ'],['3.2 元','三块二','3,2 tệ — ba tệ hai hào'],['6.02 元','六块零两分','6,02 tệ — sáu tệ không hào hai phân'],['202.2 元','二百零二块两毛','202,2 tệ — hai trăm linh hai tệ hai hào']],['Số tiền','Cách đọc tiếng Trung','Nghĩa']),
  block('Hội thoại 2 · Mua trái cây','exercise',[{...m('在菜市场，王一雪在买水果。','Ở chợ, Vương Nhất Tuyết mua trái cây.'),role:'instruction'},{...m('这儿的水果＿＿＿。','Trái cây ở đây … .','zhèr de shuǐ guǒ ＿＿＿。'),id:'textbook-087-40',label:'1',responseKey:'native-textbook-087-40'},{...m('苹果＿＿＿一斤。','Táo có giá … cho mỗi 斤 (500 gam).'),id:'textbook-087-49',label:'2',responseKey:'native-textbook-087-49'}],{id:'textbook-087-block-2',responseKey:'native-textbook-087-block-2',context:'Nghe bản thu 10-3 hai lần, rồi chọn A, B hoặc C. Trong bài này 斤 là đơn vị khối lượng bằng 500 gam.',table:{columns:['Câu','A','B','C'],rows:[['1','很少 · rất ít','真不少 · nhiều thật','真不多 · thật sự không nhiều'],['2','三块 · 3 tệ','三块五 · 3,5 tệ','七块二 · 7,2 tệ']]}}),
 ],
 'textbook-124':m=>[
  block('Hội thoại · Các con đi học','dialogue',[speaking(m,'刘明','明年女儿上中学。','Năm tới con gái mình vào trung học.'),speaking(m,'王一雪','对。儿子也上小学了。','Đúng vậy. Con trai cũng đã vào tiểu học.'),speaking(m,'刘明','我们家有了一个中学生。','Nhà mình có thêm một học sinh trung học rồi.'),speaking(m,'王一雪','还有了一个小学生。','Còn có thêm một học sinh tiểu học nữa.'),speaking(m,'刘明','上学后，他们都忙了。','Sau khi đi học, các con đều trở nên bận rộn.'),speaking(m,'王一雪','是的。太晚了，睡觉吧。','Đúng vậy. Muộn quá rồi, đi ngủ thôi.')]),
  block('Phân biệt 他们、她们、它们','grammar',[explanation(m,'“她们”指称若干女性；“它们”指称不止一个的事物等。“他们、她们、它们”读音一样，但所指意义不同。','他们, 她们, 它们 đều đọc tā men. 他们 chỉ nhóm người (thường nam hoặc nhóm có cả nam và nữ); 她们 chỉ nhóm nữ; 它们 chỉ sự vật hoặc động vật. Chọn cách viết theo đối tượng được nhắc đến.')]),
  block('Từ mới','vocabulary',pair(m,['明年|Năm sau.','上|Vào học; học (trong 上小学、上中学).','中学|Trường trung học.','小学|Trường tiểu học.','中学生|Học sinh trung học.','小学生|Học sinh tiểu học.','上学|Đi học.','他们|Họ (nhóm người).','她们|Họ (nhóm nữ).','它们|Chúng (sự vật, động vật).','晚|Muộn; trễ.'])),
 ],
 'workbook-056':m=>[
  block('Cấu tạo chữ Hán: hình, âm, nghĩa','grammar',[explanation(m,'汉字是记录汉语的符号，一个汉字基本由形、音、义构成，所以，汉字也被称为表意文字或意音文字。','Chữ Hán ghi lại tiếng Trung, kết hợp hình dạng, âm đọc và ý nghĩa. Bài giới thiệu dùng các thuật ngữ “chữ biểu ý” và “chữ biểu ý–âm”.'),explanation(m,'汉字结构主要包括笔画、部件和整字。一般来说，笔画构成部件，部件构成整字。','Nét → bộ phận cấu thành → chữ hoàn chỉnh. Các nét tạo thành bộ phận, các bộ phận tạo thành chữ.')]),
  table('Tám loại nét cơ bản',[['1','横','Nét ngang'],['2','竖','Nét sổ'],['3','撇','Nét phẩy'],['4','捺','Nét mác'],['5','点','Nét chấm'],['6','提','Nét hất'],['7','折','Nét gập'],['8','钩','Nét móc']],['Số','Tên nét','Nghĩa']),
  block('Bộ phận và chữ hoàn chỉnh','grammar',[explanation(m,'部件由笔画组成，有的部件能够独立成字，有的不能成字，需与其他部件组成一个整字。','Một số bộ phận có thể đứng độc lập thành chữ; số khác cần kết hợp với bộ phận khác.'),explanation(m,'整字由部件组成。整字结构有两种：一种叫独体字，由一个部件组成；另一种叫合体字，由两个或两个以上的部件组成。','Chữ đơn thể gồm một bộ phận; chữ hợp thể gồm từ hai bộ phận trở lên.'),explanation(m,'汉字笔画是有书写顺序的，称为笔顺。','Các nét được viết theo thứ tự quy định, gọi là thứ tự nét (笔顺).')]),
 ],
 'workbook-101':m=>[
  block('Chữ đơn thể và chữ hợp thể','grammar',[explanation(m,'独体字和合体字是汉字的两种基本结构。独体字不能拆分为两个或两个以上的部件或偏旁，例如“人”由一撇一捺构成。合体字由两个或两个以上的部件或偏旁组成，例如“认”由言字旁“讠”和“人”组成。','Chữ đơn thể không chia thành hai bộ phận cấu thành độc lập, ví dụ 人 gồm nét phẩy và nét mác. Chữ hợp thể có từ hai bộ phận trở lên, ví dụ 认 gồm 讠 và 人.')]),
  table('Đối chiếu cấu tạo',[['Đơn thể','口、上、下','Một bộ phận'],['Hợp thể','和、认、什','Từ hai bộ phận trở lên']],['Kiểu','Chữ ví dụ','Đặc điểm']),
  block('Chữ hình thanh','grammar',[explanation(m,'形声字是由形旁和声旁组成的合体字。形旁主要表示意义类别，声旁主要提示字音。多数形声字可以通过形旁快速确定字义类别，借助声旁辅助推测读音，帮助我们理解和记忆汉字。','Chữ hình thanh gồm phần gợi nghĩa và phần gợi âm. Hai phần hỗ trợ việc hiểu và ghi nhớ chữ; âm gợi ý không luôn trùng hoàn toàn với cách đọc hiện đại.'),explanation(m,'例如“奶、姥、妈、姐、妹”，左边的“女”为形旁，表示这些字的意义与女性相关；右边的“乃、老、马、且、未”是声旁。','奶, 姥, 妈, 姐, 妹 có 女 ở bên trái gợi nghĩa liên quan tới nữ giới; 乃, 老, 马, 且, 未 ở bên phải gợi âm.')],{characters:['人','认','奶','姥','妈','姐','妹']}),
 ],
};
