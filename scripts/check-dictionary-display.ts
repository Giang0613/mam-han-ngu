import fs from 'node:fs';import {createEnglishLookup} from '../src/lib/dictionary-english';
const lookup=createEnglishLookup(JSON.parse(fs.readFileSync('data/cedict.json','utf8')));for(const [hanzi,pinyin] of [['帮','bāng'],['包','bāo'],['杯','bēi'],['杯子','bēizi'],['股指','gǔzhǐ']])console.log(JSON.stringify({hanzi,...lookup({hanzi,pinyin,meaning:'test',language:'vi'})},null,2));
