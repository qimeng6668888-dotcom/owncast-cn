import { Alert, Input, Space, Spin, Collapse, Typography, Button } from 'antd';
import dynamic from 'next/dynamic';
import React, { FC, useState } from 'react';
import { useTranslation } from 'next-export-i18n';
import { isValidUrl } from '../../../utils/validators';
import { Localization } from '../../../types/localization';
import { Translation } from '../../ui/Translation/Translation';
import { translated } from '../../../utils/playerLanguage';

const { Link } = Typography;

// Lazy loaded components

const CheckCircleOutlined = dynamic(() => import('@ant-design/icons/CheckCircleOutlined'), {
  ssr: false,
});

export type IndieAuthModalProps = {
  authenticated: boolean;
  displayName: string;
  accessToken: string;
};

export const IndieAuthModal: FC<IndieAuthModalProps> = ({
  authenticated,
  displayName: username,
  accessToken,
}) => {
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(false);
  const [host, setHost] = useState('');

  const message = !authenticated ? (
    <Translation
      translationKey={Localization.Frontend.Auth.indieIntro}
      vars={{ username }}
      defaultText="使用你自己的域名验证 {{username}}，或通过 IndieAuth 登录以前验证过的聊天用户。"
    />
  ) : (
    <Translation
      translationKey={Localization.Frontend.Auth.alreadyAuthenticated}
      defaultText="<b>你已经登录</b>。你仍然可以添加其他域名，或换一个用户登录。"
    />
  );

  let errorMessageText = errorMessage;
  if (errorMessageText) {
    if (errorMessageText.includes('url does not support indieauth')) {
      errorMessageText = translated(
        t,
        Localization.Frontend.Auth.indieAuthUnsupported,
        '提供的网址无效，或不支持 IndieAuth。',
      );
    }
  }

  const validate = (url: string) => {
    if (!isValidUrl(url)) {
      setValid(false);
      return;
    }

    if (!url.includes('.')) {
      setValid(false);
      return;
    }

    setValid(true);
  };

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Don't allow people to type custom ports or protocols.
    const char = (e.nativeEvent as any).data;
    if (char === ':') {
      return;
    }

    setHost(e.target.value);
    const h = `https://${e.target.value}`;
    validate(h);
  };

  const submitButtonPressed = async () => {
    if (!valid) {
      return;
    }

    setLoading(true);

    try {
      const url = `/api/auth/indieauth?accessToken=${accessToken}`;
      const h = `https://${host}`;
      const data = { authHost: h };
      const rawResponse = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const content = await rawResponse.json();
      if (content.message) {
        setErrorMessage(content.message);
        setLoading(false);
        return;
      }
      if (!content.redirect) {
        setErrorMessage(
          translated(t, Localization.Frontend.Auth.redirectMissing, '认证服务没有返回跳转地址。'),
        );
        setLoading(false);
        return;
      }

      if (content.redirect) {
        const { redirect } = content;
        window.location = redirect;
      }
    } catch (e) {
      setErrorMessage(e.message);
    }

    setLoading(false);
  };

  return (
    <Spin spinning={loading}>
      <Space orientation="vertical">
        {message}
        {errorMessageText && (
          <Alert
            message={translated(t, Localization.Frontend.Auth.errorTitle, '错误')}
            description={errorMessageText}
            type="error"
            showIcon
          />
        )}
        <div>{translated(t, Localization.Frontend.Auth.yourDomain, '你的域名')}</div>
        <Input.Search
          addonBefore="https://"
          onInput={onInput}
          type="url"
          value={host}
          placeholder="yoursite.com"
          status={!valid && host.length > 0 ? 'error' : undefined}
          onSearch={submitButtonPressed}
          enterButton={
            <Button type={valid ? 'primary' : 'default'} disabled={!valid || host.length === 0}>
              <CheckCircleOutlined />
            </Button>
          }
        />

        <Collapse
          ghost
          items={[
            {
              key: 'header',
              label: translated(
                t,
                Localization.Frontend.Auth.learnIndieAuth,
                '了解如何用 IndieAuth 登录聊天。',
              ),
              children: (
                <>
                  <p>
                    <Translation
                      translationKey={Localization.Frontend.Auth.indieAuthBody1}
                      defaultText="IndieAuth 让你用自己的域名，以完全独立、去中心化的方式证明身份。"
                    />
                  </p>
                  <p>
                    <Translation
                      translationKey={Localization.Frontend.Auth.indieAuthBody2}
                      defaultText="如果你自己运行 Owncast，可以直接使用那个域名。否则可以了解如何支持 IndieAuth。"
                    />{' '}
                    <Link href="https://indieauth.net/#providers">IndieAuth</Link>
                  </p>
                </>
              ),
            },
          ]}
        />
        <div>
          <Translation
            translationKey={Localization.Frontend.Auth.note}
            defaultText="<strong>说明</strong>：这只用于身份验证，不会读取或保存个人资料。"
          />
        </div>
      </Space>
    </Spin>
  );
};
