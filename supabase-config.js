const SUPABASE_URL = "https://mlvbfdyahgszuwtgxmes.supabase.co";

const SUPABASE_KEY = "sb_publishable_l4ZBZi1Fxy_AwYVD2KDxiA_FnYNvp2z";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

(function () {
    function addConstructionBanner() {
        if (document.getElementById("siteConstructionBanner")) return;
        const banner = document.createElement("div");
        banner.id = "siteConstructionBanner";
        banner.innerHTML = `<strong>SKYSHOTCONNER WEBSITE UNDER CONSTRUCTION</strong><span>Some features and pages are still being developed.</span>`;
        const style = document.createElement("style");
        style.textContent = `#siteConstructionBanner{position:relative;z-index:2000;width:100%;padding:9px 16px;text-align:center;background:#0b1722;border-bottom:1px solid rgba(85,184,255,.35);color:#dcefff;font:600 10px/1.4 Inter,Arial,sans-serif;letter-spacing:.8px;text-transform:uppercase}#siteConstructionBanner strong{color:#55b8ff;margin-right:8px}#siteConstructionBanner span{color:#91a0ae}@media(max-width:600px){#siteConstructionBanner{font-size:8px;padding:8px 10px}#siteConstructionBanner strong{display:block;margin:0 0 2px}}`;
        document.head.appendChild(style);
        document.body.prepend(banner);
    }

    function addPreviousOperatorField() {
        const detailStats = document.querySelector(".detail-stats");
        const registrationElement = document.getElementById("detailRegistration");
        if (!detailStats || !registrationElement) return;
        const registration = registrationElement.textContent.trim();
        if (!registration) return;
        let stat = document.getElementById("detailPreviousOperator");
        if (!stat) {
            stat = document.createElement("div");
            stat.className = "stat";
            stat.id = "detailPreviousOperator";
            stat.innerHTML = `<div class="stat-label">Previous Operator</div><div class="stat-value" id="detailPreviousOperatorValue">—</div>`;
            detailStats.appendChild(stat);
        }
        const valueElement = document.getElementById("detailPreviousOperatorValue");
        if (!valueElement) return;
        valueElement.textContent = "Loading...";
        supabaseClient.from("aircraft").select("previous_operator").eq("registration", registration).maybeSingle().then(({ data, error }) => {
            if (error) { console.error("Error loading previous operator:", error); valueElement.textContent = "—"; return; }
            valueElement.textContent = data && data.previous_operator ? String(data.previous_operator).trim() : "—";
        });
    }

    function addGalleryRegistrationTotal() {
        if (!document.querySelector(".aircraft-grid") || document.getElementById("galleryRegistrationTotal")) return;
        let heading = document.querySelector(".section-title h2") || document.querySelector("h2");
        if (!heading) return;
        const total = document.createElement("div");
        total.id = "galleryRegistrationTotal";
        total.textContent = "Total registrations: Loading…";
        total.style.cssText = "margin-top:12px;color:#91a0ae;font:700 11px/1.4 Inter,Arial,sans-serif;letter-spacing:.8px;text-transform:uppercase;";
        heading.insertAdjacentElement("afterend", total);
        supabaseClient.from("aircraft").select("id", { count: "exact", head: true }).then(({ count, error }) => {
            if (error) { total.textContent = "Total registrations: —"; return; }
            total.textContent = `Total registrations: ${Number(count || 0)}`;
        });
    }

    async function renderDatabaseShop() {
        const locations = document.querySelector("#locations");
        if (!locations || locations.dataset.shopDatabaseRendered === "true") return;
        const container = locations.querySelector(".container");
        const grid = container && container.querySelector(".location-grid, .shop-card-grid");
        if (!container || !grid) return;
        locations.dataset.shopDatabaseRendered = "true";
        const { data, error } = await supabaseClient.from("shop_products").select("id,name,description,image_url,product_url,price,active,sort_order").eq("active", true).order("sort_order", { ascending: true });
        if (error) { console.error("Error loading shop products:", error); return; }
        const products = Array.isArray(data) ? data : [];
        const heading = container.querySelector(".section-heading");
        if (heading) {
            const eyebrow = heading.querySelector(".eyebrow");
            const title = heading.querySelector("h2");
            const intro = heading.querySelector(".section-intro");
            if (eyebrow) eyebrow.textContent = "SHOP SKYSHOTCONNER";
            if (title) title.innerHTML = `Aviation <span>Prints</span>`;
            if (intro) intro.textContent = "Choose a canvas size for a SkyShotConner aviation photograph.";
        }
        grid.className = "shop-card-grid";
        grid.innerHTML = products.map((p, i) => {
            const action = p.product_url ? `<a class="btn btn-ghost" href="${escapeHtml(p.product_url)}" target="_blank" rel="noopener noreferrer">View Product →</a>` : `<a class="btn btn-ghost" href="shop.html">View Shop →</a>`;
            const image = p.image_url ? `<img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.name)}" loading="lazy">` : `<div style="height:100%;display:grid;place-items:center;color:#91a0ae;font-weight:800">SKYSHOTCONNER</div>`;
            return `<article class="shop-product-card"><div class="shop-product-image">${image}</div><div class="shop-product-body"><span>${String(i + 1).padStart(2, "0")}</span><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description || "Aviation photography canvas print.")}</p><strong>${escapeHtml(p.price || "Price on request")}</strong>${action}</div></article>`;
        }).join("") || `<p class="photo-note">Shop products are currently being prepared.</p>`;
        if (!document.getElementById("databaseShopStyles")) {
            const style = document.createElement("style");
            style.id = "databaseShopStyles";
            style.textContent = `.shop-card-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.shop-product-card{overflow:hidden;background:#0d1219;border:1px solid rgba(255,255,255,.1)}.shop-product-image{aspect-ratio:16/9;background:#080d13;overflow:hidden}.shop-product-image img{width:100%;height:100%;object-fit:contain}.shop-product-body{padding:18px}.shop-product-body>span{color:#55b8ff;font-size:10px;font-weight:800;letter-spacing:1.5px}.shop-product-body h3{margin:7px 0;font-family:Montserrat,Arial,sans-serif;font-size:17px;text-transform:uppercase}.shop-product-body p{color:#98a4b2;font-size:12px;min-height:38px}.shop-product-body strong{display:block;margin:12px 0;font-size:18px}.shop-product-body .btn{margin-top:4px}@media(max-width:900px){.shop-card-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.shop-card-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.shop-product-body{padding:12px}.shop-product-body h3{font-size:13px}.shop-product-body p{font-size:10px;min-height:0}.shop-product-body strong{font-size:14px}}`;
            document.head.appendChild(style);
        }
    }

    function escapeHtml(value) { return String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;"); }

    function initialise() {
        addConstructionBanner();
        addGalleryRegistrationTotal();
        const detail = document.getElementById("aircraftDetail");
        if (detail) {
            const observer = new MutationObserver(() => { if (detail.classList.contains("active")) addPreviousOperatorField(); });
            observer.observe(detail, { attributes:true, childList:true, subtree:true, attributeFilter:["class"] });
        }
        const locations = document.getElementById("locations");
        if (locations) {
            const observer = new MutationObserver(() => renderDatabaseShop());
            observer.observe(locations, { childList:true, subtree:true });
            setTimeout(renderDatabaseShop, 100);
        }
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialise); else initialise();
})();