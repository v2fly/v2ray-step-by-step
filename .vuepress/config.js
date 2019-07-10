var Path = require('path');

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
  return i18nMap[locale][key];
}

function i18nPath(locale, path) {
  if (locale === 'zh_CN') {
    locale = '';
  }

  return Path.join('/', locale, '/', path);
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
      path: i18nPath(locale, '/prep/'),
      children: [
        i18nPath(locale, 'prep/start'),
        i18nPath(locale, 'prep/install'),
        i18nPath(locale, 'prep/json')
      ]
    },
    {
      title: i18n(locale, 'basics'),
      path: i18nPath(locale, '/basics/'),
      children: [
        i18nPath(locale, 'basics/vmess'),
        i18nPath(locale, 'basics/shadowsocks'),
        i18nPath(locale, 'basics/log'),
        {
          title: i18n(locale, 'routing_function'),
          path: i18nPath(locale, '/basics/routing/'),
          children: [
            i18nPath(locale, 'basics/routing/cndirect'),
            i18nPath(locale, 'basics/routing/adblock'),
            i18nPath(locale, 'basics/routing/notice')
          ]
        },
        i18nPath(locale, 'basics/sumup')
      ]
    },
    {
      title: i18n(locale, 'advanced'),
      path: i18nPath(locale, '/advanced/'),
      children: [
        i18nPath(locale, 'advanced/mux'),
        i18nPath(locale, 'advanced/mkcp'),
        i18nPath(locale, 'advanced/dynamicport'),
        i18nPath(locale, 'advanced/outboundproxy'),
        i18nPath(locale, 'advanced/httpfake'),
        i18nPath(locale, 'advanced/tls'),
        i18nPath(locale, 'advanced/websocket'),
        i18nPath(locale, 'advanced/wss_and_web'),
        i18nPath(locale, 'advanced/h2'),
        i18nPath(locale, 'advanced/cdn'),
        i18nPath(locale, 'advanced/not_recommend')
      ]
    },
    {
      title: i18n(locale, 'practical'),
      children: [
        i18nPath(locale, 'app/transparent_proxy'),
        i18nPath(locale, 'app/reverse'),
        i18nPath(locale, 'app/reverse2'),
        i18nPath(locale, 'app/dns'),
        i18nPath(locale, 'app/balance'),
        i18nPath(locale, 'app/docker-deploy-v2ray'),
        i18nPath(locale, 'app/benchmark'),
        i18nPath(locale, 'app/optimization')
      ]
    },
    {
      title: i18n(locale, 'routing'),
      children: [
        i18nPath(locale, 'routing/sitedata'),
        i18nPath(locale, 'routing/bittorrent'),
        i18nPath(locale, 'routing/balance2')
      ]
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
