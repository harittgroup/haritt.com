'use client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';import {useMemo,useRef} from 'react';import * as THREE from 'three';
const frag=`precision highp float;uniform float t;uniform vec2 r;uniform vec2 m;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<3;i++){s+=a*n(p);p*=1.9;a*=.5;}return s;}
void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=uv*vec2(r.x/r.y,1.)*1.6;
vec2 q=vec2(fbm(p+t*.035),fbm(p+vec2(5.2,1.3)-t*.03));
float f=fbm(p+3.*q+m*.35+t*.02);
vec3 c1=vec3(.97,.95,.93),c2=vec3(.96,.78,.70),c3=vec3(.93,.52,.45);
vec3 col=mix(c1,c2,smoothstep(.25,.7,f));col=mix(col,c3,smoothstep(.62,.98,f)*smoothstep(.1,.9,uv.x*.7+(1.-uv.y)*.6));
col=mix(col,vec3(.99,.93,.84),smoothstep(.5,.2,f)*.5);
float g=(h(gl_FragCoord.xy+t)-.5)*.012;gl_FragColor=vec4(col+g,1.);}`;
function Plane(){const u=useMemo(()=>({t:{value:0},r:{value:new THREE.Vector2()},m:{value:new THREE.Vector2()}}),[]);const {size,pointer}=useThree();
useFrame((s)=>{u.t.value=s.clock.elapsedTime;u.r.value.set(size.width*s.viewport.dpr,size.height*s.viewport.dpr);u.m.value.lerp(pointer,.04)});
return <mesh><planeGeometry args={[2,2]}/><shaderMaterial uniforms={u} vertexShader="void main(){gl_Position=vec4(position,1.);}" fragmentShader={frag}/></mesh>}
export default function HeroGL(){return <div className="absolute inset-0 bg-[#F5F4EF]"><Canvas dpr={[1,1.5]} gl={{antialias:false}}><Plane/></Canvas></div>}
