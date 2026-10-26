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
  Save: '保存',
  Update: '更新',
  Edit: '编辑',
  'Configure Instance Details': '直播间资料',
  'Save Message': '保存提示',
  'Custom Page Content': '页面正文',
  'Enter your custom page content here...': '在这里填写页面正文…',
  'Edit the content of your page by using simple': '用简单的',
  'Markdown syntax': 'Markdown 语法',
  'Owncast Directory': 'Owncast 目录',
  'Do not share my server.': '不公开这台服务器。',
  'Understood. Share my server publicly.': '明白了，公开分享这台服务器。',
  'What is the Owncast Directory?': '什么是 Owncast 目录？',
  'Disclaimers and Responsibility': '免责声明',
  'Owncast operates a public directory at owncast.directory to share your video streams with more people, while also using these as examples for others. Live streams and servers listed on the directory may optionally be shared on other platforms and applications.':
    'Owncast 在 owncast.directory 维护一份公开目录，用来把直播介绍给更多人，同时也给其他主播做参考。目录里的直播也可以被转发到其他平台。',
  'By enabling this feature you are granting explicit rights to Owncast to share your stream to the public via the directory, as well as other sites, applications and any platform where the Owncast project may be promoting Owncast-powered streams including social media.':
    '打开这项功能，即表示你授权 Owncast 通过目录以及其他推广 Owncast 直播的站点、应用和社交媒体公开分享你的直播。',
  'There is no obligation to list any specific server or topic. Servers can and will be removed at any time for any reason.':
    '目录没有义务收录任何特定服务器或主题，也可以随时以任何原因下架。',
  'Any server that is streaming Not Safe For Work (NSFW) content and does not have the NSFW toggle enabled on their server will be removed.':
    '播出成人内容却没有打开 NSFW 开关的服务器会被下架。',
  'Any server streaming harmful, hurtful, misleading or hateful content in any way will not be listed.':
    '播出有害、误导或仇恨内容的服务器不会被收录。',
  'You may reach out to the Owncast team to report any objectionable content or content that you believe should not be be publicly listed.':
    '如发现不宜公开的内容，可以向 Owncast 团队举报。',
  'You have the right to free software and to build whatever you want with it. But there is no obligation for others to share it.':
    '你有权使用自由软件做任何事，但别人没有义务帮你传播。',
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
  'Enable browser notifications': '开启浏览器通知',
  'Enable Discord': '开启 Discord',
  'Use S3 Storage Provider': '使用 S3 存储',
  Background: '背景',
  'Action Hover': '按钮悬停',
  'Primary Button Border': '主按钮边框',
  'Primary Button Text': '主按钮文字',
  'Chat Background': '聊天背景',
  'Text: Chat': '文字：聊天',
  'Text: Light': '文字：浅色底',
  'Text: Dark': '文字：深色底',
  'Header/Footer': '页头/页脚',
  'Page Content': '页面内容',
  'Video Status Bar Background': '播放状态条背景',
  'Video Status Bar Foreground': '播放状态条前景',
  'Corner radius': '圆角',
  'Certain sections of the interface can be customized by selecting new colors for them.':
    '可以为界面里这些区块单独选颜色。',
  'How rounded should corners be?': '圆角要多圆？',
  'Viewers can opt into being notified when you go live with their browser.':
    '观众可以在浏览器里订阅开播通知。',
  'Not all browsers support this.': '不是所有浏览器都支持。',
  'Let your Discord channel know each time you go live.': '每次开播时通知你的 Discord 频道。',
  'Create a webhook': '创建 Webhook',
  'Edit Channel / Integrations': '编辑频道 / 整合',
  under: '在 Discord 频道的',
  'on your Discord channel and provide it below.': '下面填进来。',
  'Enabling the Fediverse social features will not just alert people to when you go live, but also enable other functionality.':
    '打开联邦宇宙社交后，不只会在开播时通知别人，还会启用其他功能。',
  'Fediverse social features:': '联邦宇宙社交功能：',
  Enabled: '已开启',
  Disabled: '已关闭',
  'Configure:': '去配置：',
  "You should change your admin password from the default and keep it safe. For most people it's likely the other settings will not need to be changed.":
    '请先改掉默认管理员密码并妥善保管。其余设置多数情况不用动。',
  'Updating server settings requires a restart of your Owncast server.':
    '改服务器设置后需要重启 Owncast 才会生效。',
  'Changing your password will log you out of the admin. You may want to refresh the page to force yourself to log back in if not prompted.':
    '改密码后会退出后台。如果没有自动弹出登录框，请刷新页面重新登录。',
  'The updated ffmpeg path will be used when starting your next live stream.':
    '新的 FFmpeg 路径会在下一次开播时生效。',
  'If you have a CDN in front of your entire Owncast instance, specify your origin server here for the websocket to connect to. Most people will never need to set this.':
    '只有整站前面还有一层 CDN 时，才需要在这里填 Websocket 回源地址。一般不用填。',
  'Owncast supports optionally using external storage providers to stream your video. Learn more about this by visiting our':
    '可以选择把切片存到外部存储。说明见',
  'Storage Documentation': '存储文档',
  'Configuring this incorrectly will likely cause your video to be unplayable. Double check the documentation for your storage provider on how to configure the bucket you created for Owncast.':
    '填错会导致无法播放。请对照存储商文档检查给 Owncast 建的桶。',
  'Keep in mind this is for live streaming, not for archival, recording or VOD purposes.':
    '这是给直播用的，不是录像或点播存档。',
  'Insert custom Javascript into your Owncast page to add your own functionality or to add 3rd party scripts. Read more about how to use this feature in the':
    '可以在页面里插入自定义 JavaScript，用来加功能或第三方脚本。说明见',
  'Web page documentation.': '网页文档。',
  'Please use raw Javascript, no HTML or any script tags.':
    '请只填纯 JavaScript，不要 HTML，也不要 script 标签。',
  'Reset Directory': '重置目录登记',
  'If you are experiencing issues with your listing on the Owncast Directory and were asked to "reset" your connection to the service, you can do that here. The next time you go live it will try and re-register your server with the directory from scratch.':
    '如果目录里的登记有问题、对方让你重置连接，在这里操作。下次开播会重新向目录注册。',
  'Are you sure you want to reset your connection to the Owncast directory?':
    '确定要重置与 Owncast 目录的连接吗？',
  'Reset Directory Connection': '重置目录连接',
  'Post to Followers': '发给关注者',
  Cancel: '取消',
  Post: '发布',
  'Tell the world about your future streaming plans or let your followers know to tune in.':
    '告诉关注者下次什么时候播，或提醒他们来看。',
  "I'm still live, come join me!": '还在播，过来看！',
  'Your Social Handles': '社交账号',
  'Add all your social media handles and links to your other profiles here.':
    '在这里填写各平台账号和主页链接。',
  'Other platform name': '其他平台名称',
  'Edit Social Handle': '编辑社交账号',
  URL: '链接',
  'Url to page': '主页地址',
  'Search display names...': '搜索显示名…',
  Actions: '操作',
  'Remove IP Address Ban': '解除 IP 封禁',
  Close: '关闭',
  'User details:': '用户详情：',
  'User created at': '账号创建于',
  'This user is currently connected to Chat.': '此用户当前在聊天里。',
  'Active for:': '已在线：',
  'This user is also seen as:': '此用户还用过：',
  'This user was banned on': '此用户被封禁于',
  'Unban this user': '解除封禁',
  'Ban this user': '封禁此用户',
  ban: '封禁',
  unban: '解封',
  'add moderator': '设为管理员',
  'remove moderator': '取消管理员',
  'Confirm ban': '确认封禁',
  'Confirm unban': '确认解封',
  'Confirm add moderator': '确认设为管理员',
  'Confirm remove moderator': '确认取消管理员',
  Absolutely: '确认',
  'Yup!': '确认',
  'Are you sure you want to ban': '确定要封禁',
  'Are you sure you want to unban': '确定要解封',
  'Are you sure you want to add moderator': '确定要把此人设为管理员',
  'Are you sure you want to remove moderator': '确定要取消此人的管理员',
  'and remove their messages?': '并删除其消息吗？',
  'Use your broadcasting software': '用推流软件开播',
  'Learn how to point your existing software to your new server and start streaming your content.':
    '把 OBS 等软件指到这台服务器即可开播。',
  'Streaming URL:': '推流地址：',
  'Streaming Keys:': '推流码：',
  View: '查看',
  'Overridden via command line.': '已由命令行覆盖。',
  'Embed your video onto other sites': '把直播嵌到别的网站',
  'Learn how you can add your Owncast stream to other sites you control.':
    '可以把直播嵌到你控制的其他网站。',
  'Chat is disabled': '聊天未开启',
  'Chat will continue to be disabled until you begin a live stream.': '开播后才会启用聊天。',
  'There was an error:': '出错了：',
  'Social platform...': '社交平台…',
  'Social Platform': '社交平台',
  'If you are looking for a platform name not on this list, please select Other and type in your own name. A logo will not be provided.':
    '列表里没有的平台请选「其他」并自己填写名称。不会提供对应图标。',
  Configure: '配置',
  Other: '其他',
  'Other...': '其他…',
  'Customize your page with Javascript': '用 JavaScript 自定义页面',
  '/* Enter custom Javascript here */': '/* 在这里填写自定义 JavaScript */',
  'Find an audience on the Owncast Directory': '在 Owncast 目录里找到观众',
  'List yourself in the Owncast Directory and show off your stream. Enable it in':
    '可以把直播登记到 Owncast 目录。在',
  'settings.': '设置里打开。',
  'Add your Owncast instance to the Fediverse': '把本站加入联邦宇宙',
  'Enable Owncast social features': '打开社交功能',
  'to have your instance join the Fediverse, allowing people to follow, share and engage with your live stream.':
    '后，别人就能关注、转发和互动这场直播。',
  'No stream is active': '当前没有直播',
  'You should start one.': '可以开始推流。',
  Changed: '改于',
  ago: '前',
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
