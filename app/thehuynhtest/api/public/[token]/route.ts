import {NextRequest,NextResponse} from "next/server";
import {getSharedByToken} from "../../../lib/store";
import {sharedProfile} from "../../../lib/score";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(_request:NextRequest,{params}:{params:{token:string}}){
 try{const person=await getSharedByToken(params.token);
 if(!person)return NextResponse.json({error:"This sharing link is unavailable or has been revoked."},{status:404});
 return NextResponse.json({name:person.name,handle:person.handle,profile:sharedProfile(person.profile)},{headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex, nofollow"}});
 }catch{return NextResponse.json({error:"Shared profile unavailable"},{status:503});}
}
