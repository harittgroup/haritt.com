'use client';
import VentureDots from './VentureDots';
const INK='#16110f',RED='#8A0305';
const S={
 book:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="${INK}" d="M23 13.5C18 10 11 9 4 10v25c7-1 14 0 19 3.5zM25 13.5C30 10 37 9 44 10v25c-7-1-14 0-19 3.5z"/></svg>`,
 shield:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="${INK}" d="M24 4l16 6v12c0 11-7 19-16 22C15 41 8 33 8 22V10z"/></svg>`,
};
export default function PageDots({shape,className='w-full h-full'}:{shape:'flame'|'at'|'book'|'shield';className?:string}){
 if(shape==='flame')return <VentureDots kind="flame" color={RED} pal={['#8A0305','#a1070b','#7a0204']} className={className}/>;
 if(shape==='at')return <VentureDots kind="text" text="@" color={INK} accent={RED} className={className}/>;
 return <VentureDots kind="svg" svg={S[shape]} color={INK} accent={RED} className={className}/>}
