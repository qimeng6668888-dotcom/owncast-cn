import { localizeChatSystemBody } from '../utils/chatSystemCopy';

describe('localizeChatSystemBody', () => {
  it('rewrites the stream start and stop lines', () => {
    expect(
      localizeChatSystemBody('<p>Stay tuned, the stream is <strong>starting</strong>!</p>'),
    ).toBe('<p>直播即将开始，请稍候。</p>');
    expect(localizeChatSystemBody('<p>The stream is ending.</p>')).toBe('<p>直播已结束。</p>');
  });

  it('rewrites join-adjacent system lines and leaves other text', () => {
    expect(localizeChatSystemBody('<p><strong>张三</strong> has been removed from chat.</p>')).toBe(
      '<p><strong>张三</strong> 已被移出聊天。</p>',
    );
    expect(localizeChatSystemBody('欢迎来到直播间')).toBe('欢迎来到直播间');
  });
});
