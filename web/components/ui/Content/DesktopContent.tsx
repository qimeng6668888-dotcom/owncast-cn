import { ComponentType, FC } from 'react';
import dynamic from 'next/dynamic';
import { TabsProps } from 'antd';
import { ErrorBoundary, getErrorMessage } from 'react-error-boundary';
import { PageFigureConfig, PluginTab } from '../../../interfaces/client-config.model';
import styles from './Content.module.scss';
import { CustomPageContent } from '../CustomPageContent/CustomPageContent';
import { PluginTabFrame } from '../PluginTabFrame/PluginTabFrame';
import { ContentHeader } from '../../common/ContentHeader/ContentHeader';
import { PageFigure } from '../PageFigure/PageFigure';
import { ComponentError } from '../ComponentError/ComponentError';

export type DesktopContentProps = {
  name: string;
  summary: string;
  extraPageContent: string;
  pageFigure?: PageFigureConfig;
  pluginTabs: PluginTab[];
  setShowFollowModal: (show: boolean) => void;
  showFollowersTab: boolean;
  federatedServers?: any[]; // Will be properly typed when API is implemented
  logo?: string;
};

// lazy loaded components

const Tabs: ComponentType<TabsProps> = dynamic(() => import('antd').then(mod => mod.Tabs), {
  ssr: false,
});

const FollowerCollection = dynamic(
  () =>
    import('../followers/FollowerCollection/FollowerCollection').then(
      mod => mod.FollowerCollection,
    ),
  {
    ssr: false,
  },
);

const StreamsTab = dynamic(() => import('../StreamsTab/StreamsTab').then(mod => mod.StreamsTab), {
  ssr: false,
});

export const DesktopContent: FC<DesktopContentProps> = ({
  name,
  summary,
  extraPageContent,
  pageFigure,
  pluginTabs,
  setShowFollowModal,
  showFollowersTab,
  federatedServers = [],
  logo = '/logo',
}) => {
  const aboutTabContent = (
    <>
      {!!extraPageContent && (
        <div className={styles.bottomPageContentContainer}>
          <CustomPageContent content={extraPageContent} />
        </div>
      )}
      <PageFigure figure={pageFigure} />
    </>
  );

  const followersTabContent = (
    <div className={styles.bottomPageContentContainer}>
      <FollowerCollection name={name} onFollowButtonClick={() => setShowFollowModal(true)} />
    </div>
  );

  const streamsTabContent = (
    <div className={styles.bottomPageContentContainer}>
      <StreamsTab servers={federatedServers} />
    </div>
  );

  const items: NonNullable<TabsProps['items']> = [];
  if (extraPageContent || pageFigure?.title || pageFigure?.body || pageFigure?.image) {
    items.push({ label: 'About', key: '2', children: aboutTabContent });
  }
  if (showFollowersTab) {
    items.push({ label: 'Followers', key: '3', children: followersTabContent });
  }
  // Add Featured tab if there are featured streams
  if (federatedServers && federatedServers.length > 0) {
    items.push({ label: 'Featured Streams', key: '4', children: streamsTabContent });
  }
  // Plugin-contributed tabs render after the built-ins. Key is the
  // slug+title combination; the host's validator rejects duplicate
  // titles within a plugin, so this pair is unique across all
  // plugin tabs and stable across renders (no index-as-key
  // anti-pattern).
  //
  // forceRender mounts each tab's iframe up front instead of on first
  // activation, so the srcdoc loads and the host injects styles while the
  // pane is still hidden — the content is ready (no load flash) the moment
  // the user taps the tab.
  (pluginTabs || []).forEach(tab => {
    items.push({
      label: tab.title,
      key: `plugin-${tab.slug}-${tab.title}`,
      forceRender: true,
      children: (
        <div className={styles.bottomPageContentContainer}>
          <PluginTabFrame content={tab.html} />
        </div>
      ),
    });
  });

  return (
    <ErrorBoundary
      // eslint-disable-next-line react/no-unstable-nested-components
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ComponentError
          componentName="DesktopContent"
          message={getErrorMessage(error)}
          retryFunction={resetErrorBoundary}
        />
      )}
    >
      <div id="skip-to-content">
        <ContentHeader name={name} summary={summary} logo={logo} />
      </div>

      <div>
        {items.length > 1 ? (
          <Tabs defaultActiveKey="0" items={items} />
        ) : (
          (!!extraPageContent ||
            !!pageFigure?.title ||
            !!pageFigure?.body ||
            !!pageFigure?.image) &&
          aboutTabContent
        )}
      </div>
    </ErrorBoundary>
  );
};
