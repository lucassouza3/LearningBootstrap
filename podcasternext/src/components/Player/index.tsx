import { usePlayer } from '../../contexts/PlayerContext';

import { useRef, useEffect, useState } from 'react';

import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

import 'rc-slider/assets/index.css';

import Image from 'next/image';

import styles from './styles.module.scss';

import Slider from 'rc-slider';


export function Player() {

  const [progress, setProgress] = useState(0)

  const {
    episodeList,
    currentEpisodeIndex,
    isPlaying,
    togglePlay,
    setPlayingState,
    playNext,
    playPrevious,
    hasNext,
    hasPrevious,
    isLooping,
    isShuffling,
    toggleLoop,
    toggleShuffle,
    clearPlayerState,

  } = usePlayer();


  function handleEpisodEnded() {
    if (hasNext) {
      playNext()
    } else {
      clearPlayerState()
    }
  }

  function handleSeek(amount: number) {
    audioRef.current.currentTime = amount;
    setProgress(amount);
  }

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    if (isPlaying) {
      audioRef.current.play();
    } else { audioRef.current.pause(); }
  }, [isPlaying])

  function setupProgressListener() {
    audioRef.current.currentTime = 0;

    audioRef.current.addEventListener('timeupdate', () => {
      setProgress(Math.floor(audioRef.current.currentTime));
    });
  }

  const episode = episodeList[currentEpisodeIndex]



  return (
    <div className={styles.playerContainer}>

      <header>
        <img src="/playing.svg" alt="Tocando Agora" />
        <strong>Tocando agora </strong>
      </header>

      {episode ? (
        <div className={styles.currentEpisode}>
          <Image
            width={592}
            height={592}
            src={episode.thumbnail}
            objectFit="cover"
          />
          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir.</strong>
        </div>
      )
      }
      <footer className={episode ? styles.empty : ''}>
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(progress)}</span>

          <div className={styles.slider}>

            {episode ? (
              <Slider
                max={episode.duration}
                value={progress}
                onChange={handleSeek}
                trackStyle={{ backgroundColor: '#04d361' }}
                railStyle={{ backgroundColor: '#9f75ff' }}
                handleStyle={{ borderColor: '#04d361', borderWidth: 4 }}
              />
            )
              :
              (
                <div className={styles.emptySlider} />)}

          </div>

          <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
        </div>

        {episode && (
          <audio
            src={episode.url}
            ref={audioRef}
            autoPlay
            loop={isLooping}
            onPlay={() => setPlayingState(true)}
            onPause={() => setPlayingState(false)}
            onEnded={handleEpisodEnded}
            onLoadedMetadata={setupProgressListener}
          />
        )}

        <div className={styles.buttons}>


          <button type="button" disabled={!episode || episodeList.length === 1} onClick={toggleShuffle} className={isShuffling ? styles.isActive : ''} >
            <img src='/shuffle.svg' alt='Aleatório' />
          </button>


          <button type="button" disabled={!episode || !hasPrevious} onClick={playPrevious}>
            <img src='/play-previous.svg' alt='Anterior' />
          </button>


          <button type="button"
            className={styles.playButton}
            disabled={!episode}
            onClick={togglePlay}>
            {isPlaying ?
              <img
                src='/pause.svg'
                alt='pausar'
              />
              :
              <img
                src='/play.svg'
                alt='Tocar'
              />}

          </button>
          <button type="button" disabled={!episode || !hasNext} onClick={playNext}>
            <img src='/play-next.svg' alt='Próxima' />
          </button>
          <button type="button" disabled={!episode} onClick={toggleLoop} className={isLooping ? styles.isActive : ''}>
            <img src='/repeat.svg' alt='Repetir' />
          </button>
        </div>
      </footer>
    </div>
  );
}
function setEpisodeList(arg0: undefined[]) {
  throw new Error('Function not implemented.');
}

function setCurrentEpisodeIndeex(arg0: number) {
  throw new Error('Function not implemented.');
}

