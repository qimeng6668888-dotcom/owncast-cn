import { useContext, useEffect, useState } from 'react';
import { Button, Input, Space, Typography, Upload } from 'antd';
import { RcFile } from 'antd/lib/upload/interface';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-export-i18n';
import { FormStatusIndicator } from '../../FormStatusIndicator';
import { ServerStatusContext } from '../../../../utils/server-status-context';
import { postConfigUpdateToAPI, RESET_TIMEOUT } from '../../../../utils/config-constants';
import {
  createInputStatus,
  STATUS_ERROR,
  STATUS_PROCESSING,
  STATUS_SUCCESS,
  StatusState,
} from '../../../../utils/input-statuses';
import { NEXT_PUBLIC_API_HOST } from '../../../../utils/apis';
import { Localization } from '../../../../types/localization';
import {
  ACCEPTED_IMAGE_TYPES,
  getBase64,
  MAX_IMAGE_FILESIZE,
  readableBytes,
} from '../../../../utils/images';
import { appearanceWithBrand, isBrandHex, readBrandColors } from '../../../../utils/branding';
import { translated } from '../../../../utils/playerLanguage';

const { Title, Paragraph } = Typography;

const NAME_ENDPOINT = '/name';
const LOGO_ENDPOINT = '/logo';
const APPEARANCE_ENDPOINT = '/appearance';

const UploadOutlined = dynamic(() => import('@ant-design/icons/UploadOutlined'), {
  ssr: false,
});

const DeleteOutlined = dynamic(() => import('@ant-design/icons/DeleteOutlined'), {
  ssr: false,
});

type LogoChange = { kind: 'keep' } | { kind: 'upload'; dataUrl: string } | { kind: 'delete' };

const postConfig = (apiPath: string, data: { value: unknown }): Promise<void> =>
  new Promise((resolve, reject) => {
    postConfigUpdateToAPI({
      apiPath,
      data,
      onSuccess: () => resolve(),
      onError: (message: string) => reject(new Error(message || 'error')),
    });
  });

// eslint-disable-next-line react/function-component-definition
export default function BrandingConfig() {
  const { t } = useTranslation();
  const text = (key: string, fallback: string) => translated(t, key, fallback);
  const serverStatusData = useContext(ServerStatusContext);
  const { serverConfig, setFieldInConfigState } = serverStatusData || {};
  const instanceDetails = serverConfig?.instanceDetails;
  const savedName = instanceDetails?.name || '';
  const savedColors = readBrandColors(instanceDetails?.appearanceVariables);

  const [name, setName] = useState(savedName);
  const [primary, setPrimary] = useState(savedColors.primary);
  const [accent, setAccent] = useState(savedColors.accent);
  const [dirty, setDirty] = useState(false);
  const [logoChange, setLogoChange] = useState<LogoChange>({ kind: 'keep' });
  const [cacheBuster, setCacheBuster] = useState(0);
  const [submitStatus, setSubmitStatus] = useState<StatusState>(null);
  const [saving, setSaving] = useState(false);

  // Admin config arrives after the first paint. Fill the form once, and
  // leave it alone after the operator starts editing.
  useEffect(() => {
    if (dirty || !instanceDetails) {
      return;
    }
    setName(instanceDetails.name || '');
    const colors = readBrandColors(instanceDetails.appearanceVariables);
    setPrimary(colors.primary);
    setAccent(colors.accent);
  }, [dirty, instanceDetails]);

  const label = {
    title: text(Localization.Admin.Branding.title, '品牌'),
    description: text(
      Localization.Admin.Branding.description,
      '设置访客页面上显示的品牌名称、Logo 和颜色。保存后写入本机配置，刷新或重启后仍然有效。',
    ),
    name: text(Localization.Admin.Branding.nameLabel, '品牌名称'),
    namePlaceholder: text(Localization.Admin.Branding.namePlaceholder, '你的品牌名称'),
    logo: text(Localization.Admin.Branding.logoLabel, 'Logo'),
    preview: text(Localization.Admin.Branding.logoPreview, 'Logo 预览'),
    noLogo: text(Localization.Admin.Branding.noLogo, '未设置 Logo'),
    upload: text(Localization.Admin.Branding.upload, '上传'),
    deleteLogo: text(Localization.Admin.Branding.deleteLogo, '删除 Logo'),
    primary: text(Localization.Admin.Branding.primaryColor, '主色'),
    accent: text(Localization.Admin.Branding.accentColor, '强调色'),
    update: text(Localization.Admin.Branding.updateButton, '更新品牌'),
    success: text(Localization.Admin.Branding.success, '品牌已更新'),
    nameRequired: text(Localization.Admin.Branding.nameRequired, '请填写品牌名称。'),
    invalidColor: text(Localization.Admin.Branding.invalidColor, '请使用 #RRGGBB 格式的颜色。'),
  };

  const fail = (message: string) => {
    const template = text(Localization.Admin.Branding.failure, '更新品牌失败：{{message}}');
    setSubmitStatus(createInputStatus(STATUS_ERROR, template.replace('{{message}}', message)));
    setSaving(false);
  };

  const beforeUpload = (file: RcFile) => {
    if (file.size > MAX_IMAGE_FILESIZE) {
      fail(
        t(Localization.Admin.StatusMessages.fileSizeTooBig, {
          size: readableBytes(file.size),
        }),
      );
      return false;
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      fail(t(Localization.Admin.StatusMessages.fileTypeNotSupported, { type: file.type }));
      return false;
    }
    getBase64(file, (url: string) => {
      setDirty(true);
      setLogoChange({ kind: 'upload', dataUrl: url });
      setSubmitStatus(null);
    });
    return false;
  };

  const previewSrc =
    logoChange.kind === 'upload'
      ? logoChange.dataUrl
      : logoChange.kind === 'delete'
        ? ''
        : `${NEXT_PUBLIC_API_HOST || '/'}logo?random=${cacheBuster}`;

  const save = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      fail(label.nameRequired);
      return;
    }
    if (!isBrandHex(primary) || !isBrandHex(accent)) {
      fail(label.invalidColor);
      return;
    }

    setSaving(true);
    setSubmitStatus(createInputStatus(STATUS_PROCESSING));
    try {
      await postConfig(NAME_ENDPOINT, { value: trimmedName });
      setFieldInConfigState({ fieldName: 'name', value: trimmedName, path: 'instanceDetails' });

      if (logoChange.kind === 'upload') {
        await postConfig(LOGO_ENDPOINT, { value: logoChange.dataUrl });
        setFieldInConfigState({
          fieldName: 'logo',
          value: logoChange.dataUrl,
          path: 'instanceDetails',
        });
        setCacheBuster(Math.floor(Math.random() * 100));
      } else if (logoChange.kind === 'delete') {
        await postConfig(LOGO_ENDPOINT, { value: '' });
        setFieldInConfigState({ fieldName: 'logo', value: '/logo', path: 'instanceDetails' });
        setCacheBuster(Math.floor(Math.random() * 100));
      }

      const appearance = appearanceWithBrand(instanceDetails?.appearanceVariables, primary, accent);
      await postConfig(APPEARANCE_ENDPOINT, { value: appearance });
      setFieldInConfigState({
        fieldName: 'appearanceVariables',
        value: appearance,
        path: 'instanceDetails',
      });

      setLogoChange({ kind: 'keep' });
      setName(trimmedName);
      setSubmitStatus(createInputStatus(STATUS_SUCCESS, label.success));
      setSaving(false);
      setTimeout(() => setSubmitStatus(null), RESET_TIMEOUT);
    } catch (error) {
      fail(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%', maxWidth: 720 }}>
      <div>
        <Title level={3}>{label.title}</Title>
        <Paragraph>{label.description}</Paragraph>
      </div>

      <div className="formfield-container">
        <div className="label-side">
          <span className="formfield-label">{label.name}</span>
        </div>
        <div className="input-side">
          <Input
            id="brand-name"
            value={name}
            placeholder={label.namePlaceholder}
            maxLength={255}
            onChange={event => {
              setDirty(true);
              setName(event.target.value);
            }}
          />
        </div>
      </div>

      <div className="formfield-container logo-upload-container">
        <div className="label-side">
          <span className="formfield-label">{label.logo}</span>
        </div>
        <div className="input-side">
          <div className="input-group">
            {previewSrc ? (
              <img src={previewSrc} alt={label.preview} className="logo-preview" />
            ) : (
              <span>{label.noLogo}</span>
            )}
            <Upload
              name="logo"
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              showUploadList={false}
              beforeUpload={beforeUpload}
            >
              <Button icon={<UploadOutlined />}>{label.upload}</Button>
            </Upload>
            <Button
              icon={<DeleteOutlined />}
              onClick={() => {
                setDirty(true);
                setLogoChange({ kind: 'delete' });
                setSubmitStatus(null);
              }}
            >
              {label.deleteLogo}
            </Button>
          </div>
        </div>
      </div>

      <div className="formfield-container">
        <div className="label-side">
          <span className="formfield-label">{label.primary}</span>
        </div>
        <div className="input-side">
          <input
            id="brand-primary"
            type="color"
            aria-label={label.primary}
            value={isBrandHex(primary) ? primary : '#6544e9'}
            onChange={event => {
              setDirty(true);
              setPrimary(event.target.value);
            }}
          />
        </div>
      </div>

      <div className="formfield-container">
        <div className="label-side">
          <span className="formfield-label">{label.accent}</span>
        </div>
        <div className="input-side">
          <input
            id="brand-accent"
            type="color"
            aria-label={label.accent}
            value={isBrandHex(accent) ? accent : '#2386e2'}
            onChange={event => {
              setDirty(true);
              setAccent(event.target.value);
            }}
          />
        </div>
      </div>

      <div>
        <Button id="update-brand" type="primary" onClick={save} loading={saving}>
          {label.update}
        </Button>
        <FormStatusIndicator status={submitStatus} />
      </div>
    </Space>
  );
}
