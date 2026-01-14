/** @odoo-module **/

import publicWidget from "web.public.widget";

publicWidget.registry.CategoriesSlider = publicWidget.Widget.extend({
    selector: ".s_categories_slider",
    disabledInEditableMode: true, // ✅ CLAVE

    start: function () {
        this._super.apply(this, arguments);

        this.slider = this.el.querySelector(".slider-container");
        this.dotsContainer = this.el.querySelector(".dots");
        this.cards = this.el.querySelectorAll(".card");

        if (!this.slider || !this.dotsContainer || !this.cards.length) {
            return;
        }

        this.Categoryindex = 0;
        this._buildDots();
        this._startAutoplay();
        this._bindHoverPause();

        window.addEventListener("resize", () => {
            this._rebuildDots();
        });
    },

    _getVisibleSlides: function () {
        const cardWidth = this.cards[0]?.offsetWidth || 1;
        return Math.max(1, Math.floor(this.slider.offsetWidth / cardWidth));
    },

    _getTotalSlides: function () {
        const visibleSlides = this._getVisibleSlides();
        return Math.max(1, Math.ceil(this.cards.length / visibleSlides));
    },

    _buildDots: function () {
        this.dotsContainer.innerHTML = "";

        const totalSlides = this._getTotalSlides();
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
            if (i === 0) dot.classList.add("active");

            dot.addEventListener("click", () => this._goToSlide(i));
            this.dotsContainer.appendChild(dot);
        }

        this.dots = this.dotsContainer.querySelectorAll("button");
    },

    _rebuildDots: function () {
        const oldTotal = this.dots?.length || 0;
        const newTotal = this._getTotalSlides();
        if (oldTotal !== newTotal) {
            this.Categoryindex = 0;
            this._buildDots();
            this._goToSlide(0);
        }
    },

    _goToSlide: function (i) {
        const totalSlides = this._getTotalSlides();
        this.Categoryindex = (i + totalSlides) % totalSlides;

        this.slider.scrollTo({
            left: this.Categoryindex * this.slider.offsetWidth,
            behavior: "smooth",
        });

        if (this.dots?.length) {
            this.dots.forEach((d) => d.classList.remove("active"));
            this.dots[this.Categoryindex]?.classList.add("active");
        }
    },

    _startAutoplay: function () {
        const totalSlides = this._getTotalSlides();
        if (totalSlides <= 1) return;

        this.autoScroll = setInterval(() => {
            this._goToSlide(this.Categoryindex + 1);
        }, 4000);
    },

    _stopAutoplay: function () {
        if (this.autoScroll) {
            clearInterval(this.autoScroll);
            this.autoScroll = null;
        }
    },

    _bindHoverPause: function () {
        this.slider.addEventListener("mouseenter", () => this._stopAutoplay());
        this.slider.addEventListener("mouseleave", () => {
            this._stopAutoplay();
            this._startAutoplay();
        });
    },
});
