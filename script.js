/* ==========================================
   SKYSHOTCONNER JAVASCRIPT
   ========================================== */


/* ==========================================
   AIRCRAFT DATABASE
   ========================================== */

const aircraft = [

    {
        aircraft: "Airbus A340-541",
        registration: "A7-HHH",
        operator: "Qatar Airways",
        type: "Airliner",
        location: "Johannesburg"
    },

    {
        aircraft: "Airbus A320-232",
        registration: "ZS-GAO",
        operator: "Lift/ Global Aviation",
        type: "Airliner",
        location: "Johannesburg"
    },

    {
        aircraft: "Embraer E195-E2",
        registration: "ZS-LKG",
        operator: "Airlink",
        type: "Airliner",
        location: "Johannesburg"
    },

    {
        aircraft: "Airbus A350-941",
        registration: "A7-ALP",
        operator: "Qatar Airways",
        type: "Airliner",
        location: "Johannesburg"
    },

    {
        aircraft: "Bell 230",
        registration: "ZT-HDA",
        operator: "Henely Air/ Rocket Air Ambulance",
        type: "Helicopter",
        location: "Rand Airport"
    },

    {
        aircraft: "Airbus A350-941",
        registration: "9V-SJG",
        operator: "Singapore Airlines",
        type: "Airliner",
        location: "Johannesburg"
    },

    {
        aircraft: "Cessna 182P Skylane",
        registration: "ZS-IWK",
        operator: "Private",
        type: "General Aviation",
        location: "Rand Airport"
    },

    {
        aircraft: "Airbus A350-941",
        registration: "TC-LGB",
        operator: "Turckish Airlines",
        type: "Airliner",
        location: "Johannesburg"
    },

    {
        aircraft: "Boeing 777F/ 777-FFX",
        registration: "A6-DDC",
        operator: "Etihad Cargo",
        type: "Airliner",
        location: "Johannesburg"
    },

    {
        aircraft: "Boeing 737-8BG",
        registration: "ZS-SJO",
        operator: "FlySafair",
        type: "Airliner",
        location: "Johannesburg"
    }

];


/* ==========================================
   AIRCRAFT SEARCH
   ========================================== */

const aircraftBody =
    document.querySelector("#aircraftBody");

const emptyState =
    document.querySelector("#emptyState");

const aircraftSearch =
    document.querySelector("#aircraftSearch");

const typeFilter =
    document.querySelector("#typeFilter");


function renderAircraft() {

    const searchText =
        aircraftSearch.value
            .toLowerCase()
            .trim();


    const selectedType =
        typeFilter.value;


    const filteredAircraft =
        aircraft.filter(function (aircraft) {

            const searchableText =
                Object.values(aircraft)
                    .join(" ")
                    .toLowerCase();


            const matchesSearch =
                searchableText.includes(searchText);


            const matchesType =
                selectedType === "all" ||
                aircraft.type === selectedType;


            return matchesSearch && matchesType;

        });


    aircraftBody.innerHTML =
        filteredAircraft.map(function (aircraft) {

            return `

                <tr>

                    <td>
                        ${aircraft.aircraft}
                    </td>

                    <td>
                        ${aircraft.registration}
                    </td>

                    <td>
                        ${aircraft.operator}
                    </td>

                    <td>
                        ${aircraft.type}
                    </td>

                    <td>
                        ${aircraft.location}
                    </td>

                </tr>

            `;

        }).join("");


    if (filteredAircraft.length === 0) {

        emptyState.style.display = "block";

    } else {

        emptyState.style.display = "none";

    }

}


/* Run when typing */

aircraftSearch.addEventListener(
    "input",
    renderAircraft
);


/* Run when changing aircraft type */

typeFilter.addEventListener(
    "change",
    renderAircraft
);


/* Initial database render */

renderAircraft();


/* ==========================================
   GALLERY FILTERS
   ========================================== */

const filterButtons =
    document.querySelectorAll(".filter");


const photoCards =
    document.querySelectorAll(".photo-card");


filterButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        /* Remove active state */

        document
            .querySelector(".filter.active")
            .classList
            .remove("active");


        /* Add active state */

        button.classList.add("active");


        const selectedFilter =
            button.dataset.filter;


        photoCards.forEach(function (card) {

            const categories =
                card.dataset.category.split(" ");


            if (
                selectedFilter === "all" ||
                categories.includes(selectedFilter)
            ) {

                card.style.display = "";

            } else {

                card.style.display = "none";

            }

        });

    });

});


/* ==========================================
   HEADER SCROLL EFFECT
   ========================================== */

const header =
    document.querySelector(".site-header");


window.addEventListener("scroll", function () {

    if (window.scrollY > 20) {

        header.classList.add("scrolled");

    } else {

        header.classList.remove("scrolled");

    }

});


/* ==========================================
   MOBILE NAVIGATION
   ========================================== */

const menuButton =
    document.querySelector(".nav-toggle");


const navigation =
    document.querySelector(".nav-links");


menuButton.addEventListener(
    "click",
    function () {

        const isOpen =
            navigation.classList.toggle("open");


        menuButton.setAttribute(
            "aria-expanded",
            isOpen
        );

    }
);


/* Close menu after clicking a link */

navigation
    .querySelectorAll("a")
    .forEach(function (link) {

        link.addEventListener(
            "click",
            function () {

                navigation
                    .classList
                    .remove("open");


                menuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }
        );

    });


/* ==========================================
   CURRENT YEAR
   ========================================== */

document.querySelector("#year")
    .textContent = new Date().getFullYear();
