import { Alert, Button, Input, Space, Spin, Collapse } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-export-i18n';
import styles from './FediAuthModal.module.scss';
import { Localization } from '../../../types/localization';
import { Translation } from '../../ui/Translation/Translation';
import { translated } from '../../../utils/playerLanguage';
import { isValidFediverseAccount } from '../../../utils/validators';
import {
  getPendingFediverseAuth,
  setPendingFediverseAuth,
  clearPendingFediverseAuth,
} from '../../../utils/fediverseAuthSession';

// Lazy loaded components

const CheckCircleOutlined = dynamic(() => import('@ant-design/icons/CheckCircleOutlined'), {
  ssr: false,
});

export type FediAuthModalProps = {
  authenticated: boolean;
  displayName: string;
  accessToken: string;
};

export const FediAuthModal: FC<FediAuthModalProps> = ({
  authenticated,
  displayName,
  accessToken,
}) => {
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(false);
  const [account, setAccount] = useState('');
  const [code, setCode] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);

  // Restore an in-progress verification if the viewer left and came back (e.g.
  // backgrounded the tab to copy their code) within the OTP lifetime.
  useEffect(() => {
    const pending = getPendingFediverseAuth();
    if (pending) {
      setAccount(pending.account);
      setValid(isValidFediverseAccount(pending.account));
      setVerifyingCode(true);
    }
  }, []);

  const message = !authenticated ? (
    <Translation
      translationKey={Localization.Frontend.Auth.fediIntro}
      vars={{ displayName }}
      defaultText="在联邦宇宙接收私信，把账号关联到 {{displayName}}，或登录以前关联过的聊天用户。"
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

  const validate = (acct: string) => {
    setValid(isValidFediverseAccount(acct));
  };

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccount(e.target.value);
    validate(e.target.value);
  };

  const makeRequest = async (url, data) => {
    const rawResponse = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    let content: { message?: string } = {};
    try {
      content = await rawResponse.json();
    } catch {
      // Non-JSON response; the status check below handles it.
    }

    if (content.message) {
      // Callers set the error message, so just surface it.
      setLoading(false);
      throw new Error(content.message);
    }
    if (!rawResponse.ok) {
      setLoading(false);
      throw new Error(
        translated(t, Localization.Frontend.Auth.somethingWentWrong, '出了点问题，请再试一次。'),
      );
    }
  };

  const submitCodePressed = async () => {
    setLoading(true);
    const url = `/api/auth/fediverse/verify?accessToken=${accessToken}`;
    const data = { code };

    try {
      await makeRequest(url, data);

      // Verified. Drop the persisted state and reload the page.
      clearPendingFediverseAuth();
      window.location.href = '/';
    } catch (e) {
      console.error(e);
      setErrorMessage(e.message);
    }
    setLoading(false);
  };

  const submitAccountPressed = async () => {
    if (!valid) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    const url = `/api/auth/fediverse?accessToken=${accessToken}`;
    const normalizedAccount = account.replace(/^@+/, '');
    const data = { account: normalizedAccount };

    try {
      await makeRequest(url, data);
      setPendingFediverseAuth(normalizedAccount);
      setVerifyingCode(true);
    } catch (e) {
      console.error(e);
      setErrorMessage(e.message);
    }
    setLoading(false);
  };

  const inputCodeStep = (
    <div>
      {translated(
        t,
        Localization.Frontend.Auth.pasteCode,
        '粘贴发送到你的联邦宇宙账号的验证码。如果没有收到，请确认你可以接收私信。',
      )}
      <div className={styles.codeInputContainer}>
        <Input
          value={code}
          onChange={e => setCode(e.target.value)}
          className={styles.codeInput}
          placeholder="123456"
          maxLength={6}
        />
        <Button
          type="primary"
          onClick={submitCodePressed}
          disabled={code.length < 6}
          className={styles.submitButton}
        >
          {translated(t, Localization.Frontend.Auth.verifyCode, '验证')}
        </Button>
      </div>
    </div>
  );

  const inputAccountStep = (
    <>
      <div>
        {translated(t, Localization.Frontend.Auth.yourFediverseAccount, '你的联邦宇宙账号')}
      </div>
      <Input.Search
        addonBefore="@"
        onInput={onInput}
        value={account}
        placeholder="youraccount@yourserver.com"
        status={!valid && account.length > 0 ? 'error' : undefined}
        onSearch={submitAccountPressed}
        enterButton={
          <Button type={valid ? 'primary' : 'default'} disabled={!valid || account.length === 0}>
            <CheckCircleOutlined />
          </Button>
        }
      />
    </>
  );

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
        {verifyingCode ? inputCodeStep : inputAccountStep}
        <Collapse
          ghost
          items={[
            {
              key: 'header',
              label: translated(
                t,
                Localization.Frontend.Auth.learnFedi,
                '了解如何用联邦宇宙登录聊天。',
              ),
              children: (
                <p>
                  <Translation
                    translationKey={Localization.Frontend.Auth.fediBody}
                    defaultText="你可以把聊天身份和联邦宇宙身份关联起来。下次使用这个聊天身份时，可以再次通过联邦宇宙验证。"
                  />
                </p>
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
