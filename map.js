document.addEventListener("DOMContentLoaded", function () {

    const mapElement = document.getElementById("map");

    if (!mapElement) {
        return;
    }


    // Create the map
    const map = L.map("map").setView(
        [17.3850, 78.4867],
        12
    );


    // OpenStreetMap
    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);


    console.log("SafePass map loaded successfully.");


    // Ambulance marker
    const ambulanceIcon = L.divIcon({
        className: "custom-map-marker",
        html: `
            <div class="ambulance-marker">
                🚑
            </div>
        `,
        iconSize: [42, 42],
        iconAnchor: [21, 21],
        popupAnchor: [0, -21]
    });


    // Hospital marker
    const hospitalIcon = L.divIcon({
        className: "custom-map-marker",
        html: `
            <div class="hospital-marker">
                🏥
            </div>
        `,
        iconSize: [42, 42],
        iconAnchor: [21, 21],
        popupAnchor: [0, -21]
    });


    // Load ambulances
    async function loadAmbulancesOnMap() {

        try {

            const response =
                await fetch("/api/ambulances");

            const ambulances =
                await response.json();


            ambulances.forEach(function (ambulance) {

                if (
                    ambulance.latitude === null ||
                    ambulance.longitude === null
                ) {
                    return;
                }


                const marker = L.marker(
                    [
                        ambulance.latitude,
                        ambulance.longitude
                    ],
                    {
                        icon: ambulanceIcon
                    }
                ).addTo(map);


                marker.bindPopup(`
                    <strong>🚑 ${ambulance.ambulance_code}</strong>
                    <br><br>
                    Status: ${ambulance.status}
                    <br>
                    Location: Emergency Vehicle
                `);

            });


            console.log("Ambulance markers loaded.");

        } catch (error) {

            console.error(
                "Could not load ambulance locations:",
                error
            );

        }

    }


    // Load hospitals
    async function loadHospitalsOnMap() {

        try {

            const response =
                await fetch("/api/hospitals");

            const hospitals =
                await response.json();


            hospitals.forEach(function (hospital) {

                if (
                    hospital.latitude === null ||
                    hospital.longitude === null
                ) {
                    return;
                }


                const marker = L.marker(
                    [
                        hospital.latitude,
                        hospital.longitude
                    ],
                    {
                        icon: hospitalIcon
                    }
                ).addTo(map);


                marker.bindPopup(`
                    <strong>🏥 ${hospital.name}</strong>
                    <br><br>
                    Emergency:
                    ${
                        hospital.emergency_available
                            ? "Available"
                            : "Unavailable"
                    }
                `);

            });


            console.log("Hospital markers loaded.");

        } catch (error) {

            console.error(
                "Could not load hospital locations:",
                error
            );

        }

    }


        // Load traffic bottlenecks
    async function loadTrafficOnMap() {

        try {

            const response =
                await fetch("/api/traffic");

            const trafficData =
                await response.json();


            // Demo coordinates for simulated junctions
            const junctionLocations = {

                "Junction A": [17.3850, 78.4867],

                "Junction B": [17.3920, 78.4800],

                "Junction C": [17.3980, 78.4900],

                "Junction D": [17.3780, 78.4950],

                "Junction E": [17.3880, 78.5020]

            };


            trafficData.forEach(function (traffic) {

                const location =
                    junctionLocations[traffic.road_name];


                if (!location) {
                    return;
                }


                let markerClass =
                    "traffic-low-marker";


                if (traffic.risk_level === "MEDIUM") {

                    markerClass =
                        "traffic-medium-marker";

                }


                if (traffic.risk_level === "HIGH") {

                    markerClass =
                        "traffic-high-marker";

                }


                const trafficIcon = L.divIcon({

                    className: "custom-map-marker",

                    html: `
                        <div class="${markerClass}">
                            !
                        </div>
                    `,

                    iconSize: [32, 32],

                    iconAnchor: [16, 16],

                    popupAnchor: [0, -16]

                });


                const marker = L.marker(
                    location,
                    {
                        icon: trafficIcon
                    }
                ).addTo(map);


                marker.bindPopup(`

                    <strong>🚦 ${traffic.road_name}</strong>

                    <br><br>

                    Traffic Level:
                    ${traffic.traffic_level}%

                    <br>

                    Vehicles:
                    ${traffic.vehicle_count}

                    <br>

                    Average Speed:
                    ${traffic.average_speed} km/h

                    <br>

                    Time-to-Clear:
                    ${traffic.predicted_clear_time} sec

                    <br><br>

                    <strong>
                        Risk:
                        ${traffic.risk_level}
                    </strong>

                `);

            });


            console.log(
                "Traffic bottleneck markers loaded."
            );


        } catch (error) {

            console.error(
                "Could not load traffic data:",
                error
            );

        }

    }


    // Load markers
    loadAmbulancesOnMap();

    loadHospitalsOnMap();

    loadTrafficOnMap();
    // Map legend
    const legend = L.control({
        position: "bottomright"
    });


    legend.onAdd = function () {

        const div = L.DomUtil.create(
            "div",
            "map-legend"
        );

        div.innerHTML = `
            <h4>Map Legend</h4>

            <div>
                <span class="legend-icon ambulance-legend">
                    🚑
                </span>
                Ambulance
            </div>

            <div>
                <span class="legend-icon hospital-legend">
                    🏥
                </span>
                Hospital
            </div>

            <div>
                <span class="legend-dot traffic-low-legend"></span>
                Low Traffic
            </div>

            <div>
                <span class="legend-dot traffic-medium-legend"></span>
                Medium Traffic
            </div>

            <div>
                <span class="legend-dot traffic-high-legend"></span>
                High Traffic
            </div>
        `;

        return div;
    };


    legend.addTo(map);

});