/** @odoo-module **/
/**
 * ========================================
 * JavaScript: s_header_menu_panel
 * Snippet de Header con Panel de Filtros
 * ========================================
 */

import publicWidget from 'web.public.widget';
import 'web.dom_ready';

publicWidget.registry.HeaderMenuPanel = publicWidget.Widget.extend({
    selector: '.s_header_menu_panel',
    disabledInEditableMode: false,

    events: {
        'click [data-action="open-panel"]': '_onOpenPanel',
        'click #cerrarPanel': '_onClosePanel',
        'click .productos-panel': '_onClickOutsidePanel',
        'click #menuBtnHeader': '_onOpenOverlay',
        'click #closeOverlay': '_onCloseOverlay',
        'click .overlay': '_onClickOutsideOverlay',
        'click #btnSearchHeader': '_onToggleSearch',
        'click #btnBuscarPanel': '_onSearchProducts',
    },

    /**
     * @override
     */
    start: function () {
        this._super.apply(this, arguments);
        this._setupScrollListener();
        this._setupScrollToCloseSearch();
        return this._super.apply(this, arguments);
    },

    //--------------------------------------------------------------------------
    // Handlers
    //--------------------------------------------------------------------------

    /**
     * Abre el panel de filtros de productos
     * @private
     */
    _onOpenPanel: function (ev) {
        ev.preventDefault();
        const panel = this.$el.find('#productosPanel');
        panel.addClass('active');
        $('body').css('overflow', 'hidden');
        
        // Cerrar overlay si está abierto
        this.$el.find('#overlayMenu').removeClass('open');
    },

    /**
     * Cierra el panel de filtros
     * @private
     */
    _onClosePanel: function () {
        const panel = this.$el.find('#productosPanel');
        panel.removeClass('active');
        $('body').css('overflow', '');
    },

    /**
     * Cierra el panel al hacer clic fuera del diálogo
     * @private
     */
    _onClickOutsidePanel: function (ev) {
        if ($(ev.target).is('.productos-panel')) {
            this._onClosePanel();
        }
    },

    /**
     * Abre el menú overlay lateral
     * @private
     */
    _onOpenOverlay: function () {
        this.$el.find('#overlayMenu').addClass('open');
        $('body').css('overflow', 'hidden');
    },

    /**
     * Cierra el menú overlay
     * @private
     */
    _onCloseOverlay: function () {
        this.$el.find('#overlayMenu').removeClass('open');
        $('body').css('overflow', '');
    },

    /**
     * Cierra el overlay al hacer clic fuera
     * @private
     */
    _onClickOutsideOverlay: function (ev) {
        if ($(ev.target).is('.overlay')) {
            this._onCloseOverlay();
        }
    },

    /**
     * Toggle de la barra de búsqueda
     * @private
     */
    _onToggleSearch: function () {
        const searchBar = this.$el.find('#searchBarHeader');
        const isVisible = searchBar.is(':visible');
        
        if (isVisible) {
            searchBar.hide();
        } else {
            searchBar.show();
            searchBar.find('input').focus();
        }
    },

    /**
     * Realiza la búsqueda con los filtros seleccionados
     * @private
     */
    _onSearchProducts: function (ev) {
        ev.preventDefault();
        
        const filters = this._getSelectedFilters();
        const searchParams = new URLSearchParams();
        
        // Construir parámetros de búsqueda
        Object.keys(filters).forEach(key => {
            if (filters[key].length > 0) {
                searchParams.append(key, filters[key].join(','));
            }
        });
        
        // Redirigir a la página de shop con los filtros
        const url = '/shop?' + searchParams.toString();
        window.location.href = url;
    },

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    /**
     * Obtiene todos los filtros seleccionados
     * @private
     * @returns {Object} Objeto con todos los filtros seleccionados
     */
    _getSelectedFilters: function () {
        const panel = this.$el.find('#productosPanel');
        const filters = {
            tipo: [],
            aplicacion: [],
            acabado: [],
            material: [],
            format: [],
            ambientes: []
        };

        // Obtener todos los checkboxes marcados
        panel.find('input[type="checkbox"]:checked').each(function() {
            const name = $(this).attr('name');
            const value = $(this).val();
            
            if (filters.hasOwnProperty(name)) {
                filters[name].push(value);
            }
        });

        return filters;
    },

    /**
     * Configura el listener para el scroll del header
     * @private
     */
    _setupScrollListener: function () {
        const header = this.$el.find('.header-menu-panel');
        
        $(window).on('scroll', function() {
            if ($(window).scrollTop() > 50) {
                header.addClass('scrolled');
            } else {
                header.removeClass('scrolled');
            }
        });
    },

    /**
     * Cierra la búsqueda cuando se hace scroll
     * @private
     */
    _setupScrollToCloseSearch: function () {
        const searchBar = this.$el.find('#searchBarHeader');
        
        $(window).on('scroll', function() {
            if ($(window).scrollTop() > 50) {
                searchBar.hide();
            }
        });
    },

    /**
     * @override
     */
    destroy: function () {
        $(window).off('scroll');
        this._super.apply(this, arguments);
    },
});

export default publicWidget.registry.HeaderMenuPanel;