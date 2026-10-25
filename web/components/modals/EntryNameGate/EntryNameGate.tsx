import { FC, useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import {
  getDisplayNameFromQuery,
  trimUnicodeWhitespace,
} from '../../../utils/displayNameValidation';
import { getLocalStorage } from '../../../utils/localStorage';
import { requestEntryPlayback } from '../../video/entryGatePlayback';
import {
  clientConfigStateAtom,
  accessTokenAtom,
  isClientConfigLoadedAtom,
  submitEntryNameAtom,
} from '../../stores/ClientConfigStore';
import { EntryNameCard } from './EntryNameCard';
import { entryGateWithDefaults } from './defaults';
import styles from './EntryNameGate.module.scss';

const NAME_LIMIT = 30;

export const EntryNameGate: FC = () => {
  const configLoaded = useAtomValue(isClientConfigLoadedAtom);
  const clientConfig = useAtomValue(clientConfigStateAtom);
  const accessToken = useAtomValue(accessTokenAtom);
  const submitEntryName = useAtomValue(submitEntryNameAtom);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [savedToken, setSavedToken] = useState(true);
  const [name, setName] = useState('');
  const [hint, setHint] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const gate = entryGateWithDefaults(clientConfig.entryGate);

  useEffect(() => {
    const stored = !!getLocalStorage('accessToken');
    setSavedToken(stored);
    setCheckedStorage(true);
    if (!stored) {
      const fromLink = getDisplayNameFromQuery(window.location.search);
      if (fromLink) {
        setName(fromLink);
      }
    }
  }, []);

  useEffect(() => {
    if (!checkedStorage) {
      return undefined;
    }
    if (accessToken) {
      setSavedToken(true);
      return undefined;
    }
    // A dropped chat identity (ERROR_NEEDS_REGISTRATION) clears the saved
    // token. Show the card again instead of registering an English name.
    setSavedToken(!!getLocalStorage('accessToken'));
    return undefined;
  }, [accessToken, checkedStorage]);

  const visible =
    checkedStorage &&
    configLoaded &&
    clientConfig.entryGate?.enabled === true &&
    !accessToken &&
    !savedToken;

  useEffect(() => {
    if (!visible) {
      return undefined;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [visible]);

  if (!visible) {
    return null;
  }

  const submit = async () => {
    const trimmed = trimUnicodeWhitespace(name);
    if (!trimmed) {
      setHint('请填写真实姓名');
      return;
    }
    if ([...trimmed].length > NAME_LIMIT) {
      setHint('姓名最多 30 个字');
      return;
    }
    if (!submitEntryName) {
      setHint('页面还在准备，请再试一次');
      return;
    }
    requestEntryPlayback();
    setSubmitting(true);
    setHint('');
    try {
      await submitEntryName.submit(trimmed);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      setHint(message || '这个姓名不能使用');
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.backdrop} role="presentation">
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-label={gate.title}>
        <EntryNameCard
          title={gate.title}
          body={gate.body}
          placeholder={gate.placeholder}
          buttonLabel={gate.button}
          footer={gate.footer}
          crestUrl={gate.crest}
          name={name}
          hint={hint}
          submitting={submitting}
          onNameChange={setName}
          onSubmit={() => {
            submit().catch(() => {
              setHint('这个姓名不能使用');
              setSubmitting(false);
            });
          }}
          onDismissAttempt={() => setHint('请填写真实姓名后再进入')}
        />
      </div>
    </div>
  );
};
