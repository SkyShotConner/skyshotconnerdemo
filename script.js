/* ==========================================
   SKYSHOTCONNER — HOMEPAGE JAVASCRIPT
   ========================================== */

(function () {
    "use strict";

    const SUPABASE_URL = "https://mlvbfdyahgszuwtgxmes.supabase.co";
    const SUPABASE_KEY = "sb_publishable_l4ZBZi1Fxy_AwYVD2KDxiA_FnYNvp2z";

    function escapeHtml(value) {
        return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
    }
    function firstValue(...values) { return values.find(value => value !== null && value !== undefined && String(value).trim() !== "") ?? ""; }
    function normalise(value) { return String(value ?? "").trim().toLowerCase(); }
    function displayValue(value, fallback = "—") { const text = String(value ?? "").trim(); return text || fallback; }
    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            const existing = document.querySelector(`script[src="${src}"]`);
            if (existing) { if (existing.dataset.loaded === "true") return resolve(); existing.addEventListener("load", resolve, { once: true }); existing.addEventListener("error", reject, { once: true }); return; }
            const script = document.createElement("script"); script.src = src; script.async = false;
            script.addEventListener("load", function () { script.dataset.loaded = "true"; resolve(); }, { once: true });
            script.addEventListener("error", reject, { once: true }); document.head.appendChild(script);
        });
    }
    async function getSupabaseClient() {
        if (typeof supabaseClient !== "undefined") return supabaseClient;
        if (!window.supabase || typeof window.supabase.createClient !== "function") await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2");
        if (!window.supabase || typeof window.supabase.createClient !== "function") throw new Error("Supabase library could not be loaded.");
        return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }

    function addConstructionBanner() {
        if (document.getElementById("siteConstructionBanner")) return;
        const banner = document.createElement("div");
        banner.id = "siteConstructionBanner";
        banner.innerHTML = `<strong>SKYSHOTCONNER WEBSITE UNDER CONSTRUCTION</strong><span>Some features and pages are still being developed.</span>`;
        const style = document.createElement("style");
        style.textContent = `#siteConstructionBanner{position:relative;z-index:2000;width:100%;padding:9px 16px;text-align:center;background:#0b1722;border-bottom:1px solid rgba(85,184,255,.35);color:#dcefff;font:600 10px/1.4 Inter,Arial,sans-serif;letter-spacing:.8px;text-transform:uppercase}#siteConstructionBanner strong{color:#55b8ff;margin-right:8px}@media(max-width:600px){#siteConstructionBanner{font-size:8px;padding:8px 10px}#siteConstructionBanner strong{display:block;margin:0 0 2px}}`;
        document.head.appendChild(style); document.body.prepend(banner);
    }
    addConstructionBanner();

    const yearElement = document.querySelector("#year"); if (yearElement) yearElement.textContent = new Date().getFullYear();
    const menuButton = document.querySelector(".nav-toggle"); const navigation = document.querySelector(".nav-links");
    if (menuButton && navigation) {
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.addEventListener("click", function () { const isOpen = navigation.classList.toggle("open"); menuButton.setAttribute("aria-expanded", String(isOpen)); menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation"); });
        navigation.querySelectorAll("a").forEach(link => link.addEventListener("click", function () { navigation.classList.remove("open"); menuButton.setAttribute("aria-expanded", "false"); menuButton.setAttribute("aria-label", "Open navigation"); }));
    }
    document.querySelectorAll('a[target="_blank"]').forEach(function (link) { const rel = new Set((link.getAttribute("rel") || "").split(/\s+/).filter(Boolean)); rel.add("noopener"); rel.add("noreferrer"); link.setAttribute("rel", [...rel].join(" ")); });
    const instagramLink = document.querySelector('a[href="https://www.instagram.com/@skyshotconner"]'); if (instagramLink) instagramLink.href = "https://www.instagram.com/skyshotconner";
    document.querySelectorAll('a[href*="redbubble.com"]').forEach(function (link) { link.href = "shop.html"; link.textContent = "Aviation Prints"; link.removeAttribute("target"); });

    const galleryGrid = document.querySelector("#galleryGrid");
    const filterButtons = document.querySelectorAll(".filter");

    function installLatestShotStyles() {
        if (document.getElementById("latestShotResponsiveStyles")) return;
        const style = document.createElement("style"); style.id = "latestShotResponsiveStyles";
        style.textContent = `#galleryGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}#galleryGrid .photo-card{position:relative;min-width:0;overflow:hidden;aspect-ratio:16/9;border-radius:14px}#galleryGrid .photo-card.wide,#galleryGrid .photo-card.tall{grid-column:auto;grid-row:auto;aspect-ratio:16/9}#galleryGrid .photo-card img{display:block;width:100%;height:100%;object-fit:contain;object-position:center;background:#080d13}#galleryGrid .photo-info{position:absolute;left:0;right:0;bottom:0}@media(max-width:900px){#galleryGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){#galleryGrid{grid-template-columns:1fr;gap:12px}#galleryGrid .photo-card{aspect-ratio:16/9}}`;
        document.head.appendChild(style);
    }
    installLatestShotStyles();

    function normaliseHomepageFilters() {
        filterButtons.forEach(function (button) {
            const value = normalise(button.dataset.filter);
            if (value === "military" || value === "golden") button.remove();
        });
        const archiveFilter = document.querySelector("#typeFilter");
        if (archiveFilter) {
            const airliner = [...archiveFilter.options].find(option => normalise(option.value) === "airliner");
            if (airliner) { airliner.value = "Commercial"; airliner.textContent = "Commercial"; }
        }
    }
    normaliseHomepageFilters();

    function filterHomepagePhotos(selectedFilter) {
        if (!galleryGrid) return;
        galleryGrid.querySelectorAll(".photo-card").forEach(function (card) {
            const categories = normalise(card.dataset.category).split(/\s+/).filter(Boolean);
            card.hidden = !(selectedFilter === "all" || categories.includes(normalise(selectedFilter)));
        });
    }
    filterButtons.forEach(button => button.addEventListener("click", function () { filterButtons.forEach(btn => btn.classList.remove("active")); button.classList.add("active"); filterHomepagePhotos(button.dataset.filter || "all"); }));

    const aircraftBody = document.querySelector("#aircraftBody"); const emptyState = document.querySelector("#emptyState"); const aircraftSearch = document.querySelector("#aircraftSearch"); const typeFilter = document.querySelector("#typeFilter");
    let aircraftRecords = []; let archivePage = 1; const archivePageSize = 10;
    function aircraftCategory(record) { return firstValue(record.category, record.type, "Other"); }
    function aircraftModel(record) { return firstValue(record.aircraft_type, record.type, record.short_type, record.aircraft_model, record.model, "Aircraft"); }
    function categoryMatches(record, selectedType) {
        if (selectedType === "all") return true;
        const category = normalise(aircraftCategory(record));
        const aliases = { "commercial": ["commercial", "airliner"], "airliner": ["airliner", "commercial"], "business": ["business", "business aviation"], "general aviation": ["general aviation", "general"], "military": ["military"], "helicopter": ["helicopter", "rotorcraft"] };
        return (aliases[normalise(selectedType)] || [normalise(selectedType)]).some(alias => category.includes(alias));
    }
    function ensureArchiveUI() {
        if (!aircraftBody) return; const wrap = aircraftBody.closest(".table-wrap"); if (!wrap) return;
        if (!document.getElementById("archiveTotal")) { const total = document.createElement("div"); total.id = "archiveTotal"; total.setAttribute("aria-live", "polite"); total.style.cssText = "margin:0 0 14px;color:#91a0ae;font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;"; wrap.parentNode.insertBefore(total, wrap); }
        if (!document.getElementById("archivePagination")) { const pagination = document.createElement("div"); pagination.id = "archivePagination"; pagination.style.cssText = "display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:24px;"; wrap.parentNode.insertBefore(pagination, wrap.nextSibling); }
    }
    function renderPagination(totalPages) {
        const pagination = document.getElementById("archivePagination"); if (!pagination) return; if (totalPages <= 1) { pagination.innerHTML = ""; return; }
        pagination.innerHTML = Array.from({ length: totalPages }, (_, i) => { const page = i + 1; return `<button type="button" data-page="${page}" style="padding:9px 13px;border:1px solid rgba(255,255,255,.1);background:${page === archivePage ? "#55b8ff" : "transparent"};color:${page === archivePage ? "#06111a" : "#aeb9c4"};font-weight:800;cursor:pointer">${page}</button>`; }).join("");
        pagination.querySelectorAll("button").forEach(button => button.addEventListener("click", function () { archivePage = Number(button.dataset.page) || 1; renderAircraft(); document.getElementById("archive")?.scrollIntoView({ behavior: "smooth", block: "start" }); }));
    }
    function renderAircraft() {
        if (!aircraftBody) return; ensureArchiveUI(); const searchText = normalise(aircraftSearch ? aircraftSearch.value : ""); const selectedType = typeFilter ? typeFilter.value : "all";
        const filtered = aircraftRecords.filter(function (record) { const searchableText = [record.aircraft_type, record.short_type, record.registration, record.operator, record.category, record.location, record.airport, record.manufacturer, record.msn, record.first_flight, record.previous_operator, record.notes].filter(Boolean).join(" ").toLowerCase(); return searchableText.includes(searchText) && categoryMatches(record, selectedType); });
        const totalPages = Math.max(1, Math.ceil(filtered.length / archivePageSize)); if (archivePage > totalPages) archivePage = totalPages; const start = (archivePage - 1) * archivePageSize; const pageRecords = filtered.slice(start, start + archivePageSize);
        const total = document.getElementById("archiveTotal"); if (total) total.textContent = `Total aircraft registrations: ${aircraftRecords.length} • Showing ${filtered.length} matching`;
        if (!pageRecords.length) { aircraftBody.innerHTML = ""; if (emptyState) { emptyState.textContent = searchText || selectedType !== "all" ? "No aircraft found. Try another search or filter." : "No aircraft are currently available."; emptyState.style.display = "block"; } renderPagination(totalPages); return; }
        aircraftBody.innerHTML = pageRecords.map(function (record) { return `<tr><td>${escapeHtml(aircraftModel(record))}</td><td><strong>${escapeHtml(displayValue(record.registration))}</strong></td><td>${escapeHtml(displayValue(record.operator))}</td><td>${escapeHtml(aircraftCategory(record))}</td><td>${escapeHtml(firstValue(record.location, record.airport, "South Africa"))}</td></tr>`; }).join("");
        if (emptyState) emptyState.style.display = "none"; renderPagination(totalPages);
    }
    if (aircraftSearch) aircraftSearch.addEventListener("input", function () { archivePage = 1; renderAircraft(); });
    if (typeFilter) typeFilter.addEventListener("change", function () { archivePage = 1; renderAircraft(); });

    function photoCategory(photo, aircraft) {
        const raw = firstValue(photo.category, aircraft && aircraft.category, "commercial"); const category = normalise(raw); const categories = [];
        if (category.includes("commercial") || category.includes("airliner")) categories.push("commercial");
        if (category.includes("general")) categories.push("general");
        if (category.includes("military")) categories.push("military");
        if (category.includes("helicopter") || category.includes("rotor")) categories.push("helicopter");
        if (category.includes("golden") || category.includes("sunset")) categories.push("golden");
        if (!categories.length) categories.push(category.replace(/[^a-z0-9-]/g, "") || "commercial");
        return [...new Set(categories)].join(" ");
    }
    function photoLabel(photo, aircraft) {
        const categories = photoCategory(photo, aircraft).split(" "); const labels = [];
        if (categories.includes("commercial")) labels.push("COMMERCIAL"); if (categories.includes("general")) labels.push("GENERAL AVIATION"); if (categories.includes("military")) labels.push("MILITARY"); if (categories.includes("helicopter")) labels.push("HELICOPTER"); if (categories.includes("golden")) labels.push("GOLDEN HOUR");
        return labels.join(" • ") || "AVIATION PHOTOGRAPHY";
    }
    function renderLatestShots(photos, aircraftMap) {
        if (!galleryGrid) return; if (!photos.length) { galleryGrid.innerHTML = `<p class="photo-note">No published photographs are currently available.</p>`; return; }
        galleryGrid.innerHTML = photos.map(function (photo, index) { const aircraft = aircraftMap.get(photo.aircraft_id) || null; const categories = photoCategory(photo, aircraft); const imageUrl = firstValue(photo.thumbnail_url, photo.image_url); const title = firstValue(photo.title, aircraft && aircraft.aircraft_type, "Aviation Photograph"); const location = firstValue(photo.location, aircraft && aircraft.location, aircraft && aircraft.airport, "South Africa"); return `<article class="photo-card" data-category="${escapeHtml(categories)}"><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" loading="${index < 2 ? "eager" : "lazy"}" decoding="async"><div class="photo-info"><span>${escapeHtml(photoLabel(photo, aircraft))}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(location)}</p></div></article>`; }).join("");
        const activeFilter = document.querySelector(".filter.active"); filterHomepagePhotos(activeFilter ? activeFilter.dataset.filter : "all");
    }
    async function loadAircraft(client) {
        if (!aircraftBody || !client) return; aircraftBody.innerHTML = `<tr><td colspan="5">Loading aircraft database…</td></tr>`;
        const { data, error } = await client.from("aircraft").select("*").order("registration", { ascending: true });
        if (error) { console.error("Error loading aircraft:", error); aircraftBody.innerHTML = ""; if (emptyState) { emptyState.textContent = "Unable to load the aircraft database right now."; emptyState.style.display = "block"; } return; }
        aircraftRecords = Array.isArray(data) ? data : []; archivePage = 1; renderAircraft();
    }
    async function loadLatestShots(client) {
        if (!galleryGrid || !client) return;
        const { data: photos, error: photoError } = await client.from("photos").select("*").eq("published", true).order("created_at", { ascending: false });
        if (photoError) { console.error("Error loading homepage photographs:", photoError); return; }
        const photoList = Array.isArray(photos) ? photos : []; const aircraftIds = [...new Set(photoList.map(photo => photo.aircraft_id).filter(Boolean))]; let aircraftMap = new Map();
        if (aircraftIds.length) { const { data: aircraftData, error: aircraftError } = await client.from("aircraft").select("id, registration, aircraft_type, short_type, operator, category, location, airport").in("id", aircraftIds); if (!aircraftError) aircraftMap = new Map((aircraftData || []).map(record => [record.id, record])); }
        const visible = photoList.slice(0, Math.min(12, photoList.length));
        renderLatestShots(visible.slice(0, 6), aircraftMap);
        if (visible.length > 6) {
            let offset = 0;
            window.setInterval(function () { offset = (offset + 1) % visible.length; const rotated = Array.from({ length: Math.min(6, visible.length) }, (_, i) => visible[(offset + i) % visible.length]); renderLatestShots(rotated, aircraftMap); }, 7000);
        }
    }

    function replaceLocationsWithShop() {
        const locations = document.querySelector("#locations"); if (!locations) return; const container = locations.querySelector(".container"); if (!container) return; const heading = container.querySelector(".section-heading");
        if (heading) { const eyebrow = heading.querySelector(".eyebrow"); const title = heading.querySelector("h2"); const intro = heading.querySelector(".section-intro"); if (eyebrow) eyebrow.textContent = "SHOP SKYSHOTCONNER"; if (title) title.innerHTML = `Aviation <span>Prints</span>`; if (intro) intro.textContent = "Bring aviation photography home with SkyShotConner prints and canvases."; }
        const grid = container.querySelector(".location-grid"); if (!grid || grid.dataset.shopReplaced) return; grid.dataset.shopReplaced = "true"; grid.className = "shop-card-grid";
        grid.innerHTML = `<article class="shop-card"><div class="shop-card-number">01</div><h3>Canvas Prints</h3><p>Turn your favourite SkyShotConner aircraft photograph into a display piece.</p><a href="shop.html" class="btn btn-primary">Shop Canvases <span>→</span></a></article><article class="shop-card"><div class="shop-card-number">02</div><h3>Aviation Prints</h3><p>Browse the SkyShotConner aviation print collection and choose your favourite frame.</p><a href="shop.html" class="btn btn-ghost">View Prints <span>→</span></a></article><div class="shop-card-full"><a href="shop.html" class="btn btn-primary">View Full Shop <span>→</span></a></div>`;
        const style = document.createElement("style"); style.textContent = `.shop-card-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.shop-card{padding:28px;background:#0d1219;border:1px solid rgba(255,255,255,.1)}.shop-card-number{color:#55b8ff;font-weight:800;font-size:10px;letter-spacing:1px}.shop-card h3{margin-top:10px;font-family:Montserrat,sans-serif;font-size:24px;text-transform:uppercase}.shop-card p{margin:10px 0 22px;color:#91a0ae;font-size:12px}.shop-card .btn{display:inline-flex}.shop-card-full{grid-column:1/-1;text-align:center;margin-top:4px}@media(max-width:600px){.shop-card-grid{grid-template-columns:1fr}.shop-card-full{grid-column:auto}}`; document.head.appendChild(style);
    }
    replaceLocationsWithShop();

    function fixNavigationLabels() {
        document.querySelectorAll('a[href="#locations"]').forEach(function (link) { link.href = "shop.html"; link.textContent = "Shop"; });
        document.querySelectorAll('a[href="#archive"]').forEach(function (link) { link.textContent = "Aircraft Archive"; });
    }
    fixNavigationLabels();

    function setupAboutPlaceholder() { const aboutImage = document.querySelector(".about-image"); if (!aboutImage) return; aboutImage.setAttribute("aria-label", "SkyShotConner photographer placeholder image"); const style = document.createElement("style"); style.textContent = `.about-image{border-radius:50%;aspect-ratio:1/1;background:radial-gradient(circle at center,#182534 0%,#0d1219 65%,#070a0f 100%) !important;border:1px solid rgba(85,184,255,.25);display:grid !important;place-items:center}.about-image:after{content:"YOUR PHOTO\A COMING SOON";white-space:pre;text-align:center;color:#91a0ae;font:800 11px/1.7 Montserrat,Arial,sans-serif;letter-spacing:1.5px}`; document.head.appendChild(style); }
    setupAboutPlaceholder();

    async function initialise() { try { const client = await getSupabaseClient(); await Promise.all([loadAircraft(client), loadLatestShots(client)]); } catch (error) { console.error("SkyShotConner homepage initialisation failed:", error); if (aircraftBody && emptyState) { aircraftBody.innerHTML = ""; emptyState.textContent = "The aircraft database is temporarily unavailable."; emptyState.style.display = "block"; } } }
    initialise();
})();