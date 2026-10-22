export type HskGrammar={level:number;focus:string;sentence:string;answer:string;wrong:string[];note:string};
// Original explanations and examples. Level placement is an instructional proposal.
const rows = `
1|是 nối danh tính|她___中文老师。|是|在,有,去|是 nối chủ ngữ với danh từ chỉ danh tính. Không dùng 是 trước tính từ theo cách này.
1|吗 ở cuối câu hỏi|你是学生___？|吗|的,在,和|Giữ trật tự câu kể và thêm 吗 ở cuối để hỏi có-không.
1|不 phủ định thói quen|我___喝咖啡。|不|的,和,个|不 đặt trước động từ. Phủ định sự tồn tại của 有 thường dùng 没有.
1|Lượng từ 本|我有两___书。|本|杯,只,辆|本 dùng với sách; 杯 cho cốc đồ uống, 辆 cho xe. Số đứng trước lượng từ.
1|在 chỉ vị trí|老师___学校。|在|是,个,和|在 giới thiệu nơi một người hoặc vật đang ở.
1|的 chỉ sở hữu|这是我___手机。|的|吗,在,很|Người sở hữu + 的 + vật. Ví dụ này không phải cấu trúc 是…的 nhấn mạnh.
2|了 với hành động hoàn tất|我昨天买___一本书。|了|着,得,吗|了 sau động từ đánh dấu hành động hoàn tất trong ngữ cảnh này; không phải mọi quá khứ đều cần 了.
2|过 với trải nghiệm|我去___北京，但没去过上海。|过|着,的,吗|过 đánh dấu trải nghiệm. 去过 khác 正在去: đã từng tới và đang đi.
2|正在 với việc đang diễn ra|她___做饭，请等一会儿。|正在|从来,已经,每个|正在 đứng trước động từ chỉ hành động đang diễn ra.
2|比 trong so sánh|今天___昨天冷。|比|把,被,给|A 比 B + tính từ. 不比 không tự động có nghĩa kém hơn B.
2|给 giới thiệu người nhận|我___妈妈打电话。|给|从,比,把|给 + người + động từ giới thiệu người nhận hoặc người hưởng hành động.
2|得 trong bổ ngữ mức độ|他说中文说___很好。|得|的,地,过|得 sau động từ nối phần mô tả cách làm hoặc mức độ. Phân biệt với 的 và 地.
3|把 với đối tượng xác định|请___这本书放在桌子上。|把|被,比,从|把 + tân ngữ xác định + động từ + phần kết quả/vị trí. 不 và 没 thường đứng trước 把.
3|被 trong câu bị động|我的手机___弟弟拿走了。|被|比,从,对|Chủ thể chịu tác động + 被 + người thực hiện + hành động. Phải giữ đúng vai nghĩa.
3|除了…以外 còn…|除了中文以外，我___会说英语。|还|再,才,吗|Ngoài中文, người nói còn biết tiếng Anh. 还 bổ sung thông tin, khác 只 giới hạn phạm vi.
3|一边…一边…|她一边听音乐，___做饭。|一边|一共,一旦,一切|Dùng cho hai hành động diễn ra đồng thời. Chủ thể thường có thể thực hiện cả hai.
3|先…再…|我们先吃饭，___去图书馆。|再|又,已经,所有|先 chỉ việc trước, 再 nối việc sẽ làm tiếp. Trong mẫu này không dùng 又 để ra lệnh cho lượt tiếp theo.
3|只要…就…|只要每天练习，___会进步。|就|但,却,否则|只要 giới thiệu điều kiện đủ. Tránh nhầm với 只有…才… nói điều kiện cần.
4|即使…也…|即使下雨，我们___会参加活动。|也|否则,可是,而且|即使 đưa tình huống nhượng bộ giả định; 也 giữ kết quả không thay đổi.
4|不仅…而且…|这家店不仅价格合理，___服务周到。|而且|否则,反之,以免|Hai vế bổ sung hoặc tăng tiến, thường cùng chiều đánh giá.
4|虽然…但是…|虽然他很忙，___还是按时来了。|但是|因此,为了,除非|Vế sau trái với kỳ vọng từ vế trước. 还是 trong ví dụ nhấn mạnh kết quả vẫn xảy ra.
4|无论…都…|无论你选择哪种方法，___需要坚持。|都|否则,既然,除非|无论 kết hợp với từ hỏi hoặc lựa chọn; 都 biểu đạt kết quả không phụ thuộc lựa chọn.
4|与其…不如…|与其一直担心，___先试一试。|不如|否则,由于,尽管|So sánh hai cách làm và đề xuất cách sau. Hai vế cần tương xứng.
4|Bổ ngữ kết quả 好|我已经准备___了，可以出发。|好|很,的,每|准备好 nói việc chuẩn bị đã đạt kết quả. Không đồng nhất mọi bổ ngữ kết quả với thì quá khứ.
5|尽管…仍然…|尽管条件有限，团队___完成了任务。|仍然|以免,除非,反之|尽管 trong mẫu nhượng bộ đi với kết quả vẫn xảy ra. Phân biệt 尽管 dùng để cho phép cứ làm.
5|除非…否则…|除非提前预约，___不能进入。|否则|既然,以便,尽管|除非 nêu ngoại lệ cho quy tắc ở vế sau. Cần đọc phạm vi phủ định cẩn thận.
5|既然…就…|既然决定参加，___应该认真准备。|就|但是,以免,反之|既然 coi điều kiện là đã chấp nhận; 就 nối kết luận hoặc lời khuyên.
5|以免 nêu điều cần tránh|请把地址再确认一遍，___送错地方。|以免|以便,既然,何况|以免 + hậu quả không mong muốn. 以便 thường nói mục đích muốn đạt.
5|未必 giới hạn kết luận|价格贵的东西___质量更好。|未必|必定,所有,从而了|未必 nghĩa là chưa chắc; nó không khẳng định chắc chắn là không tốt hơn.
5|凡是…都…|凡是报名成功的学生，___可以参加。|都|除非,以免,然而|凡是 giới thiệu toàn bộ thành viên đáp ứng điều kiện, 都 nối phạm vi bao quát.
6|并非…而是…|问题并非时间不够，___安排不合理。|而是|否则,以免,尽管|Phủ định cách giải thích trước và thay bằng cách giải thích sau; không phải bổ sung đơn thuần.
6|之所以…是因为…|他之所以改变计划，___发现了新的问题。|是因为|以免,反之,除非|Kết quả đứng sau 之所以, nguyên nhân sau 是因为. Tránh đảo quan hệ nguyên nhân-kết quả.
6|一旦…就…|一旦发现错误，___应及时说明。|就|尽管,然而,以免|一旦 nhấn mạnh lúc điều kiện xuất hiện thì hệ quả hoặc hành động theo sau.
6|与其说…不如说…|与其说这是技术问题，___说是沟通问题。|不如|否则,尽管,何况|Đánh giá cách mô tả nào sát hơn. Vế sau điều chỉnh hoặc làm rõ vế trước.
6|不见得 biểu đạt chưa chắc|参与人数多，效果___就好。|不见得|所有,除非,以便|Không suy ra chất lượng chỉ từ số người. 不见得 giới hạn độ chắc chắn của phán đoán.
6|相较于 đưa mốc so sánh|___过去的方案，新方案更灵活。|相较于|以免,除非,不妨|Cụm đứng đầu xác định mốc so sánh; phần sau cần đối chiếu cùng phương diện.
7|诚然…然而…|诚然，成本降低了，___服务质量仍需评估。|然而|因此,以便,凡是|Thừa nhận một điểm nhưng giới hạn kết luận có thể rút ra từ điểm đó.
7|鉴于 với căn cứ đã có|___现有证据不足，我们暂缓作出结论。|鉴于|以便,不妨,何况就|鉴于 giới thiệu cơ sở cho quyết định. Tách cơ sở dữ liệu khỏi mục đích muốn đạt.
7|在于 nêu điểm cốt lõi|关键___能否公开评估过程。|在于|以免,尽管,除非|关键在于 xác định trọng tâm; 能否 giữ khả năng cả có lẫn không.
7|有待 chỉ việc cần làm tiếp|这一解释仍___进一步验证。|有待|已经,所有,不妨|有待 nói công việc chưa hoàn thành. Không hiểu là kết luận đã được chứng minh.
7|基于 chỉ nền tảng phân tích|___以上材料，我们提出两个假设。|基于|为了,不妨,尽管|基于 đánh dấu cơ sở phân tích. Giả thuyết vẫn cần kiểm tra riêng.
7|无从 nói thiếu cơ sở/cách làm|没有原始数据，我们___判断变化的原因。|无从|以便,不妨,既然|无从不是没有理由而已; trong ngữ cảnh này thiếu dữ liệu nên không có cơ sở để判断.
8|固然…但…|扩大规模固然重要，___并不能代替质量改进。|但|于是,从而,以便|Thừa nhận tầm quan trọng nhưng bác bỏ suy diễn rằng mở rộng thay thế được cải thiện chất lượng.
8|倘若 đặt giả định|___忽略岗位差异，平均值就可能误导判断。|倘若|以便,尽管,否则|倘若 mở một giả định. Vế sau nêu hệ quả có điều kiện, không phải sự thật vô điều kiện.
8|乃至 mở rộng phạm vi|这一变化影响个人、家庭，___整个社区。|乃至|否则,以免,除非|乃至 đưa phạm vi rộng hơn hoặc mức cao hơn trong chuỗi tăng tiến.
8|尚且…何况…|专业人员尚且需要核查，___初学者。|何况|以便,否则,从而|Dùng trường hợp đã mạnh ở vế trước để nhấn trường hợp vế sau càng cần như vậy.
8|与否 giữ hai khả năng|方案合理___，还需要讨论。|与否|以免,尽管,何况|合理与否 nghĩa là có hợp lý hay không. Không được lược bỏ khả năng phủ định khi diễn giải.
8|归根结底 kết luận bản chất|___，制度的效果取决于具体执行。|归根结底|与此同时,为了,除非|Cụm chuyển sang nhận định về nguyên nhân hoặc bản chất sau khi xem nhiều yếu tố.
9|并不意味着 chặn suy diễn|存在联系___已经证明因果关系。|并不意味着|必定,为了,尽管|Liên hệ thống kê không tự suy ra quan hệ nhân quả. Chú ý phạm vi của điều bị phủ định.
9|充其量 giới hạn mức độ|一次观察___能提出线索，不能证明机制。|充其量|凡是,以便,除非|充其量 đặt giới hạn trên cho điều có thể khẳng định từ bằng chứng hiện có.
9|未尝不是 với khẳng định dè dặt|承认局限，___一种负责任的态度。|未尝不是|绝不可能,所有,以免|Phủ định kép tạo nhận định có thể xem đó là một thái độ có trách nhiệm; không phải khẳng định tuyệt đối.
9|毋庸置疑 giới hạn phần chắc chắn|数据需要核查，这一点___；但解释仍有争议。|毋庸置疑|以免,倘若,基于|Cụm đánh dấu phần không nghi ngờ trong lập luận. Không mở rộng chắc chắn sang phần解释 vẫn tranh luận.
9|换言之 diễn giải lại|样本不代表全部人群，___，结论的适用范围有限。|换言之|与此同时,以免,除非|Diễn giải lại hệ quả ý nghĩa từ phát biểu trước; tránh tự thêm một kết luận vượt bằng chứng.
9|无可厚非…但…|追求效率本来___，但不能忽略公平。|无可厚非|以便,所有,倘若|Có thể chấp nhận mục tiêu效率, đồng thời yêu cầu giới hạn bởi公平. Câu nhượng bộ không phải tán thành vô điều kiện.
`.trim();
export const hskGrammar:HskGrammar[]=rows.split('\n').map(row=>{const [level,focus,sentence,answer,wrong,note]=row.split('|');return {level:Number(level),focus,sentence,answer,wrong:wrong.split(','),note};});
