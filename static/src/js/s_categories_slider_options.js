/** @odoo-module **/

import options from "web_editor.snippets.options";

/**
 * ==========================================================
 * 1) MultipleItems: Agregar / eliminar imágenes (max 4)
 * ==========================================================
 */
options.registry.TwoImagesMultipleItems = options.registry.MultipleItems.extend({
    MAX_ITEMS: 4,

    _computeWidgetVisibility: async function (widgetName, params) {
        const $items = this.$target.find(".two-images-row > .two-img-item");
        const count = $items.length;

        if (widgetName === "add_item_opt") {
            return count < this.MAX_ITEMS;
        }
        if (widgetName === "remove_item_opt") {
            return count > 1;
        }

        return this._super(...arguments);
    },

    _addItemCallback: function ($target) {
        // ✅ href real para que el builder deje editar link
        $target.attr("href", "#");

        // ✅ Si el snippet tiene "abrir en nueva pestaña" activo, lo heredamos
        const openInNewTab = this.$target.attr("data-open-in-new-tab") === "true";
        if (openInNewTab) {
            $target.attr("target", "_blank");
            $target.attr("rel", "noopener noreferrer");
        } else {
            $target.removeAttr("target");
            $target.removeAttr("rel");
        }
    },
});


/**
 * ==========================================================
 * 2) Options: Checkbox "Abrir en nueva pestaña"
 * ==========================================================
 */
options.registry.TwoImagesOptions = options.Class.extend({

    /**
     * Checkbox handler:
     * - Activa o desactiva target="_blank" para todos los <a>
     */
    toggle_new_tab: function (previewMode, widgetValue, params) {
        const $links = this.$target.find(".two-images-row > .two-img-item");

        // ✅ Cuando el checkbox está activo Odoo envía widgetValue = true
        const enabled = !!widgetValue;

        // Guardamos estado en el snippet (para heredar al agregar nuevos)
        this.$target.attr("data-open-in-new-tab", enabled ? "true" : "false");

        if (enabled) {
            $links.attr("target", "_blank");
            $links.attr("rel", "noopener noreferrer");
        } else {
            $links.removeAttr("target");
            $links.removeAttr("rel");
        }
    },

    /**
     * Para que el checkbox recuerde el estado actual al volver a seleccionar el snippet
     */
    _computeWidgetState: function (methodName, params) {
        if (methodName === "toggle_new_tab") {
            return this.$target.attr("data-open-in-new-tab") === "true";
        }
        return this._super(...arguments);
    },
});
