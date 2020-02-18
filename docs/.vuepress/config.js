module.exports = {
  title: "Shownoso",
  description: "Shownoso的博客",
  head: [
    ['link', { rel: 'icon', href: '/hero.ico' }]
  ],
  markdown: {
    lineNumbers: true
  },
  themeConfig: {
    repo: "shownoso",
    nav: [
      {
        text: "博客",
        link: "/blog/"
      },
    ],
    sidebar: {
      "/blog/": [
        {
          title: '开始都是大杂烩',
          collapsable: false,
          children: [
            // 'Travis_CI',
            // 'SSH_Login',
          ]
        },
        
        
      ],
    },
    lastUpdated: "最后更新",
    smoothScroll: true,
  },
  plugins: {
    // '@vuepress/medium-zoom': {
    //   selector: 'img',
    //   options: {
    //       margin: 16
    //   }
    // },
    // '@vuepress/back-to-top':true
  }
};
