import { useContext, useEffect, useState } from 'react';
import { Button, Input, Upload } from 'antd';
import { RcFile } from 'antd/lib/upload/interface';
import dynamic from 'next/dynamic';
import { ServerStatusContext } from '../../../../utils/server-status-context';
import { postConfigUpdateToAPI, RESET_TIMEOUT } from '../../../../utils/config-constants';
import {
  createInputStatus,
  STATUS_ERROR,
  STATUS_PROCESSING,
  STATUS_SUCCESS,
  StatusState,
} from '../../../../utils/input-statuses';
import { ACCEPTED_IMAGE_TYPES, getBase64, MAX_IMAGE_FILESIZE } from '../../../../utils/images';
import { PageFigure } from '../../../ui/PageFigure/PageFigure';
import { FormStatusIndicator } from '../../FormStatusIndicator';

const COPY_ENDPOINT = '/pagefigure';
const IMAGE_ENDPOINT = '/pagefigure/image';

const UploadOutlined = dynamic(() => import('@ant-design/icons/UploadOutlined'), { ssr: false });
const DeleteOutlined = dynamic(() => import('@ant-design/icons/DeleteOutlined'), { ssr: false });

const postConfig = (apiPath: string, data: { value: unknown }): Promise<void> =>
  new Promise((resolve, reject) => {
    postConfigUpdateToAPI({
      apiPath,
      data,
      onSuccess: () => resolve(),
      onError: (message: string) => reject(new Error(message || '保存失败')),
    });
  });

export const PageFigureConfig = () => {
  const { serverConfig, setFieldInConfigState } = useContext(ServerStatusContext);
  const saved = serverConfig?.instanceDetails?.pageFigure;
  const [title, setTitle] = useState(saved?.title || '');
  const [body, setBody] = useState(saved?.body || '');
  const [image, setImage] = useState(saved?.image || '');
  const [status, setStatus] = useState<StatusState>(null);

  useEffect(() => {
    setTitle(saved?.title || '');
    setBody(saved?.body || '');
    setImage(saved?.image || '');
  }, [saved?.title, saved?.body, saved?.image]);

  const remember = (next: { title: string; body: string; image: string }) => {
    setFieldInConfigState?.({ fieldName: 'pageFigure', value: next, path: 'instanceDetails' });
  };

  const saveCopy = async () => {
    setStatus(createInputStatus(STATUS_PROCESSING));
    try {
      await postConfig(COPY_ENDPOINT, { value: { title, body } });
      remember({ title, body, image });
      setStatus(createInputStatus(STATUS_SUCCESS));
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      setStatus(createInputStatus(STATUS_ERROR, message));
    }
    window.setTimeout(() => setStatus(null), RESET_TIMEOUT);
  };

  const beforeUpload = (file: RcFile) => {
    if (file.size > MAX_IMAGE_FILESIZE) {
      setStatus(createInputStatus(STATUS_ERROR, '图片不能超过 2MB'));
      return false;
    }
    getBase64(file, result => {
      if (typeof result !== 'string') {
        return;
      }
      setImage(result);
      postConfig(IMAGE_ENDPOINT, { value: result })
        .then(() => {
          remember({ title, body, image: result });
          setStatus(createInputStatus(STATUS_SUCCESS));
        })
        .catch((error: Error) => {
          setStatus(createInputStatus(STATUS_ERROR, error.message));
        });
    });
    return false;
  };

  const removeImage = () => {
    postConfig(IMAGE_ENDPOINT, { value: '' })
      .then(() => {
        setImage('');
        remember({ title, body, image: '' });
        setStatus(createInputStatus(STATUS_SUCCESS));
      })
      .catch((error: Error) => {
        setStatus(createInputStatus(STATUS_ERROR, error.message));
      });
  };

  return (
    <div className="formfield-container">
      <div className="label-side">
        <span className="formfield-label">图文</span>
      </div>
      <div className="input-side">
        <p className="field-tip">放在页面正文下面。手机上标题、文字和图片竖排成一条长图。</p>
        <Input
          value={title}
          maxLength={40}
          placeholder="主标题"
          onChange={event => setTitle(event.target.value)}
          style={{ marginBottom: 8 }}
        />
        <Input.TextArea
          value={body}
          maxLength={400}
          rows={3}
          placeholder="描述文字"
          onChange={event => setBody(event.target.value)}
        />
        <div style={{ display: 'flex', gap: 8, margin: '8px 0' }}>
          <Upload
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            showUploadList={false}
            beforeUpload={beforeUpload}
          >
            <Button icon={<UploadOutlined />}>上传图片</Button>
          </Upload>
          <Button icon={<DeleteOutlined />} onClick={removeImage}>
            移除图片
          </Button>
          <Button
            type="primary"
            onClick={() => {
              saveCopy().catch(() => {});
            }}
          >
            保存图文
          </Button>
        </div>
        <FormStatusIndicator status={status} />
        <PageFigure figure={{ title, body, image }} />
      </div>
    </div>
  );
};
