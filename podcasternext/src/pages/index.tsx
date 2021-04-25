/* SPA - Single Page Application
  import {useEffect} from "react"  
  useEffect((O que quero executar) => {
    fetch('http://localhost:3333/episodes').then(response => response.json()).then(console.log(Data))
  }, [Quando variáveis, se vazio, acontece somente 1x])
  Dispara algo quando algo muda. OBS: Não indexável pelo Google.
    import { useEffect } from "react"
    useEffect(() => {
      fetch('http://localhost:3333/episodes')
        .then(response => response.json())
        .then(data => console.log(data))
    }, [])
  
  */


/* SSR - Server-side Rendering
    export async function getServerSideProps(){
      const response = await fetch('http://localhost:3333/episodes')
      const data = await response.json()

      return{
        props:{
          episodes: data,
        }
      }
    }

    Executa toda vez que alguém acessar a página, é indexável pelo Google.
*/

/* SSG - Static Side Generation
    export async function getStaticProps(){
      const response = await fetch('http://localhost:3333/episodes')
      const data = await response.json()

      return{
        props:{
          episodes: data,
        },
        revalidate: 60*60*8, 
      }
    }    

    É mais performático, pois executa conforme o tempo do revalidate, dado em segundos.
    Se sua aplicação renova os dados a cada 24h = 3600s ou 60*60*24.
    Só funciona em produção, logo precisamos executar uma build com o yarn build.
*/
import { GetStaticProps } from "next";
import { format, parseISO } from 'date-fns';
import { api } from "../services/api";
import { ptBR } from "date-fns/locale";
import { convertDurationToTimeString } from "../utils/convertDurationToTimeString";
import styles from './home.module.scss';
import Image from 'next/image';
import Link from 'next/link';
import { useContext } from "react";
import { PlayerContext } from "../contexts/PlayerContext";
import Head from "next/head";


type Episode = {
  id: string;
  title: string;
  members: string;
  published_at: string;
  thumbnail: string;
  durationAsString: string;
  url: string;
  type: string;
  duration: number;
}


type HomeProps = {
  latestEpisodes: Episode[]; /*Array<Episode>*/
  allEpisodes: Episode[]; /*Array<Episode>*/
}



export default function Home({ latestEpisodes, allEpisodes }: HomeProps) {

  const { playList } = useContext(PlayerContext)

  const episodeList = [...latestEpisodes, ...allEpisodes]

  return (
    <div className={styles.homepage}>

      <Head>
        <title>Home | Podcaster</title>
      </Head>

      <section className={styles.latestEpisodes}>

        <h2>Últimos lançamentos { }</h2>
        <ul>
          {latestEpisodes.map((episode, index) => {
            return (
              <li key={episode.id}>
                <Image width={192}
                  height={192}
                  src={episode.thumbnail}
                  alt={episode.title}
                  objectFit="cover"
                />
                <div className={styles.episodeDetails}>
                  <Link href={`/episodes/${episode.id}`}>
                    <a >{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.published_at}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button type="button" onClick={() => playList(episodeList, index)} >
                  <img src='/play-green.svg' alt='Tocar Episódio' />
                </button>

              </li>
            )
          })
          }
        </ul>
      </section>

      <section className={styles.allEpisodes}>
        <h2>Todos os episódios</h2>
        <table cellSpacing={0}>
          <thead>
            <tr>
              <th>
              </th>
              <th>Podcast</th>
              <th>Integrantes</th>
              <th>Data</th>
              <th>Duração</th>
            </tr>
          </thead>
          <tbody>
            {allEpisodes.map((episode, index) => {
              return (
                <tr key={episode.id}>
                  <td style={{ width: 72 }}>
                    <Image
                      width={120}
                      height={120}
                      src={episode.thumbnail}
                      alt={episode.title}
                    />
                  </td>

                  <td>
                    <Link href={`/episodes/${episode.id}`}>
                      <a>{episode.title}</a>
                    </Link>
                  </td>

                  <td>{episode.members}</td>

                  <td style={{ width: 100 }}>{episode.published_at}</td>

                  <td>{episode.durationAsString}</td>

                  <td>
                    <button type="button" onClick={() => playList(episodeList, index + latestEpisodes.length)}>
                      <img src="/play-green.svg" alt="Tocar Episódio" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {

  const { data } = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  })/*?_limit=12&_sort=published_at&_order=desc Limita a 12 itens por página, organiza por data de publicação e ordena por ordem decrescente.*/
  /*const data = response.data*/

  /*Formatação dos dados*/
  /*É importante que os dados sejam formatados logo depois de serem "pegos" para que sejam retornados já formatados*/
  const episodes = data.map(episode => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      published_at: format(parseISO(episode.published_at), 'd MMM yy', { locale: ptBR }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      url: episode.file.url,
    };
  })


  const latestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(0, episodes.length);

  return {
    props: {
      latestEpisodes,
      allEpisodes,

    },
    revalidate: 60 * 60 * 8,
  }
}