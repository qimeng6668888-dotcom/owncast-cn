import { EntryGateConfig } from '../../../interfaces/client-config.model';

export const defaultEntryGate: EntryGateConfig = {
  enabled: true,
  title: '擒龙直播间 实名验证',
  body: '为了保障直播间交流环境，新观众请填写您的真实姓名进入观看。',
  placeholder: '请输入您的真实姓名',
  button: '填写姓名 进入直播间',
  footer: '个人信息仅用于实名风控，已加密保护。',
};

export const entryGateWithDefaults = (gate?: Partial<EntryGateConfig> | null): EntryGateConfig => ({
  enabled: gate?.enabled ?? defaultEntryGate.enabled,
  title: gate?.title || defaultEntryGate.title,
  body: gate?.body || defaultEntryGate.body,
  placeholder: gate?.placeholder || defaultEntryGate.placeholder,
  button: gate?.button || defaultEntryGate.button,
  footer: gate?.footer || defaultEntryGate.footer,
  crest: gate?.crest || '',
});
