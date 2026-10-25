const replacements: ReadonlyArray<readonly [string, string]> = [
  ['Stay tuned, the stream is <strong>starting</strong>!', '直播即将开始，请稍候。'],
  ['Stay tuned, the stream is **starting**!', '直播即将开始，请稍候。'],
  ['The stream is ending.', '直播已结束。'],
  ['has been removed from chat.', '已被移出聊天。'],
  ['is now authenticated as', '已验证为'],
  ['liked that this stream went live.', '赞了这场直播。'],
  ['followed this stream.', '关注了这场直播。'],
  ['shared this stream with their followers.', '把这场直播分享给了关注者。'],
  [' liked a post from ', ' 赞了 '],
  [' shared a post from ', ' 转发了 '],
  [
    "Sorry, that message exceeded the maximum size and can't be delivered.",
    '这条消息太长，无法发送。',
  ],
  [
    'Sorry, that message contained language that is not allowed in this chat.',
    '这条消息包含不允许的内容。',
  ],
  [
    'You are temporarily blocked from sending chat messages due to perceived flooding.',
    '发送过于频繁，请稍后再试。',
  ],
  ['Display name cannot be empty or contain only whitespace.', '姓名不能为空。'],
  ['You cannot change your name to ', '不能改成 '],
  [
    ' has already been registered. If this is your name, please authenticate.',
    ' 已被注册。如果这是你的名字，请先验证身份。',
  ],
  ['The name **', '**'],
  [
    'You have not been an established chat participant long enough to take part in chat. Please enjoy the stream and try again later.',
    '你加入聊天的时间还不够，暂时不能发言。请先看直播，稍后再试。',
  ],
  ['Authentication is required to participate in chat.', '需要先验证身份才能发言。'],
];

// Rewrites known English chat-system sentences. Admin-written welcome text is left as stored.
export const localizeChatSystemBody = (body: string): string => {
  if (!body) {
    return body;
  }
  return replacements.reduce((next, [from, to]) => next.split(from).join(to), body);
};
