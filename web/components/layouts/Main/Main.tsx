/* eslint-disable react/no-invalid-html-attribute */
/* eslint-disable react/no-danger */
/* eslint-disable react/no-unescaped-entities */
import { useAtomValue } from 'jotai';
import Head from 'next/head';
import { FC, useEffect, useRef } from 'react';
import { Layout } from 'antd';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'next-export-i18n';
import {
  ClientConfigStore,
  isChatAvailableSelector,
  clientConfigStateAtom,
  fatalErrorStateAtom,
  appStateAtom,
  serverStatusState,
} from '../../stores/ClientConfigStore';
import { Content } from '../../ui/Content/Content';
import { Header } from '../../ui/Header/Header';
import setupNoLinkReferrer from '../../../utils/no-link-referrer';
import { TitleNotifier } from '../../TitleNotifier/TitleNotifier';
import { ServerRenderedHydration } from '../../ServerRendered/ServerRenderedHydration';
import { Theme } from '../../theme/Theme';
import styles from './Main.module.scss';
import { PushNotificationServiceWorker } from '../../workers/PushNotificationServiceWorker/PushNotificationServiceWorker';
import { Noscript } from '../../ui/Noscript/Noscript';
import { Localization } from '../../../types/localization';
import { translated } from '../../../utils/playerLanguage';

// Lazy loaded components

const FatalErrorStateModal = dynamic(
  () =>
    import('../../modals/FatalErrorStateModal/FatalErrorStateModal').then(
      mod => mod.FatalErrorStateModal,
    ),
  {
    ssr: false,
  },
);

export const Main: FC = () => {
  const { t } = useTranslation();
  const clientConfig = useAtomValue(clientConfigStateAtom);
  const clientStatus = useAtomValue(serverStatusState);
  const { name, summary } = clientConfig;
  const isChatAvailable = useAtomValue(isChatAvailableSelector);
  const fatalError = useAtomValue(fatalErrorStateAtom);
  const appState = useAtomValue(appStateAtom);
  const layoutRef = useRef<HTMLDivElement>(null);
  const { chatDisabled } = clientConfig;
  const { videoAvailable } = appState;
  const { online, streamTitle } = clientStatus;

  useEffect(() => {
    setupNoLinkReferrer(layoutRef.current);
  }, []);

  const isProduction = process.env.NODE_ENV === 'production';
  const headerText = online ? streamTitle || name : name;

  return (
    <>
      <Head>
        {isProduction && <ServerRenderedHydration />}

        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="authorization_endpoint" href="/api/auth/provider/indieauth" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="description" content={summary || name} />
        <meta property="og:locale" content="zh_CN" />
        <meta property="og:title" content={headerText || name} />
        <meta property="og:site_name" content={name} />
        <meta property="og:description" content={summary || name} />
        <meta property="og:type" content="video.other" />

        <base target="_blank" />
      </Head>

      {isProduction ? (
        <Head>{name ? <title>{name}</title> : <title>{'{{.Name}}'}</title>}</Head>
      ) : (
        <Head>
          <title>{name}</title>
        </Head>
      )}
      <ErrorBoundary
        // eslint-disable-next-line react/no-unstable-nested-components
        fallbackRender={({ error }) => (
          <FatalErrorStateModal
            title={translated(t, Localization.Frontend.Errors.title, '错误')}
            message={translated(
              t,
              Localization.Frontend.Errors.unexpected,
              '出现了意外错误。请刷新页面重试。如果问题仍然存在，请向 Owncast 项目反馈：{{message}}',
            ).replace('{{message}}', String(error))}
          />
        )}
      >
        <ClientConfigStore />
      </ErrorBoundary>
      <PushNotificationServiceWorker />
      <TitleNotifier name={name} />
      <Theme />
      {/*
        /customjavascript serves the admin's custom JS followed by
        every loaded plugin's manifest.scripts content (concatenated
        server-side). One <script> tag covers both.
      */}
      <Script strategy="afterInteractive" src="/customjavascript" />
      <Layout ref={layoutRef} className={styles.layout}>
        <Header
          name={headerText}
          chatAvailable={isChatAvailable}
          chatDisabled={chatDisabled}
          online={videoAvailable}
        />
        <Content />
        {fatalError && (
          <FatalErrorStateModal title={fatalError.title} message={fatalError.message} />
        )}
      </Layout>
      <Noscript />
    </>
  );
};
