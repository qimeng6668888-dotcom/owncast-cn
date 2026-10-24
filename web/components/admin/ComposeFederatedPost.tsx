import { FC, useState } from 'react';

import { Button, Input, Modal } from 'antd';
import { STATUS_ERROR, STATUS_SUCCESS } from '../../utils/input-statuses';
import { fetchData, FEDERATION_MESSAGE_SEND } from '../../utils/apis';
import { useAdminText } from '../../utils/adminText';

const { TextArea } = Input;

export type ComposeFederatedPostProps = {
  open: boolean;
  handleClose: () => void;
};

export const ComposeFederatedPost: FC<ComposeFederatedPostProps> = ({ open, handleClose }) => {
  const tx = useAdminText();
  const [content, setContent] = useState('');
  const [postPending, setPostPending] = useState(false);
  const [postSuccessState, setPostSuccessState] = useState(null);

  function handleEditorChange(e) {
    setContent(e.target.value);
  }

  function close() {
    setPostPending(false);
    setPostSuccessState(null);
    handleClose();
  }

  async function sendButtonClicked() {
    setPostPending(true);

    const data = {
      value: content,
    };
    try {
      await fetchData(FEDERATION_MESSAGE_SEND, {
        data,
        method: 'POST',
        auth: true,
      });
      setPostSuccessState(STATUS_SUCCESS);
      setTimeout(close, 1000);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setPostSuccessState(STATUS_ERROR);
    }
    setPostPending(false);
  }

  return (
    <Modal
      destroyOnClose
      width={600}
      title={tx('Post to Followers')}
      open={open}
      onCancel={handleClose}
      footer={[
        <Button onClick={() => handleClose()}>{tx('Cancel')}</Button>,
        <Button
          type="primary"
          onClick={sendButtonClicked}
          disabled={postPending || postSuccessState}
          loading={postPending}
        >
          {postSuccessState?.toUpperCase() || tx('Post')}
        </Button>,
      ]}
    >
      <h3>
        {tx(
          'Tell the world about your future streaming plans or let your followers know to tune in.',
        )}
      </h3>
      <TextArea
        placeholder={tx("I'm still live, come join me!")}
        size="large"
        showCount
        maxLength={500}
        style={{ height: '150px', width: '100%' }}
        onChange={handleEditorChange}
      />
    </Modal>
  );
};
