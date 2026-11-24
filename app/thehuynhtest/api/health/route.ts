import {NextResponse} from "next/server";
import {redisDb} from "../../lib/store";
import {TEST_VERSION} from "../../lib/data";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){
 try{
  const ping=await redisDb().ping();
  if(String(ping).toUpperCase()!=="PONG")throw new Error("DATABASE_UNAVAILABLE");
  return NextResponse.json({ready:true,storage:"persistent",version:TEST_VERSION},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({ready:false,storage:"unavailable"},{status:503,headers:{"Cache-Control":"no-store"}});}
}
