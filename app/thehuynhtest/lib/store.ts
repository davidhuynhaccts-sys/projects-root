import crypto from "node:crypto";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";
import { FILMS } from "./data";
import { freshAnswer,normalizeAnswer,scoreProfile,type FilmAnswer } from "./score";
export type HTUser={id:string;handle:string;name:string;salt:string;passwordHash:string;createdAt:number;shareToken?:string;shareEnabled?:boolean};
const MONTH=60*60*24*30;
export const COOKIE_NAME="ht_session";
export function redisDb(){
 const url=process.env.UPSTASH_REDIS_REST_URL||process.env.KV_REST_API_URL;
 const token=process.env.UPSTASH_REDIS_REST_TOKEN||process.env.KV_REST_API_TOKEN;
 if(!url||!token)throw new Error("PERSISTENT_STORAGE_NOT_CONFIGURED");
 return new Redis({url,token});
}
const digest=(s:string)=>crypto.createHash("sha256").update(s).digest("hex");
export function hashPassword(password:string,salt:string){return crypto.scryptSync(password,salt,64).toString("hex");}
export function comparePassword(password:string,user:HTUser){
 const a=Buffer.from(hashPassword(password,user.salt),"hex");
 const b=Buffer.from(user.passwordHash,"hex");
 return a.length===b.length&&crypto.timingSafeEqual(a,b);
}
export function safeUser(u:HTUser){return {id:u.id,handle:u.handle,name:u.name,createdAt:u.createdAt,shareEnabled:Boolean(u.shareEnabled)};}
export async function getUser(request:NextRequest):Promise<HTUser|null>{
 const session=request.cookies.get(COOKIE_NAME)?.value;
 if(!session||!/^[-_a-zA-Z0-9]{30,}$/.test(session))return null;
 const db=redisDb();const uid=await db.get<string>("ht:session:"+digest(session));
 if(!uid)return null;
 return (await db.get<HTUser>("ht:user:"+uid))||null;
}
export async function startSession(user:HTUser){
 const token=crypto.randomBytes(36).toString("base64url");
 await redisDb().set("ht:session:"+digest(token),user.id,{ex:MONTH});
 return token;
}
export async function endSession(request:NextRequest){
 const s=request.cookies.get(COOKIE_NAME)?.value;
 if(s)await redisDb().del("ht:session:"+digest(s));
}
export function sessionCookie(response:any,token:string,maxAge=MONTH){
 response.cookies.set(COOKIE_NAME,token,{httpOnly:true,secure:true,sameSite:"lax",path:"/thehuynhtest",maxAge});
}
export async function rateLimit(key:string,max=14){
 const db=redisDb();const count=await db.incr("ht:rate:"+digest(key));if(count===1)await db.expire("ht:rate:"+digest(key),900);return count<=max;
}
export async function register(handle:string,name:string,password:string){
 const db=redisDb();const id=crypto.randomUUID();
 const user:HTUser={id,handle,name,salt:crypto.randomBytes(16).toString("hex"),passwordHash:"",createdAt:Date.now(),shareEnabled:false};
 user.passwordHash=hashPassword(password,user.salt);
 const claimed=await db.set("ht:handle:"+handle,id,{nx:true});
 if(claimed!=="OK")return null;
 try {await db.set("ht:user:"+id,user);return user;}
 catch(e){await db.del("ht:handle:"+handle);throw e;}
}
export async function findByHandle(handle:string):Promise<HTUser|null>{
 const db=redisDb();const id=await db.get<string>("ht:handle:"+handle);
 return id?(await db.get<HTUser>("ht:user:"+id))||null:null;
}
export async function loadAnswers(uid:string):Promise<Record<string,FilmAnswer>>{
 const db=redisDb();
 const records=await Promise.all(FILMS.map(f=>db.get<FilmAnswer>("ht:response:"+uid+":"+f.id)));
 return Object.fromEntries(FILMS.map((f,i)=>[f.id,records[i]?normalizeAnswer(f,records[i]):freshAnswer()]));
}
export async function saveAnswer(uid:string,id:string,input:any){
 const film=FILMS.find(f=>f.id===id);
 if(!film)return null;
 const answer=normalizeAnswer(film,input);answer.updatedAt=Date.now();
 await redisDb().set("ht:response:"+uid+":"+id,answer);
 return answer;
}
export async function getSharedByToken(token:string){
 if(!/^[a-f0-9]{48}$/.test(token))return null;
 const db=redisDb();
 const uid=await db.get<string>("ht:share:"+token);
 if(!uid)return null;
 const user=await db.get<HTUser>("ht:user:"+uid);
 if(!user||!user.shareEnabled||user.shareToken!==token)return null;
 const answers=await loadAnswers(user.id);
 const profile=scoreProfile(answers);
 return {id:user.id,name:user.name,handle:user.handle,profile};
}
export async function getSharedById(uid:string){
 const user=await redisDb().get<HTUser>("ht:user:"+uid);
 if(!user?.shareEnabled||!user.shareToken)return null;
 return getSharedByToken(user.shareToken);
}
export async function setSharing(user:HTUser,enabled:boolean){
 const db=redisDb();
 if(!enabled){
  if(user.shareToken)await db.del("ht:share:"+user.shareToken);
  user.shareEnabled=false;user.shareToken=undefined;
 }else{
  if(!user.shareToken)user.shareToken=crypto.randomBytes(24).toString("hex");
  await db.set("ht:share:"+user.shareToken,user.id);
  user.shareEnabled=true;
 }
 await db.set("ht:user:"+user.id,user);
 return {enabled:user.shareEnabled,token:user.shareToken||null};
}
export async function listFriends(uid:string):Promise<string[]>{
 return (await redisDb().get<string[]>("ht:friends:"+uid))||[];
}
export async function saveFriends(uid:string,ids:string[]){
 await redisDb().set("ht:friends:"+uid,Array.from(new Set(ids)).slice(0,8));
}
