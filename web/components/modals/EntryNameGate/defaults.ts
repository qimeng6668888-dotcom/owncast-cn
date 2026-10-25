import { EntryGateConfig } from '../../../interfaces/client-config.model';

export const defaultEntryGate: EntryGateConfig = {
  enabled: true,
  title: '填写姓名后进入',
  body: '请先填写姓名。进入后将以这个姓名观看直播。',
  placeholder: '请输入您的姓名',
  button: '填写姓名 进入直播间',
  footer: '姓名会显示在聊天里，用于本次观看。',
};

// The card is shown on every visit while the switch is on. A saved chat
// identity does not skip it; the typed name is confirmed again on the button.
export const shouldShowEntryGate = (input: {
  configLoaded: boolean;
  enabled: boolean;
  enteredThisVisit: boolean;
}): boolean => input.configLoaded && input.enabled && !input.enteredThisVisit;

export const entryGateWithDefaults = (gate?: Partial<EntryGateConfig> | null): EntryGateConfig => ({
  enabled: gate?.enabled ?? defaultEntryGate.enabled,
  title: gate?.title || defaultEntryGate.title,
  body: gate?.body || defaultEntryGate.body,
  placeholder: gate?.placeholder || defaultEntryGate.placeholder,
  button: gate?.button || defaultEntryGate.button,
  footer: gate?.footer || defaultEntryGate.footer,
  crest: gate?.crest || '',
});
