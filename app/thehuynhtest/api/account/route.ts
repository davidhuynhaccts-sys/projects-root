import {NextRequest,NextResponse} from "next/server";
import {COOKIE_NAME,comparePassword,endSession,findByHandle,getUser,rateLimit,register,redisDb,safeUser,sessionCookie,startSession} from "../../lib/store";
export const runtime="nodejs";export const dynamic="force-dynamic";
const noStore={"Cache-Control":"no-store"};
export async function GET(request:NextRequest){
 try{const user=await getUser(request);return NextResponse.json({user:user?safeUser(user):null},{headers:noStore});}
 catch{return NextResponse.json({error:"Persistent storage is unavailable."},{status:503});}
}
export async function POST(request:NextRequest){
 try{
  const body=await request.json().catch(()=>({}));
  const action=String(body.action||"");
  const handle=String(body.handle||"").trim().toLowerCase();
  const password=String(body.password||"");
  const name=String(body.name||"").trim();
  if(!/^[a-z0-9_]{3,24}$/.test(handle)||password.length>128||!["login","register"].includes(action)){
   return NextResponse.json({error:"Enter a valid handle (3–24 letters, numbers, or underscores)."},{status:400});
  }
  const source=(request.headers.get("x-forwarded-for")||"unknown").split(",")[0];
  if(!await rateLimit(source+":"+handle,16))return NextResponse.json({error:"Too many attempts. Try again later."},{status:429});
  let user;
  if(action==="register"){
   if(password.length<12)return NextResponse.json({error:"Use a password of at least 12 characters."},{status:400});
   if(name.length<2||name.length>60)return NextResponse.json({error:"Enter a display name of 2–60 characters."},{status:400});
   user=await register(handle,name,password);
   if(!user)return NextResponse.json({error:"That handle already has an account. Choose Sign In to access your saved test."},{status:409});
  }else{
   user=await findByHandle(handle);
   if(!user||!comparePassword(password,user))return NextResponse.json({error:"Sign-in details were not recognized. Use your account handle, not your display name, and check your password."},{status:401});
  }
  const token=await startSession(user);
  const response=NextResponse.json({user:safeUser(user)},{headers:noStore});
  sessionCookie(response,token);
  return response;
 }catch{return NextResponse.json({error:"Account service unavailable. Please try again."},{status:503});}
}
export async function DELETE(request:NextRequest){
 try{await endSession(request);}catch{}
 const response=NextResponse.json({ok:true},{headers:noStore});
 sessionCookie(response,"",0);return response;
}
