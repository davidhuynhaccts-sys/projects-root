import {NextRequest,NextResponse} from "next/server";
import {FILMS} from "../../lib/data";
import {getUser,loadAnswers,saveAnswer} from "../../lib/store";
import {scoreProfile} from "../../lib/score";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(request:NextRequest){
 try{
  const user=await getUser(request);if(!user)return NextResponse.json({error:"Please sign in."},{status:401});
  const answers=await loadAnswers(user.id);
  return NextResponse.json({answers,profile:scoreProfile(answers)},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"Unable to load saved responses."},{status:503});}
}
export async function PUT(request:NextRequest){
 try{
  const user=await getUser(request);if(!user)return NextResponse.json({error:"Please sign in."},{status:401});
  const body=await request.json().catch(()=>({}));
  const id=String(body.filmId||"");
  if(!FILMS.some(f=>f.id===id))return NextResponse.json({error:"Unknown film."},{status:400});
  const saved=await saveAnswer(user.id,id,body.answer);
  return NextResponse.json({ok:true,filmId:id,answer:saved},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"Could not save your answer. Please retry."},{status:503});}
}
