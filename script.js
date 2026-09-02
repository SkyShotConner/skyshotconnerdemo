/* ==========================================
   SKYSHOTCONNER — HOMEPAGE JAVASCRIPT
   ==========================================

   The homepage now uses Supabase as the single source
   of truth for aircraft and published photographs.
*/

(function () {
    "use strict";

    const client = window.supabaseClient;

    /* ------------------------------------------
       SAFETY HELPERS
    ------------------------------------------ */

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function firstValue(...values) {
        return values.find(value =>
            value !== null &&
            value !== undefined &&
            String(value).trim() !== ""
        ) ?? "";
    }

    function normalise(value) {
        return String(value ?? "").trim().toLowerCase();
    }

    function displayValue(value, fallback = "—") {
        const text = String(value ?? "").trim();
        return text || fallback;
    }

    /* ------------------------------------------
       CURRENT YEAR
    ------------------------------------------ */

    const yearElement = document.querySelector("#year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    /* ------------------------------------------
       MOBILE NAVIGATION
    ------------------------------------------ */

    const menuButton = document.querySelector(".nav-toggle");
    const navigation = document.querySelector(".nav-links");

    if (menuButton && navigation) {
        menuButton.setAttribute("aria-expanded", "false");

        menuButton.addEventListener("click", function () {
            const isOpen = navigation.classList.toggle("open");

            menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            menuButton.setAttribute(
                "aria-label",
                isOpen ? "Close navigation" : "Open navigation"
            );
        });

        navigation.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                navigation.classList.remove("open");
                menuButton.setAttribute("aria-expanded", "false");
                menuButton.setAttribute("aria-label", "Open navigation");
            });
        });
    }

    /* ------------------------------------------
       HEADER SCROLL EFFECT
    ------------------------------------------ */

    const header = document.querySelector(".site-header");

    if (header) {
        function updateHeader() {
            header.classList.toggle("scrolled", window.scrollY > 20);
        }

        window.addEventListener("scroll", updateHeader, { passive: true });
        updateHeader();
    }

    /* ------------------------------------------
       GALLERY FILTERS

       Uses event delegation so dynamically loaded
       homepage photographs are filtered correctly.
    ------------------------------------------ */

    const galleryGrid = document.querySelector("#galleryGrid");
    const filterButtons = document.querySelectorAll(".filter");

    function filterHomepagePhotos(selectedFilter) {
        if (!galleryGrid) return;

        galleryGrid.querySelectorAll(".photo-card").forEach(function (card) {
            const categories = normalise(card.dataset.category)
                .split(/\s+/)
                .filter(Boolean);

            const visible =
                selectedFilter === "all" ||
                categories.includes(normalise(selectedFilter));

            card.hidden = !visible;
        });
    }

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            filterHomepagePhotos(button.dataset.filter || "all");
        });
    });

    /* ------------------------------------------
       HOMEPAGE AIRCRAFT ARCHIVE
    ------------------------------------------ */

    const aircraftBody = document.querySelector("#aircraftBody");
    const emptyState = document.querySelector("#emptyState");
    const aircraftSearch = document.querySelector("#aircraftSearch");
    const typeFilter = document.querySelector("#typeFilter");

    let aircraftRecords = [];

    function aircraftCategory(record) {
        return firstValue(record.category, record.type, "Other");
    }

    function aircraftModel(record) {
        return firstValue(
            record.aircraft_type,
            record.type,
            record.short_type,
            record.aircraft_model,
            record.model,
            "Aircraft"
        );
    }

    function renderAircraft() {
        if (!aircraftBody) return;

        const searchText = normalise(
            aircraftSearch ? aircraftSearch.value : ""
        );

        const selectedType =
            typeFilter ? typeFilter.value : "all";

        const filtered = aircraftRecords.filter(function (record) {
            const searchableText = [
                record.aircraft_type,
                record.short_type,
                record.registration,
                record.operator,
                record.category,
                record.location,
                record.airport,
                record.manufacturer,
                record.msn,
                record.first_flight,
                record.previous_operator,
                record.notes
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch = searchableText.includes(searchText);

            const category = aircraftCategory(record);
            const type = firstValue(
                record.category,
                record.type,
                ""
            );

            const matchesType =
                selectedType === "all" ||
                category === selectedType ||
                type === selectedType;

            return matchesSearch && matchesType;
        });

        if (!filtered.length) {
            aircraftBody.innerHTML = "";

            if (emptyState) {
                emptyState.textContent = searchText || selectedType !== "all"
                    ? "No aircraft found. Try another search or filter."
                    : "No aircraft are currently available.";
                emptyState.style.display = "block";
            }

            return;
        }

        aircraftBody.innerHTML = filtered.map(function (record) {
            const model = escapeHtml(aircraftModel(record));
            const registration = escapeHtml(displayValue(record.registration));
            const operator = escapeHtml(displayValue(record.operator));
            const category = escapeHtml(aircraftCategory(record));
            const location = escapeHtml(
                firstValue(record.location, record.airport, "South Africa")
            );

            return `
                <tr>
                    <td>${model}</td>
                    <td><strong>${registration}</strong></td>
                    <td>${operator}</td>
                    <td>${category}</td>
                    <td>${location}</td>
                </tr>
            `;
        }).join("");

        if (emptyState) {
            emptyState.style.display = "none";
        }
    }

    async function loadAircraft() {
        if (!aircraftBody) return;

        if (!client) {
            console.error("Supabase client is unavailable.");
            aircraftBody.innerHTML = "";
            if (emptyState) {
                emptyState.textContent = "Aircraft database is temporarily unavailable.";
                emptyState.style.display = "block";
            }
            return;
        }

        aircraftBody.innerHTML = `
            <tr>
                <td colspan="5">Loading aircraft database…</td>
            </tr>
        `;

        const { data, error } = await client
            .from("aircraft")
            .select("*")
            .order("registration", { ascending: true });

        if (error) {
            console.error("Error loading aircraft:", error);
            aircraftBody.innerHTML = "";

            if (emptyState) {
                emptyState.textContent = "Unable to load the aircraft database right now.";
                emptyState.style.display = "block";
            }

            return;
        }

        aircraftRecords = Array.isArray(data) ? data : [];
        renderAircraft();
    }

    if (aircraftSearch) {
        aircraftSearch.addEventListener("input", renderAircraft);
    }

    if (typeFilter) {
        typeFilter.addEventListener("change", renderAircraft);
    }

    /* ------------------------------------------
       HOMEPAGE LATEST SHOTS
    ------------------------------------------ */

    function photoCategory(photo, aircraft) {
        const raw = firstValue(
            photo.category,
            aircraft && aircraft.category,
            "commercial"
        );

        const category = normalise(raw);

        const categories = [];

        if (category.includes("commercial") || category.includes("airliner")) {
            categories.push("commercial");
        }

        if (category.includes("general")) {
            categories.push("general");
        }

        if (category.includes("military")) {
            categories.push("military");
        }

        if (category.includes("helicopter") || category.includes("rotor")) {
            categories.push("helicopter");
        }

        if (category.includes("golden") || category.includes("sunset")) {
            categories.push("golden");
        }

        if (!categories.length) {
            categories.push(category.replace(/[^a-z0-9-]/g, "") || "commercial");
        }

        return [...new Set(categories)].join(" ");
    }

    function photoLabel(photo, aircraft) {
        const categories = photoCategory(photo, aircraft)
            .split(" ")
            .filter(Boolean);

        const labels = [];

        if (categories.includes("commercial")) labels.push("COMMERCIAL");
        if (categories.includes("general")) labels.push("GENERAL AVIATION");
        if (categories.includes("military")) labels.push("MILITARY");
        if (categories.includes("helicopter")) labels.push("HELICOPTER");
        if (categories.includes("golden")) labels.push("GOLDEN HOUR");

        return labels.join(" • ") || "AVIATION PHOTOGRAPHY";
    }

    function renderLatestShots(photos, aircraftMap) {
        if (!galleryGrid) return;

        if (!photos.length) {
            galleryGrid.innerHTML = `
                <p class="photo-note">
                    No published photographs are currently available.
                </p>
            `;
            return;
        }

        galleryGrid.innerHTML = photos.map(function (photo, index) {
            const aircraft = aircraftMap.get(photo.aircraft_id) || null;
            const categories = photoCategory(photo, aircraft);
            const imageUrl = firstValue(
                photo.thumbnail_url,
                photo.image_url
            );

            const title = firstValue(
                photo.title,
                aircraft && aircraft.aircraft_type,
                "Aviation Photograph"
            );

            const location = firstValue(
                photo.location,
                aircraft && aircraft.location,
                aircraft && aircraft.airport,
                "South Africa"
            );

            const className =
                index === 0 || index === 4
                    ? "photo-card wide"
                    : index === 3
                        ? "photo-card tall"
                        : "photo-card";

            return `
                <article class="${className}" data-category="${escapeHtml(categories)}">
                    <img
                        src="${escapeHtml(imageUrl)}"
                        alt="${escapeHtml(title)}"
                        loading="${index < 2 ? "eager" : "lazy"}"
                        decoding="async"
                    >
                    <div class="photo-info">
                        <span>${escapeHtml(photoLabel(photo, aircraft))}</span>
                        <h3>${escapeHtml(title)}</h3>
                        <p>${escapeHtml(location)}</p>
                    </div>
                </article>
            `;
        }).join("");

        const activeFilter = document.querySelector(".filter.active");
        filterHomepagePhotos(activeFilter ? activeFilter.dataset.filter : "all");
    }

    async function loadLatestShots() {
        if (!galleryGrid) return;

        if (!client) {
            console.error("Supabase client is unavailable.");
            return;
        }

        const { data: photos, error: photoError } = await client
            .from("photos")
            .select("*")
            .eq("published", true)
            .order("created_at", { ascending: false })
            .limit(12);

        if (photoError) {
            console.error("Error loading homepage photographs:", photoError);
            return;
        }

        const photoList = Array.isArray(photos) ? photos : [];

        const aircraftIds = [
            ...new Set(
                photoList
                    .map(photo => photo.aircraft_id)
                    .filter(Boolean)
            )
        ];

        let aircraftMap = new Map();

        if (aircraftIds.length) {
            const { data: aircraftData, error: aircraftError } = await client
                .from("aircraft")
                .select("id, registration, aircraft_type, short_type, operator, category, location, airport")
                .in("id", aircraftIds);

            if (aircraftError) {
                console.error("Error loading aircraft for homepage photographs:", aircraftError);
            } else {
                aircraftMap = new Map(
                    (aircraftData || []).map(record => [record.id, record])
                );
            }
        }

        renderLatestShots(photoList.slice(0, 6), aircraftMap);
    }

    /* ------------------------------------------
       INITIALISE
    ------------------------------------------ */

    if (client) {
        loadAircraft();
        loadLatestShots();
    } else {
        console.warn(
            "SkyShotConner: supabaseClient was not found. " +
            "Make sure supabase-config.js loads before script.js."
        );
    }

})();
