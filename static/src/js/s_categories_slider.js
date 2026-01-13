/** @odoo-module **/
/**
 * JavaScript: s_categories_slider
 * Carrusel de Categorías
 */

import publicWidget from 'web.public.widget';
import 'web.dom_ready';

publicWidget.registry.CategoriesSlider = publicWidget.Widget.extend({
    selector: '.s_categories_slider',
    disabledInEditableMode: false, // Permitir en modo edición para dots
    
    events: {
        'click .card': '_onCardClick',
    },

    /**
     * @override
     */
    start: function () {
        this._super.apply(this, arguments);
        this._initSlider();
        this._setupAutoScroll();
        return this._super.apply(this, arguments);
    },

    //--------------------------------------------------------------------------
    // Public Methods (llamadas desde las opciones)
    //--------------------------------------------------------------------------

    /**
     * Actualizar dots cuando cambia el número de cards
     * Método público llamado desde las opciones
     */
    updateDots: function () {
        this._initSlider();
    },

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    /**
     * Inicializar slider con dots
     * @private
     */
    _initSlider: function () {
        const slider = this.$el.find('[data-slider-container="true"]');
        const track = this.$el.find('[data-slider-track="true"]');
        const dotsContainer = this.$el.find('[data-dots-container="true"]');
        const cards = track.find('[data-card="true"]');
        
        // Calcular slides visibles (siempre 4 o según configuración)
        const columns = this._getVisibleColumns();
        const visibleSlides = columns;
        const totalSlides = Math.ceil(cards.length / visibleSlides);
        
        // Limpiar dots existentes
        dotsContainer.empty();
        
        // Crear dots
        for (let i = 0; i < totalSlides; i++) {
            const dot = $('<button/>', {
                'class': i === 0 ? 'active' : '',
                'data-index': i,
                'aria-label': `Ir al slide ${i + 1}`,
                'click': this._onDotClick.bind(this)
            });
            dotsContainer.append(dot);
        }
        
        this.totalSlides = totalSlides;
        this.currentSlide = 0;
        this.slider = slider;
        this.track = track;
        this.dots = dotsContainer.find('button');
        this.cards = cards;
        this.visibleColumns = columns;
        
        // Ajustar ancho del track
        this._adjustTrackWidth();
    },

    /**
     * Obtener número de columnas visibles
     * @private
     */
    _getVisibleColumns: function () {
        // Verificar clases de columnas
        if (this.$el.hasClass('cols-3')) return 3;
        if (this.$el.hasClass('cols-4')) return 4;
        if (this.$el.hasClass('cols-5')) return 5;
        return 4; // Por defecto
    },

    /**
     * Ajustar ancho del track según número de cards
     * @private
     */
    _adjustTrackWidth: function () {
        const cardWidth = this.cards.first().outerWidth(true);
        const totalWidth = this.cards.length * cardWidth;
        this.track.css('width', totalWidth + 'px');
    },

    /**
     * Configurar auto-scroll
     * @private
     */
    _setupAutoScroll: function () {
        if (this.$el.hasClass('auto-scroll')) {
            const speed = this.$el.data('speed') || 3000; // 3 segundos por defecto
            
            this.autoScrollInterval = setInterval(() => {
                this._goToSlide((this.currentSlide + 1) % this.totalSlides);
            }, speed);
        }
    },

    /**
     * Navegar a un slide específico
     * @private
     * @param {number} index - Índice del slide
     */
    _goToSlide: function (index) {
        if (this.totalSlides === 0 || index < 0 || index >= this.totalSlides) return;
        
        const sliderWidth = this.slider.width();
        const scrollPosition = index * sliderWidth;
        
        this.track.animate({
            scrollLeft: scrollPosition
        }, 300);
        
        // Actualizar dots
        this.dots.removeClass('active');
        this.dots.eq(index).addClass('active');
        
        this.currentSlide = index;
    },

    //--------------------------------------------------------------------------
    // Handlers
    //--------------------------------------------------------------------------

    /**
     * Click en dot
     * @private
     */
    _onDotClick: function (ev) {
        const index = parseInt($(ev.currentTarget).data('index'));
        this._goToSlide(index);
        
        // Reiniciar auto-scroll si existe
        if (this.autoScrollInterval) {
            clearInterval(this.autoScrollInterval);
            this._setupAutoScroll();
        }
    },

    /**
     * Click en card (para selección en editor)
     * @private
     */
    _onCardClick: function (ev) {
        // Solo en modo edición
        if (this.editableMode && !$(ev.target).is('a')) {
            // Marcar como seleccionado
            this.$el.find('[data-card="true"]').removeClass('selected');
            $(ev.currentTarget).closest('[data-card="true"]').addClass('selected');
        }
    },

    /**
     * @override
     */
    destroy: function () {
        if (this.autoScrollInterval) {
            clearInterval(this.autoScrollInterval);
        }
        this._super.apply(this, arguments);
    },
});

export default publicWidget.registry.CategoriesSlider;
