import { useContext, useEffect, useState } from 'react';
import { Button, Col, Input, Row, Switch, Upload } from 'antd';
import { RcFile } from 'antd/lib/upload/interface';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-export-i18n';
import { ServerStatusContext } from '../../../../utils/server-status-context';
import { postConfigUpdateToAPI, RESET_TIMEOUT } from '../../../../utils/config-constants';
import {
  createInputStatus,
  STATUS_ERROR,
  STATUS_PROCESSING,
  STATUS_SUCCESS,
  StatusState,
} from '../../../../utils/input-statuses';
import { FormStatusIndicator } from '../../FormStatusIndicator';
import { ACCEPTED_IMAGE_TYPES, getBase64, MAX_IMAGE_FILESIZE } from '../../../../utils/images';
import { EntryGateFields } from '../../../../types/config-section';
import { EntryNameCard } from '../../../modals/EntryNameGate/EntryNameCard';
import { entryGateWithDefaults } from '../../../modals/EntryNameGate/defaults';
import { translated } from '../../../../utils/playerLanguage';
import styles from './EntryGateConfig.module.scss';

const COPY_ENDPOINT = '/chat/entrygate';
const CREST_ENDPOINT = '/chat/entrygate/crest';

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

export const EntryGateConfig = () => {
  const { t } = useTranslation();
  const text = (key: string, fallback: string) => translated(t, key, fallback);
  const serverStatusData = useContext(ServerStatusContext);
  const { serverConfig, setFieldInConfigState } = serverStatusData || {};
  const saved = entryGateWithDefaults(serverConfig?.entryGate);
  const [form, setForm] = useState<EntryGateFields>(saved);
  const [crestPreview, setCrestPreview] = useState(saved.crest || '');
  const [status, setStatus] = useState<StatusState>(null);

  useEffect(() => {
    const next = entryGateWithDefaults(serverConfig?.entryGate);
    setForm(next);
    setCrestPreview(next.crest || '');
  }, [serverConfig]);

  const label = {
    title: text('Admin.EntryGate.title', '进房姓名'),
    tip: text(
      'Admin.EntryGate.tip',
      '新观众要先填写姓名。卡片以外是半透明遮罩，直播画面在后面继续加载。',
    ),
    enabled: text('Admin.EntryGate.enabled', '要求新观众填写姓名'),
    heading: text('Admin.EntryGate.heading', '标题'),
    body: text('Admin.EntryGate.body', '说明'),
    placeholder: text('Admin.EntryGate.placeholder', '输入框提示'),
    button: text('Admin.EntryGate.button', '按钮文字'),
    footer: text('Admin.EntryGate.footer', '页脚'),
    crest: text('Admin.EntryGate.crest', '顶部徽章'),
    upload: text('Admin.EntryGate.upload', '上传徽章'),
    remove: text('Admin.EntryGate.remove', '移除徽章'),
    save: text('Admin.EntryGate.save', '保存进房卡片'),
    preview: text('Admin.EntryGate.preview', '预览'),
  };

  const update = (field: keyof EntryGateFields, value: string | boolean) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  const remember = (next: EntryGateFields) => {
    setFieldInConfigState?.({ fieldName: 'entryGate', value: next });
  };

  const saveCopy = async (next: EntryGateFields) => {
    setStatus(createInputStatus(STATUS_PROCESSING));
    try {
      await postConfig(COPY_ENDPOINT, {
        value: {
          enabled: next.enabled,
          title: next.title,
          body: next.body,
          placeholder: next.placeholder,
          button: next.button,
          footer: next.footer,
        },
      });
      remember({ ...next, crest: crestPreview });
      setStatus(createInputStatus(STATUS_SUCCESS));
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      setStatus(createInputStatus(STATUS_ERROR, message));
    }
    window.setTimeout(() => setStatus(null), RESET_TIMEOUT);
  };

  const beforeUpload = (file: RcFile) => {
    if (file.size > MAX_IMAGE_FILESIZE) {
      setStatus(createInputStatus(STATUS_ERROR, '徽章图片不能超过 2MB'));
      return false;
    }
    getBase64(file, result => {
      if (typeof result !== 'string') {
        return;
      }
      setCrestPreview(result);
      postConfig(CREST_ENDPOINT, { value: result })
        .then(() => {
          remember({ ...form, crest: result });
          setStatus(createInputStatus(STATUS_SUCCESS));
        })
        .catch((error: Error) => {
          setStatus(createInputStatus(STATUS_ERROR, error.message));
        });
    });
    return false;
  };

  const removeCrest = () => {
    postConfig(CREST_ENDPOINT, { value: '' })
      .then(() => {
        setCrestPreview('');
        remember({ ...form, crest: '' });
        setStatus(createInputStatus(STATUS_SUCCESS));
      })
      .catch((error: Error) => {
        setStatus(createInputStatus(STATUS_ERROR, error.message));
      });
  };

  return (
    <div className={styles.section}>
      <h2>{label.title}</h2>
      <p className={styles.tip}>{label.tip}</p>
      <Row gutter={[24, 16]}>
        <Col xs={24} lg={12}>
          <div className={styles.switchRow}>
            <span>{label.enabled}</span>
            <Switch checked={form.enabled} onChange={checked => update('enabled', checked)} />
          </div>
          <label className={styles.line}>
            <span>{label.heading}</span>
            <Input
              value={form.title}
              maxLength={40}
              onChange={event => update('title', event.target.value)}
            />
          </label>
          <label className={styles.line}>
            <span>{label.body}</span>
            <Input.TextArea
              value={form.body}
              maxLength={160}
              autoSize={{ minRows: 2, maxRows: 4 }}
              onChange={event => update('body', event.target.value)}
            />
          </label>
          <label className={styles.line}>
            <span>{label.placeholder}</span>
            <Input
              value={form.placeholder}
              maxLength={40}
              onChange={event => update('placeholder', event.target.value)}
            />
          </label>
          <label className={styles.line}>
            <span>{label.button}</span>
            <Input
              value={form.button}
              maxLength={30}
              onChange={event => update('button', event.target.value)}
            />
          </label>
          <label className={styles.line}>
            <span>{label.footer}</span>
            <Input
              value={form.footer}
              maxLength={80}
              onChange={event => update('footer', event.target.value)}
            />
          </label>
          <div className={styles.crestActions}>
            <span>{label.crest}</span>
            <Upload
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              showUploadList={false}
              beforeUpload={beforeUpload}
            >
              <Button icon={<UploadOutlined />}>{label.upload}</Button>
            </Upload>
            <Button icon={<DeleteOutlined />} onClick={removeCrest}>
              {label.remove}
            </Button>
          </div>
          <Button
            type="primary"
            onClick={() => {
              saveCopy(form).catch(() => {});
            }}
          >
            {label.save}
          </Button>
          <FormStatusIndicator status={status} />
        </Col>
        <Col xs={24} lg={12}>
          <div className={styles.preview}>
            <p>{label.preview}</p>
            <EntryNameCard
              title={form.title}
              body={form.body}
              placeholder={form.placeholder}
              buttonLabel={form.button}
              footer={form.footer}
              crestUrl={crestPreview}
              readOnly
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};
