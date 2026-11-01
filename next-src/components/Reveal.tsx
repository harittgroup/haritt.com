'use client';
import {motion} from 'framer-motion';
export default function Reveal({children,className='',delay=0}:{children:React.ReactNode;className?:string;delay?:number}){
return <motion.div className={className} initial={{opacity:0,y:36}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-80px'}} transition={{duration:.9,ease:[.2,.7,.2,1],delay}}>{children}</motion.div>}
