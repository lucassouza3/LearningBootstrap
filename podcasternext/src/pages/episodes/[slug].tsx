import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { api } from '../../services/api';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';
import styles from './episode.module.scss'
import Image from 'next/image';
import Link from 'next/link';
import { usePlayer } from '../../contexts/PlayerContext';
import Head from 'next/head';


type Episode = {
  id: string;
  title: string;
  members: string;
  published_at: string;
  thumbnail: string;
  description: string;
  durationAsString: string;
  url: string;
  type: string;
  duration: number;
}

type EpisodeProps = {
  episode: Episode;
}


export default function Episode({ episode }: EpisodeProps) {

  const { play } = usePlayer();

  return (
    <div className={styles.episode}>

      <Head>
        <title>{episode.title} | Podcaster</title>
      </Head>

      <div className={styles.thumbnailContainer}>
        <Link href='/'>
          <button>
            <img src='/arrow-left.svg' alt='voltar' />
          </button>
        </Link>
        <Image width={700} height={168} src={episode.thumbnail} objectFit="cover" />
        <button type="button" onClick={() => play(episode)}>
          <img src='/play.svg' alt='tocar' />
        </button>
      </div>
      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.published_at}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div className={styles.description} dangerouslySetInnerHTML={{ __html: episode.description }} />
    </div>
  )
};

/*Método obrigatório em toda rota que tem o [];
Ele retorna quais episódios nós queremos gerar de forma estática no momento da build
*/
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],/*No momento da build nenhuma página estática é gerada
    pode ser passado uma const { data } = await api.get('episodes', { 
      params:{
        _limit: 2,
        _sort: 'published_at',
        _order: desc
      }
    }) Gera os 2 últimos episódios públicados de forma estática, e o resto é gerado normalmente.*/
    fallback: 'blocking' /*false => dá 404 se a página não tiver sido gerada
     no momento do yarn build;
     true => Episódio não gerado anteriormente, será buscado pelo lado do client
     blocking => Episódio não gerado, será buscado pelo servidor de forma incremental*/
  }
}


export const getStaticProps: GetStaticProps = async (ctx) => { //ctx => contexto
  const { slug } = ctx.params;
  const { data } = await api.get(`/episodes/${slug}`)

  const episode = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    published_at: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
    duration: Number(data.file.duration),
    durationAsString: convertDurationToTimeString(Number(data.file.duration)),
    description: data.description,
    url: data.file.url,
  };

  return {
    props: {
      episode,
    },
    revalidate: 60 * 60 * 24, //recarrega a cada 24h
  }
}