import React, { FC } from 'react';
import videojs from 'video.js';
import type VideoJsPlayer from 'video.js/dist/types/player';
import { useTranslation } from 'next-export-i18n';

import styles from './VideoJS.module.scss';
import { playerLanguagePack } from '../../../utils/playerLanguage';

export type VideoJSProps = {
  options: any;
  onReady: (player: VideoJsPlayer, vjsInstance: typeof videojs) => void;
};

export const VideoJS: FC<VideoJSProps> = ({ options, onReady }) => {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const playerRef = React.useRef<VideoJsPlayer | null>(null);
  const { t } = useTranslation();

  React.useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      const videoElement = videoRef.current;
      const langCode = options.language || 'zh-CN';

      videojs.addLanguage(langCode, playerLanguagePack(t));
      const finalOptions = {
        ...options,
        language: langCode,
        noUITitleAttributes: true, // Prevents videojs from adding a title attribute to UI elements, thus preventing "double tooltips".
      };
      // eslint-disable-next-line no-multi-assign
      const player: VideoJsPlayer = (playerRef.current = videojs(videoElement, finalOptions, () => {
        console.debug('player is ready');
        return onReady && onReady(player, videojs);
      }));

      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, videoRef]);

  // Playlists already use Cache-Control: no-store. Do not append a random
  // cachebust query: it makes every viewer's playlist URL unique, so the CDN
  // cannot coalesce those origin fetches.

  return (
    <div data-vjs-player>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        className={`video-js vjs-big-play-centered vjs-show-big-play-button-on-pause ${styles.player} vjs-owncast`}
      />
    </div>
  );
};
