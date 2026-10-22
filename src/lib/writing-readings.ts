// Common modern Mandarin readings; exclude rare historical senses from this
// beginner handwriting picker. The dictionary still keeps all authored entries.
export const writingReadings:Record<string,string[]>={
 行:['xíng','háng'],乐:['lè','yuè'],好:['hǎo','hào'],长:['cháng','zhǎng'],
 重:['zhòng','chóng'],得:['dé','děi','de'],地:['dì','de'],了:['le','liǎo'],
 还:['hái','huán'],着:['zhe','zháo','zhuó'],便:['biàn','pián'],
 觉:['jué','jiào'],为:['wéi','wèi'],空:['kōng','kòng'],看:['kàn','kān'],
 教:['jiāo','jiào'],种:['zhǒng','zhòng'],发:['fā','fà'],兴:['xīng','xìng'],
};
export const writingAudioContexts:Record<string,{zh:string;py:string}>={
 '了|liǎo':{zh:'了解',py:'liǎojiě'},
 '着|zháo':{zh:'着火',py:'zháohuǒ'},
 '便|pián':{zh:'便宜',py:'piányi'},
};
