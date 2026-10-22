import {Localize} from '@/components/i18n/LocaleProvider';
import {BookOpen,Apple,Bike,Coffee,Smartphone,Umbrella} from 'lucide-react';
const pictures={book:BookOpen,apple:Apple,bike:Bike,cup:Coffee,phone:Smartphone,umbrella:Umbrella};
export function ExercisePicture({name,label}:{name:string;label:string}){const Icon=pictures[name as keyof typeof pictures]||BookOpen;return <Localize>{<span className="exercise-picture" role="img" aria-label={label}><Icon size={58} aria-hidden="true"/></span>}</Localize>;}
