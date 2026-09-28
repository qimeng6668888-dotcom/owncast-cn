import { intervalToDuration, formatDistanceToNow, formatDuration } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { FC, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import { useSelectedLanguage, useTranslation } from 'next-export-i18n';
import { Localization } from '../../../types/localization';
import styles from './Statusbar.module.scss';

// Lazy loaded components
const EyeFilled = dynamic(() => import('@ant-design/icons/EyeFilled'), {
  ssr: false,
});

export type StatusbarProps = {
  online: Boolean;
  lastConnectTime?: Date;
  lastDisconnectTime?: Date;
  viewerCount: number;
  className?: string;
};

function makeDurationString(lastConnectTime: Date, locale?: typeof zhCN): string {
  const diff = intervalToDuration({ start: lastConnectTime, end: new Date() });
  const options = locale ? { locale } : undefined;
  if (diff.days >= 1) {
    return formatDuration(
      {
        days: diff.days,
        hours: diff.hours > 0 ? diff.hours : 0,
      },
      options,
    );
  }
  if (diff.hours >= 1) {
    return formatDuration(
      {
        hours: diff.hours,
        minutes: diff.minutes > 0 ? diff.minutes : 0,
      },
      options,
    );
  }
  return formatDuration(
    {
      minutes: diff.minutes > 0 ? diff.minutes : 0,
      seconds: diff.seconds > 0 ? diff.seconds : 0,
    },
    options,
  );
}

export const Statusbar: FC<StatusbarProps> = ({
  online,
  lastConnectTime = null,
  lastDisconnectTime = null,
  viewerCount,
  className,
}) => {
  const { t } = useTranslation();
  const { lang } = useSelectedLanguage();
  const dateLocale = lang === 'en' ? undefined : zhCN;
  const [, setNow] = useState(new Date());

  // Set a timer to update the status bar.
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  let onlineMessage = '';
  let rightSideMessage: any;
  if (online && lastConnectTime) {
    const duration = makeDurationString(new Date(lastConnectTime), dateLocale);
    onlineMessage = t(Localization.Frontend.liveFor, { duration });
    rightSideMessage = viewerCount > 0 && (
      <>
        <span className={styles.viewerIcon}>
          <EyeFilled />
        </span>
        <span>{` ${viewerCount}`}</span>
      </>
    );
  } else if (!online) {
    onlineMessage = t(Localization.Frontend.streamOffline);
    if (lastDisconnectTime) {
      rightSideMessage = t(Localization.Frontend.lastLiveAgo, {
        timeAgo: formatDistanceToNow(new Date(lastDisconnectTime), {
          locale: dateLocale,
        }),
      });
    }
  }

  return (
    <div className={classNames(styles.statusbar, className)}>
      <span className={styles.onlineMessage}>{onlineMessage}</span>
      <span className={styles.viewerCount}>{rightSideMessage}</span>
    </div>
  );
};
