// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	base: '/paella-opencast',
	integrations: [
		starlight({
			title: 'Opencast Paella Player Doc',			
			lastUpdated: true,
			editLink: {
        		baseUrl: 'https://github.com/polimediaupv/paella-opencast/edit/paella8/doc/',
      		},
			customCss: [
				'./src/styles/custom.css'
			],
			logo: {
				light: './src/assets/light-logo.webp',
				dark: './src/assets/dark-logo.webp',
				replacesTitle: true,
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/polimediaupv/paella-opencast' }],
			sidebar: [
				{
					label: 'Start Here',
					items: [
						{ label: 'Getting Started', slug: 'getting-started' }
					]
				},
				{
					label: 'Reference',
					items: [
						{
							label: 'paella-opencast-core', collapsed: true, items: [
								{ label: 'Overview', slug: 'reference/paella-opencast-core' },
								'reference/paella-opencast-core/opencast-paella-player',
								'reference/paella-opencast-core/opencast-init-params',
								'reference/paella-opencast-core/opencast-auth',
								'reference/paella-opencast-core/event',
								'reference/paella-opencast-core/event-conversor',
							]
						},

						{
							label: 'paella-opencast-plugins', collapsed: true, items: [
								{ label: 'Overview', slug: 'reference/paella-opencast-plugins' },
								{ label: 'Related Documents Data Plugin', slug: 'reference/paella-opencast-plugins/plugin_relateddocumentsdataplugin' },
								{ label: 'Related Videos Data Plugin', slug: 'reference/paella-opencast-plugins/plugin_relatedvideosdataplugin' },
								{ label: 'Downloads Plugin', slug: 'reference/paella-opencast-plugins/plugin_downloadsplugin' },
								{ label: 'Editor Plugin', slug: 'reference/paella-opencast-plugins/plugin_editorplugin' },
								{ label: 'Event Details Plugin', slug: 'reference/paella-opencast-plugins/plugin_eventdetailsplugin' },
								{ label: 'Login Plugin', slug: 'reference/paella-opencast-plugins/plugin_loginplugin' },
								{ label: 'Matomo User Tracking Plugin', slug: 'reference/paella-opencast-plugins/plugin_matomo_usertrackingdataplugin' },
								{ label: 'Multi Video Dynamic Layout', slug: 'reference/paella-opencast-plugins/plugin_multivideodynamiclayout' },
							]
						},
						{ label: 'paella-opencast-component', slug: 'reference/paella-opencast-component' },
						{ label: 'paella-opencast-skin', slug: 'reference/paella-opencast-skin' },
					],
				},
				{
					label: 'Guides',
					items: [
						{ label: 'Engage Example', slug: 'guides/engage' },
						{ label: 'Web Component', link: '/guides/web-component/' },
					],
				},
			],
		}),
	],
});
