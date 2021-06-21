const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'ChaosGenius Documentation',
  tagline: 'The Open-Source Business Observability Platform',
  url: 'https://chaosgenius.io/',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'chaos-genius', // Usually your GitHub org/user name.
  projectName: 'chaos_genius', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'ChaosGenius Documentation',
      logo: {
        alt: 'ChaosGenius Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          href: 'https://github.com/chaos-genius/chaos_genius',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'ChaosGenius',
          items: [
            {
              label: 'Documentation',
              to: '/docs/introduction',
            },
          ],
        },
        {
          title: 'Company',
          items: [
            {
              label: 'Github',
              href: 'https://github.com/chaos-genius',
            },
          ],
        },
        {
          title: 'Legal',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/facebook/docusaurus',
            },
          ],
        },
      ],
      copyright: `Copyright © 2021 GoodHealth Technologies, Inc. All rights reserved.`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/chaos-genius/chaos_genius/tree/main/docs',
        },
        // blog: {
        //   showReadingTime: true,
        //   // Please change this to your repo.
        //   editUrl:
        //     'https://github.com/facebook/docusaurus/edit/master/website/blog/',
        // },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
