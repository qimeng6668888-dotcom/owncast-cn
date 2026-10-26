import { FC } from 'react';
import { localizeChatSystemBody } from '../../../utils/chatSystemCopy';
import styles from './ChatActionMessage.module.scss';

/* eslint-disable react/no-danger */
export type ChatActionMessageProps = {
  body: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ChatActionMessage: FC<ChatActionMessageProps> = ({ body }) => (
  <div className={styles.chatActionPadding}>
    <div
      id="owncast-chat-action-message-text"
      dangerouslySetInnerHTML={{ __html: localizeChatSystemBody(body) }}
      className={styles.chatAction}
    />
  </div>
);
