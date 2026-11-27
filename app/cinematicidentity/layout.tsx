import type { Metadata } from "next";
export const metadata: Metadata = {title:"Cinematic Identity",description:"A private exploration of a life in cinema.",manifest:"/cinematicidentity/manifest.webmanifest",icons:{icon:"/cinematicidentity/app-icon?size=512",apple:"/cinematicidentity/app-icon?size=180"},appleWebApp:{capable:true,title:"Cinematic Identity",statusBarStyle:"black-translucent"}};
export default function Layout({children}:{children:React.ReactNode}){return children;}
