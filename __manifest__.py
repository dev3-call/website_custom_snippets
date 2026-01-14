{
    'name': 'Civilart Snippets',
    'category': 'Website',
    'version': '1.0',
    'depends': ['website'],
    'data': [
        'views/snippets/s_header_menu_panel.xml',
        'views/snippets/s_header_menu_panel_options.xml',
        'views/snippets/s_categories_slider.xml',
        "views/snippets/s_categories_slider_options.xml",
        'views/snippets/snippets.xml',

    ],
    'assets': {
        'web.assets_frontend': [
            'website_custom_snippets/static/src/scss/s_header_menu_panel.scss',
            'website_custom_snippets/static/src/js/s_header_menu_panel.js',

            'website_custom_snippets/static/src/scss/s_categories_slider.scss',
            'website_custom_snippets/static/src/js/s_categories_slider.js',

            "website_custom_snippets/static/src/scss/s_categories_slider.scss",
            "website_custom_snippets/static/src/js/s_categories_slider.js",
    ],
    },  
    'installable': True,
    'application': False,
}