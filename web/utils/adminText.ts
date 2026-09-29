import { useSelectedLanguage } from 'next-export-i18n';

/**
 * Simplified Chinese copy for admin strings that are still hardcoded in
 * English. Lookup is exact, so sentences that contain periods stay intact.
 * English is kept when the viewer explicitly selects ?lang=en.
 */
const ZH: Record<string, string> = {
  Name: '名称',
  'Stream Title': '直播标题',
  About: '简介',
  'Offline Message': '离线提示',
  'Welcome Message': '欢迎消息',
  Logo: 'Logo',
  Favicon: '网站图标',
  'Admin Password': '管理员密码',
  'FFmpeg Path': 'FFmpeg 路径',
  'Owncast port': '网页端口',
  'RTMP port': 'RTMP 端口',
  'RTMP address': 'RTMP 地址',
  'Server URL': '服务器地址',
  'Websocket host override': 'Websocket 主机覆盖',
  'Serving Endpoint': '播放分发地址',
  'NSFW?': '成人内容？',
  'Enable directory': '加入目录',
  'Hide viewer count': '隐藏观众人数',
  'Disable search engine indexing': '禁止搜索引擎收录',
  Chat: '聊天',
  'Spam Protection': '防刷屏',
  'Join Messages': '加入提示',
  'Chat language filter': '聊天敏感词过滤',
  'Established users only': '仅限老用户',
  'Require Authentication': '需要登录才能聊天',
  'Forbidden usernames': '禁用用户名',
  'Default usernames': '默认用户名',
  'Enable Social Features': '开启社交功能',
  Private: '私密',
  'Show engagement': '显示互动',
  'Allow quotes': '允许引用',
  'Hide followers': '隐藏关注者',
  'Now Live message': '开播通知',
  Username: '用户名',
  'Potentially NSFW': '可能含成人内容',
  'Blocked domains': '屏蔽域名',
  'Resized Width': '缩放宽度',
  'Resized Height': '缩放高度',
  'Access Key': '访问密钥',
  ACL: '访问控制',
  Bucket: '存储桶',
  Endpoint: '端点',
  Region: '区域',
  'Secret key': '私密密钥',
  'Path prefix': '路径前缀',
  'Force path-style': '强制路径风格',
  'Webhook URL': 'Webhook 地址',
  'Go Live Text': '开播文案',
  lowest: '最低',
  highest: '最高',
  Lowest: '最低',
  Highest: '最高',
  ON: '开',
  OFF: '关',
  Yes: '是',
  No: '否',
  Add: '添加',
  Update: '更新',
  Edit: '编辑',
  Key: '推流码',
  Comment: '备注',
  'Loading...': '加载中...',
  'Advanced Settings': '高级设置',
  'Optional Settings': '可选设置',
  'Video configuration': '视频配置',
  'Video Bitrate': '视频码率',
  'Video bitrate': '视频码率',
  'You have only set one video quality variant. If your server has the computing resources, consider adding another, lower-quality variant, so more people can view your content!':
    '目前只有一档画质。如果服务器性能够，可以再加一档更低的画质，让更多人能看。',
  Resolution: '分辨率',
  'Video Passthrough': '视频直通',
  'Frame rate': '帧率',
  'Use Video Passthrough?': '使用视频直通？',
  'Latency Buffer': '延迟缓冲',
  'Stream Output': '输出档位',
  'Stream output': '输出档位',
  'Add a new variant': '添加一档输出',
  'Edit Video Variant Details': '编辑输出档位',
  'Read more about framerates.': '进一步了解帧率。',
  'CPU Usage': 'CPU 占用',
  'CPU or GPU Utilization': 'CPU 或 GPU 占用',
  'Framerate selection is disabled when Video Passthrough is enabled.':
    '打开视频直通后不能再选帧率。',
  'CPU usage selection is disabled when Video Passthrough is enabled.':
    '打开视频直通后不能再选 CPU 占用。',
  '24fps - Good for film, presentations, music, low power/bandwidth servers.':
    '24fps，适合电影、演示、音乐，以及性能或带宽较低的服务器。',
  '25fps - Good for film, presentations, music, low power/bandwidth servers.':
    '25fps，适合电影、演示、音乐，以及性能或带宽较低的服务器。',
  '30fps - Good for slow/casual games, chat, general purpose.':
    '30fps，适合慢节奏游戏、聊天和一般用途。',
  '50fps - Good for fast/action games, sports, HD video.': '50fps，适合动作游戏、体育和高清视频。',
  '60fps - Good for fast/action games, sports, HD video.': '60fps，适合动作游戏、体育和高清视频。',
  '90fps - Good for newer fast games and hardware.': '90fps，适合较新的快节奏游戏和硬件。',
  '120fps - Use at your own risk!': '120fps，请自行评估风险。',
  'No name': '未命名',
  'Same as source': '与源相同',
  'Customize Appearance': '自定义外观',
  'Section Colors': '分区颜色',
  'Chat User Colors': '聊天用户颜色',
  'Other Settings': '其他设置',
  'Social Items': '社交链接',
  'Social Link': '社交链接',
  'Chat Settings': '聊天设置',
  Webhooks: 'Webhooks',
  Notifications: '通知',
  Custom: '自定义',
  'Access Tokens': '访问令牌',
  'Configure Social Features': '社交功能设置',
  'Fediverse Actions': '联邦宇宙动态',
  'Fediverse Social': '联邦宇宙',
  'Browser Alerts': '浏览器提醒',
  Discord: 'Discord',
  'IP Address': 'IP 地址',
  Reason: '原因',
  Created: '创建时间',
  'Display Name': '显示名',
  'Messages sent': '已发消息',
  'Connected Time': '连接时长',
  'User Agent': '用户代理',
  Location: '位置',
  'Delete user': '删除用户',
  'Copied to clipboard': '已复制',
  'Saving Keys Error': '保存推流码失败',
  'No stream keys!': '还没有推流码',
  'My new key': '新的推流码',
  'your key': '你的推流码',
  'My OBS Key': '我的 OBS 推流码',
  'The name of your Owncast server': '服务器显示名称',
  'What is your stream about today?': '今天这场直播的内容是什么？',
  'A brief blurb about you, your server, or what your stream is about.':
    '用一两句话介绍你、这台服务器，或者这场直播。',
  'An optional message you can leave people when your stream is not live.':
    '未开播时显示给观众的可选提示。',
  'A system chat message sent to viewers when they first connect to chat. Leave blank to disable.':
    '观众第一次进入聊天时发送的系统消息。留空则关闭。',
  'Save this password somewhere safe, you will need it to login to the admin dashboard!':
    '请把这个密码保存到安全的地方，登录管理后台时要用。',
  'Absolute file path of the FFMPEG application on your server': '服务器上 FFmpeg 程序的绝对路径',
  'What port is your Owncast web server listening? Default is 8080': '网页服务监听端口。默认 8080',
  'What port should accept inbound broadcasts? Default is 1935': '接收推流的端口。默认 1935',
  'What address/interface should accept inbound broadcasts? Default is 0.0.0.0':
    '接收推流的网卡地址。默认 0.0.0.0',
  'The full url to your Owncast server.': '这台服务器的完整地址。',
  'The direct URL of your Owncast server.': '这台服务器的直连地址。',
  'Turn this ON to request to show up in the directory.': '打开后会申请出现在目录里。',
  'Turn this ON to hide the viewer count on the web page.': '打开后网页上不再显示观众人数。',
  'Turn this ON to ask search engines to not index this site.': '打开后会请搜索引擎不要收录本站。',
  'Turn the chat functionality on/off on your Owncast server.': '打开或关闭本站聊天。',
  'Limits how quickly messages can be sent to prevent spamming.': '限制发消息的速度，防止刷屏。',
  'Show when a viewer joins the chat.': '有观众加入聊天时显示提示。',
  'Filters out messages that contain offensive language.': '过滤包含冒犯用语的消息。',
  'Only users who have previously been established for some time may chat.':
    '只有待过一段时间的用户才能发言。',
  'Only users who have authenticated may chat.': '只有登录过的用户才能发言。',
  'A list of words in chat usernames you disallow.': '不允许出现在聊天用户名里的词。',
  'Send and receive activities on the Fediverse.': '在联邦宇宙收发动态。',
  'Follow requests will require approval and only followers will see your activity.':
    '关注需要你批准，只有关注者能看到动态。',
  'Following, liking and sharing will appear in the chat feed.': '关注、点赞和转发会出现在聊天里。',
  'Let people on the Fediverse quote your posts in their own.': '允许联邦宇宙上的人引用你的帖子。',
  'Hide the public "Followers" tab on your stream page. Social features stay enabled.':
    '在直播页隐藏公开的「关注者」页。社交功能仍然开启。',
  'The message sent announcing that your live stream has begun. Tags will be automatically added. Leave blank to disable.':
    '开播时发出的通知。标签会自动加上。留空则关闭。',
  'Turn this ON if you plan to stream explicit or adult content so previews of your stream can be marked as potentially sensitive.':
    '如果会播成人或露骨内容，请打开，以便预览被标成敏感内容。',
  'You can block specific domains from interacting with you.':
    '可以屏蔽指定域名，不让它们和你互动。',
  'If enabled, all other settings will be disabled. Otherwise configure as desired.':
    '打开后，这项的其他设置都会停用。',
  'If No is selected, then you should set your desired Audio Bitrate.':
    '如果选否，就需要自己设置音频码率。',
  "Optionally resize this content's width.": '可选。缩放画面宽度。',
  "Optionally resize this content's height.": '可选。缩放画面高度。',
  'Reducing your framerate will decrease the amount of video that needs to be encoded and sent to your viewers, saving CPU and bandwidth at the expense of smoothness.  A lower value is generally is fine for most content.':
    '降低帧率可以减少编码和发送的数据，省 CPU 和带宽，画面会没那么顺滑。多数内容用低一点的帧率就够。',
  'The overall quality of your stream is generally impacted most by bitrate.':
    '直播画质通常最受码率影响。',
  'Human-readable name for for displaying in the player.': '播放器里显示的名称。',
  'Optional specific access control value to add to your content.  Generally not required.':
    '可选的访问控制值。一般不用填。',
  'Create a new bucket for each Owncast instance you may be running.':
    '每台 Owncast 建议单独建一个存储桶。',
  'The full URL (with "https://") endpoint from your storage provider.':
    '存储服务的完整地址，需要带 https://。',
  'Optionally prepend a custom path for the final URL': '可以给最终地址加上自定义路径前缀。',
  'The webhook assigned to your channel.': '频道里的 Webhook 地址。',
  'The text to send when you go live.': '开播时发送的文字。',
  '- minimum 8 characters': '- 至少 8 个字符',
  '- maximum 192 characters': '- 最多 192 个字符',
  '- at least one lowercase letter': '- 至少 1 个小写字母',
  '- at least one uppercase letter': '- 至少 1 个大写字母',
  '- at least one digit': '- 至少 1 个数字',
  '- at least one special character: !@#$%^&*': '- 至少 1 个特殊字符：!@#$%^&*',
  '- must NOT contain a dash: -': '- 不能包含连字符 -',
  "Turn this ON if you plan to stream explicit or adult content. Please respectfully set this flag so unexpected eyes won't accidentally see it in the Directory.":
    '如果会播成人或露骨内容请打开。这样目录里的人不会意外看到。',
  "If your S3 provider doesn't support virtual-hosted-style URLs set this to ON (i.e. Oracle Cloud Object Storage)":
    '如果对象存储不支持虚拟主机风格地址，请打开（例如 Oracle Cloud）。',
  'Upload your logo if you have one (max size 2 MB). We recommend that you use a square image that is at least 256x256. SVGs are discouraged as they cannot be displayed on all social media platforms.':
    '有 Logo 就上传（最大 2 MB）。建议使用至少 256×256 的正方形图片。不建议用 SVG，部分社交平台无法显示。',
  'Upload a custom favicon (PNG or ICO format, max 200KB). This icon appears in browser tabs and bookmarks.':
    '上传网站图标（PNG 或 ICO，最大 200KB）。它会出现在浏览器标签和书签里。',
  'Optional URL that video content should be accessed from instead of the default.  Used with CDNs and specific storage providers. Generally not required.':
    '可选。观众改从这里拉视频，而不是默认地址。用于 CDN 或特定存储。一般不用填。',
  'An optional list of chat usernames that new users get assigned. If the list holds less then 10 items, random names will be generated.  Users can change their usernames afterwards and the same username may be given out multple times.':
    '新观众进入聊天时可以分配的用户名。不足 10 个时会自动补随机名。观众之后可以改名，同一个名字也可能发给多个人。',
  'The username used for sending and receiving activities from the Fediverse. For example, if you use "bob" as a username you would send messages to the fediverse from @bob@yourserver. Once people start following your instance you should not change this.\nNote: Username cannot have special characters. ':
    '在联邦宇宙收发动态时使用的用户名。例如填 bob，对外就是 @bob@你的服务器。已经有人关注后不要再改。用户名不能包含特殊字符。',
  'The full url to your Owncast server is required to enable social features. Must use SSL (https). Once people start following your instance you should not change this.':
    '开启社交功能必须填写服务器完整地址，并且使用 https。已经有人关注后不要再改。',
  'Lowest hardware usage - lowest quality video': '硬件占用最低，画质最低',
  'Low hardware usage - low quality video': '硬件占用低，画质低',
  'Medium hardware usage - average quality video': '硬件占用中等，画质一般',
  'High hardware usage - high quality video': '硬件占用高，画质高',
  'Highest hardware usage - higher quality video': '硬件占用最高，画质更高',
  'Reduce to improve server performance, or increase it to improve video quality.':
    '调低可以减轻服务器压力，调高可以提高画质。',
  'This could mean GPU or CPU usage depending on your server environment.':
    '具体占用的是 CPU 还是 GPU，取决于服务器环境。',
  'Read more about hardware performance.': '进一步了解硬件性能。',
  'Read more about bitrates.': '进一步了解码率。',
  'Read more about resolutions.': '进一步了解分辨率。',
  'Resizing your content will take additional resources on your server. If you wish to optionally resize your content for this stream output then you should either set the width or the height to keep your aspect ratio.':
    '缩放画面会额外占用服务器资源。如果要缩放这一档输出，只填宽度或只填高度，这样能保持比例。',
  'Enabling video passthrough may allow for less hardware utilization, but may also make your stream unplayable.':
    '打开视频直通可以少占硬件，但也可能让观众无法播放。',
  'All other settings for this stream output will be disabled if passthrough is used.':
    '使用直通后，这一档的其他设置都会停用。',
  'Read the documentation before enabling, as it impacts your stream.':
    '打开之前请先看文档，它会直接影响直播。',
  'Did you read the documentation about video passthrough and understand the risks involved with enabling it?':
    '你是否已经看过视频直通的文档，并了解打开它的风险？',
  'Before changing your video configuration visit the video documentation to learn how it impacts your stream performance. The general rule is to start conservatively by having one middle quality stream output variant and experiment with adding more of varied qualities.':
    '改视频配置之前，请先了解它会怎样影响直播性能。一般先只保留一档中等画质，再按需要增加其他档位。',
  'visit the video documentation': '查看视频文档',
  'A streaming key is used with your broadcasting software to authenticate itself to Owncast. Most people will only need one. However, if you share a server with others or you want different keys for different broadcasting sources you can add more here.':
    '推流码用来让 OBS 等软件连上这台服务器。大多数人只需要一把。如果和别人共用，或不同来源要用不同的码，可以在这里再加。',
  "These keys are unrelated to the admin password and will not grant you access to make changes to Owncast's configuration.":
    '推流码和管理员密码不是一回事，不能用来改后台配置。',
  'Read more about broadcasting at': '推流说明见',
  'the documentation': '文档',
  'You will not be able to stream until you create at least one stream key and add it to your broadcasting software.':
    '至少要有一把推流码，并填进推流软件，否则无法开播。',
  'The key you provide your broadcasting software. Please note that the key must be a minimum of eight characters and must include at least one uppercase letter, at least one lowercase letter, and at least one number.':
    '填进推流软件的码。至少 8 位，并且要同时包含大写字母、小写字母和数字。',
  'For remembering why you added this key': '用来记住这把码是给谁用的',
  "While it's natural to want to keep your latency as low as possible, you may experience reduced error tolerance and stability the lower you go. The lowest setting is not recommended.":
    '延迟越低，容错和稳定性通常越差。不建议用最低一档。',
  'For interactive live streams you may want to experiment with a lower latency, for non-interactive broadcasts you may want to increase it.':
    '互动直播可以试低一点的延迟，单向转播可以把延迟调高。',
  'Read to learn more.': '了解更多。',
  'Lowest latency, lowest error tolerance (Not recommended, may not work for all content/configurations.)':
    '延迟最低，容错最低（不推荐，部分内容或配置下可能无法播放）',
  'Low latency, low error tolerance': '延迟低，容错低',
  'Medium latency, medium error tolerance (Default)': '延迟中等，容错中等（默认）',
  'High latency, high error tolerance': '延迟高，容错高',
  'Highest latency, highest error tolerance': '延迟最高，容错最高',
  'The following colors are used across the user interface.': '下面这些颜色会用在整个界面上。',
  'Updating your video configuration will take effect the next time you begin a new stream.':
    '视频配置会在下一次重新开播后生效。',
  'Warning: please edit & reset': '请编辑并重新设置',
  'Add a new tag': '添加标签',
  'Doing cool things...': '正在做有意思的事...',
  'HD or Low': '高清或流畅',
  kbps: 'kbps',
  fps: 'fps',
};

export function adminText(english: string, lang?: string): string {
  if (!english) {
    return english;
  }
  if (lang === 'en') {
    return english;
  }
  return ZH[english] || english;
}

export function useAdminText(): (english: string) => string {
  const { lang } = useSelectedLanguage();
  return (english: string) => adminText(english, lang);
}
