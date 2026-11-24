import {NextRequest,NextResponse} from "next/server";
import {getUser,setSharing} from "../../lib/store";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(request:NextRequest){
 try{const u=await getUser(request);if(!u)return NextResponse.json({error:"Unauthorized"},{status:401});
 return NextResponse.json({enabled:Boolean(u.shareEnabled),token:u.shareToken||null},{headers:{"Cache-Control":"no-store"}});}
 catch{return NextResponse.json({error:"Share settings unavailable"},{status:503});}
}
export async function POST(request:NextRequest){
 try{const u=await getUser(request);if(!u)return NextResponse.json({error:"Unauthorized"},{status:401});
 const body=await request.json().catch(()=>({}));if(typeof body.enabled!=="boolean")return NextResponse.json({error:"Invalid request"},{status:400});
 return NextResponse.json(await setSharing(u,body.enabled),{headers:{"Cache-Control":"no-store"}});}
 catch{return NextResponse.json({error:"Could not update sharing"},{status:503});}
}
