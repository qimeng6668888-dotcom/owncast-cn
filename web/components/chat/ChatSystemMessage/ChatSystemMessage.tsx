import { FC } from 'react';
import cn from 'classnames';
import { Interweave } from 'interweave';
import { UrlMatcher } from 'interweave-autolink';
import { useTranslation } from 'next-export-i18n';

import { ChatMessage } from '../../../interfaces/chat-message.model';
import styles from './ChatSystemMessage.module.scss';
import { ChatMessageHighlightMatcher } from '../ChatUserMessage/customMatcher';
import { Localization } from '../../../types/localization';
import { translated } from '../../../utils/playerLanguage';

export type ChatSystemMessageProps = {
  message: ChatMessage;
  highlightString: string;
};

export const ChatSystemMessage: FC<ChatSystemMessageProps> = ({
  message: {
    body,
    user: { displayName },
  },
  highlightString,
}) => {
  const { t } = useTranslation();
  const content =
    body === 'The stream is ending.'
      ? translated(t, Localization.Frontend.Chat.streamEnding, '直播即将结束。')
      : body;

  return (
    <div className={styles.chatSystemMessagePadding}>
      <div className={cn([styles.chatSystemMessage, 'chat-message_system'])}>
        <div className={styles.user}>
          <span className={styles.userName}>{displayName}</span>
        </div>
        <Interweave
          className={styles.message}
          content={content}
          matchers={[
            new UrlMatcher('url', { customTLDs: ['online'] }),
            new ChatMessageHighlightMatcher('highlight', { highlightString }),
          ]}
        />
      </div>
    </div>
  );
};
