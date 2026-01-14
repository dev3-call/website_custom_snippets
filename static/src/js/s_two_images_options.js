/** @odoo-module **/

import options from "web_editor.snippets.options";

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
        $target.attr("href", "#");
    },
});
