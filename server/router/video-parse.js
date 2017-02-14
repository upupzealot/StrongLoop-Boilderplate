'use strict';

const request = require('request');

const EmbedHTMLs = {
  youku: '<embed width="WIDTH" height="HEIGHT" src="http://player.youku.com/player.php/sid/VID/v.swf" allowFullScreen="true" quality="high" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash"></embed>',
  tudou: '<embed width="WIDTH" height="HEIGHT" src="http://www.tudou.com/v/VID/&bid=05&resourceId=0_05_05_99/v.swf" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" wmode="opaque"></embed>',
  tencent: '<embed width="WIDTH" height="HEIGHT" src="http://static.video.qq.com/TPout.swf?vid=VID&auto=0" allowFullScreen="true" quality="high" allowScriptAccess="always" type="application/x-shockwave-flash"></embed>',
  bilibili: '<iframe width="WIDTH" height="HEIGHT" src="http://www.bilibili.com/html/player.html?aid=1493075&page=1" scrolling="no" border="0" frameborder="no" framespacing="0"></iframe>',
};

const getEmbedHTML = (info, width, height) => {
  let embed = EmbedHTMLs[info.site];
  embed = embed.replace('VID', info.vid)
    .replace('WIDTH', width)
    .replace('HEIGHT', height);

  return embed;
};

const VideoSites = {
  youku: {
    test: /http(s)?:\/\/v.youku.com\//,
    match: /videoId2:"([-=\w_]+)"/,
  },
  tudou: {
    test: /http(s)?:\/\/www.tudou.com\//,
    match: /icode: '([-\w_]+)'/,
  },
  tencent: {
    test: /http(s)?:\/\/v.qq.com\//,
    match: /vid: "([-\w_]+)"/,
  },
  bilibili: {
    test: /http(s)?:\/\/www.bilibili.com/,
    match: /aid='([-\w_]+)'/,
  },
};

const getInfoFromPage = (url, body) => {
  for (const k in VideoSites) {
    const site = VideoSites[k];

    const info = {site: k};
    if (site.test.test(url)) {
      const vid_match = body.match(site.match);
      if (vid_match && vid_match[1]) {
        info.vid = vid_match[1];
      }
      return info;
    }
  }
  return null;
};

module.exports = (router, server) => {
  router.post('/video-embed', (req, res) => {
    const url = req.body.url;

    if (/http:\/\/www.bilibili.com\/video\/av(\d+)/.test(url)) {
      const vid_match = url.match(/\/av(\d+)/);
      if (vid_match && vid_match[1]) {
        const vid = vid_match[1];
        return res.json({
          embed: EmbedHTMLs['bilibili']
          .replace('VID', vid)
          .replace('WIDTH', '100%')
          .replace('HEIGHT', '400px'),
        });
      }
    }

    if (/http:\/\/v.youku.com\//.test(url)) {
      const vid_match = url.match(/id_([\w+=]+)/);
      if (vid_match && vid_match[1]) {
        const vid = vid_match[1];
        return res.json({
          embed: EmbedHTMLs['youku']
          .replace('VID', vid)
          .replace('WIDTH', '100%')
          .replace('HEIGHT', '400px'),
        });
      }
    }

    request({
      url: url,
    },
      (err, response, body) => {
        if (err || response.statusCode != 200) {
          return res.json({
            err: err || response.statusCode,
          });
        } else {
          const info = getInfoFromPage(url, body);
          if (info) {
            const embed = getEmbedHTML(info, '100%', 400);
            res.json({embed: embed});
          } else {
            res.json({err: '暂不支持该站点或当前面没有明确的视频'});
          }
        }
      }
    );
  });
};
