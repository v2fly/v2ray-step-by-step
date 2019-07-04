module.exports = {
  title: '新 · v2ray 白话文',
  description: 'Just playing around',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Basics', link: '/basics/' },
      { text: 'External', link: 'https://google.com' },
      {
        text: 'Languages',
        items: [
          { text: 'Chinese', link: '/' },
          { text: 'Japanese', link: '/language/japanese/' }
        ]
      },
    ],
    sidebar:
      [
        {
          title: '前言',
          collapsable: false,
          children: [
            '',
            'pa'
          ]
        },
        {
          title: '基本篇',
          children: [
            'basics/log',
            'basics/sumup'
          ]
        }
      ],
    displayAllHeaders: true,
    sidebarDepth: 4
  }
}