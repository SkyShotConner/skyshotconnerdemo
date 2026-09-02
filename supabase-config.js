const SUPABASE_URL = "https://mlvbfdyahgszuwtgxmes.supabase.co";

const SUPABASE_KEY = "sb_publishable_l4ZBZi1Fxy_AwYVD2KDxiA_FnYNvp2z";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/* =========================================================
   AIRCRAFT PROFILE + GALLERY ENHANCEMENTS
========================================================= */

(function () {

    function addConstructionBanner() {
        if (document.getElementById("siteConstructionBanner")) return;

        const banner = document.createElement("div");
        banner.id = "siteConstructionBanner";
        banner.innerHTML = `
            <strong>SKYSHOTCONNER WEBSITE UNDER CONSTRUCTION</strong>
            <span>Some features and pages are still being developed.</span>
        `;

        const style = document.createElement("style");
        style.textContent = `
            #siteConstructionBanner{position:relative;z-index:2000;width:100%;padding:9px 16px;text-align:center;background:#0b1722;border-bottom:1px solid rgba(85,184,255,.35);color:#dcefff;font:600 10px/1.4 Inter,Arial,sans-serif;letter-spacing:.8px;text-transform:uppercase}
            #siteConstructionBanner strong{color:#55b8ff;margin-right:8px}
            #siteConstructionBanner span{color:#91a0ae}
            @media(max-width:600px){#siteConstructionBanner{font-size:8px;padding:8px 10px}#siteConstructionBanner strong{display:block;margin:0 0 2px}}
        `;
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
            stat.innerHTML = `
                <div class="stat-label">Previous Operator</div>
                <div class="stat-value" id="detailPreviousOperatorValue">—</div>
            `;
            detailStats.appendChild(stat);
        }

        const valueElement = document.getElementById("detailPreviousOperatorValue");
        if (!valueElement) return;

        valueElement.textContent = "Loading...";

        supabaseClient
            .from("aircraft")
            .select("previous_operator")
            .eq("registration", registration)
            .maybeSingle()
            .then(({ data, error }) => {
                if (error) {
                    console.error("Error loading previous operator:", error);
                    valueElement.textContent = "—";
                    return;
                }
                valueElement.textContent = data && data.previous_operator
                    ? String(data.previous_operator).trim()
                    : "—";
            });
    }


    function addGalleryRegistrationTotal() {
        if (!document.querySelector(".aircraft-grid")) return;
        if (document.getElementById("galleryRegistrationTotal")) return;

        let heading = document.querySelector(".section-title h2");
        if (!heading) heading = document.querySelector("h2");
        if (!heading) return;

        const total = document.createElement("div");
        total.id = "galleryRegistrationTotal";
        total.textContent = "Total registrations: Loading…";
        total.style.cssText = "margin-top:12px;color:#91a0ae;font:700 11px/1.4 Inter,Arial,sans-serif;letter-spacing:.8px;text-transform:uppercase;";
        heading.insertAdjacentElement("afterend", total);

        supabaseClient
            .from("aircraft")
            .select("id", { count: "exact", head: true })
            .then(({ count, error }) => {
                if (error) {
                    console.error("Error loading gallery registration total:", error);
                    total.textContent = "Total registrations: —";
                    return;
                }
                total.textContent = `Total registrations: ${Number(count || 0)}`;
            });
    }


    function initialise() {
        addConstructionBanner();
        addGalleryRegistrationTotal();

        const detail = document.getElementById("aircraftDetail");
        if (!detail) return;

        const observer = new MutationObserver(mutations => {
            const registrationElement = document.getElementById("detailRegistration");
            const relevantChange = mutations.some(mutation =>
                (mutation.type === "attributes" && mutation.target === detail && mutation.attributeName === "class") ||
                (mutation.type === "childList" && mutation.target === registrationElement)
            );
            if (detail.classList.contains("active") && relevantChange) addPreviousOperatorField();
        });

        observer.observe(detail, {
            attributes: true,
            attributeFilter: ["class"],
            childList: true,
            subtree: true
        });
    }


    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialise);
    } else {
        initialise();
    }

})();
