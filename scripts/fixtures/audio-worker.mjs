import {createInterface} from 'node:readline';
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
for await(const line of createInterface({input:process.stdin})){
 const job=JSON.parse(line);
 if(job.text==='exit')process.exit(7);
 if(job.text==='hang')await wait(60000);
 if(job.text==='private-error'){
  process.stderr.write('Exception contains PRIVATE_LEARNER_TEXT\n');
  console.log(JSON.stringify({key:job.key,error:'ValueError'}));
 }else{
  await wait(15);
  console.log(JSON.stringify({key:job.key,ok:true}));
 }
}
