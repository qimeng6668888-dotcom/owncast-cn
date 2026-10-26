import { FC } from 'react';
import { PageFigureConfig } from '../../../interfaces/client-config.model';
import styles from './PageFigure.module.scss';

export type PageFigureProps = {
  figure?: PageFigureConfig | null;
};

export const PageFigure: FC<PageFigureProps> = ({ figure }) => {
  if (!figure?.title && !figure?.body && !figure?.image) {
    return null;
  }

  return (
    <section className={styles.figure}>
      {figure.title ? <h2 className={styles.title}>{figure.title}</h2> : null}
      {figure.body ? <p className={styles.body}>{figure.body}</p> : null}
      {figure.image ? <img className={styles.image} src={figure.image} alt="" /> : null}
    </section>
  );
};
