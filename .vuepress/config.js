module.exports = {
  title: '新 V2Ray 白话文指南',
  description: 'Just playing around',
  locales: {
      '/': {
        lang: 'zh-CN',
        title: '新 V2Ray 白话文指南',
        description: '你没有见过的船新版本'
      },
      /*'/zh_CN': {
        lang: 'zh-CN',
        title: '新 V2Ray 白话文指南',
        description: '你没有见过的船新版本'
      },*/
      '/en_US': {
        lang: 'en-US',
        title: 'V2Ray Beginner\'s Guide',
        description: 'Step-by-step guide for first-timers\' using V2Ray.'
      },
      '/fa': {
        lang: 'fa-IR',
        title: 'راهنمای مبتدی V2Ray',
        description: 'راهنمای گام به گام برای اولین بار با استفاده از V2Ray.'
      },
      '/ko_KR': {
        lang: 'ko-KR',
        title: 'V2Ray 초급 가이드',
        description: '초보자를위한 V2Ray 사용을위한 단계별 안내서입니다.'
      },
      '/ru_RU': {
        lang: 'ru-RU',
        title: 'V2Ray Руководство для начинающих',
        description: 'Пошаговое руководство для новичков, использующих V2Ray.'
      },
      '/vi_VN': {
        lang: 'vi-VN',
        title: 'Hướng dẫn cho người mới bắt đầu V2Ray',
        description: 'Hướng dẫn từng bước cho những người lần đầu tiên sử dụng V2Ray.'
      },
      '/fr_FR': {
        lang: 'fr-FR',
        title: 'Guide du débutant V2Ray',
        description: 'Guide pas à pas pour les débutants utilisant V2Ray.'
      }
  },
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Official Guide', link: 'https://v2fly.org' },
    ],
    sidebar:
      [
        {
          title: '前言',
          collapsable: false,
          children: [
            '',
          ]
        },
        {
          title: '基本篇',
          children: [
            'basics/log',
            'basics/Shadowsocks',
            'basics/vmess',
            // 'basics/routing/',
            [
              'basics/routing/', {
                title: 'routing'，
                // collapsable:false,
                children:[
                  '',
                  'cndirect',
                  'adblock',
                  'notice'
                ]
              }
            ],
            // 'basics/routing/cndirect',
            // 'basics/routing/adblock',
            // 'basics/routing/notice',
            'basics/sumup'
          ]
        }
      ],
    displayAllHeaders: true,
    sidebarDepth: 3
  }
}
