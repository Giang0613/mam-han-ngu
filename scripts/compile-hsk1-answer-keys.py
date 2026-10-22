"""Compile local practice keys from the publisher's exact HSK 1 supplements.
The three public PDFs are frozen in public/hsk1-materials/reference. Image-based pinyin
is transcribed below and cross-checked against the publisher's listening script.
This does not alter native lesson content or learner drafts.
"""
import json,re,hashlib,unicodedata
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
CACHE=ROOT/'public/hsk1-materials/reference'
NATIVE=ROOT/'data/hsk1-materials/native'
WB_STARTS=[8,12,16,20,29,38,46,55,64,73,82,91,100,109,118,128]
KEYS={};AUDIT=[]
LAYOUT=json.loads((ROOT/'src/lib/hsk/material-answer-layout.json').read_text(encoding='utf-8'))
def normalize(s):return unicodedata.normalize('NFC',s).replace('ɡ','g').replace('ɑ','a')
def bare(s):return ''.join(c for c in unicodedata.normalize('NFD',s) if c not in '\u0300\u0301\u0304\u030c').replace(' ','')
def slot(answer,explanation,policy='choice',aliases=None,label='Câu 1',pinyin=None):
 d=dict(label=label,policy=policy,accepted=list(dict.fromkeys([answer]+(aliases or []))),answer=answer,explanation=explanation)
 if pinyin:d['pinyin']=pinyin
 return d
def add(page,block,key,slots,source='workbook-key',sourcepage=1,hint=None):
 if not key or not slots:return
 composite=page['id']+':'+key
 assert composite not in KEYS,composite
 KEYS[composite]=dict(pageId=page['id'],blockId=block['id'],source=source,sourcePage=sourcepage,slots=slots)
 if hint:KEYS[composite]['hint']=hint
 AUDIT.append(dict(pageId=page['id'],responseKey=key,source=source,sourcePage=sourcepage))
def page(n,book='workbook'):return json.loads((NATIVE/f'{book}-{n:03}.json').read_text(encoding='utf-8'))
def itemblock(d,title):return next(b for b in d['blocks'] if b['title']==title)
def items(b):return [i for i in b['items'] if i.get('responseKey') and not i['zh'].startswith('例如') and i['zh']!='你叫什么＿＿＿？' and i.get('practiceMode')!='with-others']

# The complete syllables in the underlined publisher answers (PDF pp. 2–4).
phonetics={
 (11,'Nghe và điền thanh mẫu'):('initial','dà gěi pán bù mǎi lěng fó hǎo tóng hěn bān dōu kè nǐ máng',2),
 (11,'Nghe và điền vận mẫu'):('final','tā hěn māo dì fáng dōng hàn gǒu péng gē kāi fēi nù lěng bō',2),
 (11,'Nghe và ghi thanh điệu'):('tone','lǎo néng gè bā fēn kàn bái lǐ gōng máng gǒu hòu',2),
 (15,'Nghe và điền thanh mẫu'):('initial','qián jīn xiǎng jiào xiè qǐng jǐ qù xià',3),
 (15,'Nghe và điền vận mẫu'):('final','jiàn xiě qù jiào qǐng xué jiǎo xīng jiě qián xiàn qǐ jiā xiū quán',3),
 (15,'Nghe và ghi thanh điệu'):('tone','xué jiào qún jiǔ xīn qǐng xià jiā qù jī xiǎo jiě',3),
 (18,'Nghe và điền thanh mẫu'):('initial','sān chī zǒu zhèng zì chàng rén suì cài shuǐ rì zhōng',4),
 (18,'Nghe và điền vận mẫu'):('final','zū zhī cài zì chāo rèn shàng zěn rì sān chuān rè zhuō cóng shéi',4),
 (19,'Nghe và ghi thanh điệu'):('tone','chē rén chàng zǎo shǒu zhēn suì shēng rì zhōng shuǐ zuò chuáng shū sì',4),
 (22,'Nghe và chọn âm tiết'):('syllable','pā zì láng jǔ mén rù kè qǐng',5),
 (30,'Nghe và chọn âm tiết'):('syllable','gē qiǎng sóng nìng jiā cuàn tōu shí',7),
 (39,'Nghe và chọn âm tiết'):('syllable','nàbiān dōngxi chāoshì wǎnfàn shǒujī diànhuà',9),
 (55,'Nghe và phân biệt âm tiết'):('syllable','nián rěn tiē chǎn lüè hún bīng kǒng',12),
 (64,'Nghe và ghi dấu thanh'):('tone','hǎo xiè nín zhōng tóngxué dàjiā zàijiàn rènshi',14),
 (73,'Nghe và ghi dấu thanh'):('tone','duì jiā guó xiǎng chāoshì niúnǎi shàngwǔ diànyǐng',16),
 (82,'Nghe và ghi dấu thanh'):('tone','chàng lěng huí shuìjiào píngguǒ jīdàn dàxuéshēng diànyǐngyuàn',18),
}
tone_names={1:'thanh 1: cao và ngang',2:'thanh 2: đi lên',3:'thanh 3: hạ xuống rồi lên',4:'thanh 4: đi xuống mạnh',5:'thanh nhẹ'}
def tone_numbers(s):
 out=[];current=5
 for c in unicodedata.normalize('NFD',s):
  if c in '\u0304\u0301\u030c\u0300':out.append({'\u0304':1,'\u0301':2,'\u030c':3,'\u0300':4}[c])
 return out
for (n,title),(kind,syllables,sourcepage) in phonetics.items():
 d=page(n);b=itemblock(d,title);answers=syllables.split();its=items(b);assert len(answers)==len(its),(n,title)
 for idx,(i,syllable) in enumerate(zip(its,answers)):
  aliases=[syllable];policy='pinyin';answer=syllable
  if kind=='initial':
   initial=re.match(r'^(zh|ch|sh|[bpmfdtnlgkhjqxrzcs])',syllable).group();answer=initial
   explanation=f'Bản thu đọc {syllable}. Thanh mẫu là {initial}; ghép với phần đã cho để thành {syllable}.'
  elif kind=='final':
   initial=re.match(r'^(zh|ch|sh|[bpmfdtnlgkhjqxrzcs])',syllable).group();answer=syllable[len(initial):]
   # q/j/x spell ü without dots. The prompt asks for the written missing part.
   aliases += [bare(answer)]
   explanation=f'Bản thu đọc {syllable}. Phần cần điền sau {initial} là {answer}. Viết trọn âm tiết: {syllable}.'
   if initial in ['j','q','x'] and bare(answer).startswith('u'):explanation+=' Sau j, q, x, ü được viết thành u (bỏ hai chấm).'
  elif kind=='tone':
   tones=tone_numbers(syllable)
   if len(tones)==1 and bare(syllable)==i['zh']:aliases += [str(tones[0]),'thanh '+str(tones[0])]
   explanation=f'Bản thu đọc {syllable}. '+('; '.join(tone_names[t] for t in tones)+'.' if tones else 'Chú ý thanh nhẹ ở âm tiết không mang dấu.')
   if 'shi' in syllable and syllable=='rènshi':explanation+=' shi đọc thanh nhẹ; có thể viết ren4 shi5.'
   policy='tone'
  else:
   explanation=f'Âm tiết nghe được là {syllable}; đối chiếu cả âm đầu, vận mẫu và thanh điệu, không chỉ âm gần giống.'
   if b.get('table'):
    row=list(b['table']['rows'][idx])
    for r,c,v in LAYOUT['tableCells'].get(b['id'],[]):
     if r==idx:row[c]=v
    for j,v in enumerate(row[1:],1):
     if normalize(v).replace(' ','')==syllable:aliases.append(b['table']['columns'][j] if b['table']['columns'][j] in list('ABC') else str(j))
  add(d,b,i['responseKey'],[slot(answer,explanation,policy,aliases,'Câu '+str(idx+1))],sourcepage=sourcepage,hint='Điền thanh mẫu còn thiếu (ví dụ: b, p, zh) hoặc nhập cả âm tiết.' if kind=='initial' else 'Điền vận mẫu còn thiếu hoặc cả âm tiết; có thể dùng dấu thanh hoặc số thanh (ví dụ: ma3).' if kind=='final' else 'Nhập âm tiết có dấu hoặc số thanh (ví dụ: ma3); bài một âm tiết cũng chấp nhận số thanh.' if kind=='tone' else 'Nhập âm tiết nghe được (có dấu hoặc số thanh) hoặc ký hiệu lựa chọn.')

# Answer keys for sound comparisons, word/number matching, and sentence intonation.
odd={55:('Chọn từ hai âm tiết không phải dạng lặp','BCBA',12),64:('Chọn âm tiết có thanh khác nhóm','BACC',14),73:('Chọn âm tiết có thanh khác nhóm','CB BAC'.replace(' ',''),16),82:('Chọn từ có thanh khác nhóm','ACCBB',18),91:('Chọn từ có thanh khác nhóm','BABC',20),100:('Chọn cụm từ có thanh khác nhóm','BABC',22)}
tone_patterns={64:[['2','3','2'],['4','1','1'],['3','3','2'],['1','1','4']],73:[['4','4','1'],['3','2','3'],['1','4','1'],['3','2','2'],['4–5','4–5','1–4']],82:[['3','2','2'],['1','1','4'],['4–4','4–4','4–1'],['2–1','3–1','2–1'],['1–1–1','1–2–1','1–1–1']],91:[['3','4','3'],['4–2','4–4','4–4'],['1–4','1–2','1–4'],['4–1–4','4–1–4','4–5–3']],100:[['3–5','3–3','3–5'],['2–2','2–1','2–1'],['3–1–5','3–4–4','3–1–5'],['2–1–4','2–1–4','3–2–2']]}
for n,(title,letters,sp) in odd.items():
 d=page(n);b=itemblock(d,title);assert len(letters)==len(items(b))
 for idx,(i,a) in enumerate(zip(items(b),letters)):
  value=b['table']['rows'][idx][ord(a)-64]
  for r,c,v in LAYOUT['tableCells'].get(b['id'],[]):
   if r==idx and c==ord(a)-64:value=v
  explanation=f'Chọn {a}: {value}. '+('Đây là từ gồm các âm tiết khác nhau, không phải dạng lặp.' if n==55 else 'Mẫu thanh ghi trong bảng: '+', '.join(f'{label}: {pattern}' for label,pattern in zip('ABC',tone_patterns[n][idx]))+f'. {a} khác hai lựa chọn còn lại. Thanh 5 là thanh nhẹ.')
  add(d,b,i['responseKey'],[slot(a,explanation,'choice',[value],str(idx+1))],sourcepage=sp,hint='Nhập chữ cái A, B hoặc C.')
for n,order,sp in [(11,'132',2),(15,'3142',3),(19,'3412',4)]:
 d=page(n);b=itemblock(d,'Ghép tình huống với hội thoại')
 context=re.findall(r'\d+\.\s*(.*?)(?=\s+\d+\.|$)',b.get('context',''))
 add(d,b,b['responseKey'],[slot(a,f'Tình huống {idx+1} tương ứng hội thoại {a}: {b["items"][int(a)-1]["zh"]}.','choice',label='Tình huống '+str(idx+1)) for idx,a in enumerate(order)],sourcepage=sp,hint='Nhập số hội thoại phù hợp với từng tình huống.')
for n,sp in [(91,20),(100,22),(109,24),(118,26)]:
 d=page(n);b=itemblock(d,'Ghép pinyin với từ')
 orders={91:[1,4,6,5,2,3],100:[1,5,2,6,3,4],109:[1,5,6,2,3,4],118:[1,4,6,2,3,5]}
 for i,a in zip(items(b),orders[n]):
  py=b['table']['rows'][a-1][1]
  add(d,b,i['responseKey'],[slot(str(a),f'{i["zh"]} đọc là {py}, tương ứng số {a} trong bảng.','choice',[py],i.get('label',''))],sourcepage=sp,hint='Nhập số của pinyin tương ứng trong bảng.')
for n,letters,sp in [(110,'BBAABA',24),(119,'BACBDB',26)]:
 d=page(n);b=itemblock(d,'Nhận biết loại câu')
 why={'A':'Câu trần thuật cung cấp thông tin.','B':'Câu nghi vấn yêu cầu người nghe trả lời.','C':'Câu cảm thán biểu lộ cảm xúc hoặc nhận xét mạnh.','D':'Câu cầu khiến đề nghị hoặc yêu cầu thực hiện hành động.'}
 for i,a in zip(items(b),letters):add(d,b,i['responseKey'],[slot(a,f'{i["zh"]} {why[a]}','choice',label=i.get('label',''))],sourcepage=sp,hint='Nhập ký hiệu loại câu theo yêu cầu của bài.')

# Publisher PDF pp. 6,8,10...27 provides all simulated-test answers; p.28 mock.
keytext=(CACHE/'workbook-key.txt').read_text(encoding='utf-8')
pdfpages=re.split(r'=== PAGE \d+ ===\n',keytext)[1:]
sim={}
for lesson,pdfpage in [(4,6),(5,8),(6,10),(7,11),(8,13),(9,15),(10,17),(11,19),(12,21),(13,23),(14,25),(15,27),(16,28)]:
 found=dict((int(n),a) for n,a in re.findall(r'(\d+)\.\s*([A-F])',pdfpages[pdfpage-1]));assert len(found)==(40 if lesson==16 else 20)
 sim[lesson]=(found,pdfpage)
transcript=(CACHE/'workbook-transcript.txt').read_text(encoding='utf-8')
transcript=re.sub(r'=== PAGE \d+ ===\n|—\d+—','',transcript)
evidence={}
for lesson in range(4,17):
 start=transcript.find('\n'+str(lesson)+' ') if lesson<16 else transcript.index('HSK（一级）模拟试卷')
 end=transcript.find('\n'+str(lesson+1)+' ',start+1) if lesson<15 else transcript.index('HSK（一级）模拟试卷') if lesson==15 else len(transcript)
 section=transcript[start:end];section=section[section.index('模拟测练'):] if lesson<16 else section
 for m in re.finditer(r'(?:^|\n)(\d+)\.\s*(.*?)(?=\n\d+\.|\n第[一二三四]部分|$)',section,re.S):
  content=re.sub(r'\n+',' ',m[2]).strip();content=re.split(r'第\d+到\d+题|听力考试现在结束',content)[0].strip()
  evidence[(lesson,int(m[1]))]=content
for n in range(20,138):
 if n==133:continue
 d=page(n);lesson=next((i+1 for i in range(15) if WB_STARTS[i]<=n<WB_STARTS[i+1]),16)
 if lesson not in sim:continue
 answers,sp=sim[lesson]
 for b in d['blocks']:
  if b['kind']!='exercise':continue
  match=re.search(r'(?:Câu|câu)\s+(\d+)[–−-](\d+)',b['title'])
  if not match:continue
  first,last=map(int,match.groups());numbers=list(range(first,last+1))
  def make(q,item=None):
   a=answers[q];detail=evidence.get((lesson,q),'') if q<= (20 if lesson==16 else 10) else ''
   if lesson<16 and q in [17,18]:
    word=next((i for i in b['items'] if i.get('label')==a),None)
    if word:return slot(word['zh'],f'Điền vào chỗ trống: {word["zh"]} ({word["vi"]}). '+(f'Câu hoàn chỉnh: {item["zh"].replace("＿＿＿",word["zh"])}' if item else 'Đọc lại câu và đối chiếu nghĩa của từ.'),'hanzi',[a],label='Câu '+str(q),pinyin=word.get('pinyin'))
   if detail:return slot(a,f'Bản thu: {detail} Đáp án {a} phù hợp với thông tin này.','choice',label='Câu '+str(q))
   if b.get('table'):
    row=next((r for r in b['table']['rows'] if r[0]==a),None)
    if row:return slot(a,(f'Câu “{item["zh"]}” ({item["vi"]}) ' if item else '')+f'tương ứng tình huống {a}: {"; ".join(row[1:])}.','choice',label='Câu '+str(q))
   if (lesson<16 and q in [14,15,16]) or (lesson==16 and 26<=q<=35):
    chosen=next((i for i in b['items'] if i.get('label')==a),None)
    if chosen:
     queries=[i for i in b['items'] if i.get('label') not in list('ABCDEF') and i.get('role')!='instruction' and not i['zh'].startswith('例如') and i['zh']!='你喝水吗？']
     query=queries[q-first] if len(queries)==len(numbers) else None
     return slot(a,(f'“{query["zh"]}” ({query["vi"]}) ghép với ' if query else 'Ghép với ')+f'{a}: “{chosen["zh"]}” ({chosen["vi"]}).','choice',label='Câu '+str(q))
   if (lesson<16 and q in [19,20]) or (lesson==16 and 36<=q<=40):
    starts=[idx for idx,i in enumerate(b['items']) if i.get('label')=='A']
    if len(starts)==len(numbers)+1:
     start=starts[1+q-first];end=starts[2+q-first] if 2+q-first<len(starts) else len(b['items'])
     chosen=next((i for i in b['items'][start:end] if i.get('label')==a),None)
     previous=starts[q-first];prior=[idx for idx in range(previous,start) if b['items'][idx].get('label') in list('ABC')];lead=b['items'][max(prior)+1:start] if prior else []
     evidence_vi=' '.join(i['vi'] for i in lead if i.get('role')!='instruction' and i.get('label') not in list('ABC'))
     if chosen:return slot(a,(evidence_vi+' ' if evidence_vi else '')+f'Vì vậy chọn {a}: {chosen["zh"]} ({chosen["vi"]}).','choice',label='Câu '+str(q))
   return slot(a,f'Chọn {a}. Đối chiếu thông tin trong câu và đoạn đọc; đây là phương án tương ứng của câu {q}.','choice',label='Câu '+str(q))
  its=items(b)
  # A picture label was previously imported as a fourth question on this page.
  if n==43 and b['id']=='workbook-043-block-2':its=[i for i in its if i['zh']!='星期二']
  if len(its)==len(numbers):
   for i,q in zip(its,numbers):add(d,b,i['responseKey'],[make(q,i)],sourcepage=sp,hint='Nhập từ cần điền hoặc chữ cái của đáp án.' if q in [17,18] and lesson<16 else 'Nhập chữ cái của đáp án.')
  elif not its:add(d,b,b.get('responseKey'),[make(q) for q in numbers],sourcepage=sp,hint='Nhập đáp án cho từng câu theo thứ tự.')
  elif lesson<16 and numbers==[17,18] and len(its)==1:
   add(d,b,its[0]['responseKey'],[make(17,its[0])],sourcepage=sp,hint='Nhập từ cần điền hoặc chữ cái của đáp án.')
   following=page(n+1);fb=following['blocks'][0];blank=next(i for i in fb['items'] if '＿＿＿' in i['zh'])
   add(following,fb,blank.get('responseKey') or 'native-'+blank['id'],[make(18,blank)],sourcepage=sp,hint='Nhập từ cần điền hoặc chữ cái của đáp án.')
  else:raise ValueError(('Unaligned question count',n,b['id'],len(its),numbers))

# Warm-up pictures were adapted to Vietnamese meaning prompts in the native
# website. Bind the publisher's pictured word to that meaning, not to a new
# position in the displayed grid. Letter labels may differ after adaptation.
warmups={33:('CDEFAB',1),42:('CDEFAB',2),50:('CDEFAB',3),69:('CDEFAB',5),76:('CDEFAB',6),85:('CDEFG-B',7),93:('CDEFAB',8),101:('CDEFAB',9),110:('CDEFAB',10),118:('CAB',11),127:('CDEFAB',12)}
for n,(letters,sp) in warmups.items():
 d=page(n,'textbook');b=itemblock(d,'Khởi động · Ghép từ với nghĩa');its=items(b)
 assert len(its)==len(letters)
 options={i.get('label'):i for i in b['items'] if not i.get('responseKey')}
 for idx,(i,a) in enumerate(zip(its,letters)):
  if a=='-':continue # A layout decoration was OCR'd as 4色心; it is not a word.
  word=options[a];meaning=b['table']['rows'][idx][1]
  add(d,b,i['responseKey'],[slot(a,f'{meaning} tương ứng {word["zh"]} ({word["pinyin"]}), nên chọn {a}.','choice',[word['zh']],label='Câu '+str(idx+1))],'textbook-key',sp,hint='Nhập chữ cái hoặc từ tiếng Trung tương ứng với nghĩa.')

# Number writing is a deterministic application of the source lesson's number
# table, not a claim that the publisher supplement contains a numeric key.
d=page(35,'textbook');b=itemblock(d,'Hoàn thành các ô số còn trống')
digits=['零','一','二','三','四','五','六','七','八','九'];digit_py=['líng','yī','èr','sān','sì','wǔ','liù','qī','bā','jiǔ']
def chinese_number(n):
 if n<10:return digits[n],digit_py[n]
 if n<100:
  tens,ones=divmod(n,10);return (('' if tens==1 else digits[tens])+'十'+(digits[ones] if ones else ''),('' if tens==1 else digit_py[tens]+' ')+'shí'+(' '+digit_py[ones] if ones else ''))
 if n==100:return '一百','yì bǎi'
 raise ValueError(n)
for i in items(b):
 n=int(i['zh'].split('→')[0]);word,py=chinese_number(n)
 explanation=f'{n} viết là {word} ({py}). '+('Dùng 十 cho hàng chục rồi ghép chữ số hàng đơn vị.' if 10<=n<100 else 'Đối chiếu với bảng số trong bài.')
 add(d,b,i['responseKey'],[slot(word,explanation,'hanzi',pinyin=py)],'uploaded-textbook',35,hint='Viết số bằng chữ Hán.')
clock_answers=[('十点十分','shí diǎn shí fēn',['上午十点十分','10点10分']),('十二点半','shí èr diǎn bàn',['十二点三十分','中午十二点半','12点30分']),('下午一点四十五分','xià wǔ yì diǎn sì shí wǔ fēn',['一点四十五分','十三点四十五分','下午一点三刻','一点三刻','13点45分']),('下午三点二十分','xià wǔ sān diǎn èr shí fēn',['三点二十分','十五点二十分','15点20分']),('晚上六点','wǎn shang liù diǎn',['六点','下午六点','十八点','18点','十八点整','六点整']),('八点一刻','bā diǎn yí kè',['八点十五分','早上八点十五分','上午八点十五分','8点15分'])]
d=page(60,'textbook');b=itemblock(d,'Khởi động · Nói giờ bằng tiếng Trung')
for i,(word,py,aliases) in zip(items(b),clock_answers):add(d,b,i['responseKey'],[slot(word,'Dùng 点 cho giờ, 分 cho phút; 半 là 30 phút và 一刻 là 15 phút. Giờ sau 12:00 có thể nói bằng 下午/晚上 với giờ 12 tiếng hoặc dùng giờ 24 tiếng.','hanzi',aliases,pinyin=py)],'textbook-key',4,hint='Nhập cách nói giờ bằng tiếng Trung.')
clock_variants={0:['早上十点十分','上午十点十分'],1:['中午十二点三十分','中午十二点半'],2:['差一刻两点','差十五分两点','下午差一刻两点','一点四十五','下午一点四十五'],3:['三点二十','下午三点二十','十五点二十'],4:['晚上六点整','傍晚六点','下午六点整','18点00分'],5:['早上八点一刻','上午八点一刻','八点十五','早上八点十五','上午八点十五']}
for idx,i in enumerate(items(b)):KEYS[d['id']+':'+i['responseKey']]['slots'][0]['accepted']+=clock_variants[idx]

# The worked example printed in the workbook is explicitly marked C (名字).
for p in sorted(NATIVE.glob('workbook-*.json')):
 d=json.loads(p.read_text(encoding='utf-8'))
 for b in d['blocks']:
  for i in b['items']:
   if i.get('responseKey') and '你叫什么＿＿＿' in i['zh']:
    add(d,b,i['responseKey'],[slot('名字','你叫什么名字？ nghĩa là “Bạn tên là gì?”. 名字 là danh từ “tên”; đi sau 叫什么 để hỏi tên.','hanzi',['C'],pinyin='míng zi')],'uploaded-workbook',d['page'])

# Textbook PDF uses printed page numbers; native imported PDF is offset by 15.
tbtext=re.sub(r'=== PAGE \d+ ===\n','',(CACHE/'textbook-key.txt').read_text(encoding='utf-8'))
for m in re.finditer(r'P(\d+)，([^\n]+)\n(.*?)(?=P\d+，|\nP\d+，|\n第\s*\d+\s*课|$)',tbtext,re.S):
 printed,title,body=int(m[1]),m[2],m[3]
 answers=[x.replace(' ','') for x in re.findall(r'（\d+）\s*([A-F](?:\s*[,，]\s*[A-F])?)',body)]
 if not answers:continue
 d=page(printed+15,'textbook')
 # Compute the original source PDF page containing this heading.
 raw=(CACHE/'textbook-key.txt').read_text(encoding='utf-8');pos=raw.find('P'+str(printed)+'，');sp=len(re.findall(r'=== PAGE \d+ ===',raw[:pos]))
 if '选词填空' in title:
  blocks=[b for b in d['blocks'] if 'điền vào chỗ trống' in b['title'].lower()]
 else:blocks=[b for b in d['blocks'] if ('chọn đáp án' in b['title'].lower() or 'nghe' in b['title'].lower() or 'hội thoại' in b['title'].lower()) and any(i.get('responseKey') or i.get('label') in ['1','2'] for i in b['items'])]
 if not blocks:continue
 blocks.sort(key=lambda bb:0 if 'nghe' in bb['title'].lower() or 'chọn đáp án' in bb['title'].lower() else 1)
 b=blocks[0];its=items(b)
 options={i.get('label'):i for i in b['items'] if i.get('label') in list('ABCDEF')}
 if '选词填空' in title:
  cells=[a for ans in answers for a in ans.split(',')]
  # Source blanks are not counted by underline length. A six-character OCR
  # underline is often one blank, and some dialogues span two physical pages.
  layouts={30:[('textbook-030-edited-1-item-'+str(k),1) for k in range(5,10)],40:[('textbook-040-'+k,c) for k,c in [('55',1),('57',1),('58',2),('61',1)]],48:[('textbook-048-'+k,1) for k in ['9','10','12','15','17']],56:[('textbook-056-'+k,c) for k,c in [('16',2),('19',1),('21',1),('22',1)]],67:[('textbook-067-'+k,c) for k,c in [('10',1),('11',2),('14',1),('17',1)]],74:[('textbook-074-87',1),('textbook-075-2',1),('textbook-075-4',1),('textbook-075-6',1),('textbook-075-8',1)],82:[('textbook-082-'+k,c) for k,c in [('10',2),('12',1),('14',1),('17',1)]],91:[('textbook-091-'+k,c) for k,c in [('24',1),('26',2),('29',1),('32',1)]],99:[('textbook-099-'+k,1) for k in ['26','28','30','32','35']],107:[('textbook-107-'+k,c) for k,c in [('10',2),('12',1),('13',1),('15',1)]],116:[('textbook-116-'+k,1) for k in ['10','12','14','16','19']],125:[('textbook-125-'+k,c) for k,c in [('15',1),('17',1),('20',1),('22',2)]],133:[('textbook-133-'+k,1) for k in ['10','12','14','16','18']]}
  layout=layouts[printed+15];assert sum(count for _,count in layout)==len(cells)
  missingwords={(48,'C'):('休息','xiū xi','nghỉ ngơi'),(116,'A'):('一下','yí xià','một chút; làm thử trong thời gian ngắn')}
  position=0
  rules={'吗':'吗 đặt cuối câu để tạo câu hỏi có/không.','哪':'哪 hỏi lựa chọn hoặc xuất xứ.','谁':'谁 hỏi danh tính của một người.','呢':'呢 dùng để hỏi lại người đối diện về cùng chủ đề.','没':'没 phủ định việc có hoặc việc đã xảy ra.','口':'口 là lượng từ thường dùng để đếm thành viên gia đình.','大':'多大 dùng để hỏi tuổi.','多少':'多少 hỏi số lượng.','了':'了 đánh dấu hành động hoàn thành hoặc sự thay đổi.','要':'要 thể hiện ý muốn hoặc dự định.','给':'给 chỉ người nhận trong mẫu 给 + người + vật.','可以':'可以 hỏi hoặc nêu sự cho phép.','都':'都 diễn tả toàn bộ các đối tượng đã nhắc tới.','正在':'正在 ... 呢 diễn tả việc đang diễn ra.','一下':'Động từ + 一下 diễn tả hành động ngắn và làm lời đề nghị nhẹ hơn.'}
  for itemid,count in layout:
   targetpage=d if itemid.startswith(d['id']+'-') else page(int(itemid.split('-')[1]),'textbook')
   targetblock=next(bb for bb in targetpage['blocks'] if any(ii['id']==itemid for ii in bb['items']));i=next(ii for ii in targetblock['items'] if ii['id']==itemid)
   slots=[]
   for j,a in enumerate(cells[position:position+count]):
    o=options.get(a)
    word,py,meaning=(o['zh'],o.get('pinyin'),o['vi']) if o else missingwords[(printed+15,a)]
    explanation=f'Điền {word} ({meaning}). '+rules.get(word,'Dùng nghĩa của từ để hoàn thành thông tin trong câu: '+i['zh'])
    slots.append(slot(word,explanation,'hanzi',[a],label='Ô '+str(j+1),pinyin=py))
   add(targetpage,targetblock,i.get('responseKey') or 'native-'+itemid,slots,'textbook-key',sp,hint='Nhập từ tiếng Trung hoặc chữ cái của từ trong khung.')
   position+=count
 else:
  its=[i for i in b['items'] if i.get('label') in ['1','2']]
  targets=[(d,b,i) for i in its]
  if printed==108:targets.append((d,b,next(i for i in b['items'] if i['id']=='textbook-123-27')))
  if len(targets)==1 and its[0].get('label')=='2':
   preceding=page(printed+14,'textbook')
   candidates=[(preceding,bb,ii) for bb in preceding['blocks'] for ii in bb['items'] if ii.get('responseKey') and ii.get('label')=='1' and ('nghe' in bb['title'].lower() or 'hội thoại' in bb['title'].lower())]
   targets=candidates[-1:]+targets
  elif len(targets)==1:
   following=page(printed+16,'textbook')
   candidates=[(following,bb,ii) for bb in following['blocks'] for ii in bb['items'] if ii.get('responseKey') and ii.get('label')=='2' and ('nghe' in bb['title'].lower() or 'hội thoại' in bb['title'].lower())]
   targets+=candidates[:1]
  assert len(answers)==len(targets),(printed,len(answers),len(targets))
  for (dp,bp,i),a in zip(targets,answers):add(dp,bp,i.get('responseKey') or 'native-'+i['id'],[slot(a,f'Chọn {a} cho câu hỏi {i["zh"]}. Đối chiếu với thông tin trong hội thoại của phần này.')],'textbook-key',sp,hint='Nhập chữ cái A, B hoặc C.')

target=ROOT/'src/lib/hsk/material-answer-keys.json';target.write_text(json.dumps(KEYS,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sources=[]
for x in json.loads((CACHE/'publisher-resources.json').read_text(encoding='utf-8')):
 name='workbook-key' if '学练' in x['title'] and '答案' in x['title'] else 'textbook-key' if '答案' in x['title'] else 'workbook-transcript'
 sources.append(dict(id=name,title=x['title'],url='https://www.fltrp-clt.com'+x['resFile'],detailUrl='https://www.fltrp-clt.com/pages/resource/sigleResource.jsp?modelType=res&resId='+x['id']+'&resFormat=4001003',sha256=hashlib.sha256((CACHE/(name+'.pdf')).read_bytes()).hexdigest()))
manifest=json.loads((ROOT/'data/hsk1-materials/manifest.json').read_text(encoding='utf-8'))
sources.append(dict(id='uploaded-textbook',title='User-provided hsk-course-1.pdf',sha256=next(b['sha256'] for b in manifest['books'] if b['id']=='textbook'),method='Deterministic Chinese-number composition from the source lesson table'))
sources.append(dict(id='uploaded-workbook',title='User-provided hsk-course-1-workbook.pdf',sha256=next(b['sha256'] for b in manifest['books'] if b['id']=='workbook'),method='Explicit worked-example answer C printed beside the source blank'))
audit=dict(revision='hsk1-publisher-answers-2026-10-07-v1',sources=sources,reviewMethod='Publisher printed keys and listening transcript, visual pinyin review, strict native question-count alignment',keys=len(KEYS),questions=sum(len(v['slots']) for v in KEYS.values()),bindings=AUDIT)
(ROOT/'data/hsk1-materials/editorial/answer-key-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Compiled {len(KEYS)} answer controls, {sum(len(v["slots"]) for v in KEYS.values())} answer slots from exact publisher PDFs.')
