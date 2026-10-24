/* eslint-disable react/no-danger */
import { FC } from 'react';

export const ServerRenderedHydration: FC = () => (
  <script
    id="server-side-hydration"
    nonce="{{.Nonce}}"
    dangerouslySetInnerHTML={{
      __html: `
	window.configHydration = {{.ServerConfigJSON}};
	window.statusHydration = {{.StatusJSON}};
	(function () {
		try {
			if (window.statusHydration && window.statusHydration.online) {
				var link = document.createElement('link');
				link.rel = 'preload';
				link.as = 'fetch';
				link.href = '/hls/stream.m3u8';
				link.crossOrigin = 'anonymous';
				document.head.appendChild(link);
			}
		} catch (e) {}
	})();
	`,
    }}
  />
);
