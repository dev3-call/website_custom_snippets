/** @odoo-module **/

import options from "web_editor.snippets.options";

console.log("✅ CategoriesSliderOptions LOADED");

options.registry.CategoriesSliderOptions = options.Class.extend({
    start: function () {
        console.log("✅ CategoriesSliderOptions START", this.$target);
        return this._super.apply(this, arguments);
    },

    add_card: function () {
        console.log("✅ add_card() clicked");

        const slider = this.$target.find(".slider-container").first();
        console.log("✅ slider found:", slider.length);

        if (!slider.length) return;

        const newCard = `
            <a class="card" href="#"
               style="background-image: url('/web/static/img/placeholder.png');">
                <div class="card-overlay"></div>
                <div class="content">
                    <h3 class="o_default_snippet_text">Nueva Categoría</h3>
                </div>
            </a>
        `;

        slider.append(newCard);
        console.log("✅ Card appended, total:", slider.find(".card").length);
    },

    remove_last_card: function () {
        console.log("✅ remove_last_card() clicked");

        const slider = this.$target.find(".slider-container").first();
        if (!slider.length) return;

        const cards = slider.find(".card");
        if (cards.length <= 1) return;

        cards.last().remove();
        console.log("✅ Card removed, total:", slider.find(".card").length);
    },
});
