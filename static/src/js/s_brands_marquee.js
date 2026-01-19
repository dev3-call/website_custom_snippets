/** @odoo-module **/

import options from 'web_editor.snippets.options';
import { generateHTMLId } from 'web_editor.utils';

options.registry.BrandsMarquee = options.Class.extend({
    selector: '.s_brands_marquee',

    start() {
        this.entriesNotInDom = [];
        return this._super(...arguments);
    },

    /**
     * ✅ Ahora el builder lee IDs estables desde data-brand-id
     *    y NO genera IDs nuevos cada vez.
     */
    async _computeWidgetState(methodName, params) {
        if (methodName !== 'renderListItems') {
            return this._super(...arguments);
        }

        const trackEl = this.$target[0].querySelector('.brands-track');
        if (!trackEl) return JSON.stringify([]);

        const originals = [
            ...trackEl.querySelectorAll(':scope > a.s_brands_item:not([data-marquee-clone="1"])')
        ];

        let listPosition = 0;
        let domPosition = 0;

        const entries = originals.map((a) => {
            const imgEl = a.querySelector('img.brand_img');
            const url = imgEl ? (imgEl.getAttribute('src') || '').trim() : '';
            if (!url) return null;

            // ✅ ID estable basado en data-brand-id
            let brandId = a.getAttribute('data-brand-id');
            if (!brandId) {
                brandId = generateHTMLId();
                a.setAttribute('data-brand-id', brandId);
            }

            return {
                id: brandId,
                display_name: url,
                placeholder: 'https://dummyimage.com/220x110/000/fff.png&text=BRAND',
                selected: true,
                listPosition: listPosition++,
                domPosition: domPosition++,
            };
        }).filter(Boolean);

        // Mantener los no seleccionados
        const allEntries = entries.concat(this.entriesNotInDom);

        // Normalizar posiciones
        allEntries.sort((a, b) => (a.listPosition ?? 0) - (b.listPosition ?? 0));
        allEntries.forEach((e, idx) => e.listPosition = idx);

        return JSON.stringify(allEntries);
    },

    /**
     * ✅ Render correcto:
     * - Limpia track
     * - Inserta originales con data-brand-id
     * - Inserta clones marcados data-marquee-clone="1"
     */
    async renderListItems(previewMode, widgetValue, params) {
        const root = this.$target[0];
        const trackEl = root.querySelector('.brands-track');
        if (!trackEl) return;

        let entries = [];
        try {
            entries = JSON.parse(widgetValue || '[]');
        } catch (e) {
            entries = [];
        }

        const selectedEntries = entries.filter((e) => e && e.selected);
        this.entriesNotInDom = entries.filter((e) => e && !e.selected);

        // ✅ Vacío => placeholder
        if (!selectedEntries.length) {
            trackEl.classList.remove('is-ready');
            trackEl.innerHTML = `
                <div class="placeholder-text">
                    Agrega marcas desde las opciones →
                </div>
            `;
            return;
        }

        // 1) Construir originales
        const originals = [];
        for (let i = 0; i < selectedEntries.length; i++) {
            const entry = selectedEntries[i];

            let url = (entry.display_name || entry.value || '').trim();
            if (!url) continue;

            if (url && !/^(([a-zA-Z]+):|\/)/.test(url)) {
                url = `https://${url}`;
                entry.display_name = url;
            }

            // ✅ ID estable del entry (no regenerar)
            const brandId = entry.id || generateHTMLId();

            const a = document.createElement('a');
            a.className = 's_brands_item';
            a.href = '#';
            a.target = '_blank';
            a.setAttribute('data-brand-id', brandId);

            const img = document.createElement('img');
            img.className = 'brand_img';
            img.src = url;
            img.alt = `Brand ${i + 1}`;
            img.loading = 'lazy';

            a.appendChild(img);
            originals.push(a);
        }

        // 2) Limpiar track
        trackEl.innerHTML = '';

        // 3) Insertar originales
        for (const a of originals) {
            a.removeAttribute('data-marquee-clone');
            trackEl.appendChild(a);
        }

        // 4) Crear clones
        const clones = originals.map((a) => {
            const c = a.cloneNode(true);
            c.setAttribute('data-marquee-clone', '1');
            // IMPORTANT: clones no deben crear nuevos IDs
            return c;
        });

        for (const c of clones) {
            trackEl.appendChild(c);
        }

        // 5) Activar animación correctamente
        this._refreshMarquee(trackEl);
    },

    _refreshMarquee(trackEl) {
        trackEl.classList.remove('is-ready');
        void trackEl.offsetWidth;
        trackEl.classList.add('is-ready');
    },
});
