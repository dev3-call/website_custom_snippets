/** @odoo-module **/

import options from "web_editor.snippets.options";

options.registry.ProductsSliderOptions = options.Class.extend({
    /**
     * @override
     */
    willStart: async function () {
        const _super = this._super.bind(this);

        this._categories = {};
        await this._fetchCategories();

        return _super(...arguments);
    },

    /**
     * @override
     * Este método se activa con data-select-data-attribute
     */
    selectDataAttribute: function (previewMode, widgetValue, params) {
        this._super.apply(this, arguments);

        // ✅ Categoría elegida en builder
        if (params.attributeName === "categoryId" && previewMode === false) {
            this.$target.attr("data-category-id", widgetValue || "");
            return this._refreshPublicWidgets();
        }

        // ✅ Límite
        if (params.attributeName === "limit" && previewMode === false) {
            this.$target.attr("data-limit", widgetValue || "12");
            return this._refreshPublicWidgets();
        }

        // ✅ Posición (nueva opción)
        if (params.attributeName === "position" && previewMode === false) {
            this._updatePosition(widgetValue);
            return this._refreshPublicWidgets();
        }
    },

    /**
     * @override
     * Standard Odoo: pintar opciones dinámicas aquí
     */
    _renderCustomXML: async function (uiFragment) {
        await this._renderCategoriesSelector(uiFragment);
    },

    // ------------------------------------------------
    // Private
    // ------------------------------------------------

    async _fetchCategories() {
        const categories = await this._rpc({
            model: "product.public.category",
            method: "search_read",
            args: [[], ["id", "name"]],
        });

        for (const c of categories) {
            this._categories[c.id] = c;
        }
    },

    async _renderCategoriesSelector(uiFragment) {
        const selectorEl = uiFragment.querySelector('[data-name="category_opt"]');
        if (!selectorEl) return;

        // ✅ limpiar selector
        selectorEl.innerHTML = "";

        // ✅ placeholder
        const emptyBtn = document.createElement("we-button");
        emptyBtn.dataset.selectDataAttribute = "";
        emptyBtn.innerText = "-- Seleccionar --";
        selectorEl.appendChild(emptyBtn);

        // ✅ opciones
        for (const id in this._categories) {
            const btn = document.createElement("we-button");
            btn.dataset.selectDataAttribute = id;
            btn.innerText = this._categories[id].name;
            selectorEl.appendChild(btn);
        }
    },

    /**
     * ✅ Actualiza la posición del slider (nuevo método)
     */
    _updatePosition(position) {
        const $target = this.$target;
        
        // Remover clases antiguas
        $target.removeClass('product-left product-right');
        
        // Agregar nueva clase
        if (position === 'right') {
            $target.addClass('product-right');
            $target.attr('data-position', 'right');
        } else {
            $target.addClass('product-left');
            $target.attr('data-position', 'left');
        }
    },
});