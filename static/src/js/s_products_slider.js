/** @odoo-module **/

import publicWidget from "web.public.widget";
import rpc from "web.rpc";

publicWidget.registry.ProductsSlider = publicWidget.Widget.extend({
    selector: ".s_products_slider",
    disabledInEditableMode: false,

    start() {
        this._isLoading = false;
        this._loadProducts();
        return this._super.apply(this, arguments);
    },

    async _loadProducts() {
        if (this._isLoading) {
            return;
        }
        this._isLoading = true;

        try {
            const $wrap = this.$(".js_products_slider_wrap");
            const $empty = this.$(".js_products_slider_empty");

            const catId = parseInt(this.el.dataset.categoryId || "0");
            const limit = parseInt(this.el.dataset.limit || "12");

            // ✅ LIMPIA siempre antes de renderizar
            $wrap.empty();

            if (!catId) {
                $empty.removeClass("d-none");
                $empty.text("Selecciona una categoría desde el Builder para mostrar productos.");
                return;
            }

            $empty.addClass("d-none");

            const domain = [
                ["sale_ok", "=", true],
                ["website_published", "=", true],
                ["public_categ_ids", "in", [catId]],
            ];

            // ✅ Campos actualizados para Odoo 16
            const fields = [
                "id", 
                "name", 
                "website_url", 
                "image_1920", 
                "product_template_image_ids",  // Imagen alternativa para hover
                "list_price",
                "product_tag_ids"  // ✅ Campo correcto en Odoo 16
            ];

            const result = await rpc.query({
                model: "product.template",
                method: "web_search_read",
                args: [],
                kwargs: {
                    domain: domain,
                    fields: fields,
                    limit: limit,
                    order: "create_date desc",
                },
            });

            let products = result.records || [];

            // ✅ Deduplicar por ID
            const seen = new Set();
            products = products.filter((p) => {
                if (!p || !p.id) return false;
                if (seen.has(p.id)) return false;
                seen.add(p.id);
                return true;
            });

            if (!products.length) {
                $empty.removeClass("d-none");
                $empty.text("No hay productos en esta categoría.");
                return;
            }

            // ✅ Cargar información de tags (colores, nombres)
            const tagInfo = await this._loadTagInfo(products);

            for (const p of products) {
                const getImageUrl = (product, isHover = false) => {
                    // Imagen principal
                    if (!isHover) {
                        return product.image_1920
                            ? `/web/image/product.template/${product.id}/image_1920`
                            : "/web/static/img/placeholder.png";
                    }
                    
                    // Imagen hover (extra media)
                    if (product.product_template_image_ids && 
                        product.product_template_image_ids.length > 0) {
                        const firstExtraImageId = product.product_template_image_ids[0];
                        return `/web/image/product.image/${firstExtraImageId}/image_1024`;
                    }
                    
                    // Fallback a imagen principal si no hay extra
                    return product.image_1920
                        ? `/web/image/product.template/${product.id}/image_1920`
                        : "/web/static/img/placeholder.png";
                };

                const imgSrc = getImageUrl(p, false);
                const backImgSrc = getImageUrl(p, true);

                // Precio formateado
                const price = p.list_price 
                    ? `$${parseFloat(p.list_price).toFixed(2)} / m²`
                    : "Consultar precio";

                // ✅ Generar badges basados en tags
                const badgesHtml = this._generateBadgesHtml(p, tagInfo);

                $wrap.append(`
                    <div class="product-card">
                        <div class="image-wrapper">
                            <img src="${imgSrc}" alt="${p.name}" class="front" loading="lazy"/>
                            <img src="${backImgSrc}" alt="${p.name}" class="back" loading="lazy"/>
                        </div>
                        <h4>${p.name}</h4>
                        <p class="price">${price}</p>
                        <div class="btn-group">
                            <a href="${p.website_url}" class="btn-primary">Agregar al carrito</a>
                            <a href="${p.website_url}" class="btn-outline">Ver más</a>
                        </div>
                        ${badgesHtml}
                    </div>
                `);
            }
            
            // ✅ Configurar funcionalidad del slider después de renderizar
            this._setupSlider();
            
        } finally {
            this._isLoading = false;
        }
    },

    /**
     * ✅ Carga información de tags (colores, nombres)
     */
    async _loadTagInfo(products) {
        // Obtener todos los IDs de tags únicos de todos los productos
        const tagIds = new Set();
        products.forEach(p => {
            if (p.product_tag_ids && Array.isArray(p.product_tag_ids)) {
                p.product_tag_ids.forEach(id => tagIds.add(id));
            }
        });

        if (tagIds.size === 0) return {};

        const tags = await rpc.query({
            model: "product.tag",
            method: "search_read",
            args: [[["id", "in", Array.from(tagIds)]]],
            kwargs: {
                fields: ["id", "name", "color"],
            },
        });

        // Crear mapa de información de tags
        const tagInfo = {};
        tags.forEach(tag => {
            tagInfo[tag.id] = {
                name: tag.name,
                color: tag.color || "#b51a2e", // Color por defecto si no tiene
            };
        });

        return tagInfo;
    },

    /**
     * ✅ Genera HTML para los badges basados en tags del producto
     */
    _generateBadgesHtml(product, tagInfo) {
        if (!product.product_tag_ids || !Array.isArray(product.product_tag_ids) || product.product_tag_ids.length === 0) {
            return '';
        }

        // Filtrar solo tags que existen
        const validTags = product.product_tag_ids
            .map(tagId => tagInfo[tagId])
            .filter(tag => tag);

        if (validTags.length === 0) return '';

        // Ordenar: tags especiales primero, luego por nombre
        const specialTagsOrder = {
            'destacado': 1,
            'oferta': 2,
            '2x1': 3,
            'nuevo': 4,
            'hot sale': 5,
            'descuento': 6,
            'featured': 7,
            'sale': 8,
            'new': 9,
            'promo': 10
        };

        validTags.sort((a, b) => {
            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();
            const aOrder = specialTagsOrder[aName] || 99;
            const bOrder = specialTagsOrder[bName] || 99;
            return aOrder - bOrder;
        });

        // Tomar máximo 2 badges para no saturar
        const displayTags = validTags.slice(0, 2);

        // Generar HTML para cada badge
        const badges = displayTags.map(tag => {
            const tagName = tag.name.toLowerCase();
            let className = 'offer-item';
            let icon = '';

            // Asignar clases específicas según el nombre del tag
            if (tagName.includes('destacado') || tagName.includes('featured')) {
                className += ' hot-sale';
                icon = '<img src="https://www.vedek.com.ar//img/icons/off-icon.svg" alt="Destacado" title="Destacado">';
            } else if (tagName.includes('oferta') || tagName.includes('sale') || tagName.includes('promo')) {
                className += ' off-sale';
                icon = '<img src="https://www.vedek.com.ar/img/icons/off-icon.svg" alt="Oferta" title="Oferta">';
            } else if (tagName.includes('2x1') || tagName.includes('2x')) {
                className += ' hot-sale';
                icon = '<img src="https://www.vedek.com.ar//img/icons/off-icon.svg" alt="2x1" title="2x1">';
            } else if (tagName.includes('nuevo') || tagName.includes('new')) {
                className += ' hot-sale';
                icon = '<img src="https://www.vedek.com.ar//img/icons/off-icon.svg" alt="Nuevo" title="Nuevo">';
            } else {
                // Tag genérico - usar color del tag
                className += ' generic-tag';
            }

            return `
                <div class="${className}" style="${className.includes('generic-tag') ? `background-color: ${tag.color}` : ''}">
                    ${icon}
                    <p class="off-title">${tag.name.toUpperCase()}</p>
                </div>
            `;
        });

        return `
            <div class="offer-block">
                ${badges.join('')}
            </div>
        `;
    },
    
    _setupSlider() {
        const $slider = this.$(".product-slider");
        const $nextBtn = this.$(".next-arrow");
        const $prevBtn = this.$(".prev-arrow");
        const $showAllBtn = this.$(".btn-show-all");
        
        if (!$slider.length || !$nextBtn.length || !$prevBtn.length) return;
        
        // ✅ Funciones para calcular scroll
        const scrollAmount = () => {
            const card = $slider.find('.product-card').first()[0];
            if (!card) return 0;
            const gap = 24; // gap de 1.5rem = 24px
            return (card.offsetWidth + gap) * 4;
        };
        
        // ✅ Eventos para flechas
        $nextBtn.on('click', () => {
            $slider[0].scrollBy({ left: scrollAmount(), behavior: 'smooth' });
        });
        
        $prevBtn.on('click', () => {
            $slider[0].scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
        });
        
        // ✅ Evento para botón "Ver toda la colección"
        if ($showAllBtn.length) {
            $showAllBtn.on('click', () => {
                const catId = this.el.dataset.categoryId;
                if (catId) {
                    window.location.href = `/shop?category=${catId}`;
                } else {
                    window.location.href = '/shop';
                }
            });
        }
        
        // ✅ Ocultar flechas en móviles
        const updateControlsVisibility = () => {
            const $controls = this.$(".controls");
            if (window.innerWidth <= 768) {
                $controls.hide();
            } else {
                $controls.show();
            }
        };
        
        updateControlsVisibility();
        $(window).on('resize', updateControlsVisibility);
    },
    
    destroy() {
        $(window).off('resize');
        this._super.apply(this, arguments);
    }
});