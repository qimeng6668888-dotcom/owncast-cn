import { FC, ReactNode, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { differenceInSeconds } from 'date-fns';
import { useRouter } from 'next/router';
import { Layout, Menu, Alert, Button, Space, Tooltip, Badge } from 'antd';

import { useTranslation } from 'next-export-i18n';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { upgradeVersionAvailable } from '../../utils/apis';
import { PluginsContext } from '../../utils/plugins-context';
import { PluginIcon } from './plugins/PluginIcon';
import { Localization } from '../../types/localization';
import { translated } from '../../utils/playerLanguage';
import { parseSecondsToDurationString } from '../../utils/format';

import { OwncastLogo } from '../common/OwncastLogo/OwncastLogo';
import { ServerStatusContext } from '../../utils/server-status-context';
import { AlertMessageContext } from '../../utils/alert-message-context';

import { TextFieldWithSubmit } from './TextFieldWithSubmit';
import { TEXTFIELD_PROPS_STREAM_TITLE } from '../../utils/config-constants';
import { ComposeFederatedPost } from './ComposeFederatedPost';
import { usePendingFeatureRequestCount } from '../../hooks/useFeatureRequests';
import { UpdateArgs } from '../../types/config-section';
import { FatalErrorStateModal } from '../modals/FatalErrorStateModal/FatalErrorStateModal';

// Lazy loaded components

const SettingOutlined = dynamic(() => import('@ant-design/icons/SettingOutlined'), {
  ssr: false,
}); // Lazy loaded components

const HomeOutlined = dynamic(() => import('@ant-design/icons/HomeOutlined'), {
  ssr: false,
});

const TeamOutlined = dynamic(() => import('@ant-design/icons/TeamOutlined'), {
  ssr: false,
});

const LineChartOutlined = dynamic(() => import('@ant-design/icons/LineChartOutlined'), {
  ssr: false,
});

const ToolOutlined = dynamic(() => import('@ant-design/icons/ToolOutlined'), {
  ssr: false,
});

const PlayCircleFilled = dynamic(() => import('@ant-design/icons/PlayCircleFilled'), {
  ssr: false,
});

const MinusSquareFilled = dynamic(() => import('@ant-design/icons/MinusSquareFilled'), {
  ssr: false,
});

const QuestionCircleOutlined = dynamic(() => import('@ant-design/icons/QuestionCircleOutlined'), {
  ssr: false,
});

const MessageOutlined = dynamic(() => import('@ant-design/icons/MessageOutlined'), {
  ssr: false,
});

const ExperimentOutlined = dynamic(() => import('@ant-design/icons/ExperimentOutlined'), {
  ssr: false,
});

const AppstoreOutlined = dynamic(() => import('@ant-design/icons/AppstoreOutlined'), {
  ssr: false,
});

const EditOutlined = dynamic(() => import('@ant-design/icons/EditOutlined'), {
  ssr: false,
});

const DownloadOutlined = dynamic(() => import('@ant-design/icons/DownloadOutlined'), {
  ssr: false,
});

const StarOutlined = dynamic(() => import('@ant-design/icons/StarOutlined'), {
  ssr: false,
});

const FediverseOutlined = dynamic(() => import('../../assets/images/icons/fediverse.svg'), {
  ssr: false,
});

export type MainLayoutProps = {
  children: ReactNode;
};

export const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const nav = (key: string, fallback: string) => translated(t, key, fallback);
  const context = useContext(ServerStatusContext);
  const { serverConfig, online, broadcaster, versionNumber, error: serverError } = context || {};
  const { instanceDetails, chatDisabled, federation } = serverConfig;
  const { enabled: federationEnabled } = federation;

  // Drives the badge on the Featured Streams sidebar item.
  const pendingFeatureRequestCount = usePendingFeatureRequestCount(federationEnabled);

  const [currentStreamTitle, setCurrentStreamTitle] = useState('');
  const [postModalDisplayed, setPostModalDisplayed] = useState(false);

  const alertMessage = useContext(AlertMessageContext);

  const router = useRouter();
  const { route } = router || {};

  const { Header, Footer, Content, Sider } = Layout;

  const [upgradeVersion, setUpgradeVersion] = useState('');
  const checkForUpgrade = async () => {
    if (versionNumber === '0.0.0') {
      return;
    }
    try {
      const result = await upgradeVersionAvailable(versionNumber);
      setUpgradeVersion(result);
    } catch (error) {
      console.log('==== error', error);
    }
  };

  useEffect(() => {
    checkForUpgrade();
  }, [versionNumber]);

  // Plugins with declared admin pages drive the sidebar's Plugins
  // submenu. Read from the shared PluginsContext so an install or
  // uninstall on the Plugins page updates the submenu live, without the
  // admin needing to refresh the whole page.
  const { plugins } = useContext(PluginsContext);

  useEffect(() => {
    setCurrentStreamTitle(instanceDetails.streamTitle);
  }, [instanceDetails]);

  const handleStreamTitleChanged = ({ value }: UpdateArgs) => {
    setCurrentStreamTitle(value);
  };

  const handleCreatePostButtonPressed = () => {
    setPostModalDisplayed(true);
  };

  const appClass = classNames({
    'app-container': true,
    online,
  });

  const upgradeVersionString = `${upgradeVersion}` || '';
  const upgradeMessage = nav(Localization.Admin.Nav.upgradeTo, '升级到 v{{version}}').replace(
    '{{version}}',
    upgradeVersionString,
  );
  const openMenuItems = upgradeVersion ? ['utilities-menu'] : [];

  const clearAlertMessage = () => {
    alertMessage.setMessage(null);
  };

  const headerAlertMessage = alertMessage.message ? (
    <Alert message={alertMessage.message} afterClose={clearAlertMessage} banner closable />
  ) : null;

  // status indicator items
  const streamDurationString = broadcaster
    ? parseSecondsToDurationString(differenceInSeconds(new Date(), new Date(broadcaster.time)))
    : '';

  const statusIcon = online ? <PlayCircleFilled /> : <MinusSquareFilled />;
  const statusMessage = online
    ? `${nav(Localization.Admin.Nav.online, '在线')} ${streamDurationString}`
    : nav(Localization.Admin.Nav.offline, '离线');

  const statusIndicator = (
    <div className="online-status-indicator">
      <span className="status-label">{statusMessage}</span>
      <span className="status-icon">{statusIcon}</span>
    </div>
  );

  const integrationsMenu = [
    {
      label: <Link href="/admin/webhooks">{nav(Localization.Admin.Nav.webhooks, 'Webhooks')}</Link>,
      key: '/admin/webhooks',
    },
    {
      label: (
        <Link href="/admin/access-tokens">
          {nav(Localization.Admin.Nav.accessTokens, '访问令牌')}
        </Link>
      ),
      key: '/admin/access-tokens',
    },
    {
      label: (
        <Link href="/admin/actions">{nav(Localization.Admin.Nav.externalActions, '外部操作')}</Link>
      ),
      key: '/admin/actions',
    },
  ];

  const chatMenu = [
    {
      label: (
        <Link href="/admin/chat/messages">{nav(Localization.Admin.Nav.messages, '消息')}</Link>
      ),
      key: '/admin/chat/messages',
    },
    {
      label: <Link href="/admin/chat/emojis">{nav(Localization.Admin.Nav.emojis, '表情')}</Link>,
      key: '/admin/chat/emojis',
    },
  ];

  const utilitiesMenu = [
    {
      label: (
        <Link href="/admin/hardware-info">{nav(Localization.Admin.Nav.hardware, '硬件')}</Link>
      ),
      key: '/admin/hardware-info',
    },
    {
      label: (
        <Link href="/admin/stream-health">
          {nav(Localization.Admin.Nav.streamHealth, '直播健康')}
        </Link>
      ),
      key: '/admin/stream-health',
    },
    {
      label: <Link href="/admin/logs">{nav(Localization.Admin.Nav.logs, '日志')}</Link>,
      key: '/admin/logs',
    },
    ...(federationEnabled
      ? [
          {
            label: (
              <Link href="/admin/federation/actions">
                {nav(Localization.Admin.Nav.socialActions, '社交动态')}
              </Link>
            ),
            key: '/admin/federation/actions',
          },
        ]
      : []),
  ];

  const configurationMenu = [
    {
      label: (
        <Link href="/admin/config/general">{nav(Localization.Admin.Nav.general, '常规')}</Link>
      ),
      key: '/admin/config/general',
    },
    {
      label: (
        <Link href="/admin/config/server">
          {nav(Localization.Admin.Nav.serverSetup, '服务器设置')}
        </Link>
      ),
      key: '/admin/config/server',
    },
    {
      label: <Link href="/admin/config-video">{nav(Localization.Admin.Nav.video, '视频')}</Link>,
      key: '/admin/config-video',
    },
    {
      label: (
        <Link href="/admin/config-chat">{nav(Localization.Admin.Nav.chatSettings, '聊天')}</Link>
      ),
      key: '/admin/config-chat',
    },
    {
      label: (
        <Link href="/admin/config-federation">{nav(Localization.Admin.Nav.social, '社交')}</Link>
      ),
      key: '/admin/config-federation',
    },
    {
      label: (
        <Link href="/admin/config-notify">{nav(Localization.Admin.Nav.notifications, '通知')}</Link>
      ),
      key: '/admin/config-notify',
    },
  ];

  const menuItems = [
    {
      label: <Link href="/admin">{nav(Localization.Admin.Nav.home, '首页')}</Link>,
      icon: <HomeOutlined />,
      key: '/admin',
    },
    {
      label: <Link href="/admin/viewer-info">{nav(Localization.Admin.Nav.viewers, '观众')}</Link>,
      icon: <LineChartOutlined />,
      key: '/admin/viewer-info',
    },
    {
      label: <Link href="/admin/users">{nav(Localization.Admin.Nav.users, '用户')}</Link>,
      icon: <TeamOutlined />,
      key: '/admin/users',
    },
    ...(!chatDisabled
      ? [
          {
            label: <span>{nav(Localization.Admin.Nav.chat, '聊天')}</span>,
            icon: <MessageOutlined />,
            children: chatMenu,
            key: 'chat',
          },
        ]
      : []),
    ...(federationEnabled
      ? [
          {
            key: '/admin/federation/followers',
            label: (
              <Link href="/admin/federation/followers">
                {nav(Localization.Admin.Nav.followers, '关注者')}
              </Link>
            ),
            icon: (
              <span
                role="img"
                aria-label="message"
                className="anticon anticon-message ant-menu-item-icon"
              >
                {/* Wrapping the icon in span for consistency with other icons used
                directly from antd */}
                <FediverseOutlined />
              </span>
            ),
          },
        ]
      : []),
    ...(federationEnabled
      ? [
          {
            key: '/admin/config-featured',
            label: (
              <Link href="/admin/config-featured">
                {nav(Localization.Admin.Nav.featuredStreams, '精选直播')}
                {pendingFeatureRequestCount > 0 && (
                  <Badge
                    count={pendingFeatureRequestCount}
                    size="small"
                    style={{ marginInlineStart: 8 }}
                  />
                )}
              </Link>
            ),
            icon: <StarOutlined />,
          },
        ]
      : []),
    {
      key: 'configuration',
      label: nav(Localization.Admin.Nav.configuration, '配置'),
      icon: <SettingOutlined />,
      children: configurationMenu,
    },
    {
      key: 'utilities',
      label: nav(Localization.Admin.Nav.utilities, '工具'),
      icon: <ToolOutlined />,
      children: utilitiesMenu,
    },
    {
      key: 'integrations',
      label: nav(Localization.Admin.Nav.integrations, '集成'),
      icon: <ExperimentOutlined />,
      children: integrationsMenu,
    },
    {
      key: 'plugins-menu',
      label: t(Localization.Admin.Plugins.sidebarTitle),
      icon: <AppstoreOutlined />,
      children: [
        {
          key: '/admin/plugins',
          label: <Link href="/admin/plugins">{t(Localization.Admin.Plugins.overview)}</Link>,
        },
        // One entry per enabled plugin that declares at least one admin
        // page, so the admin can jump straight to a plugin's config
        // without going through the overview + Configure button. Disabled
        // plugins are omitted — their admin pages don't serve. URL is
        // a static route plus an id query param (the plugin's slug)
        // because the admin UI is statically exported and can't
        // enumerate plugin identifiers at build time. Sidebar labels use
        // the human-readable display name.
        ...plugins
          .filter(p => p.enabled && Object.keys(p.adminPages ?? {}).length > 0)
          .map(p => ({
            key: `/admin/plugins/configure?id=${p.slug}`,
            label: (
              <Link href={{ pathname: '/admin/plugins/configure', query: { id: p.slug } }}>
                {p.name}
              </Link>
            ),
            icon: <PluginIcon plugin={p} size="sidebar" />,
          })),
      ],
    },
    ...(upgradeVersion
      ? [
          {
            type: 'divider' as const,
            key: 'upgrade-divider',
          },
        ]
      : []),
    ...(upgradeVersion
      ? [
          {
            key: '/admin/upgrade',
            label: (
              <Link href="/admin/upgrade">
                <strong>{upgradeMessage}</strong>
              </Link>
            ),
            icon: <DownloadOutlined />,
          },
        ]
      : []),
    {
      key: '/admin/help',
      label: <Link href="/admin/help">{nav(Localization.Admin.Nav.help, '帮助')}</Link>,
      icon: <QuestionCircleOutlined />,
    },
  ];

  const [openKeys, setOpenKeys] = useState(openMenuItems);

  const onOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  useEffect(() => {
    menuItems.forEach(item =>
      item?.children?.forEach(child => {
        if (child?.key === route) setOpenKeys([...openMenuItems, item.key]);
      }),
    );
  }, []);

  // The per-plugin configure page is a query-string route
  // (/admin/plugins/configure?id=...), so the literal-key match above
  // doesn't fire when navigating to a specific plugin. Open the plugins
  // submenu whenever the URL is anywhere in /admin/plugins.
  useEffect(() => {
    if (route && route.startsWith('/admin/plugins')) {
      setOpenKeys(prev => (prev.includes('plugins-menu') ? prev : [...prev, 'plugins-menu']));
    }
  }, [route]);

  return (
    <Layout id="admin-page" className={appClass}>
      <Head>
        <title>{nav(Localization.Admin.Nav.adminTitle, '管理后台')}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {serverError?.type === 'OWNCAST_SERVICE_UNREACHABLE' && (
        <FatalErrorStateModal
          title={nav(Localization.Admin.Nav.serverUnreachable, '无法连接服务器')}
          message={serverError.msg}
        />
      )}

      <Sider width={240} className="side-nav">
        <h1 className="owncast-title">
          <span className="logo-container">
            <OwncastLogo variant="simple" />
          </span>
          <span className="title-label">{nav(Localization.Admin.Nav.adminTitle, '管理后台')}</span>
        </h1>
        <Menu
          mode="inline"
          theme="dark"
          className="menu-container"
          items={menuItems}
          selectedKeys={[route || '/admin']}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
        />
      </Sider>

      <Layout className="layout-main">
        <Header className="layout-header">
          <Space orientation="horizontal">
            <Tooltip title={nav(Localization.Admin.Nav.composePostTooltip, '向社交关注者发布帖子')}>
              <Button
                type="link"
                icon={<EditOutlined />}
                size="small"
                onClick={handleCreatePostButtonPressed}
                style={{ display: federationEnabled ? 'block' : 'none', margin: '10px' }}
              >
                {nav(Localization.Admin.Nav.composePost, '发布帖子')}
              </Button>
            </Tooltip>
          </Space>
          <div className="global-stream-title-container">
            <TextFieldWithSubmit
              fieldName="streamTitle"
              {...TEXTFIELD_PROPS_STREAM_TITLE}
              placeholder={nav(
                Localization.Admin.Nav.streamTitlePlaceholder,
                '你正在直播什么？（直播标题）',
              )}
              value={currentStreamTitle}
              initialValue={instanceDetails.streamTitle}
              onChange={handleStreamTitleChanged}
            />
          </div>
          <Space orientation="horizontal">{statusIndicator}</Space>
        </Header>

        {headerAlertMessage}

        <Content className="main-content-container">{children}</Content>

        <Footer className="footer-container">
          <a href="https://owncast.online/?source=admin" target="_blank" rel="noopener noreferrer">
            {nav(Localization.Admin.Nav.aboutOwncast, '关于 Owncast v{{version}}').replace(
              '{{version}}',
              versionNumber || '',
            )}
          </a>
        </Footer>
      </Layout>

      <ComposeFederatedPost
        open={postModalDisplayed}
        handleClose={() => setPostModalDisplayed(false)}
      />
    </Layout>
  );
};
