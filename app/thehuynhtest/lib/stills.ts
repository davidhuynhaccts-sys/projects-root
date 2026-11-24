/** Frozen movie reference images for Huynh Test V2.0 Pilot 002.
 * All participants see the same image for each film. These are unchanged
 * third-party film stills, not AI-generated images. The historic Pilot 001
 * stills remain separate; those exact prior files were not available here.
 * Image rights remain with their respective owners. */
export type Still = { src:string; scene:string; source:string; sourcePage:string };
export const STILLS:Record<string,Still> = {
  "truman": {
    "src": "https://m.media-amazon.com/images/M/MV5BZmNhMjA5ZDEtMjYwNi00N2VlLWJlNjMtNDk4YjhmZjUxODg3XkEyXkFqcGc%40._V1_FMjpg_UX1000_.jpg",
    "scene": "Truman reaches the door at the end of the sky",
    "source": "IMDb",
    "sourcePage": "https://www.imdb.com/title/tt0120382/mediaviewer/rm1906994176/"
  },
  "sunshine": {
    "src": "https://fr.web.img3.acsta.net/r_1280_720/medias/nmedia/18/36/31/76/18754653.jpg",
    "scene": "The Hoover family running beside their yellow van",
    "source": "AlloCiné",
    "sourcePage": "https://www.allocine.fr/film/fichefilm-109815/photos/detail/?cmediafile=18754653"
  },
  "matrix": {
    "src": "https://cdn.mos.cms.futurecdn.net/SQEgi2E2JxKYqx4jzhab2C.jpg",
    "scene": "Morpheus offers the red and blue pills",
    "source": "Space.com",
    "sourcePage": "https://www.space.com/the-matrix-movies-in-order"
  },
  "greenbook": {
    "src": "https://culturekit-assets.imgix.net/1/assets/cc12ff3d-b46d-4fd1-9b3d-c423bfa31d20.jpg?auto=format&fit=max&q=72&w=1200",
    "scene": "Tony and Don traveling together in a turquoise car",
    "source": "Cineville",
    "sourcePage": "https://cineville.nl/nl-NL/magazine/green-book-verzoening-voorspelling"
  },
  "spirited": {
    "src": "https://conteudo.imguol.com.br/c/entretenimento/a4/2020/01/20/cena-de-a-viagem-de-chihiro-2001-1579522908937_v2_900x506.jpg",
    "scene": "Chihiro and No-Face on the train over water",
    "source": "UOL",
    "sourcePage": "https://entretenimento.uol.com.br/noticias/redacao/2020/05/14/diretor-de-chihiro-esta-fazendo-novo-filme-a-mao-um-minuto-por-mes.htm"
  },
  "whiplash": {
    "src": "https://img.buzzfeed.com/buzzfeed-static/static/2022-03/24/15/asset/e1d388cf48af/sub-buzz-2176-1648135617-19.jpg",
    "scene": "Andrew rehearsing at the drum kit",
    "source": "BuzzFeed",
    "sourcePage": "https://www.buzzfeed.com/ewuraamaquarshie/actors-who-learnt-instruments-for-movies"
  },
  "amelie": {
    "src": "https://estaticos-cdn.prensaiberica.es/clip/95d694be-ff8e-4e1e-bad1-dce9136ecf33_alta-libre-aspect-ratio_default_0.jpg",
    "scene": "Amélie turns in the warm-lit café",
    "source": "Información",
    "sourcePage": "https://www.informacion.es/ocio/cine/2017/04/06/mejores-frases-amelie-5942579.html"
  },
  "parasite": {
    "src": "https://arc-anglerfish-arc2-prod-infobae.s3.amazonaws.com/public/UJGDFIQM6BEEVGRWC63OROO3QA.jpg",
    "scene": "Kim family relaxing together in the Park living room",
    "source": "Infobae",
    "sourcePage": "https://www.infobae.com/cultura/2020/01/13/parasite-la-magistral-e-impredecible-pelicula-coreana-que-conquista-al-mundo-y-a-los-premios/"
  },
  "eeaao": {
    "src": "https://media.vanityfair.com/photos/6258708967f4b24bbe872214/3%3A2/w_1665%2Ch_1110%2Cc_limit/michelle-yeoh-everything-everywhere-all-at-once.jpg",
    "scene": "Evelyn pauses in the laundromat",
    "source": "Vanity Fair",
    "sourcePage": "https://www.vanityfair.com/hollywood/2022/04/awards-insider-little-gold-men-everything-everywhere-all-at-once"
  },
  "goodwill": {
    "src": "https://static.independent.co.uk/s3fs-public/thumbnails/image/2014/08/12/08/robin-williams-7.jpg?fit=crop&height=900&width=1200",
    "scene": "Sean and Will talking on the park bench",
    "source": "The Independent",
    "sourcePage": "https://www.independent.co.uk/arts-entertainment/films/news/matt-damon-robin-williams-good-will-hunting-bench-scene-your-move-chief-watch-death-anniversary-a7185036.html"
  },
  "odyssey": {
    "src": "https://nofilmschool.com/media-library/remember-when-stanley-kubrick-rewrote-the-future-with-2001-a-space-odyssey.jpg?id=34070992&quality=50&width=800",
    "scene": "HAL 9000's glowing red camera eye",
    "source": "No Film School",
    "sourcePage": "https://nofilmschool.com/stanley-kubrick-2001-a-space-odyssey"
  },
  "getout": {
    "src": "https://gcp-na-images.contentstack.com/v3/assets/bltea6093859af6183b/blt00766ba0cee0ba4a/6988d8d7cf40a8eb6ac48e07/170808-get-out-most-profitable-movie.jpg?branch=production",
    "scene": "Chris confronting fear and the Sunken Place",
    "source": "TIME",
    "sourcePage": "https://time.com/5047929/jordan-peele-on-get-out-theory/"
  },
  "ladybird": {
    "src": "https://a.scpr.org/178362_5bfc1ff75550603c57983f89a710f8e7_original.jpg",
    "scene": "Lady Bird and her mother sitting together",
    "source": "LAist",
    "sourcePage": "https://laist.com/shows/the-frame/laurie-metcalf-talks-lady-bird-and-the-empowering-effect-of-strong-women-roles"
  },
  "joker": {
    "src": "https://static.dc.com/dc/files/default_images/Movies-Gallery_TheJoker_3_5d6753cd128d14.53917387.jpg?w=1200",
    "scene": "Arthur Fleck dances on the Joker staircase",
    "source": "DC",
    "sourcePage": "https://www.dc.com/movies/joker-2019"
  },
  "arrival": {
    "src": "https://media.vanityfair.com/photos/57cc8060c4c543236f2c1213/16%3A9/w_1440%2Ch_810%2Cc_limit/arrival-review.jpg",
    "scene": "Louise Banks holds a whiteboard while communicating in the spacecraft",
    "source": "Vanity Fair",
    "sourcePage": "https://www.vanityfair.com/hollywood/2016/09/arrival-amy-adams-review"
  },
  "godfather": {
    "src": "https://iagq.tmgrup.com.tr/img/photo_gallery_photos/17-02/19/the-godfather-screening-moosic-dickson-city-stroudsburg-1487512893.jpg",
    "scene": "Don Vito Corleone in his office",
    "source": "GQ Türkiye",
    "sourcePage": "https://gq.com.tr/populer/the-godfatherdan-ogrendigimiz-hayat-dersleri"
  },
  "groundhog": {
    "src": "https://media.vogue.mx/photos/626038d863e1430f4bd56894/master/w_1600%2Cc_limit/076_Un_jour_sans_fin_1993_015.jpg",
    "scene": "Phil and Rita embrace outside a house in winter",
    "source": "Vogue México",
    "sourcePage": "https://www.vogue.mx/estilo-de-vida/articulo/comedias-romanticas-de-los-90-peliculas-que-nunca-pasan-de-moda"
  },
  "lastjedi": {
    "src": "https://img.lemde.fr/2017/12/12/77/256/5438/3625/1668/0/75/0/989a391_30833-1fjix3q.puzq.jpg",
    "scene": "Rey stands on the cliffs of Ahch-To",
    "source": "Le Monde",
    "sourcePage": "https://www.lemonde.fr/cinema/article/2017/12/12/star-wars-les-derniers-jedi-de-nouvelles-forces-pour-une-vieille-saga_5228635_3476.html"
  },
  "moonlight": {
    "src": "https://assets.vogue.com/photos/589188917edfa70512d65138/master/w_2560%2Cc_limit/00-moonlight.jpg",
    "scene": "Juan teaches young Chiron to swim in the ocean",
    "source": "Vogue",
    "sourcePage": "https://www.vogue.com/article/moonlight-barry-jenkins-review"
  },
  "shawshank": {
    "src": "https://nofilmschool.com/media-library/shawshank.jpg?coordinates=259%2C0%2C31%2C0&height=1500&id=34065616&width=2000",
    "scene": "Andy stands under the rain with arms outstretched",
    "source": "No Film School",
    "sourcePage": "https://nofilmschool.com/2016/04/100-most-iconic-shots-100-years-cinema"
  }
};
