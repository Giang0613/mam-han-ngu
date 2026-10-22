import type {NativeMaterialBlock,NativeMaterialItem} from '../src/lib/hsk/materials-catalog';
type Make=(zh:string,vi:string,py?:string)=>NativeMaterialItem;
type Edit=(make:Make)=>NativeMaterialBlock[];
const block=(title:string,kind:NativeMaterialBlock['kind'],items:NativeMaterialItem[]=[],extra:Partial<NativeMaterialBlock>={}):NativeMaterialBlock=>({id:'',title,kind,items,...extra});
const table=(title:string,columns:string[],rows:string[][])=>block(title,'phonetics',[],{table:{columns,rows}});
const context='Chưa có bản thu riêng của bài tập này trong bộ âm thanh đã cung cấp. Có thể luyện với giáo viên; không dùng giọng đọc câu hỏi để đoán đáp án nghe.';
const words=(m:Make,pairs:string[])=>block('Đọc và luyện phát âm','vocabulary',pairs.map(p=>{const [zh,vi,py]=p.split('|');return m(zh,vi,py)}));
const choices=(m:Make,title:string,rows:string[][])=>block(title,'exercise',rows.map((_,i)=>({...m(`第${i+1}题`,`Chọn chữ cái của âm tiết bạn nghe được.`),label:String(i+1),responseKey:`native-phonetic-choice-${i}`})),{context,table:{columns:['Câu',...rows[0].map((_,i)=>String.fromCharCode(65+i))],rows:rows.map((r,i)=>[String(i+1),...r])}});
const mark=(m:Make,values:string[])=>block('Nghe và ghi dấu thanh','exercise',values.map((v,i)=>({...m(v,'Viết lại pinyin có dấu thanh của âm bạn nghe.',v),label:String(i+1),responseKey:`native-mark-${i}`,audio:false})),{context});
const matching=(m:Make,py:string[],zh:string[],vi:string[])=>block('Ghép pinyin với từ','exercise',zh.map((z,i)=>({...m(z,vi[i]),label:String(i+1),responseKey:`native-match-${i}`})),{context:'Ghi số pinyin tương ứng với mỗi từ. Ví dụ 你好 tương ứng số 1. Có thể ẩn pinyin để tự kiểm tra trước khi mở lại.',table:{columns:['Số','Pinyin'],rows:py.map((p,i)=>[String(i+1),p])}});
const classify=(m:Make,pairs:string[],four=false)=>block('Nhận biết loại câu','exercise',pairs.map((p,i)=>({...m(...p.split('|') as [string,string]),label:String(i+1),responseKey:`native-sentence-type-${i}`})),{context:four?'A: trần thuật · B: nghi vấn · C: cảm thán · D: cầu khiến. Đọc câu và chọn loại câu; luyện nghe ngữ điệu với giáo viên.':'A: câu trần thuật · B: câu nghi vấn. Đọc câu và chọn A hoặc B; luyện nghe ngữ điệu với giáo viên.'});
export const nativePhoneticEdits:Record<string,Edit>={
 'workbook-020':m=>[
  block('Biến điệu thanh 3','phonetics',[m('两个三声音节相连，第一个三声音节读作二声。','Khi hai âm tiết thanh 3 đứng liền nhau, âm tiết đầu được đọc thành thanh 2. Pinyin từ vựng vẫn thường ghi thanh gốc.')]),
  table('Thanh gốc → cách đọc trong cụm',['Từ','Thanh gốc','Khi nói'],[['你好','nǐ hǎo','ní hǎo'],['哪里','nǎ lǐ','ná lǐ'],['可以','kě yǐ','ké yǐ'],['小语','xiǎo yǔ','xiáo yǔ'],['很好','hěn hǎo','hén hǎo']]),
  words(m,['水果|Trái cây','你好|Xin chào','可以|Có thể','哪里|Ở đâu','很好|Rất tốt','所以|Vì vậy','请你|Mời bạn','手表|Đồng hồ đeo tay'])],
 'workbook-021':m=>[
  words(m,['你好|Xin chào','哪里|Ở đâu','小语|Tiểu Ngữ','水果|Trái cây']),
  block('Thanh nhẹ','phonetics',[m('轻声是又轻又短的声调。轻声音节不标声调。','Thanh nhẹ được đọc nhẹ và ngắn; âm tiết thanh nhẹ không ghi dấu thanh.'),m('有的词，读轻声和不读轻声，意义有所不同。','Một số từ đổi nghĩa khi âm tiết cuối chuyển thành thanh nhẹ.')]),
  table('Phân biệt nghĩa',['Chữ','Không đọc nhẹ','Nghĩa','Đọc nhẹ','Nghĩa'],[['东西','dōng xī','Đông và tây','dōng xi','Đồ vật'],['买卖','mǎi mài','Mua và bán','mǎi mai','Việc kinh doanh'],['孙子','Sūn zǐ','Tôn Tử (tên riêng)','sūn zi','Cháu trai']]),
  words(m,['妈妈|Mẹ','爸爸|Bố','椅子|Ghế','饺子|Bánh chẻo'])],
 'workbook-022':m=>[
  words(m,['谢谢|Cảm ơn','衣服|Quần áo','漂亮|Đẹp','早上|Buổi sáng']),
  choices(m,'Nghe và chọn âm tiết',[['pà','bà'],['zì','cì'],['náng','láng'],['jù','qù'],['mén','méng'],['rù','lù'],['kè','rè'],['qìn','qìng']]),
  words(m,['你好|Xin chào','可以|Có thể','哪里|Ở đâu','水果|Trái cây','手表|Đồng hồ đeo tay','所以|Vì vậy','捧场|Ủng hộ; cổ vũ','好久|Rất lâu','晚点|Muộn một chút','了解|Hiểu rõ','洗澡|Tắm','只有|Chỉ có']),
  words(m,['包子|Bánh bao','谢谢|Cảm ơn','便宜|Rẻ','弟弟|Em trai','漂亮|Đẹp','没关系|Không sao','对不起|Xin lỗi','认识|Quen; biết']),
  table('Phân biệt thanh nhẹ',['Nhóm','A','B'],[['1','Sūn zǐ','sūn zi'],['2','dōng xī','dōng xi'],['3','yùn qì','yùn qi'],['4','Lǎo zǐ','lǎo zi'],['5','dì fāng','dì fang'],['6','mǎ mǎ hū hū','mǎ hu']])],
 'workbook-029':m=>[
  block('Biến điệu của 不','phonetics',[m('“不”单说，或在一声、二声、三声音节前，读四声；在四声音节前，读二声。','不 đứng riêng hoặc trước thanh 1, 2, 3 đọc bù. Trước âm tiết thanh 4, 不 đọc bú.')]),
  table('Đọc 不 trước thanh 4',['Cụm','Thanh gốc','Cách đọc'],[['不是','bù + shì','bú shì'],['不会','bù + huì','bú huì'],['不大','bù + dà','bú dà'],['不对','bù + duì','bú duì']]),
  block('Biến điệu của 一','phonetics',[m('“一”单说或表示序数时，读一声。','一 đứng riêng hoặc dùng trong số thứ tự đọc yī. Trong cụm từ, cách đọc thay đổi theo thanh điệu âm tiết sau.')])],
 'workbook-030':m=>[
  block('一 trước thanh 1, 2, 3','phonetics',[m('“一”在一声、二声和三声音节前，读四声。','一 trước thanh 1, 2, 3 được đọc thành thanh 4: yì.')]),
  table('Đọc yì',['Cụm','Thanh gốc','Cách đọc'],[['一些','yī + xiē','yì xiē'],['一年','yī + nián','yì nián'],['一口','yī + kǒu','yì kǒu']]),
  block('一 trước thanh 4','phonetics',[m('“一”在四声音节前，读二声。','一 trước thanh 4 được đọc thành thanh 2: yí.')]),
  table('Đọc yí',['Cụm','Thanh gốc','Cách đọc'],[['一个','yī + gè','yí gè'],['一日','yī + rì','yí rì'],['一岁','yī + suì','yí suì']]),
  choices(m,'Nghe và chọn âm tiết',[['gè','kè'],['jiàng','qiàng'],['cóng','sóng'],['nìng','lìng'],['jiā','xiā'],['zuàn','cuàn'],['tòu','gòu'],['zhí','shí']])],
 'workbook-031':m=>[
  words(m,['不要|Không muốn; đừng|bú yào','不客气|Không có gì|bú kè qi','不喝|Không uống|bù hē','不来|Không đến|bù lái','不冷|Không lạnh|bù lěng','不知道|Không biết|bù zhī dào','不学习|Không học|bù xué xí','不好听|Nghe không hay|bù hǎo tīng']),
  words(m,['一天|Một ngày|yì tiān','一元|Một nhân dân tệ|yì yuán','一点儿|Một chút|yì diǎnr','一半|Một nửa|yí bàn','一车|Một xe|yì chē','一人|Một người|yì rén','一碗|Một bát|yì wǎn','一下|Một chút; một lần|yí xià'])],
 'workbook-038':m=>[
  block('Âm cuốn lưỡi 儿化','phonetics',[m('“儿”加在韵母后边，与前面的音节合成一个音节。儿化用“r”标记。','儿化 thêm âm r vào cuối vận mẫu, kết hợp với âm tiết trước thành một âm tiết. Pinyin ghi bằng r.'),m('儿化常用于口语，有时表示亲切、小巧或区别词义。','儿化 thường gặp trong khẩu ngữ; có thể gợi sự thân mật, nhỏ nhắn hoặc phân biệt nghĩa từ.')]),
  words(m,['这儿|Ở đây|zhèr','那儿|Ở đó|nàr','面条儿|Mì sợi|miàn tiáor','茶馆儿|Quán trà|chá guǎnr','饭馆儿|Quán ăn|fàn guǎnr','名牌儿|Nhãn hiệu|míng páir','照片儿|Ảnh|zhào piànr']),
  table('Ví dụ thay đổi dạng từ',['Không 儿化','Có 儿化'],[['这 zhè','这儿 zhèr'],['哪 nǎ','哪儿 nǎr'],['画 huà (vẽ)','画儿 huàr (bức vẽ)'],['盖 gài (đậy)','盖儿 gàir (nắp)'],['个 gè (lượng từ)','个儿 gèr (vóc dáng)'],['眼 yǎn (mắt)','眼儿 yǎnr (lỗ nhỏ)']])],
 'workbook-039':m=>[
  words(m,['面条儿|Mì sợi|miàn tiáor','好玩儿|Vui; thú vị|hǎo wánr','一点儿|Một chút|yì diǎnr','饭馆儿|Quán ăn|fàn guǎnr','那儿|Ở đó|nàr','这儿|Ở đây|zhèr','玩儿|Chơi|wánr','歌儿|Bài hát|gēr']),
  block('Dấu phân cách âm tiết','phonetics',[m('“a、o、e”开头的音节与前面的音节相接时，为了避免音节界限不清楚，要在两个音节间使用隔音符号。','Khi âm tiết bắt đầu bằng a, o, e đứng sau âm tiết khác, dùng dấu nháy đơn khi cần để làm rõ ranh giới âm tiết.')]),
  table('Cách viết',['Chữ','Pinyin'],[['十二',"shí'èr"],['西安',"Xī'ān"],['天安门',"Tiān'ānmén"]]),
  choices(m,'Nghe và chọn âm tiết',[['nà piàn','nà biān'],['dōng xī','dōng xi'],['chāo shī','chāo shì'],['wǎn fàn','wǎn fēng'],['shōu jī','shǒu jī'],['diàn huà','biàn huà']]),
  table('Phân biệt âm có và không có r',['Câu','A','B'],[['1','nà','nàr'],['2','cí','cír'],['3','huàr','huà'],['4','yí kuàir','yí kuài'],['5','jiā yóu','jiā yóur'],['6','chàng gēr','chàng gē']])],
 'workbook-046':m=>[
  block('Âm bật hơi và không bật hơi','phonetics',[m('送气声母和不送气声母是成对的，共六组：b和p、d和t、g和k、j和q、zh和ch、z和c。','Có sáu cặp thanh mẫu đối lập bật hơi: b/p, d/t, g/k, j/q, zh/ch, z/c. Có thể đưa một mảnh giấy trước miệng để quan sát luồng hơi.')]),
  table('Nghe và phân biệt',['Không bật hơi','Bật hơi'],[['gǔ','kǔ'],['diàn','tiàn'],['dōng','tōng'],['jiù','qiù'],['zēng','cēng'],['zhǔn','chǔn'],['zhí','chí'],['zì','cì'],['bái','pái'],['bēn','pēn'],['jù','qù'],['guā','kuā']]),
  block('Vận mẫu mũi -n và -ng','phonetics',[m('汉语中前鼻音韵母是指以“-n”结尾的韵母，后鼻音韵母是指以“-ng”结尾的韵母。','Vận mẫu mũi trước kết thúc bằng -n; vận mẫu mũi sau kết thúc bằng -ng.')])],
 'workbook-047':m=>[
  table('Phân biệt -n và -ng',['Mũi trước','Mũi sau'],[['pén','péng'],['rǎn','rǎng'],['nián','niáng'],['jiàn','jiàng'],['gǎn','gǎng'],['mén','méng'],['sēn','sēng'],['zàn','zàng'],['shēn','shēng'],['huán','huáng'],['fàn','fàng'],['chén','chéng'],['lín','líng'],['xiǎn','xiǎng'],['bīn','bīng'],['qīn','qīng']]),
  block('Hán tự: hình, âm và nghĩa','reading',[
   m('汉字发祥于古老的中国，是世界上最古老的文字之一，也是世界上唯一一个从古代演变至今、从未间断使用的文字。','Chữ Hán có nguồn gốc từ Trung Quốc cổ đại. Sách giới thiệu đây là một trong những hệ chữ lâu đời nhất và được sử dụng liên tục tới ngày nay.'),
   m('汉字是记录汉语的符号。历史上，汉字经历了甲骨文、金文、篆书、隶书、楷书、草书、行书等形式，这些形式至今仍在书法艺术中被使用。其中，楷书是汉字的标准字体。','Chữ Hán ghi lại tiếng Trung. Các kiểu chữ trong lịch sử gồm giáp cốt văn, kim văn, triện, lệ, khải, thảo và hành; chúng vẫn được dùng trong thư pháp. Khải thư là kiểu chữ tiêu chuẩn.'),
   m('汉字以象形字为基础，以形声字为主体，现代汉字中形声字比例高达90%左右，为人们学习汉字提供了便利。','Theo nội dung sách, chữ Hán có nền tảng là chữ tượng hình; phần lớn là chữ hình thanh (khoảng 90% theo cách phân loại của sách). Điều này giúp người học nhận biết chữ.'),
   m('汉字是形、音、义一体的文字形式。一般情况下，根据文字形式，就可推知其意义和读音。例如：“材”，“才”提示该字的读音，“木”（木字旁）是偏旁，表明与树木相关；“花”，“化”提示该字的读音，“艹”（草字头）是偏旁，表明与花草植物相关。','Hán tự kết hợp hình dạng, âm và nghĩa. Một số bộ phận gợi âm, một số gợi nghĩa. Trong 材, 才 gợi âm và 木 gợi nghĩa liên quan đến gỗ. Trong 花, 化 gợi âm và 艹 gợi nghĩa liên quan đến cây cỏ.'),
   m('随着数字时代的到来，借助汉语拼音来识读汉字的途径和方式更加丰富，进一步方便了学习者掌握汉字，提升汉语阅读水平。','Công cụ số và pinyin giúp người học nhận biết chữ Hán thuận tiện hơn và nâng cao khả năng đọc tiếng Trung.')])],
 'workbook-055':m=>[
  choices(m,'Nghe và phân biệt âm tiết',[['lián','nián'],['rén','shén'],['diē','tiē'],['chǎn','chǎng'],['liè','lüè'],['hùn','fèn'],['bīn','bīng'],['gōng','kōng']]),
  choices(m,'Chọn từ hai âm tiết không phải dạng lặp',[['tīng ting','tīng lì','jiě jie'],['gē ge','gè ge','gē kē'],['kàn kan','kàn jiàn','xiǎng xiang'],['méi yǒu','mèi mei','xiè xie']])],
 'workbook-064':m=>[mark(m,['hao','xie','nin','zhong','tongxue','dajia','zaijian','renshi']),choices(m,'Chọn âm tiết có thanh khác nhóm',[['qián','xiǎo','nián'],['chàng','shū','zhōng'],['gǒu','běn','xué'],['biān','gē','dì']])],
 'workbook-073':m=>[mark(m,['dui','jia','guo','xiang','chaoshi','niunai','shangwu','dianying']),choices(m,'Chọn âm tiết có thanh khác nhóm',[['zuò','zì','zhuō'],['xiě','chá','jiě'],['chuān','qù','fēn'],['yǒu','shuǐ','rén'],['wàibian','zhège','yīyuàn']])],
 'workbook-082':m=>[mark(m,['chang','leng','hui','shuijiao','pingguo','jidan','daxuesheng','dianyingyuan']),choices(m,'Chọn từ có thanh khác nhóm',[['mǎi','néng','méi'],['xīn','zhēn','rè'],['zuò fàn','zhèng zài','xià bān'],['shí jiān','hǎo tīng','míng tiān'],['Xīng qī tiān','zhōng xué shēng','chū zū chē']])],
 'workbook-091':m=>[
  choices(m,'Chọn từ có thanh khác nhóm',[['shuǐ','shuì','hěn'],['wèn tí','kàn bìng','diàn shì'],['gāo xìng','fēi cháng','zhī dào'],['qù chāo shì','zài shāng diàn','duì bu qǐ']]),
  matching(m,['nǐ hǎo','míng zi','Zhōng guó','lǎo shī','hái zi','xiè xie'],['你好','老师','谢谢','孩子','名字','中国'],['Xin chào','Giáo viên','Cảm ơn','Trẻ em','Tên','Trung Quốc'])],
 'workbook-100':m=>[
  choices(m,'Chọn cụm từ có thanh khác nhóm',[['jiǎo zi','shuǐ guǒ','zǎo shang'],['xué xí','fáng jiān','míng tiān'],['mǎi bāo zi','xiě Hàn zì','yǒu bēi zi'],['máng gōng zuò','lái shū diàn','zhǎo tóng xué']]),
  matching(m,['nǐ hǎo','gōng sī','xiān sheng','gōng zuò','jiǎo zi','péng you'],['你好','饺子','公司','朋友','先生','工作'],['Xin chào','Bánh chẻo','Công ty','Bạn bè','Ông; ngài','Làm việc'])],
 'workbook-109':m=>[
  matching(m,['nǐ hǎo','méi guān xi','nán péng you','bú kè qi',"nǚ'ér",'hǎo wánr'],['你好','女儿','好玩儿','没关系','男朋友','不客气'],['Xin chào','Con gái','Vui; thú vị','Không sao','Bạn trai','Không có gì']),
  block('Ngữ điệu và loại câu','phonetics',[m('按照不同表达功能和语气划分，汉语句子一般分为陈述句、疑问句、感叹句和祈使句四类。','Có bốn loại câu theo mục đích giao tiếp: trần thuật, nghi vấn, cảm thán và cầu khiến.'),m('陈述句叙述事实，句尾音调平或略下降；疑问句提出问题，除了特指问句，句尾音调多上扬；感叹句表达强烈的情感，句尾音调拉长或加重；祈使句发出请求或命令，句尾音调下降。','Câu trần thuật nêu sự việc, cuối câu thường ngang hoặc hơi hạ. Câu hỏi có thể lên giọng (không áp dụng máy móc cho mọi câu hỏi). Câu cảm thán nhấn mạnh cảm xúc; câu cầu khiến thể hiện yêu cầu hoặc mệnh lệnh.')])],
 'workbook-110':m=>[classify(m,['你是学生吗？|Bạn là học sinh phải không?','你是哪国人？|Bạn là người nước nào?','我叫李文。|Tôi tên Lý Văn.','今天我休息。|Hôm nay tôi nghỉ.','谁是老师？|Ai là giáo viên?','我想去超市买东西。|Tôi muốn đi siêu thị mua đồ.'])],
 'workbook-118':m=>[
  matching(m,['nǐ hǎo','méi kàn jiàn','nǎ xiē rén','shuō huà','shén me shí hou','zuò fēi jī'],['你好','说话','坐飞机','没看见','哪些人','什么时候'],['Xin chào','Nói chuyện','Đi máy bay','Không nhìn thấy','Những người nào','Khi nào']),
  block('Luyện ngữ điệu bốn loại câu','phonetics',[],{context:'Phần tiếp theo dùng A cho câu trần thuật, B cho câu nghi vấn, C cho câu cảm thán và D cho câu cầu khiến. Nghe ngữ điệu với giáo viên rồi đọc to.'})],
 'workbook-119':m=>[classify(m,['你是学生吗？|Bạn là học sinh phải không?','我爱吃水果。|Tôi thích ăn trái cây.','这件衣服真漂亮！|Bộ quần áo này đẹp quá!','你们去哪里？|Các bạn đi đâu?','请坐。|Mời ngồi.','雨大吗？|Mưa có to không?'],true)],
};
