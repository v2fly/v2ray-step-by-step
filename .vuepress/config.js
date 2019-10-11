const Path = require('path');
const Fs = require('fs')

const i18nMap = {
  zh_CN: {
    advanced: '高级篇',
    basics: '基本篇',
    before_start: '开篇',
    practical: '应用篇',
    preface: '前言',
    routing: '路由',
    routing_function: '路由功能'
  },
  en_US: {
    advanced: 'Advanced',
    basics: 'Basics',
    before_start: 'Before start',
    practical: 'Practical',
    routing: 'Routing',
    routing_function: 'Routing function',
    preface: 'Preface'
  }
}

function i18n(locale, key) {
  if (i18nMap[locale] && i18nMap[locale][key]) {
    return i18nMap[locale][key];
  } else {
    return `i18n_${locale}_${key}`;
  }
}

function absolute(relativePath) {
  absolutePath = Path.join(Path.resolve(__dirname, '..'), relativePath);
  return absolutePath.endsWith('/')
    ? Path.join(absolutePath, 'README.md')
    : `${absolutePath}.md`;
}

function i18nPath(locale, paths) {
  let multi = Array.isArray(paths);
  let single = !multi;
  if (single) {
    // blank string
    if (0 === paths.length || !paths.trim()) {
      paths = ['/'];
    } else {
      paths = [paths];
    }
  }

  if (locale === 'zh_CN') {
    locale = '/';
  }

  let result = [];
  paths.forEach(path => {
    if (typeof path !== 'string' && !(path instanceof String)) {
      result.push(path);
      return;
    }

    relativePath = Path.join('/', locale, path);
    if (Fs.existsSync(absolute(relativePath))) {
      // still return relativePath, let vuepress handle this.
      result.push(relativePath);
    } else {
      // TODO: fallback to default language.
      console.warn('\x1b[33m%s\x1b[0m', `WARN! ${relativePath} does not exists!`);
    }
  });

  if (single) {
    return result[0];
  }

  return result;
}

function i18nSidebar(locale) {
  return [
    {
      title: i18n(locale, 'preface'),
      collapsable: false,
      children: [
        i18nPath(locale, ''),
      ]
    },
    {
      title: i18n(locale, 'before_start'),
      path: i18nPath(locale, '/prep/prep'),
      children: i18nPath(locale, ['prep/start', 'prep/install', 'prep/json'])
    },
    {
      title: i18n(locale, 'basics'),
      path: i18nPath(locale, '/basics/basics'),
      children: i18nPath(locale, [
        'basics/vmess',
        'basics/shadowsocks',
        'basics/log',
        {
          title: i18n(locale, 'routing_function'),
          path: i18nPath(locale, '/basics/routing/basics_routing'),
          children: i18nPath(locale, [
            'basics/routing/cndirect',
            'basics/routing/adblock',
            'basics/routing/notice'
          ])
        },
        'basics/sumup'
      ])
    },
    {
      title: i18n(locale, 'advanced'),
      path: i18nPath(locale, '/advanced/advanced'),
      children: i18nPath(locale, [
        'advanced/mux',
        'advanced/mkcp',
        'advanced/dynamicport',
        'advanced/outboundproxy',
        'advanced/httpfake',
        'advanced/tls',
        'advanced/websocket',
        'advanced/wss_and_web',
        'advanced/h2',
        'advanced/cdn',
        'advanced/traffic',
        'advanced/not_recommend',
      ])
    },
    {
      title: i18n(locale, 'practical'),
      path: i18nPath(locale, '/app/app'),
      children: i18nPath(locale, [
        'app/transparent_proxy',
        'app/reverse',
        'app/reverse2',
        'app/dns',
        'app/balance',
        'app/docker-deploy-v2ray',
        'app/benchmark',
        'app/optimization',
      ])
    },
    {
      title: i18n(locale, 'routing'),
      path: i18nPath(locale, '/routing/routing'),
      children: i18nPath(locale, [
        'routing/sitedata',
        'routing/bittorrent',
        'routing/balance2',
      ])
    }
  ];
}

module.exports = {
  chainWebpack: (config, isServer) => {
    if (!isServer) {
      // mutate the config for client
    }
    config.module.rule('bmp').test(/\.bmp$/).use('file-loader').loader('file-loader').tap(options => {
      options = {};
      options.outputPath = 'assets/img';
      options.name = '[name].[md5:hash:hex:8].[ext]';
      return options
    }).end()
  },
  title: '新 V2Ray 白话文指南',
  description: 'Just playing around',
  locales: {
    '/': {
      lang: 'zh-CN',
      title: '新 V2Ray 白话文指南',
      description: '你没有见过的船新版本'
    },
    '/en_US/': {
      lang: 'en-US',
      title: 'V2Ray Beginner\'s Guide',
      description: 'Step-by-step guide for first-timers\' using V2Ray.'
    },
    '/fa/': {
      lang: 'fa-IR',
      title: 'راهنمای مبتدی V2Ray',
      description: 'راهنمای گام به گام برای اولین بار با استفاده از V2Ray.'
    },
    '/ko_KR/': {
      lang: 'ko-KR',
      title: 'V2Ray 초급 가이드',
      description: '초보자를위한 V2Ray 사용을위한 단계별 안내서입니다.'
    },
    '/ru_RU/': {
      lang: 'ru-RU',
      title: 'V2Ray Руководство для начинающих',
      description: 'Пошаговое руководство для новичков, использующих V2Ray.'
    },
    '/vi_VN/': {
      lang: 'vi-VN',
      title: 'Hướng dẫn cho người mới bắt đầu V2Ray',
      description: 'Hướng dẫn từng bước cho những người lần đầu tiên sử dụng V2Ray.'
    },
    '/fr_FR/': {
      lang: 'fr-FR',
      title: 'Guide du débutant V2Ray',
      description: 'Guide pas à pas pour les débutants utilisant V2Ray.'
    }
  },
  themeConfig: {
    locales: {
      '/': {
        nav: [
          { text: '首页', link: '/' },
          { text: '官方手册', link: 'https://v2fly.org' },
        ],
        sidebar: i18nSidebar('zh_CN'),
        editLinkText: '在 GitHub 上编辑此页',
        lastUpdated: '上次更新'
      },
      '/en_US/': {
        nav: [
          { text: 'Home', link: '/' },
          { text: 'Official Guide', link: 'https://v2fly.org' },
        ],
        sidebar: i18nSidebar('en_US'),
        editLinkText: 'Edit this page on GitHub',
        lastUpdated: 'Last Updated'
      }
    },
    sidebarDepth: 3,
    repo: 'v2fly/v2ray-step-by-step',
    docsBranch: 'transifex',
    editLinks: true
  },
  extendPageData ($page) {
    $page.frontmatter.editLink = ('/' === $page._computed.$localePath)
  }
}
