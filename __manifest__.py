{
    'name': 'Civilart Snippets',
    'category': 'Website',
    'version': '1.0',
    'depends': ['website', 'website_sale'],
    'data': [
        'views/snippets/s_header_menu_panel.xml',
        'views/snippets/s_header_menu_panel_options.xml',
        'views/snippets/s_categories_slider.xml',
        'views/snippets/s_categories_slider_options.xml',
        'views/snippets/s_two_images.xml',
        'views/snippets/s_two_images_options.xml',
        "views/snippets/s_products_slider.xml",
        "views/snippets/s_products_slider_options.xml",
        'views/snippets/s_brands_marquee.xml',
        'views/snippets/s_brands_marquee_options.xml',
        'views/snippets/snippets.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            'website_custom_snippets/static/src/scss/s_header_menu_panel.scss',
            'website_custom_snippets/static/src/js/s_header_menu_panel.js',

            'website_custom_snippets/static/src/scss/s_categories_slider.scss',
            'website_custom_snippets/static/src/js/s_categories_slider.js',

            'website_custom_snippets/static/src/scss/s_two_images.scss',

            "website_custom_snippets/static/src/js/s_products_slider.js",
            "website_custom_snippets/static/src/scss/s_products_slider.scss",

            'website_custom_snippets/static/src/scss/s_brands_marquee.scss',
        ],
        'website.assets_wysiwyg': [
            'website_custom_snippets/static/src/js/s_two_images_options.js',
            "website_custom_snippets/static/src/js/s_products_slider_options.js",
            'website_custom_snippets/static/src/js/s_brands_marquee.js',
        ],
    },  
    'installable': True,
    'application': False,
}