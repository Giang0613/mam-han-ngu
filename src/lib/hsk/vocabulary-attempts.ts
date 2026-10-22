// Valid IDs for the immutable PDF import v1. Server membership is also checked at submission.
const counts:Record<string,number>={'1':499,'2':772,'3':973,'4':1000,'5':1071,'6':1800,'79':5600};
export function validVocabularyExerciseId(id:string){
 const match=/^hskv1-hskpdf-([1-6]|79)-(\d{4})-[mr]$/.exec(id);
 return !!match&&Number(match[2])>=1&&Number(match[2])<=counts[match[1]];
}
