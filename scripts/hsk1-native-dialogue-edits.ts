import type {NativeMaterialBlock,NativeMaterialItem} from '../src/lib/hsk/materials-catalog';
type Make=(zh:string,vi:string,py?:string)=>NativeMaterialItem;
const block=(title:string,kind:NativeMaterialBlock['kind'],items:NativeMaterialItem[],extra:Partial<NativeMaterialBlock>={}):NativeMaterialBlock=>({id:'',title,kind,items,...extra});
const line=(m:Make,id:string,speaker:string,zh:string,vi:string,py?:string)=>({...m(zh,vi,py),id,speaker,role:'utterance' as const});
const note=(m:Make,zh:string,vi:string)=>({...m(zh,vi),role:'explanation' as const});
const tasks=(m:Make,questions:string[])=>block('Thực hành theo hội thoại','exercise',questions.map((s,i)=>({...m(...s.split('|') as [string,string]),label:String(i+1)})));
// Checked against the supplied pages. Sidebars, restaurant-screen text and
// vocabulary are separate content, never words spoken by a dialogue actor.
export const nativeDialogueEdits:Record<string,(m:Make)=>NativeMaterialBlock[]>={
 'textbook-051':m=>[
  block('Hội thoại 1 · Trao đổi số điện thoại','dialogue',[
   {...m('在校园里，李文向白家月要手机号。','Trong khuôn viên trường, Lý Văn hỏi số điện thoại của Bạch Gia Nguyệt.'),role:'instruction'},
   line(m,'textbook-051-14','李文','家月，你的手机号是多少？','Gia Nguyệt, số điện thoại di động của bạn là bao nhiêu?'),
   line(m,'textbook-051-phone-bai','白家月','我的手机号是+33 601493190。','Số điện thoại di động của tôi là +33 601493190.'),
   line(m,'textbook-051-phone-li','李文','我的手机号是+86 13552721160。','Số điện thoại di động của tôi là +86 13552721160.'),
   line(m,'textbook-051-agree','白家月','好的。','Được rồi.'),
  ]),
  block('Ghi nhớ khi nói số điện thoại','grammar',[
   note(m,'现在人们有时也用“电话”指代“手机”。','Trong giao tiếp hiện nay, 电话 đôi khi cũng được dùng để chỉ điện thoại di động.'),
   note(m,'手机号要一位一位地读，而且数字“1”要读成“yāo”。','Đọc số điện thoại từng chữ số một. Khi đọc số điện thoại, chữ số 1 thường đọc là yāo để nghe rõ và tránh nhầm.'),
  ]),
  block('Từ mới','vocabulary',[m('手机','Điện thoại di động.'),m('电话','Điện thoại; cuộc gọi điện thoại (tùy ngữ cảnh).'),m('号','Số; số hiệu (trong 手机号 là số điện thoại).')]),
  tasks(m,['分角色朗读对话。|Phân vai và đọc thành tiếng đoạn hội thoại.','两人一组，根据实际情况对话。|Làm theo cặp, dùng thông tin phù hợp để trao đổi số điện thoại.']),
 ],
 'textbook-054':m=>[
  block('Hội thoại 3 · Chọn nơi ăn tối','dialogue',[
   line(m,'textbook-054-2','王一雪','星期天我们去哪儿吃晚饭？','Chủ nhật chúng ta đi đâu ăn tối?','xīng qī tiān wǒ men qù nǎr chī wǎn fàn？'),
   line(m,'textbook-054-10','刘明','我还想去西安饭店。','Anh vẫn muốn đến nhà hàng Tây An.'),
   line(m,'textbook-054-15','刘小雪','那边的包子非常好吃，我想吃包子。','Bánh bao ở đó rất ngon; con muốn ăn bánh bao.'),
   line(m,'textbook-054-30','刘小明','妈妈，我想吃米饭，不想吃包子。','Mẹ ơi, con muốn ăn cơm, không muốn ăn bánh bao.'),
   line(m,'textbook-054-43','王一雪','好的。我们怎么去？','Được. Chúng ta đi bằng cách nào?'),
   line(m,'textbook-054-56','刘明','坐出租车去。','Đi bằng taxi.'),
  ]),
  block('Đọc bổ sung · Thông tin nhà hàng','reading',[
   note(m,'西安饭店：评分4.6，3994条评价，人均85元。口味4.5，环境4.7，服务4.5。','Nhà hàng Tây An: điểm đánh giá 4,6; 3.994 lượt đánh giá; mức chi tiêu trung bình 85 tệ/người. Điểm hương vị 4,5; không gian 4,7; phục vụ 4,5.'),
   m('优惠、菜品、评价、笔记。','Ưu đãi; món ăn; đánh giá; ghi chép.'),
   m('推荐菜、网友推荐菜、查看全部。','Món được gợi ý; món được người dùng đề xuất; xem tất cả.'),
   m('包子、面条儿、羊肉串、拌面。','Bánh bao; mì sợi; xiên thịt cừu; mì trộn.'),
   m('三层楼有包间；工作日不需排队；一楼服务特别热情；包子很好吃。','Có phòng riêng trên tầng ba; ngày thường không cần xếp hàng; phục vụ ở tầng một rất nhiệt tình; bánh bao rất ngon.'),
   m('匿名用户，20小时前。超预期。这家饭店开了很多年了，菜做得地道有特色，好吃！','Người dùng ẩn danh, 20 giờ trước: Vượt mong đợi. Nhà hàng này đã mở nhiều năm; món ăn có hương vị chuẩn và đặc trưng riêng, rất ngon!'),
  ],{context:'Đây là thông tin trong hình minh họa nhà hàng, không phải lời của các nhân vật trong bản thu.'}),
  tasks(m,['分角色朗读对话。|Phân vai và đọc thành tiếng đoạn hội thoại.','西安饭店的包子好吃吗？|Bánh bao của nhà hàng Tây An có ngon không?','他们怎么去西安饭店？|Họ đến nhà hàng Tây An bằng cách nào?']),
 ],
 'textbook-066':m=>[
  block('Hội thoại 3 · Việc làm buổi tối','dialogue',[
   line(m,'textbook-066-4','王一雪','喂，你在哪儿呢？','A lô, anh đang ở đâu đấy?','wéi，nǐ zài nǎr ne？'),
   line(m,'textbook-066-14','刘明','我在家里呢。','Anh đang ở nhà.','wǒ zài jiā li ne。'),
   line(m,'textbook-066-21','王一雪','我晚上六点半下班。','Em tan làm lúc sáu giờ rưỡi tối.'),
   line(m,'textbook-066-25','刘明','我八点去医院上班。','Tám giờ anh đến bệnh viện làm việc.'),
   line(m,'textbook-066-30','王一雪','好的，你去店里买些菜吧。','Được, anh đến cửa hàng mua một ít rau nhé.','hǎo de，nǐ qù diàn li mǎi xiē cài ba。'),
   line(m,'textbook-066-38','刘明','好，我十分钟后去。','Được, mười phút nữa anh đi.'),
  ]),
  block('Cách đọc 里','grammar',[note(m,'“里”作方位词时，在“家、超市”等名词性词语后，一般读轻声“li”；在“里边”等词语中，需读第三声“lǐ”。','里 thường đọc thanh nhẹ li khi đứng sau danh từ chỉ nơi chốn như 家, 超市. Trong từ 里边, 里 đọc thanh 3 lǐ.')]),
  block('Từ mới','vocabulary',[
   m('在','Ở, tại.'),m('家','Nhà.'),m('里','Trong, bên trong; sau danh từ nơi chốn thường đọc li.','li'),m('晚上','Buổi tối.'),m('医院','Bệnh viện.'),m('上班','Đi làm; làm việc.'),m('店','Cửa hàng.'),m('菜','Rau (trong 买些菜).'),m('分钟','Phút, đơn vị thời lượng.'),m('后','Sau; về sau (trong 十分钟后: mười phút nữa).'),
  ]),
  tasks(m,['分角色朗读对话。|Phân vai và đọc thành tiếng đoạn hội thoại.','刘明晚上还去做什么？|Tối nay Lưu Minh còn đi làm việc gì?']),
 ],
 'textbook-079':m=>[
  block('Nghe hội thoại 2 · Câu 2','exercise',[{...m('这是陈天中的＿＿＿中文书。','Đây là quyển sách tiếng Trung thứ … của Trần Thiên Trung.'),id:'textbook-079-4',label:'2',responseKey:'native-textbook-079-4'}],{context:'Nghe hội thoại 2, chọn A, B hoặc C.',table:{columns:['A','B','C'],rows:[['第一本 · quyển thứ nhất','第二本 · quyển thứ hai','第三本 · quyển thứ ba']]}}),
  block('Hội thoại 2 · Quyển sách trên ghế','dialogue',[
   line(m,'textbook-079-19','白家月','椅子上有一本中文书，那是谁的书？','Trên ghế có một quyển sách tiếng Trung; sách đó của ai?','yǐ zi shang yǒu yì běn zhōng wén shū，nà shì shéi de shū？'),
   line(m,'textbook-079-book-owner','陈天中','是我的书，谢谢。这是我的第二本中文书。','Là sách của tôi, cảm ơn bạn. Đây là quyển sách tiếng Trung thứ hai của tôi.'),
   line(m,'textbook-079-45','白家月','不客气。你明天上午在哪儿？','Không có gì. Sáng mai bạn ở đâu?','bú kè qi。nǐ míng tiān shàng wǔ zài nǎr？'),
   line(m,'textbook-079-school','陈天中','我明天上午在学校学习。','Sáng mai tôi học ở trường.'),
  ]),
  block('Cách đọc 上','grammar',[note(m,'作方位词时，“上”在名词后，比如“椅子上”“书上”，读轻声；表示位置在高处，或次序、时间在前时，比如“上方”“上半年”，“上”读四声。','上 thường đọc thanh nhẹ shang khi đứng sau danh từ trong các cụm chỉ vị trí như 椅子上, 书上. Khi chỉ vị trí cao hơn hoặc thứ tự, thời gian trước đó, như 上方, 上半年, đọc thanh 4 shàng.')]),
  block('Từ mới','vocabulary',[m('椅子','Ghế.'),m('上','Trên; sau danh từ vị trí thường đọc shang.','shang'),m('本','Lượng từ dùng cho sách, tương đương quyển.'),m('书','Sách.'),m('那','Đó; kia.'),m('第','Tiền tố tạo số thứ tự: thứ…'),m('学习','Học; học tập.')]),
  tasks(m,['分角色朗读对话。|Phân vai và đọc thành tiếng đoạn hội thoại.','椅子上的书是谁的？|Quyển sách trên ghế là của ai?','陈天中明天上午在哪儿学习？|Sáng mai Trần Thiên Trung học ở đâu?']),
 ],
 'textbook-115':m=>[
  block('Nghe hội thoại 3 · Câu 2','exercise',[{...m('刘明想喝＿＿＿。','Lưu Minh muốn uống … .'),id:'textbook-115-3',label:'2',responseKey:'native-textbook-115-3'}],{context:'Nghe hội thoại 3, chọn A, B hoặc C.',table:{columns:['A','B','C'],rows:[['水 · nước','茶 · trà','牛奶 · sữa bò']]}}),
  block('Hội thoại 3 · Gọi món','dialogue',[
   line(m,'textbook-115-12','服务员','先生，请坐！您要什么？','Mời anh ngồi! Anh muốn gọi món gì?'),
   line(m,'textbook-115-18','刘明','我要一斤饺子。','Tôi muốn một cân bánh chẻo (500 gam).'),
   line(m,'textbook-115-24','服务员','好的。一斤饺子40个。','Vâng. Một cân bánh chẻo có 40 chiếc.'),
   line(m,'textbook-115-42','刘明','40个太多了，我要一半吧。','40 chiếc nhiều quá; cho tôi một nửa thôi nhé.'),
   line(m,'textbook-115-52','服务员','半斤20个。您想喝什么？','Nửa cân có 20 chiếc. Anh muốn uống gì?'),
   line(m,'textbook-115-63','刘明','请给我一杯茶吧。','Xin cho tôi một tách trà nhé.'),
  ],{context:'Trong hội thoại mua hàng này, 1 斤 là 500 gam; nửa 斤 là 250 gam.'}),
  block('Từ mới','vocabulary',[m('先生','Ông; anh, cách gọi lịch sự với nam giới.'),m('一半','Một nửa.'),m('茶','Trà, đồ uống.')]),
  tasks(m,['分角色朗读对话。|Phân vai và đọc thành tiếng đoạn hội thoại.','刘明想要多少饺子？|Lưu Minh muốn bao nhiêu bánh chẻo?','刘明要米饭了吗？|Lưu Minh có gọi cơm không?']),
 ],
};
