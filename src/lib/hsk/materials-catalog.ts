import audioIndex from './material-audio-index.json';
import audioPlacement from './material-audio-placement.json';
import type {MaterialSubmission} from './material-grading';
export const HSK1_MATERIAL_REVISION='hsk1-books-2026-10-07-v1';
export type MaterialBook='textbook'|'workbook'|'writing';
export const materialBooks:{id:MaterialBook;title:string;pages:number}[]=[
 {id:'textbook',title:'Bài học',pages:144},{id:'workbook',title:'Bài tập',pages:139},{id:'writing',title:'Tập viết',pages:15},
];
export type MaterialLesson={id:number;zh:string;py:string;vi:string;goal:string;pages:Record<MaterialBook,number[]>};
const titles=[
 ['AI小语，你好！','AI Xiǎoyǔ, nǐ hǎo!','Chào Xiaoyu!','Chào hỏi, cảm ơn, tạm biệt và cách xưng hô lịch sự.'],
 ['我叫李文','Wǒ jiào Lǐ Wén','Tôi tên là Lý Văn','Giới thiệu tên, xin lỗi và trật tự cơ bản của câu.'],
 ['我是中国人','Wǒ shì Zhōngguó rén','Tôi là người Trung Quốc','Nói quốc tịch; câu 是, trợ từ 的 và câu hỏi 吗.'],
 ['我有两个孩子','Wǒ yǒu liǎng ge háizi','Tôi có hai người con','Nói về gia đình, số lượng, lượng từ và trợ từ 呢.'],
 ['今天我休息','Jīntiān wǒ xiūxi','Hôm nay tôi nghỉ','Nói ngày tháng, thời gian và khả năng với 会.'],
 ['你的手机号是多少？','Nǐ de shǒujī hào shì duōshao?','Số điện thoại của bạn là bao nhiêu?','Trao đổi thông tin liên lạc; 想, câu liên động và 怎么.'],
 ['我晚上六点半下班','Wǒ wǎnshang liù diǎn bàn xiàbān','Tôi tan làm lúc sáu giờ rưỡi tối','Nói giờ, lịch sinh hoạt và đề nghị với 吧.'],
 ['我爸爸也在医院工作','Wǒ bàba yě zài yīyuàn gōngzuò','Bố tôi cũng làm việc ở bệnh viện','Nói địa điểm; từ chỉ phương hướng, 在 và 能.'],
 ['我明天上午在学校学习','Wǒ míngtiān shàngwǔ zài xuéxiào xuéxí','Sáng mai tôi học ở trường','Sắp xếp thời gian và nơi chốn; câu tồn tại và số thứ tự.'],
 ['这儿的苹果真便宜！','Zhèr de píngguǒ zhēn piányi!','Táo ở đây thật rẻ!','Hỏi giá, miêu tả đặc điểm và hỏi 怎么样.'],
 ['我读大学呢','Wǒ dú dàxué ne','Tôi đang học đại học','Câu hỏi chính phản; hoạt động đang diễn ra và 要.'],
 ['昨天下雪了','Zuótiān xià xuě le','Hôm qua tuyết rơi','Nói thời tiết, thay đổi tình huống và mẫu 太……了.'],
 ['请给我一杯茶','Qǐng gěi wǒ yì bēi chá','Xin cho tôi một cốc trà','Gọi món; 可以, động từ + 一下 và câu hai tân ngữ.'],
 ['我看了一个电影','Wǒ kàn le yí ge diànyǐng','Tôi đã xem một bộ phim','Kể hoạt động đã hoàn thành; 了, từ ly hợp và 都.'],
 ['大兴机场见！','Dàxīng jīchǎng jiàn!','Hẹn gặp ở sân bay Đại Hưng!','Nói kế hoạch chuyến đi và nối ý với 还/也.'],
];
const textbookStarts=[16,20,25,33,42,50,60,69,76,85,93,101,110,118,127,137];
const workbookStarts=[8,12,16,20,29,38,46,55,64,73,82,91,100,109,118,128];
const writingRanges:Record<number,[number,number]>={8:[1,1],9:[2,3],10:[4,5],11:[6,7],12:[8,9],13:[10,11],14:[12,13],15:[14,15]};
const range=(a:number,b:number)=>Array.from({length:b-a+1},(_,i)=>a+i);
export const materialLessons:MaterialLesson[]=titles.map(([zh,py,vi,goal],i)=>({id:i+1,zh,py,vi,goal,pages:{textbook:range(textbookStarts[i],textbookStarts[i+1]-1),workbook:range(workbookStarts[i],workbookStarts[i+1]-1),writing:writingRanges[i+1]?range(...writingRanges[i+1]):[]}}));
export const materialSections:MaterialLesson[]=[
 {id:0,zh:'学习指南',py:'Xuéxí zhǐnán',vi:'Hướng dẫn và phần mở đầu',goal:'Cách dùng sách, nhân vật và ngôn ngữ trong lớp.',pages:{textbook:range(1,15),workbook:range(1,7),writing:[]}},
 ...materialLessons,
 {id:16,zh:'复习与附录',py:'Fùxí yǔ fùlù',vi:'Ôn tập, đề mô phỏng và phụ lục',goal:'Đề luyện tổng hợp, bảng từ và phần cuối của bộ tài liệu.',pages:{textbook:range(137,144),workbook:range(128,139),writing:[]}},
];
// Keep archival ranges for import checks, but opening matter and back covers
// are not learning activities. Existing drafts keep their original page IDs.
export const materialLearningSections:MaterialLesson[]=[...materialLessons,{...materialSections[16],pages:{textbook:range(137,143),workbook:[128,129,130,131,132,134,135,136,137],writing:[]}}];
export function learningMaterialLesson(id:number){return materialLearningSections.find(l=>l.id===id)}
export function materialLesson(id:number){return materialSections.find(l=>l.id===id)}
export function materialPageId(book:MaterialBook,page:number){return `${book}-${String(page).padStart(3,'0')}`}
export function validMaterialPageId(id:string){const m=/^(textbook|workbook|writing)-(\d{3})$/.exec(id);return !!m&&Number(m[2])>=1&&Number(m[2])<=materialBooks.find(b=>b.id===m[1])!.pages}
export type MaterialAudio={lesson:number;track:number;id:string;url:string;kind:string;section:number;title:string;markerPage:number;pages:number[]};
// The learner requested removal of this one recording from every study mode.
// Retain the imported asset/index for archive integrity and hide it centrally.
export function materialAudio(lesson:number):MaterialAudio[]{return audioIndex.filter(a=>a.lesson===lesson&&a.id!=='01-1')}
export function materialPageAudio(lesson:number,book:MaterialBook,page:number){return book==='textbook'?materialAudio(lesson).filter(a=>a.pages.includes(page)):[]}
// Source-page associations remain archival. The learner hears a recording only
// on its content page, not again on a preceding setup/instruction page.
export function materialStudyPageAudio(lesson:number,book:MaterialBook,page:number){const pageId=materialPageId(book,page);return materialPageAudio(lesson,book,page).filter(a=>audioPlacement.some(p=>p.audioId===a.id&&p.pageId===pageId))}
export function materialBlockAudio(lesson:number,page:NativeMaterialPage,blockId:string){return materialStudyPageAudio(lesson,page.book,page.page).filter(a=>audioPlacement.some(p=>p.audioId===a.id&&p.pageId===page.id&&p.blockId===blockId))}
const speakerNames:Record<string,string>={'王一飞':'Vương Nhất Phi','王一雪':'Vương Nhất Tuyết','王老师':'Cô Vương','小语':'Tiểu Ngữ','学生们':'Cả lớp','白家月':'Bạch Gia Nguyệt','李文':'Lý Văn','安妮':'Annie','陈天中':'Trần Thiên Trung','刘明':'Lưu Minh','杨同乐':'Dương Đồng Lạc','刘小雪':'Lưu Tiểu Tuyết','刘小明':'Lưu Tiểu Minh','胡医生':'Bác sĩ Hồ','医生':'Bác sĩ','服务员':'Nhân viên phục vụ','售货员':'Nhân viên bán hàng'};
export function materialSpeakerName(name:string){return speakerNames[name]||name}
export type MaterialLine={id:string;text:string;zh:string;pinyin:string;vi:string;translation:'edited'|'machine';confidence:number;reviewed?:boolean;audio?:boolean};
export type MaterialPage={id:string;book:MaterialBook;page:number;image:string;width:number;height:number;lines:MaterialLine[];audioTracks:number[]};
export type MaterialDraft={answers:Record<string,string>;notes:string;done:boolean;submissions?:Record<string,MaterialSubmission>};
export type NativeMaterialItem=MaterialLine&{label?:string;speaker?:string;speakerPinyin?:string;role?:'explanation'|'instruction'|'example'|'utterance'|'word';practiceMode?:'with-others';responseKey?:string;extraResponses?:string[];mergedIds?:string[];accepted?:string[];explanation?:string};
export type NativeMaterialBlock={id:string;kind:'reading'|'dialogue'|'vocabulary'|'grammar'|'exercise'|'phonetics'|'writing';title:string;items:NativeMaterialItem[];practiceMode?:'with-others';responseKey?:string;retiredResponseKeys?:string[];context?:string;soundGroups?:{title:string;tokens:string[]}[];table?:{columns:string[];rows:string[][];readings?:string[][]};characters?:string[]};
export type NativeMaterialPage={id:string;book:MaterialBook;page:number;title:string;blocks:NativeMaterialBlock[];audioTracks:number[]};
