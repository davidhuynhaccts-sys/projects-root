import {NextRequest,NextResponse} from "next/server";
import {getSharedByToken,getSharedById,getUser,listFriends,saveFriends} from "../../lib/store";
import {sharedProfile} from "../../lib/score";
export const runtime="nodejs";export const dynamic="force-dynamic";
const cache={"Cache-Control":"no-store"};
function tokenFromInput(input:string){
 const v=input.trim();
 if(/^[a-f0-9]{48}$/.test(v))return v;
 try{const parsed=new URL(v);const parts=parsed.pathname.split("/").filter(Boolean);
 if(!["projectsproject.com","www.projectsproject.com","projects-root.vercel.app"].includes(parsed.hostname)&&!parsed.hostname.endsWith(".vercel.app"))return null;
 if(parts[0]!=="thehuynhtest"||parts[1]!=="share")return null;
 const token=parts[2];return token&&/^[a-f0-9]{48}$/.test(token)?token:null;
 }catch{return null;}
}
export async function GET(request:NextRequest){
 try{const u=await getUser(request);if(!u)return NextResponse.json({error:"Unauthorized"},{status:401});
 const ids=await listFriends(u.id);
 const friends=(await Promise.all(ids.map(id=>getSharedById(id)))).filter(Boolean).map(v=>({id:v!.id,name:v!.name,handle:v!.handle,profile:sharedProfile(v!.profile)}));
 return NextResponse.json({friends},{headers:cache});
 }catch{return NextResponse.json({error:"Unable to load friends"},{status:503});}
}
export async function POST(request:NextRequest){
 try{const u=await getUser(request);if(!u)return NextResponse.json({error:"Unauthorized"},{status:401});
 const body=await request.json().catch(()=>({}));const token=tokenFromInput(String(body.link||""));
 if(!token)return NextResponse.json({error:"Paste a valid Huynh Test sharing link or token."},{status:400});
 const friend=await getSharedByToken(token);
 if(!friend)return NextResponse.json({error:"The profile is private or the link has been revoked."},{status:404});
 if(friend.id===u.id)return NextResponse.json({error:"You cannot add your own profile as a friend."},{status:400});
 const friends=await listFriends(u.id);
 if(friends.includes(friend.id))return NextResponse.json({ok:true,alreadyAdded:true});
 if(friends.length>=8)return NextResponse.json({error:"Maximum of eight comparison profiles."},{status:400});
 await saveFriends(u.id,[...friends,friend.id]);return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:"Could not add that friend"},{status:503});}
}
export async function DELETE(request:NextRequest){
 try{const u=await getUser(request);if(!u)return NextResponse.json({error:"Unauthorized"},{status:401});
 const body=await request.json().catch(()=>({}));const id=String(body.id||"");
 const friends=await listFriends(u.id);await saveFriends(u.id,friends.filter(x=>x!==id));
 return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:"Could not remove friend"},{status:503});}
}
