import type {NativeMaterialBlock,NativeMaterialItem} from '../src/lib/hsk/materials-catalog';
type Make=(zh:string,vi:string,py?:string)=>NativeMaterialItem;
type Edit=(make:Make)=>NativeMaterialBlock[];
const block=(title:string,kind:NativeMaterialBlock['kind'],items:NativeMaterialItem[]=[],extra:Partial<NativeMaterialBlock>={}):NativeMaterialBlock=>({id:'',title,kind,items,...extra});
const table=(title:string,columns:string[],rows:string[][],items:NativeMaterialItem[]=[])=>block(title,'phonetics',items,{table:{columns,rows}});
const tones=(rows:string[])=>rows.map(r=>r.split(' '));
const words=(m:Make,pairs:string[])=>block('Đọc to từng từ','vocabulary',pairs.map(p=>{const [zh,vi]=p.split('|');return m(zh,vi)}));
const fill=(m:Make,title:string,values:string[],prefix:boolean)=>block(title,'exercise',values.map((v,i)=>({...m(prefix?'＿＿＿'+v:v+'＿＿＿','Điền âm còn thiếu rồi đọc to.',''),label:String(i+1),audio:false})));
const mark=(m:Make,values:string[])=>block('Nghe và ghi thanh điệu','exercise',values.map((v,i)=>({...m(v,'Ghi âm tiết có dấu thanh bạn nghe được.',v),label:String(i+1),responseKey:`native-tone-${values.join('-')}-${i}`,audio:false})),{context:'Cần bản thu bài tập tương ứng để làm phần nghe; có thể dùng phần này để tự luyện với giáo viên.'});
const listeningContext='Bộ âm thanh bạn cung cấp chưa có bản thu riêng cho bài tập này. Không dùng bản đọc câu hỏi để suy ra đáp án nghe.';
const listeningTable=(m:Make,title:string,start:number,rows:string[][])=>block(title,'exercise',rows.map((_,i)=>({...m(`第${start+i}题`,`Chọn A, B hoặc C cho câu ${start+i}.`),label:String(start+i),responseKey:`native-mock-question-${start+i}`})),{context:listeningContext,table:{columns:['Câu','A','B','C'],rows:rows.map((r,i)=>[String(start+i),...r])}});
export const nativePageEdits:Record<string,Edit>={
 'textbook-016':m=>[
  block('Mục tiêu','reading',[m('能听懂并使用礼貌用语打招呼、致谢、告别。','Hiểu và dùng lời chào, lời cảm ơn và lời tạm biệt lịch sự.'),m('了解中文交际礼仪，能听懂并使用第二人称代词敬称“您”。','Hiểu phép lịch sự khi giao tiếp bằng tiếng Trung và cách dùng 您 để xưng hô kính trọng.')]),
  block('Hội thoại 1','dialogue',[m('开学第一天，在办公室里，王一飞和助教小语打招呼。','Ngày đầu tiên đến trường, trong văn phòng, cô Vương Nhất Phi và trợ giảng Tiểu Ngữ chào nhau.'),{...m('小语，你好！','Chào Tiểu Ngữ!'),speaker:'王一飞'},{...m('王老师，你好！','Em chào cô Vương!'),speaker:'小语'}]),
  words(m,['你好|Xin chào','王老师|Cô Vương']),
 ],
 'textbook-017':m=>[
  block('Hội thoại 2','dialogue',[m('开学第一天，课堂上，学生们学习打招呼用语。','Ngày đầu tiên đến lớp, các học sinh học cách chào hỏi.'),{...m('大家好！','Chào mọi người!'),speaker:'王一飞'},{...m('老师，您好！','Chúng em chào cô ạ!'),speaker:'学生们'},{...m('你们好！','Chào các bạn!'),speaker:'小语'},{...m('你好，小语！','Chào Tiểu Ngữ!'),speaker:'学生们'}]),
  block('Xưng hô kính trọng','grammar',[m('“您”是敬称，对年长者或尊敬的人使用。','您 là cách gọi kính trọng, dùng với người lớn tuổi hoặc người bạn muốn thể hiện sự tôn trọng.')]),
  words(m,['大家|Mọi người','好|Tốt; khỏe','学生|Học sinh','们|Hậu tố số nhiều chỉ người','老师|Giáo viên; thầy cô','您|Ông; bà; thầy/cô (cách gọi kính trọng)','你们|Các bạn']),
  block('Luyện theo vai','exercise',[m('分角色朗读对话。','Phân vai và đọc thành tiếng đoạn hội thoại.'),m('两人一组或多人一组，用真实姓名对话。','Làm việc theo cặp hoặc nhóm; dùng tên thật để chào hỏi theo mẫu.')]),
 ],
 'textbook-018':m=>[
  block('Hội thoại 3','dialogue',[m('开学第一天，课堂上，学生们学习致谢语、告别语。','Ngày đầu tiên đến lớp, các học sinh học cách cảm ơn và chào tạm biệt.'),{...m('谢谢！','Cảm ơn!'),speaker:'学生们'},{...m('不客气！','Không có gì!','bú kè qi'),speaker:'小语'},{...m('同学们，再见！','Tạm biệt các em!'),speaker:'王一飞'},{...m('老师，再见！','Chúng em chào cô, tạm biệt ạ!'),speaker:'学生们'}]),
  words(m,['谢谢|Cảm ơn','不客气|Không có gì','同学|Bạn học; học sinh','再见|Tạm biệt']),
  block('Luyện theo vai','exercise',[m('分角色朗读对话。','Phân vai và đọc thành tiếng đoạn hội thoại.'),m('两人一组，用对方的名字对话。','Làm theo cặp; dùng tên của người cùng cặp để hội thoại.')]),
 ],
 'textbook-019':m=>[
  block('Đọc theo bài luyện nói','phonetics',[m('妈种麻，我放马。','Mẹ trồng cây gai, tôi chăn ngựa.','mā zhòng má，wǒ fàng mǎ'),m('马吃麻，妈骂马。','Ngựa ăn cây gai, mẹ mắng ngựa.','mǎ chī má，mā mà mǎ')],{context:'Nghe bản thu 01-7 rồi đọc chậm, sau đó tăng dần tốc độ. Chú ý mā / má / mǎ / mà.'}),
  block('Khám phá pinyin','phonetics',[m('你还想学习更多的汉语拼音知识吗？那就去敲敲“小语的彩蛋”吧，惊喜等着你。','Bạn muốn tìm hiểu thêm về pinyin? Hãy khám phá phần bổ sung của Tiểu Ngữ.'),m('汉语拼音','Pinyin tiếng Trung'),m('你好','Xin chào')],{context:'Tiếp tục ở mục Bài tập để học cấu tạo âm tiết, thanh mẫu, vận mẫu và bốn thanh điệu. Tệp video bổ sung không có trong bộ tài liệu đã gửi.'}),
 ],
 'workbook-008':m=>[
  block('Âm tiết tiếng Trung','phonetics',[m('汉语一个汉字通常对应一个音节，汉语音节一般由声母、韵母和声调组成，有时由韵母和声调组成。例如：','Một chữ Hán thường tương ứng với một âm tiết. Âm tiết tiếng Trung thường gồm thanh mẫu, vận mẫu và thanh điệu; đôi khi chỉ có vận mẫu và thanh điệu.')]),
  table('Cấu tạo âm tiết',['Thanh mẫu','Vận mẫu','Thanh điệu','Âm tiết','Chữ ví dụ'],[['b','a','1','bā','八'],['b','a','2','bá','拔'],['b','a','3','bǎ','把'],['b','a','4','bà','爸'],['—','a','1','ā','阿'],['—','a','2','á','啊']],['八|Tám|bā','拔|Nhổ, rút|bá','把|Cầm, nắm|bǎ','爸|Bố|bà','阿|Âm ví dụ ā|ā','啊|Âm ví dụ á|á'].map(p=>{const [zh,vi,py]=p.split('|');return {...m(zh,vi,py),audio:zh==='啊'?true:undefined}})),
  words(m,['茶|Trà','狗|Chó','猫|Mèo','菜|Rau; món ăn'])],
 'workbook-009':m=>[
  words(m,['杯子|Cốc','学生|Học sinh','老师|Giáo viên','鸡蛋|Trứng gà']),
  block('Thanh mẫu và vận mẫu (1)','phonetics',[m('汉语声母和韵母拼合组成音节，但是声母和韵母不是都能相拼的。','Thanh mẫu và vận mẫu kết hợp thành âm tiết, nhưng không phải mọi cặp đều kết hợp được.'),m('在下方表格列举的部分声母中，除了声母“n、l”，其他声母都不能和韵母“ü”及“ü”开头的韵母相拼。另外，声母“b、p、f”不和韵母“e”相拼；声母“f、g、k、h”不和韵母“i”相拼。','Trong nhóm thanh mẫu bên dưới, chỉ n và l kết hợp với ü và các vận mẫu bắt đầu bằng ü. b, p, f không ghép với e; f, g, k, h không ghép với i.'),m('韵母“er”不和任何声母相拼，而是单独作为一个音节。','er đứng riêng thành một âm tiết, không ghép với thanh mẫu.')]),
  block('Danh sách thanh mẫu và vận mẫu','phonetics',[],{context:'Hai nhóm dưới đây là danh sách âm, không phải bảng ghép theo từng hàng. Không phải mọi thanh mẫu đều kết hợp với mọi vận mẫu; er đứng riêng.',soundGroups:[{title:'Thanh mẫu đang xét',tokens:['b','p','m','f','d','t','n','l','g','k','h']},{title:'Vận mẫu đang xét',tokens:['a','o','e','i [i]','u','er','ai','ei','ao','ou','an','en','ang','eng','ong']}]}),
  block('Bốn thanh điệu','phonetics',[m('汉语有4个基本声调，包括第一声（55）、第二声（35）、第三声（214）和第四声（51），也称一声、二声、三声、四声。声调要标在韵母的主要元音上。声调不同，意义也不同。','Tiếng Trung có bốn thanh cơ bản: thanh 1 cao và ngang (55), thanh 2 đi lên (35), thanh 3 xuống rồi lên (214), thanh 4 đi xuống (51). Dấu thanh đặt trên nguyên âm chính của vận mẫu. Khác thanh điệu có thể làm đổi nghĩa.')])],
 'workbook-010':m=>[
  table('Đọc cùng bốn thanh',['Thanh 1 · 55','Thanh 2 · 35','Thanh 3 · 214','Thanh 4 · 51'],tones(['ā á ǎ à','ē é ě è','— ér ěr èr','dā dá dǎ dà','kē ké kě kè'])),
  words(m,['口|Miệng','饭|Cơm','喝|Uống','二|Hai','你好|Xin chào','朋友|Bạn bè','面包|Bánh mì','妹妹|Em gái','房间|Phòng','白天|Ban ngày','饭店|Nhà hàng','电脑|Máy tính'])],
 'workbook-011':m=>[
  table('Nghe và đọc âm tiết',['Thanh 1','Thanh 2','Thanh 3','Thanh 4'],tones(['mō mó mǒ mò','lōu lóu lǒu lòu','fū fú fǔ fù','hān hán hǎn hàn','dī dí dǐ dì','pāng páng pǎng pàng','tāo táo tǎo tào','gēn gén gěn gèn'])),
  {...fill(m,'Nghe và điền thanh mẫu',['à','ěi','án','ù','ǎi','ěng','ó','ǎo','ōng','ěn','ān','ōu','è','ǐ','áng'],true),context:listeningContext},
  {...fill(m,'Nghe và điền vận mẫu',['t','h','m','d','f','d','h','g','p','g','k','f','n','l','b'],false),context:listeningContext},
  mark(m,['lao','neng','ge','ba','fen','kan','bai','li','gong','mang','gou','hou']),
  block('Ghép tình huống với hội thoại','exercise',[m('A：你好！ B：你好！','A: Xin chào! B: Xin chào!'),m('A：你好！ B：你们好！','A: Xin chào! B: Chào các bạn!'),m('A：谢谢！ B：不客气！','A: Cảm ơn! B: Không có gì!')],{context:'1. Hai người chào nhau tại quầy lễ tân. 2. Một người giúp người khác đứng dậy sau khi ngã. 3. Một giáo viên chào một nhóm học sinh. Ghi số hội thoại phù hợp với từng tình huống.'})],
 'workbook-012':m=>[
  block('Thanh mẫu và vận mẫu (2)','phonetics',[m('声母“j、q、x”只和下方表格中的韵母“i [i]、ü”及“i [i]、ü”开头的韵母相拼，不和韵母“a、u”及“a、u”开头的韵母直接相拼。','j, q, x kết hợp với i, ü và những vận mẫu bắt đầu bằng i, ü; không ghép trực tiếp với a, u và nhóm bắt đầu bằng a, u.')]),
  block('Nhóm j · q · x','phonetics',[],{context:'j, q, x kết hợp với i, ü và các vận mẫu bắt đầu bằng i hoặc ü. Các ô dưới đây liệt kê âm; không ghép theo vị trí của từng hàng.',soundGroups:[{title:'Thanh mẫu',tokens:['j','q','x']},{title:'Vận mẫu',tokens:['i [i]','ü','ia','ie','iao','iou (iu)','ian','in','iang','ing','iong','üe','üan','ün']}]}),
  table('Đọc âm tiết; chú ý cách viết ü',['Thanh 1','Thanh 2','Thanh 3','Thanh 4'],tones(['jī jí jǐ jì','qū qú qǔ qù','xū xú xǔ xù'])),
  table('Đọc thêm',['Âm 1','Âm 2','Âm 3','Âm 4','Âm 5','Âm 6'],[['jiā','jiàn','quán','qīng','xiàng','xīn']])],
 'workbook-013':m=>[
  words(m,['鸡|Gà','七|Bảy','写|Viết','请|Mời; xin','再见|Tạm biệt','谢谢|Cảm ơn','星期|Tuần; thứ','高兴|Vui']),
  block('Viết i, u, ü khi đứng riêng','phonetics',[m('韵母“i、u、ü”单独成音节时，写成“yi、wu、yu”。','Khi i, u, ü đứng riêng thành âm tiết, viết lần lượt là yi, wu, yu.')]),
  table('Đọc theo từng thanh',['Thanh 1','Thanh 2','Thanh 3','Thanh 4'],tones(['yī yí yǐ yì','wū wú wǔ wù','yū yú yǔ yù'])),
  words(m,['雨|Mưa','五|Năm','一|Một','椅子|Ghế'])],
 'workbook-014':m=>[
  block('j, q, x kết hợp với ü','phonetics',[m('声母“j、q、x”和韵母“ü”相拼时，“ü”上边的两点儿省略，写作“u”。','Sau j, q, x, bỏ hai chấm của ü khi viết; chữ u ở đây vẫn đọc là ü.')]),
  table('Đọc âm tiết',['Thanh 1','Thanh 2','Thanh 3','Thanh 4'],tones(['jū jú jǔ jù','qū qú qǔ qù','xū xú xǔ xù'])),
  block('iou khi đứng riêng','phonetics',[m('韵母“iou”单独成音节时，写作“you”。','Khi iou đứng riêng thành âm tiết, viết là you.')]),
  table('Đọc theo thanh',['Thanh 1','Thanh 2','Thanh 3','Thanh 4'],tones(['yōu yóu yǒu yòu'])),
  words(m,['游泳|Bơi lội','旅游|Du lịch','朋友|Bạn bè']),
  block('iou sau thanh mẫu','phonetics',[m('韵母“iou”和声母“m、d、n、l、j、q、x”相拼时，写作“iu”。例如：“miu、diu、niu、liu、jiu、qiu、xiu”。“iu”的声调要标在“u”上。','iou sau m, d, n, l, j, q, x viết thành iu; dấu thanh đặt trên u. Ví dụ: miu, diu, niu, liu, jiu, qiu, xiu.')]),
  table('Đọc các âm với iu',['1','2','3','4','5','6','7','8'],[['miù','diū','niú','liǔ','jiù','qiū','qiú','xiū']]),
  words(m,['九|Chín','朋友|Bạn bè','牛奶|Sữa bò','休息|Nghỉ ngơi'])],
 'workbook-015':m=>[
  {...fill(m,'Nghe và điền thanh mẫu',['ián','īn','iǎng','iāo','iě','īng','ǐ','ù','ià'],true),context:listeningContext},
  {...fill(m,'Nghe và điền vận mẫu',['j','x','q','j','q','x','j','x','j','q','x','q','j','x','q'],false),context:listeningContext},
  mark(m,['xue','jiao','qun','jiu','xin','qing','xia','jia','qu','ji','xiao','jie']),
  block('Ghép tình huống với hội thoại','exercise',[m('A：老师，再见！ B：再见！','A: Thưa thầy/cô, tạm biệt! B: Tạm biệt!'),m('A：对不起。 B：没关系。','A: Xin lỗi. B: Không sao.'),m('A：很高兴认识你。 B：认识你我也很高兴。','A: Rất vui được quen bạn. B: Tôi cũng rất vui được quen bạn.'),m('A：大家好，我叫白家月。 B：白家月，你好。','A: Chào mọi người, tôi tên Bạch Gia Nguyệt. B: Chào Bạch Gia Nguyệt.')],{context:'1. Hai người bắt tay khi gặp nhau. 2. Giáo viên vẫy chào hai học sinh. 3. Một học sinh đứng giới thiệu tên. 4. Một người xin lỗi người đang nghe mình nói. Ghi số hội thoại phù hợp.'})],
 'workbook-016':m=>[
  block('Thanh mẫu và vận mẫu (3)','phonetics',[m('声母“zh、ch、sh、r、z、c、s”主要和下方表格中列举的部分韵母相拼，不和韵母“i [i]、ü”及“i [i]、ü”开头的韵母相拼。','zh, ch, sh, r, z, c, s kết hợp với các vận mẫu dưới đây; không ghép với i [i], ü và các nhóm bắt đầu bằng chúng. i sau nhóm này có cách phát âm riêng, khác i [i].')]),
  block('Nhóm zh · ch · sh · r · z · c · s','phonetics',[],{context:'Đây là danh sách thanh mẫu và vận mẫu, không phải bảng ghép từng hàng. i sau nhóm thanh mẫu này có cách phát âm khác i [i].',soundGroups:[{title:'Thanh mẫu',tokens:['zh','ch','sh','r','z','c','s']},{title:'Vận mẫu',tokens:['a','e','i (âm đầu lưỡi)','u','ai','ao','ou','an','en','ang','eng','ong','ua','uo','uai','uei (ui)','uan','uen (un)','uang','ueng']}]})],
 'workbook-017':m=>[
  table('Đọc theo bốn thanh',['Thanh 1','Thanh 2','Thanh 3','Thanh 4'],tones(['zhā zhá zhǎ zhà','shē shé shě shè','chuāng chuáng chuǎng chuàng','zuō zuó zuǒ zuò'])),
  words(m,['人|Người','坐|Ngồi','菜|Rau; món ăn','书|Sách','手机|Điện thoại di động','医生|Bác sĩ','桌子|Bàn','出租车|Taxi']),
  block('Vận mẫu bắt đầu bằng u đứng riêng','phonetics',[m('韵母“ua、uo、uai、uei、uan、uen、uang、ueng”单独成音节时，“u”写作“w”，写成“wa、wo、wai、wei、wan、wen、wang、weng”。','Khi đứng riêng, đổi u đầu thành w: ua→wa, uo→wo, uai→wai, uei→wei, uan→wan, uen→wen, uang→wang, ueng→weng.')])],
 'workbook-018':m=>[
  table('Đọc theo bốn thanh',['Thanh 1','Thanh 2','Thanh 3','Thanh 4'],tones(['wā wá wǎ wà','wēi wéi wěi wèi'])),
  block('uei, uen sau thanh mẫu','phonetics',[m('韵母“uei、uen”和声母相拼时，写作“ui、un”。例如：“shuì、chūn、suì、cūn”。','uei, uen sau thanh mẫu được viết thành ui, un. Ví dụ: shuì, chūn, suì, cūn.')]),
  words(m,['春|Mùa xuân','村|Làng','睡|Ngủ','嘴|Miệng']),
  {...fill(m,'Nghe và điền thanh mẫu',['ān','ī','ǒu','èng','ì','àng','én','ùi','ài','uǐ','ǐ','ōng'],true),context:listeningContext},
  {...fill(m,'Nghe và điền vận mẫu',['z','zh','c','z','ch','r','sh','z','r','s','ch','r','zh','c','sh'],false),context:listeningContext}],
 'workbook-019':m=>[
  mark(m,['che','ren','chang','zao','shou','zhen','sui','sheng','ri','zhong','shui','zuo','chuang','shu','si']),
  block('Ghép tình huống với hội thoại','exercise',[m('A：我是法国人。 B：我也是法国人。','A: Tôi là người Pháp. B: Tôi cũng là người Pháp.'),m('A：这是我女朋友。 B：你好，很高兴认识你。','A: Đây là bạn gái tôi. B: Xin chào, rất vui được quen bạn.'),m('A：王老师是你的中文老师吗？ B：是的。','A: Cô Vương là giáo viên tiếng Trung của bạn phải không? B: Đúng vậy.'),m('A：喂，你工作忙吗？ B：我工作不忙。','A: A lô, công việc của bạn có bận không? B: Tôi không bận.')],{context:'1. Giáo viên Vương đang đứng trước bảng. 2. Một người nói chuyện qua điện thoại. 3. Hai hành khách trò chuyện trên máy bay. 4. Một người giới thiệu bạn gái với bạn. Ghi số hội thoại phù hợp.'})],
 'workbook-048':()=>[block('Hán tự: hình, âm và nghĩa','reading',[],{context:'Chữ Hán có nhiều kiểu chữ trong lịch sử, như giáp cốt văn, kim văn, triện thư, lệ thư, khải thư, thảo thư và hành thư. Các kiểu này vẫn xuất hiện trong thư pháp; khải thư được dùng làm kiểu viết tiêu chuẩn.\nChữ Hán có nguồn gốc từ chữ tượng hình. Nhiều chữ hiện đại là chữ hình thanh: một phần gợi ý nghĩa và một phần gợi ý cách đọc.\nVí dụ 材: 才 gợi âm, 木 gợi ý nghĩa liên quan đến gỗ. Với 花, 化 gợi âm, 艹 gợi ý nghĩa liên quan tới thực vật.\nPinyin và công cụ số hỗ trợ nhận biết cách đọc, nhưng khi học chữ vẫn cần kết hợp hình dạng, âm và nghĩa.'})],
 'workbook-128':m=>[listeningTable(m,'Đề tổng hợp · nghe câu 1–3',1,[['Bánh bao','Trà','Bánh chẻo'],['Học sinh trên lớp','Hai người nấu ăn','Người vẽ tranh'],['Bố và con chơi bóng','Hai người dùng điện thoại','Hai người chọn sách']])],
 'workbook-129':m=>[listeningTable(m,'Đề tổng hợp · nghe câu 4–5',4,[['Đồng hồ 7:30','Đồng hồ 8:05','Đồng hồ 10:30'],['Bé gái và chó','Mẹ bế em bé','Hai bé gái']])],
 'workbook-131':m=>[block('Đề tổng hợp · nghe câu 11–15','exercise',[m('例如：女：你好！男：你好！很高兴认识你。','Ví dụ: Nữ: Xin chào! Nam: Xin chào, rất vui được quen bạn. Chọn C.'),...Array.from({length:5},(_,i)=>({...m(`第${11+i}题`,`Chọn A–F cho câu ${11+i}.`),label:String(11+i),responseKey:`native-mock-question-${11+i}`}))],{context:listeningContext,table:{columns:['Lựa chọn','Tình huống'],rows:[['A','Bác sĩ nói chuyện qua điện thoại ở bàn làm việc'],['B','Hai chiếc ghế'],['C','Hai người bắt tay chào nhau'],['D','Khán giả xem phim'],['E','Người ngồi trước quạt'],['F','Người ngủ trên giường']]}})],
 'workbook-134':m=>[block('Đề tổng hợp · đọc câu 21–25','exercise',[m('例如：我很喜欢这本书。','Ví dụ: Tôi rất thích quyển sách này. Chọn E.'),...['王先生是医生。|Ông Vương là bác sĩ.','姐姐上午去超市买了菜。|Chị gái buổi sáng đã đi siêu thị mua rau.','今天的早饭是牛奶和鸡蛋。|Bữa sáng hôm nay là sữa và trứng gà.','我家有四口人，爸爸、妈妈、弟弟和我。|Nhà tôi có bốn người: bố, mẹ, em trai và tôi.','她和好朋友都爱唱歌。|Cô ấy và bạn thân đều thích hát.'].map((s,i)=>({...m(...s.split('|') as [string,string]),label:String(21+i),responseKey:`native-mock-question-${21+i}`}))],{context:'Ghép mỗi câu với một mô tả A–F.',table:{columns:['Lựa chọn','Tình huống'],rows:[['A','Sữa và hai quả trứng'],['B','Một bác sĩ'],['C','Gia đình bốn người'],['D','Phụ nữ chọn rau ở siêu thị'],['E','Phụ nữ đọc sách'],['F','Hai phụ nữ hát cùng nhau']]}})],
 'textbook-030':m=>[
  block('Đọc thành tiếng','reading',['你也很忙吗？|Bạn cũng rất bận phải không？','你是他的中文老师吗？|Bạn là giáo viên tiếng Trung của anh ấy phải không?','你有姐姐吗？|Bạn có chị gái không?'].map(s=>m(...s.split('|') as [string,string]))),
  block('Chọn từ điền vào chỗ trống','exercise',[...['哪|Nào','吗|Trợ từ hỏi','谁|Ai','中国人|Người Trung Quốc','想|Nhớ; muốn'].map((s,i)=>({...m(...s.split('|') as [string,string]),label:'ABCDE'[i]})),...['你工作忙＿＿＿？|Công việc của bạn có bận …?','我很＿＿＿你们。|Tôi rất … các bạn.','白家月：你是＿＿＿国人？|Bạch Gia Nguyệt: Bạn là người nước …?','李文：我是＿＿＿。|Lý Văn: Tôi là … .','白家月：她是＿＿＿？|Bạch Gia Nguyệt: Cô ấy là …?','安妮：她是陈天中的女朋友。|Annie: Cô ấy là bạn gái của Trần Thiên Trung.'].map(s=>m(...s.split('|') as [string,string]))]),
  block('Miêu tả bằng từ và ngữ pháp của bài','exercise',[m('他＿＿＿陈天中，是泰国人，他＿＿＿也＿＿＿泰国人。','Anh ấy … Trần Thiên Trung, là người Thái Lan; … của anh ấy cũng … người Thái Lan.'),m('王一飞是＿＿＿中文老师，她＿＿＿很＿＿＿。','Vương Nhất Phi là giáo viên tiếng Trung của …; cô ấy … rất … .')],{context:'Tình huống 1: Trần Thiên Trung đứng trong công viên. Tình huống 2: cô Vương Nhất Phi đang làm việc tại bàn. Hoàn thành câu dựa vào thông tin đã học trong hội thoại.'})],
};
// Stroke sequences pictured in worksheets are rendered by the existing Hanzi
// Writer component, not transcribed as repeated/partial OCR characters.
const writing:Record<number,{strokes?:string[][];rules?:string[][];pairs:string[]}>={
 1:{strokes:[['横 héng','Ngang · trái → phải'],['竖 shù','Sổ · trên → dưới']],rules:[['先横后竖','Ngang trước, sổ sau','十']],pairs:['二十|Hai mươi','工作|Làm việc']},
 2:{strokes:[['撇 piě','Phẩy · trên phải → dưới trái'],['捺 nà','Mác · trên trái → dưới phải'],['点 diǎn','Chấm'],['提 tí','Hất · dưới trái → trên phải']],rules:[['先撇后捺','Phẩy trước, mác sau','人'],['从上到下','Từ trên xuống dưới','文']],pairs:[]},
 3:{pairs:['那个|Cái đó','今天|Hôm nay','认识|Quen; biết','打电话|Gọi điện thoại']},
 4:{strokes:[['横折 héng zhé','Ngang rồi gập xuống'],['横撇 héng piě','Ngang rồi phẩy'],['竖折 shù zhé','Sổ rồi gập ngang'],['竖提 shù tí','Sổ rồi hất lên']],rules:[['从左到右','Từ trái sang phải','的'],['先外后里','Ngoài trước, trong sau','月']],pairs:[]},
 5:{pairs:['星期日|Chủ nhật','朋友|Bạn bè','医生|Bác sĩ','可以|Có thể; được phép']},
 6:{strokes:[['横钩 héng gōu','Ngang móc'],['竖钩 shù gōu','Sổ móc'],['斜钩 xié gōu','Móc xiên'],['弯钩 wān gōu','Móc cong'],['卧钩 wò gōu','Móc nằm']],rules:[['先外后里，再封口','Ngoài trước, trong sau, đóng khung cuối','日']],pairs:['买卖|Mua bán']},
 7:{pairs:['小学|Tiểu học','飞机|Máy bay','小狗|Chó con','怎么样|Thế nào','中国|Trung Quốc']},
 8:{strokes:[['横折钩 héng zhé gōu','Ngang gập móc'],['竖弯钩 shù wān gōu','Sổ cong móc'],['横折弯钩 héng zhé wān gōu','Ngang gập cong móc'],['竖折折钩 shù zhé zhé gōu','Sổ gập gập móc']],rules:[['先中间后两边','Giữa trước, hai bên sau','水']],pairs:['读书|Đọc sách','几岁|Mấy tuổi']},
 9:{pairs:['吃饭|Ăn cơm','妈妈|Mẹ','多少|Bao nhiêu']},
 10:{rules:[['左右结构','Kết cấu trái–phải','和'],['左中右结构','Kết cấu trái–giữa–phải','做']],pairs:['女儿|Con gái','弟弟|Em trai']},
 11:{pairs:['汉语|Tiếng Trung','谢谢|Cảm ơn']},
 12:{rules:[['上下结构','Kết cấu trên–dưới','分'],['上中下结构','Kết cấu trên–giữa–dưới','爱'],['半包围结构','Kết cấu bao quanh một phần','同']],pairs:[]},
 13:{rules:[['全包围结构','Kết cấu bao quanh toàn bộ','国']],pairs:['苹果|Táo','爱读书|Thích đọc sách','看病|Khám bệnh','回家|Về nhà']},
 14:{rules:[['口字旁','Bộ khẩu 口','喝'],['单人旁','Bộ nhân đứng 亻','你'],['言字旁','Bộ ngôn 讠','认'],['日字旁','Bộ nhật 日','明'],['木字旁','Bộ mộc 木','杯'],['女字旁','Bộ nữ 女','姐']],pairs:['喝茶|Uống trà','你们|Các bạn','认识|Quen; biết']},
 15:{pairs:['明天|Ngày mai','杯子|Cốc','姐姐|Chị gái']},
};
for(const [n,spec] of Object.entries(writing))nativePageEdits[`writing-${n.padStart(3,'0')}`]=m=>[
 ...(spec.strokes?[block('Tên nét & hướng viết','writing',spec.strokes.map(([zh,vi])=>m(zh.split(' ')[0],vi)),{table:{columns:['Tên nét','Hướng viết'],rows:spec.strokes}})]:[]),
 ...(spec.rules?[block('Thứ tự nét & cấu tạo chữ','writing',spec.rules.flatMap(([zh,vi,c])=>[m(zh,vi),m(c,`Luyện chữ ${c} theo quy tắc trên.`)]),{characters:spec.rules.map(r=>r[2])})]:[]),
 ...(spec.pairs.length?[block('Luyện viết chữ và từ','writing',spec.pairs.map(s=>m(...s.split('|') as [string,string])),{characters:[...new Set(spec.pairs.flatMap(p=>[...p.split('|')[0]]))]})]:[]),
];
// The workbook contains the same handwriting sheets. Reuse the typed content
// and stroke player instead of exposing partial/repeated OCR stroke fragments.
const sheet=(n:number,m:Make)=>nativePageEdits[`writing-${String(n).padStart(3,'0')}`](m);
for(const [page,n] of [[57,1],[65,2],[66,3],[74,4],[75,5]] as const)nativePageEdits[`workbook-${String(page).padStart(3,'0')}`]=m=>sheet(n,m);
const withoutWords=(n:number,m:Make)=>sheet(n,m).filter(b=>b.title!=='Luyện viết chữ và từ');
const onlyWords=(n:number,m:Make)=>sheet(n,m).filter(b=>b.title==='Luyện viết chữ và từ');
nativePageEdits['workbook-083']=m=>withoutWords(6,m);
nativePageEdits['workbook-084']=m=>[...onlyWords(6,m),...sheet(7,m)];
nativePageEdits['workbook-092']=m=>withoutWords(8,m);
nativePageEdits['workbook-093']=m=>[...onlyWords(8,m),...sheet(9,m)];
nativePageEdits['workbook-102']=m=>[...sheet(10,m),...sheet(11,m)];
nativePageEdits['workbook-111']=m=>[block('Kết cấu bao quanh một phần','writing',[m('半包围结构','Kết cấu bao quanh một phần'),m('同','Luyện chữ 同.')],{characters:['同']}),...sheet(13,m)];
nativePageEdits['workbook-120']=m=>[...onlyWords(14,m),...sheet(15,m)];
export const nativeWritingAdditions:Record<string,Edit>={
 'workbook-110':m=>[block('Kết cấu trên–dưới và trên–giữa–dưới','writing',[m('上下结构','Kết cấu trên–dưới'),m('分','Luyện chữ 分.'),m('上中下结构','Kết cấu trên–giữa–dưới'),m('爱','Luyện chữ 爱.')],{characters:['分','爱']})],
 'workbook-119':m=>withoutWords(14,m),
};
