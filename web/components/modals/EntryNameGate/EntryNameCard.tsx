import { FC, FormEvent, KeyboardEvent } from 'react';
import styles from './EntryNameCard.module.scss';

export type EntryNameCardProps = {
  title: string;
  body: string;
  placeholder: string;
  buttonLabel: string;
  footer: string;
  crestUrl?: string;
  name?: string;
  hint?: string;
  submitting?: boolean;
  readOnly?: boolean;
  onNameChange?: (value: string) => void;
  onSubmit?: () => void;
  onDismissAttempt?: () => void;
};

const PlayBadge = () => (
  <svg className={styles.badge} viewBox="0 0 72 72" aria-hidden="true">
    <circle cx="36" cy="36" r="34" />
    <path d="M30 24l22 12-22 12z" />
  </svg>
);

export const EntryNameCard: FC<EntryNameCardProps> = ({
  title,
  body,
  placeholder,
  buttonLabel,
  footer,
  crestUrl,
  name = '',
  hint,
  submitting = false,
  readOnly = false,
  onNameChange,
  onSubmit,
  onDismissAttempt,
}) => {
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (readOnly) {
      return;
    }
    onSubmit?.();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onDismissAttempt?.();
    }
  };

  return (
    <form className={styles.card} onSubmit={submit} onKeyDown={onKeyDown}>
      <div className={styles.crest}>
        {crestUrl ? <img className={styles.crestImage} src={crestUrl} alt="" /> : <PlayBadge />}
      </div>
      <button
        type="button"
        className={styles.close}
        aria-label="关闭"
        onClick={() => onDismissAttempt?.()}
      >
        ×
      </button>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.body}>{body}</p>
      <label className={styles.field}>
        <span className={styles.person} aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="3.2" />
            <path d="M5.5 19.2c1.2-3 3.5-4.5 6.5-4.5s5.3 1.5 6.5 4.5" />
          </svg>
        </span>
        <input
          lang="zh-CN"
          name="real-name"
          autoComplete="name"
          enterKeyHint="done"
          maxLength={30}
          placeholder={placeholder}
          value={name}
          readOnly={readOnly}
          aria-label={placeholder}
          onChange={event => onNameChange?.(event.target.value)}
        />
      </label>
      {hint ? <p className={styles.hint}>{hint}</p> : null}
      <button className={styles.enter} type="submit" disabled={submitting}>
        {buttonLabel}
      </button>
      <p className={styles.footer}>
        <span className={styles.shield} aria-hidden="true">
          ✓
        </span>
        {footer}
      </p>
    </form>
  );
};
