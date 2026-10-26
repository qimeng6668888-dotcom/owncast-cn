import { FC, useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import {
  getDisplayNameFromQuery,
  trimUnicodeWhitespace,
} from '../../../utils/displayNameValidation';
import { getLocalStorage, setLocalStorage } from '../../../utils/localStorage';
import { requestEntryPlayback } from '../../video/entryGatePlayback';
import { MessageType } from '../../../interfaces/socket-events';
import {
  clientConfigStateAtom,
  accessTokenAtom,
  currentUserAtom,
  isClientConfigLoadedAtom,
  submitEntryNameAtom,
  websocketServiceAtom,
} from '../../stores/ClientConfigStore';
import { EntryNameCard } from './EntryNameCard';
import { entryGateWithDefaults, shouldShowEntryGate } from './defaults';
import styles from './EntryNameGate.module.scss';

const NAME_LIMIT = 30;
const ENTRY_NAME_KEY = 'entryDisplayName';
const RENAME_WAIT_MS = 4000;

export const EntryNameGate: FC = () => {
  const configLoaded = useAtomValue(isClientConfigLoadedAtom);
  const clientConfig = useAtomValue(clientConfigStateAtom);
  const accessToken = useAtomValue(accessTokenAtom);
  const currentUser = useAtomValue(currentUserAtom);
  const websocketService = useAtomValue(websocketServiceAtom);
  const submitEntryName = useAtomValue(submitEntryNameAtom);
  const [ready, setReady] = useState(false);
  const [entered, setEntered] = useState(false);
  const [name, setName] = useState('');
  const [hint, setHint] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pendingName, setPendingName] = useState<string | null>(null);
  const gate = entryGateWithDefaults(clientConfig.entryGate);

  useEffect(() => {
    // Only an explicit ?displayname= link may prefill. A saved chat nickname
    // is often an old English phrase, and must not appear in the box.
    const fromLink = getDisplayNameFromQuery(window.location.search);
    if (fromLink) {
      setName(fromLink);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!pendingName || currentUser?.displayName !== pendingName) {
      return undefined;
    }
    setLocalStorage(ENTRY_NAME_KEY, pendingName);
    setPendingName(null);
    setEntered(true);
    return undefined;
  }, [currentUser, pendingName]);

  useEffect(() => {
    if (!pendingName) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setPendingName(current => {
        if (current !== pendingName) {
          return current;
        }
        setHint('这个姓名不能使用');
        setSubmitting(false);
        return null;
      });
    }, RENAME_WAIT_MS);
    return () => window.clearTimeout(timer);
  }, [pendingName]);

  const visible = shouldShowEntryGate({
    configLoaded: configLoaded && ready,
    enabled: clientConfig.entryGate?.enabled === true,
    enteredThisVisit: entered,
  });

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

  const rememberedName = () => currentUser?.displayName || getLocalStorage(ENTRY_NAME_KEY) || '';

  const finish = (confirmed: string) => {
    setLocalStorage(ENTRY_NAME_KEY, confirmed);
    setEntered(true);
  };

  const submit = async () => {
    const trimmed = trimUnicodeWhitespace(name);
    if (!trimmed) {
      setHint('请填写姓名');
      return;
    }
    if ([...trimmed].length > NAME_LIMIT) {
      setHint('姓名最多 30 个字');
      return;
    }
    // The click starts playback immediately. Renaming is one chat message
    // and does not gate the video.
    requestEntryPlayback();
    setSubmitting(true);
    setHint('');

    if (accessToken && trimmed === rememberedName()) {
      finish(trimmed);
      return;
    }

    if (!accessToken) {
      if (!submitEntryName) {
        setHint('页面还在准备，请再试一次');
        setSubmitting(false);
        return;
      }
      await submitEntryName.submit(trimmed);
      finish(trimmed);
      return;
    }

    if (!websocketService?.isConnected()) {
      setHint('页面还在准备，请再试一次');
      setSubmitting(false);
      return;
    }
    setPendingName(trimmed);
    websocketService.send({ type: MessageType.NAME_CHANGE, newName: trimmed });
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
          onDismissAttempt={() => setHint('请填写姓名后再进入')}
        />
      </div>
    </div>
  );
};
