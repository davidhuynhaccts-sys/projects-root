import Link from 'next/link';
export default function SuperElly() {return <main className="elly-home">
 <div className="home-stars">✦ &nbsp; LITTLE HERO. BIG ADVENTURES. &nbsp; ✦</div>
 <h1>Super Elly<span>A little courage. A lot of magic.</span></h1>
 <article className="featured-game"><img src="/superelly/assets/mockup.jpg" alt="Elly in her skeleton costume shining a flashlight at pastel bakery monsters"/><div className="featured-copy"><span className="eyebrow">TWO PLAYABLE LEVELS</span><h2>Bakery Monsters</h2><p>Something is stirring in Jaylean’s Bakery. Grab your cookies, rescue the cookies, and send those sneaky monsters packing!</p><Link className="elly-primary" href="/superelly/bakery-monsters">Let’s play <span>➜</span></Link><Link className="home-link" href="/superelly/bakery-monsters?level=2">New: Level 2 · Storage room scramble ➜</Link><small>Made for two thumbs • Two bakery adventures</small></div></article>
 <h3>More stories, more adventures</h3><div className="future-games"><article><span>🥦</span><h2>Missing Broccoli</h2><p>A future Super Elly adventure</p></article><article><span>🍓</span><h2>Jelly Explosion</h2><p>A future Super Elly adventure</p></article></div>
 <p className="home-foot">From the world of the Super Elly books<br/>Made with imagination, cookies, and a little bravery.</p>
 </main>}
