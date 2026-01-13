/** @odoo-module **/
/**
 * JavaScript: s_categories_slider_options
 * Opciones del Carrusel de Categorías (funciona como accordion pero horizontal)
 */

import { _t } from 'web.core';
import options from 'web_editor.snippets.options';

options.registry.CategoriesSliderOptions = options.Class.extend({
    
    /**
     * @override
     */
    start: function () {
        this._super.apply(this, arguments);
        this._setupCardSelection();
        return this._super.apply(this, arguments);
    },

    //--------------------------------------------------------------------------
    // Options
    //--------------------------------------------------------------------------

    /**
     * Agregar un nuevo card (se añade a la derecha, horizontalmente)
     */
    addCard: async function (previewMode, widgetValue, params) {
        const self = this;
        
        // Obtener contador de cards
        const cardCount = this.$target.find('[data-card="true"]').length + 1;
        const cardId = `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // HTML del nuevo card con dimensiones EXACTAS
        const newCardHTML = `
            <div class="card-container" 
                data-card="true" 
                data-card-id="${cardId}"
                data-name="Card ${cardCount}">
                <a href="/shop" class="card-link" data-card-link="true">
                    <div class="card" data-card-bg="true">
                        <div class="card-overlay"></div>
                        <div class="card-content">
                            <img src="/web/image/website/1/logo" 
                                alt="${_t('Icono')}" 
                                class="card-icon"
                                data-card-icon="true"/>
                            <h3 class="card-title" 
                                data-content="card_title"
                                contenteditable="true">
                                ${_t('Nuevo Card')} ${cardCount}
                            </h3>
                        </div>
                    </div>
                </a>
            </div>
        `;
        
        // Agregar al final del track (a la derecha)
        const sliderTrack = this.$target.find('[data-slider-track="true"]');
        sliderTrack.append(newCardHTML);
        
        // Actualizar dots del slider
        this._updateSliderDots();
        
        // Desplazar carrusel para mostrar el nuevo card
        this._scrollToNewCard(cardId);
        
        // Seleccionar automáticamente el nuevo card
        this._selectCard(cardId);
        
        // Notificar que hay cambios
        this.trigger_up('snippet_option_updated', {});
    },

    /**
     * Configurar velocidad del autoplay
     */
    setSpeed: function (previewMode, widgetValue, params) {
        // Guardar valor en data attribute
        this.$target.data('speed', widgetValue * 1000); // Convertir a milisegundos
        
        // Si hay widget de slider, actualizar su intervalo
        this._updateSliderSpeed(widgetValue);
    },

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    /**
     * Configurar selección de cards
     * @private
     */
    _setupCardSelection: function () {
        const self = this;
        
        // Escuchar clicks en cards para seleccionarlos
        this.$target.on('click.categories_slider', '[data-card="true"]', function (e) {
            // Solo en modo edición
            if (!self.editableMode) return;
            
            // Prevenir navegación si es un enlace
            if ($(e.target).closest('a').length && !$(e.target).is('.card-title')) {
                e.preventDefault();
            }
            
            // Seleccionar este card
            const cardId = $(this).data('card-id');
            self._selectCard(cardId);
        });
        
        // Doble click en título para editar
        this.$target.on('dblclick.categories_slider', '.card-title', function (e) {
            e.stopPropagation();
            $(this).focus();
        });
        
        // Guardar cambios al editar título
        this.$target.on('blur.categories_slider', '.card-title', function () {
            self.trigger_up('snippet_option_updated', {});
        });
    },

    /**
     * Seleccionar un card específico
     * @private
     * @param {string} cardId - ID del card a seleccionar
     */
    _selectCard: function (cardId) {
        // Remover selección anterior
        this.$target.find('[data-card="true"]').removeClass('selected');
        
        // Agregar selección al card específico
        const card = this.$target.find(`[data-card-id="${cardId}"]`);
        card.addClass('selected');
        
        // Forzar que las opciones del card aparezcan
        // Esto activa el widget CardOptions para este card específico
        this.trigger_up('snippet_option_updated', {
            doNotSetDirty: true,
        });
    },

    /**
     * Desplazar carrusel para mostrar nuevo card
     * @private
     * @param {string} cardId - ID del nuevo card
     */
    _scrollToNewCard: function (cardId) {
        const card = this.$target.find(`[data-card-id="${cardId}"]`);
        const sliderTrack = this.$target.find('[data-slider-track="true"]');
        
        if (card.length && sliderTrack.length) {
            // Calcular posición del nuevo card
            const cardPosition = card.position().left;
            const cardWidth = card.outerWidth(true);
            const containerWidth = sliderTrack.parent().width();
            
            // Desplazar para que el card sea visible
            const scrollTo = Math.max(0, cardPosition - (containerWidth / 2) + (cardWidth / 2));
            
            sliderTrack.animate({
                scrollLeft: scrollTo
            }, 300);
        }
    },

    /**
     * Actualizar dots del slider cuando cambia el número de cards
     * @private
     */
    _updateSliderDots: function () {
        // Buscar widget del slider y actualizar dots
        const slider = this.$target.find('.s_categories_slider');
        if (slider.length) {
            const widget = slider.data('widget');
            if (widget && typeof widget.updateDots === 'function') {
                widget.updateDots();
            }
        }
    },

    /**
     * Actualizar velocidad del slider
     * @private
     * @param {number} seconds - Segundos entre slides
     */
    _updateSliderSpeed: function (seconds) {
        const slider = this.$target.find('.s_categories_slider');
        if (slider.length) {
            const widget = slider.data('widget');
            if (widget && widget.autoScrollInterval) {
                // Reiniciar intervalo con nueva velocidad
                clearInterval(widget.autoScrollInterval);
                
                if (this.$target.hasClass('auto-scroll')) {
                    widget.autoScrollInterval = setInterval(() => {
                        if (widget._goToSlide) {
                            widget._goToSlide((widget.currentSlide + 1) % widget.totalSlides);
                        }
                    }, seconds * 1000);
                }
            }
        }
    },

    /**
     * @override
     */
    cleanForSave: function () {
        // Remover selección al guardar
        this.$target.find('[data-card="true"]').removeClass('selected');
        this._super.apply(this, arguments);
    },

    /**
     * @override
     */
    destroy: function () {
        this.$target.off('.categories_slider');
        this._super.apply(this, arguments);
    },

});

//==============================================================================
// Opciones INDIVIDUALES para cada card
//==============================================================================
options.registry.CardOptions = options.Class.extend({
    
    /**
     * @override
     */
    start: function () {
        this._super.apply(this, arguments);
        this._setupDeleteKey();
        return this._super.apply(this, arguments);
    },

    //--------------------------------------------------------------------------
    // Options
    //--------------------------------------------------------------------------

    /**
     * Eliminar el card seleccionado
     */
    removeCard: function (previewMode, widgetValue, params) {
        const self = this;
        
        // Confirmación
        if (confirm(_t('¿Eliminar este card?'))) {
            // Eliminar el card
            this.$target.remove();
            
            // Notificar cambio
            this.trigger_up('snippet_option_updated', {});
            
            // Actualizar dots del slider
            this._updateSliderDots();
        }
    },

    /**
     * Actualizar enlace del card
     */
    setLink: function (previewMode, widgetValue, params) {
        // widgetValue contiene el href
        const link = this.$target.find('.card-link');
        if (link.length) {
            link.attr('href', widgetValue || '#');
        }
    },

    /**
     * Actualizar imagen de fondo
     */
    setBackground: function (previewMode, widgetValue, params) {
        // widgetValue contiene la URL de la imagen
        const card = this.$target.find('.card');
        if (card.length && widgetValue) {
            card.css('background-image', `url('${widgetValue}')`);
        }
    },

    /**
     * Actualizar icono
     */
    setIcon: function (previewMode, widgetValue, params) {
        // widgetValue contiene la URL del icono
        const icon = this.$target.find('.card-icon');
        if (icon.length && widgetValue) {
            icon.attr('src', widgetValue);
        }
    },

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    /**
     * Configurar tecla SUPR para eliminar
     * @private
     */
    _setupDeleteKey: function () {
        const self = this;
        
        // Escuchar tecla SUPR
        $(document).on('keydown.categories_card', function (e) {
            if ((e.key === 'Delete' || e.key === 'Del') && self.$target.is(':visible')) {
                // Verificar que estamos en modo edición y el card está seleccionado
                if (self.editableMode && self.$target.hasClass('selected')) {
                    e.preventDefault();
                    e.stopPropagation();
                    self.removeCard();
                }
            }
        });
    },

    /**
     * Actualizar dots del slider
     * @private
     */
    _updateSliderDots: function () {
        const slider = this.$target.closest('.s_categories_slider');
        if (slider.length) {
            const widget = slider.data('widget');
            if (widget && typeof widget.updateDots === 'function') {
                widget.updateDots();
            }
        }
    },

    /**
     * @override
     */
    destroy: function () {
        $(document).off('keydown.categories_card');
        this._super.apply(this, arguments);
    },

});

export default {
    CategoriesSliderOptions: options.registry.CategoriesSliderOptions,
    CardOptions: options.registry.CardOptions,
};
