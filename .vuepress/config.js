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
        'basics/http',
        'basics/dns',
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
        'advanced/tcp_tls_web',
        'advanced/tcp_tls_shunt_proxy',
        'advanced/websocket',
        'advanced/wss_and_web',
	'advanced/wss_and_browserforwarder',
        'advanced/h2',
        'advanced/h2_tls_web',
        'advanced/tls_routing_with_nginx',
        'advanced/cdn',
        'advanced/traffic',
        'advanced/tor',
        'advanced/not_recommend',
      ])
    },
    {
      title: i18n(locale, 'practical'),
      path: i18nPath(locale, '/app/app'),
      children: i18nPath(locale, [
        'app/tproxy',
        'app/transparent_proxy',
        'app/reverse',
        'app/reverse2',
        'app/parent',
        'app/balance',
        'app/docker-deploy-v2ray',
        'app/benchmark',
        'app/optimization',
        'app/mtproto',
        'app/tinc_proxy',
        'app/android_without_root_use_v2ray'
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
  title: '新 V2Ray 白话文指南',
  description: 'Just playing around',
  locales: {
    '/': {
      lang: 'zh-CN',
      title: '新 V2Ray 白话文指南',
      description: 'V2Fly 社区维护的新手向教程。'
    },
    '/en_US/': {
      lang: 'en-US',
      title: 'V2Ray Beginner\'s Guide',
      description: 'Step-by-step guide for first-timers\' using V2Ray.'
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
  extendPageData($page) {
    $page.frontmatter.editLink = ('/' === $page._computed.$localePath)
  },
  plugins: [
    'vuepress-plugin-mermaidjs'
  ],
}
