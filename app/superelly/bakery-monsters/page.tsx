import GameClient from './GameClient';
import './level2.css';
export default function BakeryMonsters({searchParams}:{searchParams:{level?:string}}){return <GameClient initialLevel={searchParams.level==='3'?3:searchParams.level==='2'?2:1}/>}
