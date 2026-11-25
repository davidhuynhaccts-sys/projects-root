import { NextResponse } from "next/server";

// Public metadata only. No participant data, search terms, age or pathway is accepted.
export const dynamic = "force-dynamic";
export const maxDuration = 30;
const dataset="HenryWaltson/TMDB-IMDB-Movies-Dataset";
type Film={id:string;title:string;year:number;src:string;scene:string;source:string;sourcePage:string;genres:string;tags:string;language:string;rating:number;votes:number};
const validPath=/^\/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp)$/i;
async function decade(start:number):Promise<Film[]> {
 const q=new URLSearchParams({dataset,config:"default",split:"train",where:'"release_date">=\''+start+'-01-01\' AND "release_date"<\''+(start+10)+'-01-01\' AND "vote_average">=7 AND "vote_count">='+ (start<1960?80:250)+' AND "adult"=false AND "status"=\'Released\'',orderby:'"vote_count" DESC',length:"100"});
 const response=await fetch("https://datasets-server.huggingface.co/filter?"+q.toString(),{next:{revalidate:86400},signal:AbortSignal.timeout(6500)});
 if(!response.ok)return [];
 const data=await response.json();const result:Film[]=[];
 for(const x of data.rows||[]){const r=x.row;if(!r||!r.title||!r.id||typeof r.backdrop_path!=="string"||!validPath.test(r.backdrop_path))continue;
 const year=Number(String(r.release_date).slice(0,4));if(!Number.isInteger(year)||year>new Date().getFullYear())continue;
 result.push({id:"tmdb-"+r.id,title:String(r.title),year,src:"https://image.tmdb.org/t/p/w780"+r.backdrop_path,scene:"Film image from "+r.title,source:"TMDB",sourcePage:"https://www.themoviedb.org/movie/"+r.id,genres:String(r.genres||""),tags:String(r.keywords||"").slice(0,1000),language:String(r.original_language||""),rating:Number(r.vote_average)||0,votes:Number(r.vote_count)||0});
 }
 return result;
}
export async function GET(){
 const years=Array.from({length:13},(_,i)=>1900+i*10);
 const results=await Promise.allSettled(years.map(decade));
 const films=results.flatMap(r=>r.status==="fulfilled"?r.value:[]);
 return NextResponse.json({films,source:dataset},{headers:{"Cache-Control":films.length>0?"public, s-maxage=86400, stale-while-revalidate=604800":"no-store"}});
}
