export type Locale = 'vi' | 'en';
export const LOCALE_COOKIE = 'mam_locale';
export function isLocale(value:unknown):value is Locale{return value==='vi'||value==='en';}
