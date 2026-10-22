import {notFound} from 'next/navigation';
import {BookAudioLibrary} from '@/components/study/BookAudioLibrary';

export default async function Page({params}:{params:Promise<{level:string}>}){
 const {level}=await params;
 if(level!=='1')notFound();
 return <BookAudioLibrary/>;
}
