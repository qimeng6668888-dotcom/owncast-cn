import cn from 'classnames';
import { FC } from 'react';
import Linkify from 'react-linkify';
import { Logo } from '../../ui/Logo/Logo';
import styles from './ContentHeader.module.scss';

export type ContentHeaderProps = {
  name: string;
  summary: string;
  logo: string;
};

export const ContentHeader: FC<ContentHeaderProps> = ({ name, summary, logo }) => (
  <div className={styles.root}>
    <div className={styles.logoTitleSection}>
      <div className={styles.logo}>
        <Logo src={logo} />
      </div>
      <div className={styles.titleSection}>
        <h2 className={cn(styles.title, styles.row, 'header-title')}>{name}</h2>
        <h3 className={cn(styles.subtitle, styles.row, 'header-subtitle')}>
          <Linkify>{summary}</Linkify>
        </h3>
      </div>
    </div>
  </div>
);
