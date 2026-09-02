const SUPABASE_URL = "https://mlvbfdyahgszuwtgxmes.supabase.co";

const SUPABASE_KEY = "sb_publishable_l4ZBZi1Fxy_AwYVD2KDxiA_FnYNvp2z";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/* =========================================================
   AIRCRAFT PROFILE ENHANCEMENTS
   Adds Previous Operator to the existing aircraft profile.
   The observer is deliberately limited to aircraft-detail
   changes so updating the displayed value cannot trigger an
   infinite MutationObserver loop.
========================================================= */

(function () {

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
                <div class="stat-label">
                    Previous Operator
                </div>
                <div class="stat-value" id="detailPreviousOperatorValue">
                    —
                </div>
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
                    console.error(
                        "Error loading previous operator:",
                        error
                    );

                    valueElement.textContent = "—";
                    return;
                }

                valueElement.textContent =
                    data && data.previous_operator
                        ? String(data.previous_operator).trim()
                        : "—";

            });

    }


    const observer = new MutationObserver(mutations => {

        const detail = document.getElementById("aircraftDetail");
        const registrationElement = document.getElementById("detailRegistration");

        if (!detail || !detail.classList.contains("active")) return;

        const relevantChange = mutations.some(mutation => {

            /* Run when the aircraft detail section becomes active. */
            if (
                mutation.type === "attributes" &&
                mutation.target === detail &&
                mutation.attributeName === "class"
            ) {
                return true;
            }

            /* Run when openAircraft() changes the registration. */
            if (
                mutation.type === "childList" &&
                mutation.target === registrationElement
            ) {
                return true;
            }

            return false;

        });

        if (relevantChange) {
            addPreviousOperatorField();
        }

    });


    function initializeObserver() {

        const detail = document.getElementById("aircraftDetail");

        if (!detail) return;

        observer.observe(detail, {
            attributes: true,
            attributeFilter: ["class"],
            childList: true,
            subtree: true
        });

    }


    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeObserver
        );
    } else {
        initializeObserver();
    }

})();
