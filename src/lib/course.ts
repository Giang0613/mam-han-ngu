import { grammarRows } from './grammar-data';
export const CONTENT_VERSION = 'hanzi-path-2026.1';
export const levels = [
 {id:1,title:'Lời chào đầu tiên',subtitle:'Làm quen · Danh tính · Những câu đầu tiên',hanzi:'初'},
 {id:2,title:'Thế giới quanh bạn',subtitle:'Sở thích · Thời gian · Cuộc sống hằng ngày',hanzi:'知'},
 {id:3,title:'Tự tin giao tiếp',subtitle:'Ăn uống · Trải nghiệm · So sánh',hanzi:'说'},
 {id:4,title:'Kết nối những ý tưởng',subtitle:'Cảm nhận · Nguyên nhân · Hành động',hanzi:'连'},
 {id:5,title:'Diễn đạt chính xác',subtitle:'Kết quả · Phương hướng · Khả năng',hanzi:'进'},
 {id:6,title:'Nói có chiều sâu',subtitle:'Điều kiện · Tăng tiến · Lựa chọn',hanzi:'通'},
 {id:7,title:'Góc nhìn của bạn',subtitle:'Quan điểm · Lập luận · Nhượng bộ',hanzi:'思'},
 {id:8,title:'Diễn đạt linh hoạt',subtitle:'Sắc thái · Văn viết · Tổng hợp',hanzi:'达'},
];
export type Grammar = {id:string;level:number;key:string;title:string;formula:string;tokens:string[];zh:string;pinyin:string;vi:string;note:string};
const extraRows = `
1|正反问|Câu hỏi khẳng định-phủ định|Động từ + 不 + động từ|你/去/不/去|Nǐ qù bu qù?|Bạn có đi không?|Không thêm 吗 vào câu hỏi chính-phản. Với 有, dùng 有没有.
1|哪里|Hỏi ở đâu|哪里 ở vị trí địa điểm|你/住/在/哪里|Nǐ zhù zài nǎlǐ?|Bạn sống ở đâu?|哪里 và 哪儿 đều hỏi địa điểm. Không chuyển từ hỏi lên đầu câu theo tiếng Việt.
2|怎么|Hỏi cách thức|怎么 + động từ|这个/字/怎么/写|Zhège zì zěnme xiě?|Chữ này viết thế nào?|怎么 hỏi cách làm; 为什么 thường hỏi lý do. 怎么 trong một số ngữ cảnh cũng hỏi nguyên nhân với sắc thái ngạc nhiên.
2|为什么|Hỏi lý do|为什么 + vị ngữ|你/为什么/学习/中文|Nǐ wèishénme xuéxí Zhōngwén?|Vì sao bạn học tiếng Trung?|Có thể trả lời bằng 因为. Không cần thêm 吗 khi đã có 为什么.
2|什么时候|Hỏi thời điểm|什么时候 + động từ|你/什么时候/回家|Nǐ shénme shíhou huí jiā?|Khi nào bạn về nhà?|Đặt cụm hỏi tại vị trí của từ chỉ thời gian. Không dùng 什么时候 để hỏi khoảng thời gian dài bao lâu.
2|怎么样|Hỏi nhận xét|Chủ đề + 怎么样|这个/办法/怎么样|Zhège bànfǎ zěnmeyàng?|Cách này thế nào?|怎么样 xin nhận xét về đối tượng hoặc đề xuất. 怎么 + động từ hỏi cách thực hiện cụ thể.
2|每都|Mỗi… đều…|每 + lượng từ + danh từ + 都|每个/学生/都/有/一本/书|Měi ge xuésheng dōu yǒu yì běn shū.|Mỗi học sinh đều có một quyển sách.|每 thường đi với lượng từ; 每天 và 每年 là các kết hợp thời gian thông dụng không thêm 个.
3|一样|So sánh ngang bằng|A + 跟 + B + 一样 + tính từ|这本/书/跟/那本/一样/贵|Zhè běn shū gēn nà běn yíyàng guì.|Quyển sách này đắt bằng quyển kia.|Có thể dùng 和 thay 跟. Không dùng 比 khi muốn nói bằng nhau trong mẫu này.
3|没有比较|So sánh không bằng|A + 没有 + B + tính từ|今天/没有/昨天/热|Jīntiān méiyǒu zuótiān rè.|Hôm nay không nóng bằng hôm qua.|没有 phủ định mức độ đạt tới mốc B. A不比B热 chỉ phủ định hơn, không luôn có nghĩa kém hơn.
4|一点也不|Hoàn toàn không|一点儿 + 也 / 都 + 不 + vị ngữ|这个/问题/一点儿/也/不/难|Zhège wèntí yìdiǎnr yě bù nán.|Vấn đề này không khó chút nào.|Dùng 不 với trạng thái trong ví dụ; 一点儿也没有 có thể phủ định lượng hoặc sự tồn tại.
3|变化了|Trạng thái mới với 了|Mệnh đề + 了 ở cuối|天气/冷/了|Tiānqì lěng le.|Trời trở lạnh rồi.|了 cuối câu có thể báo hiệu thay đổi trạng thái, không nhất thiết là hành động hoàn tất trong quá khứ.
3|要了|Sắp xảy ra|要 + động từ + 了|快/要/下雨/了|Kuài yào xià yǔ le.|Trời sắp mưa rồi.|快要 / 就要 / 要…了 nói sự việc sắp xảy ra. Phân biệt 要 biểu đạt mong muốn.
3|再又|Lặp lại với 再 và 又|再 cho việc sau; 又 cho việc đã lặp|请/再/说/一遍|Qǐng zài shuō yí biàn.|Xin nói lại một lần.|再 thường nói một lần lặp sẽ làm; 又 thường nói sự lặp đã xảy ra. Không áp dụng quy tắc thời gian này máy móc vào mọi thành ngữ.
4|刚刚|Vừa mới|刚刚 + động từ|他/刚刚/离开|Tā gānggāng líkāi.|Anh ấy vừa mới rời đi.|刚刚 thường làm trạng ngữ sát động từ. 刚才 là từ thời gian chỉ lúc nãy và có cách dùng rộng hơn ở vị trí danh ngữ.
3|已经|Đã… rồi|已经 + vị ngữ + 了|我/已经/吃饭/了|Wǒ yǐjīng chī fàn le.|Tôi đã ăn cơm rồi.|已经 nhấn mạnh việc đã đạt trạng thái tại thời điểm nói. 了 tùy cấu trúc, không phải lúc nào cũng bắt buộc.
2|给|Cho và làm cho ai|给 + người + động từ|我/给/妈妈/打电话|Wǒ gěi māma dǎ diànhuà.|Tôi gọi điện cho mẹ.|给 trước người có thể giới thiệu người nhận hành động. 给 cũng là động từ cho trong 给你一本书.
4|让|Sai khiến với 让|Người A + 让 + người B + động từ|老师/让/我们/读/课文|Lǎoshī ràng wǒmen dú kèwén.|Giáo viên bảo chúng tôi đọc bài khóa.|让 có nghĩa để, cho phép hoặc yêu cầu tùy ngữ cảnh. Người thực hiện hành động đứng sau 让.
5|为了|Mục đích với 为了|为了 + mục đích， hành động|为了/健康/，/我/每天/运动|Wèile jiànkāng, wǒ měitiān yùndòng.|Vì sức khỏe, tôi vận động mỗi ngày.|为了 nói mục đích hướng đến, khác 因为 nói nguyên nhân dẫn đến sự việc.
4|次遍|Số lần và lượt trọn vẹn|Động từ + số + 次 / 遍|我/读/了/两遍/课文|Wǒ dú le liǎng biàn kèwén.|Tôi đã đọc bài khóa hai lượt.|遍 nhấn mạnh từ đầu đến cuối; 次 đếm số lần. Vị trí tân ngữ thay đổi theo loại tân ngữ.
4|时量|Bổ ngữ thời lượng|Động từ + 了 + khoảng thời gian|我/等/了/半个小时|Wǒ děng le bàn ge xiǎoshí.|Tôi đã đợi nửa tiếng.|Thời lượng cho biết hành động kéo dài bao lâu. Khác thời điểm như 三点 thường đứng trước động từ.
6|从来|Từ trước tới nay|从来 + 不 / 没 + động từ|我/从来/不/喝/酒|Wǒ cónglái bù hē jiǔ.|Tôi không bao giờ uống rượu.|从来不 nói thói quen; 从来没…过 nói chưa từng có trải nghiệm.
3|只|Chỉ|只 + động từ / số lượng|我/只/有/十块/钱|Wǒ zhǐ yǒu shí kuài qián.|Tôi chỉ có mười tệ.|只 giới hạn phạm vi hoặc số lượng. Chú ý vị trí để không đổi đối tượng được giới hạn.
6|不得了|Mức độ rất cao|Tính từ + 得 + 不得了|今天/热/得/不得了|Jīntiān rè de bùdéliǎo.|Hôm nay nóng khủng khiếp.|不得了 là bổ ngữ nhấn mạnh mức độ, thường khẩu ngữ. Không hiểu thành khả năng không làm được trong mẫu này.
5|像|Giống như|A + 像 + B|她/的/声音/像/妈妈/的/声音|Tā de shēngyīn xiàng māma de shēngyīn.|Giọng cô ấy giống giọng mẹ.|像 là động từ giống; Có thể thêm 一样 để mở rộng so sánh, nhưng không cần 是 trước 像.
`.trim();
export const grammar:Grammar[] = (grammarRows+'\n'+extraRows).split('\n').map((line,i)=>{
 const [level,key,title,formula,seg,pinyin,vi,note]=line.split('|');
 return {id:`g${String(i+1).padStart(3,'0')}`,level:Number(level),key,title,formula,tokens:seg.split('/'),zh:seg.replaceAll('/','')+(/[吗谁哪几多少什么怎么样]|正反问|还是|究竟/.test(key)?'？':'。'),pinyin,vi,note};
});
// Explicit sentence punctuation; labels are not a grammar parser.
for(const id of ['g009','g010','g011','g022','g024','g050','g102','g101','g100','g099','g098','g097']){const g=grammar.find(x=>x.id===id);if(g&&g.pinyin.endsWith('?'))g.zh=g.tokens.join('')+'？';}
for(const g of grammar) g.zh=g.tokens.join('')+(g.pinyin.endsWith('?')?'？':'。');

const lessonRows=`
Lời chào mở đầu|你好~nǐ hǎo~xin chào;学生~xuésheng~học sinh;老师~lǎoshī~giáo viên;越南人~Yuènán rén~người Việt Nam
Còn bạn thì sao?|我~wǒ~tôi;你~nǐ~bạn;咖啡~kāfēi~cà phê;谢谢~xièxie~cảm ơn
Tên và đồ dùng của bạn|叫~jiào~tên là;书~shū~sách;名字~míngzi~tên;朋友~péngyou~bạn bè
Gia đình nhỏ|姐姐~jiějie~chị gái;妈妈~māma~mẹ;爸爸~bàba~bố;家~jiā~nhà
Ai và cái nào?|谁~shéi~ai;哪~nǎ~nào;喜欢~xǐhuan~thích;同学~tóngxué~bạn học
Một ngày đẹp trời|苹果~píngguǒ~táo;钱~qián~tiền;今天~jīntiān~hôm nay;天气~tiānqì~thời tiết
Bạn đang ở đâu?|学校~xuéxiào~trường học;茶~chá~trà;想~xiǎng~muốn;喝~hē~uống
Điều bạn yêu thích|电影~diànyǐng~phim;音乐~yīnyuè~âm nhạc;看~kàn~xem;她~tā~cô ấy
Cùng đi công viên|我们~wǒmen~chúng tôi;公园~gōngyuán~công viên;中文~Zhōngwén~tiếng Trung;说~shuō~nói
Những món đồ nhỏ|这~zhè~này;那~nà~kia;杯~bēi~cốc;有意思~yǒu yìsi~thú vị
Lên lịch ngày mai|明天~míngtiān~ngày mai;北京~Běijīng~Bắc Kinh;星期~xīngqī~tuần;去~qù~đi
Tôi làm được!|写~xiě~viết;汉字~Hànzì~chữ Hán;来~lái~đến;会~huì~biết làm
Một bữa ăn ngon|面条~miàntiáo~mì sợi;碗~wǎn~bát;坐~zuò~ngồi;这里~zhèlǐ~ở đây
Hôm nay và hôm qua|做饭~zuò fàn~nấu ăn;买~mǎi~mua;三~sān~ba;正在~zhèngzài~đang
Những chuyến đi|昨天~zuótiān~hôm qua;上海~Shànghǎi~Thượng Hải;旅游~lǚyóu~du lịch;去过~qù guo~đã từng đi
Sớm hay muộn?|六点~liù diǎn~sáu giờ;十点~shí diǎn~mười giờ;起床~qǐchuáng~thức dậy;早~zǎo~sớm
Cái nào tốt hơn?|冷~lěng~lạnh;热~rè~nóng;更~gèng~hơn nữa;比较~bǐjiào~tương đối
Bài hát yêu thích|歌~gē~bài hát;慢~màn~chậm;请~qǐng~xin mời;一点儿~yìdiǎnr~một chút
Cảm nhận của bạn|菜~cài~món ăn;辣~là~cay;甜~tián~ngọt;有点儿~yǒudiǎnr~hơi
Vì sao vậy?|下雨~xià yǔ~mưa;出去~chūqù~ra ngoài;衣服~yīfu~quần áo;贵~guì~đắt
Kế hoạch linh hoạt|如果~rúguǒ~nếu;听~tīng~nghe;饭~fàn~cơm;一起~yìqǐ~cùng nhau
Làm từng bước|先~xiān~trước tiên;再~zài~rồi;学习~xuéxí~học;清楚~qīngchu~rõ ràng
Một buổi học yên tĩnh|认真~rènzhēn~nghiêm túc;门~mén~cửa;开~kāi~mở;安静~ānjìng~yên tĩnh
Đồ vật và hành động|关~guān~đóng;自行车~zìxíngchē~xe đạp;弟弟~dìdi~em trai;骑~qí~đi xe đạp
Cuối cùng cũng xong|已经~yǐjīng~đã;终于~zhōngyú~cuối cùng;票~piào~vé;完成~wánchéng~hoàn thành
Nghe thấy điều gì?|声音~shēngyīn~âm thanh;准备~zhǔnbèi~chuẩn bị;做好~zuò hǎo~làm xong;听见~tīng jiàn~nghe thấy
Lấy ra và bắt đầu|拿~ná~cầm lấy;大家~dàjiā~mọi người;笑~xiào~cười;出来~chūlái~ra đây
Tiếp tục câu chuyện|继续~jìxù~tiếp tục;录音~lùyīn~bản ghi âm;懂~dǒng~hiểu;这段~zhè duàn~đoạn này
Kể lại trải nghiệm|吃~chī~ăn;这么多~zhème duō~nhiều thế này;昨天~zuótiān~hôm qua;什么时候~shénme shíhou~khi nào
Tìm đường đến ga|近~jìn~gần;远~yuǎn~xa;车站~chēzhàn~nhà ga;分钟~fēnzhōng~phút
Nỗ lực mỗi ngày|累~lèi~mệt;唱歌~chàng gē~hát;跳舞~tiào wǔ~nhảy múa;虽然~suīrán~mặc dù
Điều kiện để tiến bộ|时间~shíjiān~thời gian;努力~nǔlì~cố gắng;进步~jìnbù~tiến bộ;只要~zhǐyào~chỉ cần
Những điều bất ngờ|自己~zìjǐ~bản thân;生日~shēngrì~sinh nhật;忘~wàng~quên;越来越~yuè lái yuè~ngày càng
Nơi chốn lý tưởng|地方~dìfang~nơi chốn;方便~fāngbiàn~tiện lợi;安静~ānjìng~yên tĩnh;环境~huánjìng~môi trường
Chọn điều mình thích|大~dà~to;甜~tián~ngọt;或者~huòzhě~hoặc;选择~xuǎnzé~lựa chọn
Về nhà gọi tôi nhé|还是~háishi~hay là;到家~dào jiā~về đến nhà;电话~diànhuà~điện thoại;给~gěi~cho
Ngoài ra còn gì?|英语~Yīngyǔ~tiếng Anh;其他人~qítā rén~những người khác;除了~chúle~ngoại trừ;以外~yǐwài~bên ngoài
Theo góc nhìn của tôi|问题~wèntí~vấn đề;重要~zhòngyào~quan trọng;历史~lìshǐ~lịch sử;关于~guānyú~về
Đưa ra nhận xét|建议~jiànyì~đề nghị;意见~yìjiàn~ý kiến;航班~hángbān~chuyến bay;取消~qǔxiāo~hủy bỏ
Dù thế nào đi nữa|即使~jíshǐ~dù cho;哪里~nǎlǐ~đâu;支持~zhīchí~ủng hộ;无论~wúlùn~bất kể
Giải thích quan điểm|知道~zhīdào~biết;告诉~gàosu~nói cho biết;健康~jiànkāng~sức khỏe;压力~yālì~áp lực
Chọn cách giải quyết|走路~zǒu lù~đi bộ;等~děng~đợi;抱怨~bàoyuàn~than phiền;办法~bànfǎ~cách thức
Kiên trì với lựa chọn|忙~máng~bận;读书~dú shū~đọc sách;同意~tóngyì~đồng ý;仍然~réngrán~vẫn
Chuẩn bị chu đáo|提前~tíqián~trước thời hạn;出发~chūfā~xuất phát;迟到~chídào~đến muộn;联系~liánxì~liên lạc
Suýt nữa thì…|生病~shēng bìng~bị ốm;带~dài~mang;钥匙~yàoshi~chìa khóa;差点儿~chàdiǎnr~suýt nữa
Hóa ra là vậy|原来~yuánlái~hóa ra;住~zhù~sống ở;究竟~jiūjìng~rốt cuộc;什么~shénme~cái gì
Điều trái kỳ vọng|东西~dōngxi~đồ vật;未必~wèibì~chưa chắc;生气~shēng qì~tức giận;反而~fǎn'ér~ngược lại
Trình bày trọn vẹn|担心~dānxīn~lo lắng;费用~fèiyòng~chi phí;需要~xūyào~cần;总之~zǒngzhī~tóm lại
`.trim();
export type Word={id:string;zh:string;pinyin:string;vi:string;level:number;lessonId:string};
export type Lesson={id:string;level:number;index:number;title:string;wordIds:string[];grammarIds:string[];minutes:number;prerequisite:string|null};
export const words:Word[]=[];
export const lessons:Lesson[]=lessonRows.split('\n').map((row,i)=>{
 const [title,entries]=row.split('|'),id=`l${String(i+1).padStart(2,'0')}`,level=Math.floor(i/6)+1;
 const wordIds=entries.split(';').map(entry=>{const [zh,pinyin,vi]=entry.split('~');let word=words.find(w=>w.zh===zh&&w.pinyin===pinyin&&w.vi===vi);if(!word){word={id:`w${String(words.length+1).padStart(3,'0')}`,zh,pinyin,vi,level,lessonId:id};words.push(word)}return word.id});
 return {id,level,index:i+1,title,wordIds,grammarIds:grammar.slice(i*2,i*2+2).map(g=>g.id),minutes:8+Math.floor(i/12),prerequisite:i%6===0?null:`l${String(i).padStart(2,'0')}`};
});
export const wordById=Object.fromEntries(words.map(w=>[w.id,w]));
export const grammarById=Object.fromEntries(grammar.map(g=>[g.id,g]));
export const lessonById=Object.fromEntries(lessons.map(l=>[l.id,l]));
export type Exercise={id:string;lessonId:string;kind:'choice'|'listening'|'order'|'typing'|'matching';skill:'vocabulary'|'listening'|'grammar'|'writing'|'reading'|'pinyin';prompt:string;zh?:string;pinyin?:string;passage?:string;passagePinyin?:string;hintText?:string;layout?:'paragraph';options?:{id:string;text:string;pinyin?:string;picture?:string;pictureLabel?:string}[];pairs?:{id:string;left:string;right:string}[];tokens?:string[];answer:string;answerPolicy?:'option-id'|'pairs'|'hanzi';accepted?:string[];explanation:string;concept:string};
export const exercises:Exercise[]=lessons.flatMap(l=>{
 const ws=l.wordIds.map(id=>wordById[id]);
 const result:Exercise[]=ws.map((w,i)=>({id:`${l.id}-v${i}`,lessonId:l.id,kind:'choice',skill:'vocabulary',prompt:`“${w.zh}” có nghĩa là gì?`,zh:w.zh,pinyin:w.pinyin,options:ws.map(x=>({id:x.id,text:x.vi})),answer:w.id,explanation:`${w.zh} (${w.pinyin}): ${w.vi}.`,concept:w.id}));
 result.push(...l.grammarIds.map(id=>{const g=grammarById[id];return {id:`${l.id}-${id}`,lessonId:l.id,kind:'order' as const,skill:'grammar' as const,prompt:`Sắp câu theo mẫu: ${g.formula}`,tokens:g.tokens,answer:g.tokens.join(''),explanation:`${g.zh} ${g.vi} ${g.note}`,concept:g.id}}));
 result.push({id:`${l.id}-listen`,lessonId:l.id,kind:'listening',skill:'listening',prompt:'Nghe và chọn từ bạn nghe được.',zh:ws[1].zh,options:ws.map(w=>({id:w.id,text:w.zh})),answer:ws[1].id,explanation:`Bạn vừa nghe ${ws[1].zh} (${ws[1].pinyin}): ${ws[1].vi}.`,concept:ws[1].id});
 result.push({id:`${l.id}-write`,lessonId:l.id,kind:'typing',skill:'writing',prompt:`Gõ chữ Hán có nghĩa “${ws[0].vi}”.`,pinyin:ws[0].pinyin,answer:ws[0].zh,explanation:`Đáp án: ${ws[0].zh} (${ws[0].pinyin}).`,concept:ws[0].id});
 return result;
});
export const exerciseById=Object.fromEntries(exercises.map(e=>[e.id,e]));
export const placementExercises=levels.flatMap(l=>{const sample=grammar.filter(g=>g.level===l.id).slice(0,2);return sample.map((g,i)=>({id:`place-${g.id}`,lessonId:'placement',kind:'choice' as const,skill:'grammar' as const,prompt:`Chọn nghĩa đúng: ${g.zh}`,zh:g.zh,pinyin:g.pinyin,options:sample.map(x=>({id:x.id,text:x.vi})).concat([{id:'unknown',text:'Tôi chưa biết'}]),answer:g.id,explanation:`${g.zh} ${g.vi}`,concept:g.id,level:l.id}))});
export function normalizeAnswer(s:string){return s.normalize('NFC').replace(/[\s，。！？、,.!?]/g,'').trim()}
export function grade(e:Exercise,answer:string){if(e.answerPolicy==='option-id'||e.answerPolicy==='pairs')return answer===e.answer;return [e.answer,...(e.accepted||[])].some(a=>normalizeAnswer(a)===normalizeAnswer(answer))}
export function searchKey(s:string){return s.toLowerCase().replace(/u:|[üǖǘǚǜ]/g,'v').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replaceAll('đ','d').replace(/[1-5\s']/g,'')}
export const scenarios=[
 {id:'hello',title:'Lần đầu gặp mặt',place:'Ở lớp tiếng Trung',icon:'人',level:1,goal:'Chào hỏi, nói tên và quốc tịch.',turns:[{zh:'你好！你叫什么名字？',py:'Nǐ hǎo! Nǐ jiào shénme míngzi?',vi:'Chào bạn! Bạn tên là gì?',hint:'我叫小明。',answer:'我叫'},{zh:'很高兴认识你！你是哪国人？',py:'Hěn gāoxìng rènshi nǐ! Nǐ shì nǎ guó rén?',vi:'Rất vui được biết bạn! Bạn là người nước nào?',hint:'我是越南人。',answer:'越南'},{zh:'你为什么学习中文？',py:'Nǐ wèishénme xuéxí Zhōngwén?',vi:'Vì sao bạn học tiếng Trung?',hint:'因为我喜欢中文。',answer:'因为'}]},
 {id:'cafe',title:'Một ly trà, cảm ơn!',place:'Quán cà phê',icon:'茶',level:2,goal:'Gọi đồ uống, chọn kích cỡ và hỏi giá.',turns:[{zh:'欢迎！你想喝什么？',py:'Huānyíng! Nǐ xiǎng hē shénme?',vi:'Chào mừng! Bạn muốn uống gì?',hint:'我想喝一杯茶。',answer:'茶'},{zh:'你要热的还是冷的？',py:'Nǐ yào rè de háishi lěng de?',vi:'Bạn muốn nóng hay lạnh?',hint:'我要热的。',answer:'热'},{zh:'好的，还需要什么？',py:'Hǎo de, hái xūyào shénme?',vi:'Được rồi, bạn cần gì nữa?',hint:'不用了，谢谢。多少钱？',answer:'多少钱'}]},
 {id:'directions',title:'Đường đến nhà ga',place:'Trong thành phố',icon:'路',level:3,goal:'Hỏi vị trí và thời gian di chuyển.',turns:[{zh:'你好，需要帮忙吗？',py:'Nǐ hǎo, xūyào bāngmáng ma?',vi:'Chào bạn, cần giúp gì không?',hint:'请问，车站在哪里？',answer:'车站'},{zh:'车站在前面。你想走路去吗？',py:'Chēzhàn zài qiánmiàn. Nǐ xiǎng zǒu lù qù ma?',vi:'Ga ở phía trước. Bạn muốn đi bộ đến đó à?',hint:'对，走路要多长时间？',answer:'时间'},{zh:'大概十分钟。',py:'Dàgài shí fēnzhōng.',vi:'Khoảng mười phút.',hint:'谢谢你的帮助！',answer:'谢谢'}]},
 {id:'restaurant',title:'Bữa trưa cùng bạn',place:'Nhà hàng',icon:'饭',level:3,goal:'Gọi món, điều chỉnh khẩu vị, thanh toán.',turns:[{zh:'请问，你想吃什么？',py:'Qǐngwèn, nǐ xiǎng chī shénme?',vi:'Xin hỏi, bạn muốn ăn gì?',hint:'我要一碗面条。',answer:'面条'},{zh:'你能吃辣吗？',py:'Nǐ néng chī là ma?',vi:'Bạn ăn cay được không?',hint:'请少放一点儿辣椒。',answer:'辣'},{zh:'好的，请稍等。',py:'Hǎo de, qǐng shāo děng.',vi:'Được, xin đợi một chút.',hint:'谢谢。请问，可以用手机付款吗？',answer:'付款'}]},
 {id:'travel',title:'Thay đổi chuyến đi',place:'Quầy vé',icon:'旅',level:5,goal:'Giải thích lý do và hỏi phương án mới.',turns:[{zh:'您好，有什么可以帮您？',py:'Nín hǎo, yǒu shénme kěyǐ bāng nín?',vi:'Xin chào, tôi có thể giúp gì?',hint:'因为计划变了，所以我想改签。',answer:'改签'},{zh:'您想改到什么时候？',py:'Nín xiǎng gǎi dào shénme shíhou?',vi:'Bạn muốn đổi sang khi nào?',hint:'我想改到明天上午。',answer:'明天'},{zh:'需要支付差价，可以吗？',py:'Xūyào zhīfù chājià, kěyǐ ma?',vi:'Cần trả khoản chênh lệch, được không?',hint:'可以，请问需要多少钱？',answer:'多少'}]},
 {id:'opinion',title:'Nêu quan điểm của bạn',place:'Buổi thảo luận',icon:'思',level:7,goal:'Đưa quan điểm, lý do và giải pháp.',turns:[{zh:'你觉得每天学习很重要吗？',py:'Nǐ juéde měitiān xuéxí hěn zhòngyào ma?',vi:'Bạn thấy việc học mỗi ngày có quan trọng không?',hint:'对我来说，每天学习很重要。',answer:'来说'},{zh:'如果工作很忙，你会怎么办？',py:'Rúguǒ gōngzuò hěn máng, nǐ huì zěnme bàn?',vi:'Nếu công việc bận, bạn sẽ làm thế nào?',hint:'即使很忙，我也会学十分钟。',answer:'也'},{zh:'你想给其他学习者什么建议？',py:'Nǐ xiǎng gěi qítā xuéxízhě shénme jiànyì?',vi:'Bạn muốn khuyên người học khác điều gì?',hint:'与其担心，不如现在开始。',answer:'不如'}]},
];

