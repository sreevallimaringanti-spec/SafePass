console.log("SafePass JavaScript loaded successfully.");

document.addEventListener("DOMContentLoaded", function () {



    console.log("SafePass page is ready.");

    // =========================================================
    // AMBULANCE + HOSPITAL DATA
    // =========================================================

    const ambulanceSelect =
        document.getElementById("ambulance");

    const hospitalSelect =
        document.getElementById("hospital");

    const initializeTripButton =
        document.getElementById("initializeTrip");

    const tripMessage =
        document.getElementById("tripMessage");


    // ---------------------------------------------------------
    // LOAD AMBULANCES
    // ---------------------------------------------------------

    async function loadAmbulances() {

        if (!ambulanceSelect) {
            return;
        }

        try {

            const response =
                await fetch("/api/ambulances");

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Could not load ambulances."
                );
            }

            const ambulances =
                Array.isArray(data)
                    ? data
                    : (data.ambulances || []);

            ambulanceSelect.innerHTML =
                '<option value="">Select ambulance</option>';

            if (ambulances.length === 0) {

                ambulanceSelect.innerHTML =
                    '<option value="">No ambulances available</option>';

                console.warn(
                    "No ambulances returned by the API."
                );

                return;
            }

            ambulances.forEach(
                function (ambulance) {

                    const option =
                        document.createElement("option");

                    option.value =
                        ambulance.ambulance_code || "";

                    option.textContent =
                        (ambulance.ambulance_code || "Ambulance") +
                        " — " +
                        (ambulance.status || "AVAILABLE");

                    ambulanceSelect.appendChild(
                        option
                    );

                }
            );

            console.log(
                "Ambulances loaded:",
                ambulances.length
            );

        } catch (error) {

            console.error(
                "Could not load ambulances:",
                error
            );

            ambulanceSelect.innerHTML =
                '<option value="">Unable to load ambulances</option>';

        }

    }


    // ---------------------------------------------------------
    // LOAD HOSPITALS
    // ---------------------------------------------------------

    async function loadHospitals() {

        if (!hospitalSelect) {
            return;
        }

        try {

            const response =
                await fetch("/api/hospitals");

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Could not load hospitals."
                );
            }

            const hospitals =
                Array.isArray(data)
                    ? data
                    : (data.hospitals || []);

            hospitalSelect.innerHTML =
                '<option value="">Select hospital</option>';

            if (hospitals.length === 0) {

                hospitalSelect.innerHTML =
                    '<option value="">No hospitals available</option>';

                console.warn(
                    "No hospitals returned by the API."
                );

                return;
            }

            hospitals.forEach(
                function (hospital) {

                    const option =
                        document.createElement("option");

                    option.value =
                        hospital.id ?? "";

                    option.textContent =
                        hospital.name || "Hospital";

                    hospitalSelect.appendChild(
                        option
                    );

                }
            );

            console.log(
                "Hospitals loaded:",
                hospitals.length
            );

        } catch (error) {

            console.error(
                "Could not load hospitals:",
                error
            );

            hospitalSelect.innerHTML =
                '<option value="">Unable to load hospitals</option>';

        }

    }


    // =========================================================
    // INITIALIZE EMERGENCY TRIP
    // =========================================================

    if (initializeTripButton) {

        initializeTripButton.addEventListener(
            "click",
            async function () {

                const ambulance =
                    ambulanceSelect ?
                    ambulanceSelect.value :
                    "";

                const hospital =
                    hospitalSelect ?
                    hospitalSelect.value :
                    "";


                if (ambulance === "") {

                    tripMessage.className =
                        "trip-message error";

                    tripMessage.textContent =
                        "Please select an ambulance before continuing.";

                    return;
                }


                if (hospital === "") {

                    tripMessage.className =
                        "trip-message error";

                    tripMessage.textContent =
                        "Please select a destination hospital before continuing.";

                    return;
                }


                try {

                    const response =
                        await fetch(
                            "/api/trips",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    ambulance_code:
                                        ambulance,

                                    hospital_id:
                                        hospital
                                })
                            }
                        );


                    const data =
                        await response.json();


                    if (!data.success) {

                        tripMessage.className =
                            "trip-message error";

                        tripMessage.textContent =
                            data.message;

                        return;
                    }


                    tripMessage.className =
                        "trip-message success";

                    tripMessage.textContent =
                        "Emergency trip initialized successfully. " +
                        "Trip ID: " +
                        data.trip_id;


                    loadLatestTrip();


                } catch (error) {

                    console.error(
                        "Could not create trip:",
                        error
                    );

                    tripMessage.className =
                        "trip-message error";

                    tripMessage.textContent =
                        "Unable to create emergency trip.";

                }

            }
        );

    }


    // =========================================================
    // ACTIVE TRIP
    // =========================================================

    async function loadLatestTrip() {

        const activeTrip =
            document.getElementById("activeTrip");

        if (!activeTrip) {
            return;
        }


        try {

            const response =
                await fetch("/api/trips/latest");

            const data =
                await response.json();


            if (!data.success) {

                activeTrip.style.display =
                    "none";

                return;
            }


            const trip =
                data.trip;


            const tripId =
                document.getElementById("tripId");

            const tripAmbulance =
                document.getElementById("tripAmbulance");

            const tripHospital =
                document.getElementById("tripHospital");

            const tripStatus =
                document.getElementById("tripStatus");

            const tripStartTime =
                document.getElementById("tripStartTime");


            if (tripId) {
                tripId.textContent =
                    trip.id;
            }


            if (tripAmbulance) {
                tripAmbulance.textContent =
                    trip.ambulance_code;
            }


            if (tripHospital) {
                tripHospital.textContent =
                    trip.hospital_name;
            }


            if (tripStatus) {
                tripStatus.textContent =
                    trip.status;
            }


            if (tripStartTime) {
                tripStartTime.textContent =
                    trip.start_time;
            }


            activeTrip.style.display =
                "block";


        } catch (error) {

            console.error(
                "Could not load latest trip:",
                error
            );

        }

    }


    // =========================================================
    // SAFE PASS ACTIVITY LOG
    // =========================================================

    function addActivityLog(
        title,
        message
    ) {

        const activityLog =
            document.getElementById(
                "activityLog"
            );


        if (!activityLog) {
            return;
        }


        const activityItem =
            document.createElement("div");


        activityItem.className =
            "activity-item";


        activityItem.innerHTML = `
            <span class="activity-dot"></span>

            <div>
                <strong>${title}</strong>
                <small>${message}</small>
            </div>
        `;


        activityLog.prepend(
            activityItem
        );


        while (
            activityLog.children.length > 6
        ) {

            activityLog.removeChild(
                activityLog.lastElementChild
            );

        }

    }


    // =========================================================
    // TRIP HISTORY
    // =========================================================

    async function loadTripHistory() {

        const tripHistoryBody =
            document.getElementById(
                "tripHistoryBody"
            );


        const tripHistoryMessage =
            document.getElementById(
                "tripHistoryMessage"
            );


        const totalTripsCount =
            document.getElementById(
                "totalTripsCount"
            );


        const activeTripsCount =
            document.getElementById(
                "activeTripsCount"
            );


        const completedTripsCount =
            document.getElementById(
                "completedTripsCount"
            );


        if (!tripHistoryBody) {
            return;
        }


        try {

            const response =
                await fetch(
                    "/api/trips/history"
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Could not load trip history."
                );

            }


            tripHistoryBody.innerHTML =
                "";


            const trips =
                Array.isArray(data.trips)
                    ? data.trips
                    : [];


            // -------------------------------------------------
            // UPDATE TRIP HISTORY SUMMARY
            // -------------------------------------------------

            const totalTrips =
                trips.length;


            const activeTrips =
                trips.filter(
                    function (trip) {

                        return trip.status ===
                            "ACTIVE";

                    }
                ).length;


            const completedTrips =
                trips.filter(
                    function (trip) {

                        return trip.status ===
                            "COMPLETED";

                    }
                ).length;


            if (totalTripsCount) {

                totalTripsCount.textContent =
                    totalTrips;

            }


            if (activeTripsCount) {

                activeTripsCount.textContent =
                    activeTrips;

            }


            if (completedTripsCount) {

                completedTripsCount.textContent =
                    completedTrips;

            }


            // -------------------------------------------------
            // NO TRIPS
            // -------------------------------------------------

            if (trips.length === 0) {

                tripHistoryBody.innerHTML = `
                    <tr>
                        <td colspan="5">
                            No emergency trips recorded yet.
                        </td>
                    </tr>
                `;

                return;
            }


            // -------------------------------------------------
            // DISPLAY TRIPS
            // -------------------------------------------------

            trips.forEach(
                function (trip) {

                    const row =
                        document.createElement(
                            "tr"
                        );


                    row.innerHTML = `
                        <td>
                            #${trip.id}
                        </td>

                        <td>
                            ${trip.ambulance_code}
                        </td>

                        <td>
                            ${trip.hospital_name || "Unknown"}
                        </td>

                        <td>
                            ${trip.start_time}
                        </td>

                        <td>
                            <span class="trip-history-status">
                                ${trip.status}
                            </span>
                        </td>
                    `;


                    tripHistoryBody.appendChild(
                        row
                    );

                }
            );


            if (tripHistoryMessage) {

                tripHistoryMessage.className =
                    "alert alert-success";

                tripHistoryMessage.textContent =
                    "Emergency trip history loaded successfully.";

            }


        } catch (error) {

            console.error(
                "Could not load trip history:",
                error
            );


            if (tripHistoryMessage) {

                tripHistoryMessage.className =
                    "alert alert-danger";

                tripHistoryMessage.textContent =
                    "Unable to load trip history.";

            }

        }

    }


    // =========================================================
    // TRAFFIC
    // =========================================================

    async function loadTraffic() {

        const trafficTableBody =
            document.getElementById(
                "trafficTableBody"
            );


        if (!trafficTableBody) {
            return;
        }


        try {

            const response =
                await fetch("/api/traffic");


            const trafficData =
                await response.json();


            trafficTableBody.innerHTML =
                "";


            trafficData.forEach(
                function (traffic) {

                    const row =
                        document.createElement(
                            "tr"
                        );


                    let riskClass =
                        "risk-low";


                    if (
                        traffic.risk_level ===
                        "MEDIUM"
                    ) {

                        riskClass =
                            "risk-medium";

                    }


                    if (
                        traffic.risk_level ===
                        "HIGH"
                    ) {

                        riskClass =
                            "risk-high";

                    }


                    row.innerHTML = `

                        <td>
                            ${traffic.road_name}
                        </td>

                        <td>
                            ${traffic.traffic_level}%
                        </td>

                        <td>
                            ${traffic.vehicle_count}
                        </td>

                        <td>
                            ${traffic.average_speed} km/h
                        </td>

                        <td>
                            ${traffic.predicted_clear_time} sec
                        </td>

                        <td>
                            <span class="traffic-risk ${riskClass}">
                                ${traffic.risk_level}
                            </span>
                        </td>

                    `;


                    trafficTableBody.appendChild(
                        row
                    );

                }
            );


            // =================================================
            // AI TRAFFIC PREDICTION
            // =================================================

            const aiTrafficLevel =
                document.getElementById(
                    "aiTrafficLevel"
                );


            const aiAverageSpeed =
                document.getElementById(
                    "aiAverageSpeed"
                );


            const aiVehicleCount =
                document.getElementById(
                    "aiVehicleCount"
                );


            const aiClearTime =
                document.getElementById(
                    "aiClearTime"
                );


            const aiConfidence =
                document.getElementById(
                    "aiConfidence"
                );


            const aiPredictionMessage =
                document.getElementById(
                    "aiPredictionMessage"
                );


            if (
                trafficData.length > 0 &&
                aiTrafficLevel &&
                aiAverageSpeed &&
                aiVehicleCount &&
                aiClearTime
            ) {

                // -------------------------------------------------
                // FIND MOST CONGESTED ROAD
                // -------------------------------------------------

                const bottleneck =
                    trafficData.reduce(
                        function (
                            highest,
                            current
                        ) {

                            return current.traffic_level >
                                highest.traffic_level
                                ? current
                                : highest;

                        }
                    );


                // -------------------------------------------------
                // DISPLAY TRAFFIC INFORMATION
                // -------------------------------------------------

                aiTrafficLevel.textContent =
                    bottleneck.traffic_level +
                    "%";


                aiAverageSpeed.textContent =
                    bottleneck.average_speed +
                    " km/h";


                aiVehicleCount.textContent =
                    bottleneck.vehicle_count;


                // -------------------------------------------------
                // AI PREDICTION REQUEST
                // -------------------------------------------------

                const aiUrl =
                    "/api/ai-predict?" +
                    "traffic_level=" +
                    encodeURIComponent(
                        bottleneck.traffic_level
                    ) +
                    "&average_speed=" +
                    encodeURIComponent(
                        bottleneck.average_speed
                    ) +
                    "&vehicle_count=" +
                    encodeURIComponent(
                        bottleneck.vehicle_count
                    );


                try {

                    const aiResponse =
                        await fetch(
                            aiUrl
                        );


                    const aiData =
                        await aiResponse.json();


                    if (
                        aiResponse.ok &&
                        aiData.success
                    ) {

                        aiClearTime.textContent =
                            aiData.predicted_clear_time +
                            " sec";


                        if (aiConfidence) {

                            aiConfidence.textContent =
                                "Prototype Model";

                        }


                        if (aiPredictionMessage) {

                            aiPredictionMessage.innerHTML =
                                "<strong>🧠 AI Prediction Active</strong><br>" +
                                "SafePass predicts approximately " +
                                aiData.predicted_clear_time +
                                " seconds for the current traffic bottleneck to clear.";

                        }

                    } else {

                        aiClearTime.textContent =
                            "-- sec";


                        if (aiConfidence) {

                            aiConfidence.textContent =
                                "Unavailable";

                        }


                        if (aiPredictionMessage) {

                            aiPredictionMessage.textContent =
                                "Unable to generate AI prediction.";

                        }

                    }


                } catch (aiError) {

                    console.error(
                        "AI prediction error:",
                        aiError
                    );


                    if (aiClearTime) {

                        aiClearTime.textContent =
                            "-- sec";

                    }


                    if (aiConfidence) {

                        aiConfidence.textContent =
                            "Unavailable";

                    }


                    if (aiPredictionMessage) {

                        aiPredictionMessage.textContent =
                            "AI prediction service is currently unavailable.";

                    }

                }

            }


        } catch (error) {

            console.error(
                "Could not load traffic data:",
                error
            );

        }

    }


    // =========================================================
    // ROUTE INTELLIGENCE
    // =========================================================

    const analyzeRouteBtn =
        document.getElementById(
            "analyzeRouteBtn"
        );


    const routeResults =
        document.getElementById(
            "routeResults"
        );


    const recommendedRouteBox =
        document.getElementById(
            "recommendedRoute"
        );


    const routeAnalysisMessage =
        document.getElementById(
            "routeAnalysisMessage"
        );


    if (analyzeRouteBtn) {

        analyzeRouteBtn.addEventListener(
            "click",
            async function () {

                const ambulance =
                    ambulanceSelect ?
                    ambulanceSelect.value :
                    "";


                const hospital =
                    hospitalSelect ?
                    hospitalSelect.value :
                    "";


                if (
                    !ambulance ||
                    !hospital
                ) {

                    showRouteMessage(
                        "Please select an ambulance and hospital first.",
                        "danger"
                    );

                    return;
                }


                analyzeRouteBtn.disabled =
                    true;


                analyzeRouteBtn.innerHTML =
                    '<span class="route-spinner"></span> Analyzing Traffic...';


                if (routeResults) {

                    routeResults.innerHTML =
                        "";

                }


                showRouteMessage(
                    "Analyzing traffic, predicted clearance time and route risk...",
                    "info"
                );


                try {

                    const url =
                        `/api/route-analysis?ambulance=${encodeURIComponent(ambulance)}&hospital=${encodeURIComponent(hospital)}`;


                    const response =
                        await fetch(
                            url
                        );


                    const data =
                        await response.json();


                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        throw new Error(
                            data.message ||
                            "Route analysis failed."
                        );

                    }


                    // -------------------------------------------------
                    // DISPLAY ROUTES
                    // -------------------------------------------------

                    data.routes.forEach(
                        function (route) {

                            const card =
                                document.createElement(
                                    "div"
                                );


                            card.className =
                                "route-card";


                            if (
                                route.name ===
                                data.recommended_route
                            ) {

                                card.classList.add(
                                    "recommended"
                                );

                            }


                            let riskClass =
                                "risk-medium";


                            if (
                                route.risk ===
                                "LOW"
                            ) {

                                riskClass =
                                    "risk-low";

                            }


                            if (
                                route.risk ===
                                "HIGH"
                            ) {

                                riskClass =
                                    "risk-high";

                            }


                            card.innerHTML = `

                                <div class="route-name">
                                    ${route.name}
                                </div>


                                <div style="margin-top: 8px;">

                                    <span class="risk ${riskClass}">
                                        ${route.risk} RISK
                                    </span>

                                </div>


                                <div class="route-detail">

                                    <span>
                                        Distance
                                    </span>

                                    <strong>
                                        ${route.distance} km
                                    </strong>

                                </div>


                                <div class="route-detail">

                                    <span>
                                        Traffic Delay
                                    </span>

                                    <strong>
                                        ${route.traffic_delay} sec
                                    </strong>

                                </div>


                                <div class="route-detail">

                                    <span>
                                        Time-to-Clear
                                    </span>

                                    <strong>
                                        ${route.clear_time} sec
                                    </strong>

                                </div>


                                <div class="route-detail">

                                    <span>
                                        Estimated Time
                                    </span>

                                    <strong>
                                        ${route.estimated_time} min
                                    </strong>

                                </div>


                                <div class="route-detail">

                                    <span>
                                        Route Score
                                    </span>

                                    <strong>
                                        ${route.score}
                                    </strong>

                                </div>


                                ${
                                    route.name ===
                                    data.recommended_route
                                    ? `
                                        <div
                                            class="alert alert-success"
                                            style="margin-top: 14px;">

                                            ✓ RECOMMENDED ROUTE

                                        </div>
                                    `
                                    : ""
                                }

                            `;


                            if (routeResults) {

                                routeResults.appendChild(
                                    card
                                );

                            }

                        }
                    );


                    // -------------------------------------------------
                    // GENERATE EMERGENCY CORRIDOR
                    // -------------------------------------------------

                    generateEmergencyCorridor(
                        data.recommended_route,
                        data.routes
                    );


                    addActivityLog(
                        "Emergency route selected",
                        "SafePass selected " +
                        data.recommended_route +
                        " as the preferred emergency route."
                    );


                    // -------------------------------------------------
                    // RECOMMENDED ROUTE
                    // -------------------------------------------------

                    if (recommendedRouteBox) {

                        recommendedRouteBox.innerHTML = `

                            <strong>
                                SafePass Recommendation:
                            </strong>

                            ${data.recommended_route}

                            is currently the best emergency
                            route based on predicted travel
                            time, traffic delay, clearance
                            time and risk.

                        `;


                        recommendedRouteBox.style.display =
                            "block";

                    }


                    // =================================================
                    // SYSTEM INTELLIGENCE UPDATE
                    // =================================================

                    const intelligenceEfficiency =
                        document.getElementById(
                            "intelligenceEfficiency"
                        );


                    const intelligenceTraffic =
                        document.getElementById(
                            "intelligenceTraffic"
                        );


                    const intelligenceRisk =
                        document.getElementById(
                            "intelligenceRisk"
                        );


                    const intelligenceDecision =
                        document.getElementById(
                            "intelligenceDecision"
                        );


                    const intelligenceMessage =
                        document.getElementById(
                            "intelligenceMessage"
                        );


                    const intelligenceRoute =
                        data.routes.find(
                            function (route) {

                                return route.name ===
                                    data.recommended_route;

                            }
                        );


                    if (intelligenceRoute) {

                        // -------------------------------------------------
                        // CORRIDOR EFFICIENCY
                        // -------------------------------------------------

                        let intelligenceEfficiencyScore =
                            100 -
                            (
                                intelligenceRoute.traffic_delay *
                                0.4
                            ) -
                            (
                                intelligenceRoute.clear_time *
                                0.2
                            );


                        intelligenceEfficiencyScore =
                            Math.max(
                                55,
                                Math.min(
                                    98,
                                    Math.round(
                                        intelligenceEfficiencyScore
                                    )
                                )
                            );


                        if (intelligenceEfficiency) {

                            intelligenceEfficiency.textContent =
                                intelligenceEfficiencyScore;

                        }


                        // -------------------------------------------------
                        // TRAFFIC CONDITION
                        // -------------------------------------------------

                        if (intelligenceTraffic) {

                            if (
                                intelligenceRoute.traffic_delay <=
                                30
                            ) {

                                intelligenceTraffic.textContent =
                                    "LOW";

                            }

                            else if (
                                intelligenceRoute.traffic_delay <=
                                60
                            ) {

                                intelligenceTraffic.textContent =
                                    "MEDIUM";

                            }

                            else {

                                intelligenceTraffic.textContent =
                                    "HIGH";

                            }

                        }


                        // -------------------------------------------------
                        // ROUTE RISK
                        // -------------------------------------------------

                        if (intelligenceRisk) {

                            intelligenceRisk.textContent =
                                intelligenceRoute.risk;

                        }


                        // -------------------------------------------------
                        // AI DECISION
                        // -------------------------------------------------

                        if (intelligenceDecision) {

                            intelligenceDecision.textContent =
                                data.recommended_route;

                        }


                        // -------------------------------------------------
                        // INTELLIGENCE MESSAGE
                        // -------------------------------------------------

                        if (intelligenceMessage) {

                            intelligenceMessage.innerHTML = `
                                <strong>
                                    🤖 SafePass Intelligence Active
                                </strong>

                                <br>

                                AI traffic analysis evaluated
                                the available emergency routes
                                and selected

                                <strong>
                                    ${data.recommended_route}
                                </strong>

                                as the preferred emergency route.
                            `;


                            intelligenceMessage.className =
                                "alert alert-success";

                        }

                    }


                    // =================================================
                    // AI ROUTE REASONING
                    // =================================================

                    const aiRouteReasoning =
                        document.getElementById(
                            "aiRouteReasoning"
                        );


                    const aiRouteReasoningText =
                        document.getElementById(
                            "aiRouteReasoningText"
                        );


                    if (
                        aiRouteReasoning &&
                        aiRouteReasoningText
                    ) {

                        const selectedRoute =
                            data.routes.find(
                                function (route) {

                                    return route.name ===
                                        data.recommended_route;

                                }
                            );


                        if (selectedRoute) {

                            aiRouteReasoningText.textContent =
                                "SafePass selected " +
                                selectedRoute.name +
                                " because its predicted travel time, " +
                                "traffic delay, and AI time-to-clear score " +
                                "are favorable compared with the alternative routes.";


                            aiRouteReasoning.style.display =
                                "block";

                        }

                    }


                } catch (error) {

                    console.error(
                        "Route analysis error:",
                        error
                    );


                    showRouteMessage(
                        "Unable to analyze routes: " +
                        error.message,
                        "danger"
                    );


                } finally {

                    analyzeRouteBtn.disabled =
                        false;


                    analyzeRouteBtn.innerHTML =
                        "Analyze Emergency Routes";

                }

            }
        );

    }


    function showRouteMessage(
        message,
        type
    ) {

        if (!routeAnalysisMessage) {
            return;
        }


        routeAnalysisMessage.textContent =
            message;


        routeAnalysisMessage.className =
            "alert alert-" +
            type;


        routeAnalysisMessage.style.display =
            "block";

    }


    // =========================================================
    // DYNAMIC EMERGENCY CORRIDOR
    // =========================================================

    function generateEmergencyCorridor(
        recommendedRoute,
        routes
    ) {

        const corridorPanel =
            document.getElementById(
                "corridorPanel"
            );


        const corridorMessage =
            document.getElementById(
                "corridorMessage"
            );


        const corridorScore =
            document.getElementById(
                "corridorScore"
            );


        const corridorRoute =
            document.getElementById(
                "corridorRoute"
            );


        const corridorStatus =
            document.getElementById(
                "corridorStatus"
            );


        const junctionList =
            document.getElementById(
                "junctionList"
            );


        if (
            !corridorPanel ||
            !corridorScore ||
            !corridorRoute ||
            !corridorStatus ||
            !junctionList
        ) {

            console.warn(
                "Emergency Corridor elements not found."
            );

            return;

        }


        const selectedRoute =
            routes.find(
                function (route) {

                    return route.name ===
                        recommendedRoute;

                }
            );


        if (!selectedRoute) {
            return;
        }


        // ---------------------------------------------------------
        // CORRIDOR EFFICIENCY
        // ---------------------------------------------------------

        let efficiency =
            100 -
            (
                selectedRoute.traffic_delay *
                0.4
            ) -
            (
                selectedRoute.clear_time *
                0.2
            );


        efficiency =
            Math.max(
                55,
                Math.min(
                    98,
                    Math.round(
                        efficiency
                    )
                )
            );


        corridorScore.textContent =
            efficiency;


        corridorRoute.textContent =
            recommendedRoute;


        // ---------------------------------------------------------
        // CORRIDOR STATUS
        // ---------------------------------------------------------

        if (efficiency >= 80) {

            corridorStatus.textContent =
                "READY";

        }

        else if (efficiency >= 65) {

            corridorStatus.textContent =
                "PRIORITY";

        }

        else {

            corridorStatus.textContent =
                "DEGRADED";

        }


        // ---------------------------------------------------------
        // JUNCTION STATUS
        // ---------------------------------------------------------

        const junctions = [

            {
                name: "Junction A",

                status: "PRIORITY",

                description:
                    "Emergency corridor priority required."
            },


            {
                name: "Junction B",

                status: "CONGESTED",

                description:
                    "High simulated traffic detected."
            },


            {
                name: "Junction C",

                status: "CLEAR",

                description:
                    "Traffic conditions suitable for passage."
            },


            {
                name: "Junction D",

                status: "PRIORITY",

                description:
                    "Prepare junction for emergency movement."
            },


            {
                name: "Junction E",

                status: "CLEAR",

                description:
                    "No major simulated obstruction."
            }

        ];


        junctionList.innerHTML =
            "";


        junctions.forEach(
            function (junction) {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "junction-item";


                let statusClass =
                    "junction-clear";


                if (
                    junction.status ===
                    "PRIORITY"
                ) {

                    statusClass =
                        "junction-priority";

                }


                if (
                    junction.status ===
                    "CONGESTED"
                ) {

                    statusClass =
                        "junction-congested";

                }


                item.innerHTML = `

                    <div class="junction-info">

                        <strong>
                            ${junction.name}
                        </strong>

                        <span>
                            ${junction.description}
                        </span>

                    </div>


                    <span
                        class="junction-status ${statusClass}">
                        ${junction.status}
                    </span>

                `;


                junctionList.appendChild(
                    item
                );

            }
        );


        corridorPanel.style.display =
            "block";


        addActivityLog(
            "Emergency corridor activated",
            "Dynamic emergency corridor established for " +
            recommendedRoute +
            "."
        );


        // ---------------------------------------------------------
        // CONNECTED VEHICLE ALERTS
        // ---------------------------------------------------------

        simulateConnectedVehicles(
            recommendedRoute
        );


        // ---------------------------------------------------------
        // AMBULANCE MOVEMENT
        // ---------------------------------------------------------

        setupAmbulanceMovement();


        if (corridorMessage) {

            corridorMessage.style.display =
                "none";

        }


        console.log(
            "Emergency Corridor generated:",
            recommendedRoute,
            efficiency
        );

    }


    // =========================================================
    // CONNECTED VEHICLE ALERTS
    // =========================================================

    function simulateConnectedVehicles(
        recommendedRoute
    ) {

        const vehicleAlertPanel =
            document.getElementById(
                "vehicleAlertPanel"
            );


        const vehicleAlertMessage =
            document.getElementById(
                "vehicleAlertMessage"
            );


        const nearbyVehicleCount =
            document.getElementById(
                "nearbyVehicleCount"
            );


        const alertsSentCount =
            document.getElementById(
                "alertsSentCount"
            );


        const vehicleEmergencyStatus =
            document.getElementById(
                "vehicleEmergencyStatus"
            );


        const vehicleAlertList =
            document.getElementById(
                "vehicleAlertList"
            );


        if (
            !vehicleAlertPanel ||
            !nearbyVehicleCount ||
            !alertsSentCount ||
            !vehicleEmergencyStatus ||
            !vehicleAlertList
        ) {

            console.warn(
                "Connected vehicle elements not found."
            );

            return;

        }


        const vehicles = [

            {
                id: "CV-001",

                type: "Car",

                distance: "120 m",

                status: "ALERT SENT"
            },


            {
                id: "CV-002",

                type: "Car",

                distance: "240 m",

                status: "ALERT SENT"
            },


            {
                id: "CV-003",

                type: "Bus",

                distance: "380 m",

                status: "SLOW DOWN"
            },


            {
                id: "CV-004",

                type: "Car",

                distance: "510 m",

                status: "ALERT SENT"
            },


            {
                id: "CV-005",

                type: "Delivery Vehicle",

                distance: "650 m",

                status: "PREPARE TO YIELD"
            }

        ];


        nearbyVehicleCount.textContent =
            vehicles.length;


        alertsSentCount.textContent =
            vehicles.filter(
                function (vehicle) {

                    return vehicle.status ===
                        "ALERT SENT";

                }
            ).length;


        vehicleEmergencyStatus.textContent =
            "ACTIVE";


        vehicleAlertList.innerHTML =
            "";


        vehicles.forEach(
            function (vehicle) {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "vehicle-alert-item";


                let statusClass =
                    "vehicle-alert-normal";


                if (
                    vehicle.status ===
                    "ALERT SENT"
                ) {

                    statusClass =
                        "vehicle-alert-sent";

                }

                else if (
                    vehicle.status ===
                    "SLOW DOWN"
                ) {

                    statusClass =
                        "vehicle-alert-warning";

                }

                else {

                    statusClass =
                        "vehicle-alert-priority";

                }


                item.innerHTML = `

                    <div class="vehicle-info">

                        <div class="vehicle-icon">
                            🚗
                        </div>


                        <div>

                            <strong>
                                ${vehicle.id}
                            </strong>

                            <span>
                                ${vehicle.type}
                            </span>

                        </div>

                    </div>


                    <div class="vehicle-distance">

                        <strong>
                            ${vehicle.distance}
                        </strong>

                        <span>
                            from ambulance
                        </span>

                    </div>


                    <span
                        class="vehicle-alert-status ${statusClass}">
                        ${vehicle.status}
                    </span>

                `;


                vehicleAlertList.appendChild(
                    item
                );

            }
        );


        vehicleAlertPanel.style.display =
            "block";


        if (vehicleAlertMessage) {

            vehicleAlertMessage.style.display =
                "none";

        }


        addActivityLog(
            "Connected vehicle alerts sent",
            "Simulated vehicles were notified about the approaching ambulance on " +
            recommendedRoute +
            "."
        );


        console.log(
            "Connected Vehicle Simulation:",
            recommendedRoute,
            vehicles
        );

    }


    // =========================================================
    // AMBULANCE MOVEMENT
    // =========================================================

    function setupAmbulanceMovement() {

        const startMovementBtn =
            document.getElementById(
                "startMovementBtn"
            );


        const movementStatus =
            document.getElementById(
                "movementStatus"
            );


        if (!startMovementBtn) {

            console.warn(
                "Start movement button not found."
            );

            return;

        }


        startMovementBtn.onclick =
            function () {

                startAmbulanceMovement(
                    movementStatus,
                    startMovementBtn
                );

            };

    }


    function startAmbulanceMovement(
        movementStatus,
        startMovementBtn
    ) {

        if (
            startMovementBtn.dataset.running ===
            "true"
        ) {

            return;

        }


        // Reset rerouting state for every new movement
        window.reroutingTriggered =
            false;


        startMovementBtn.dataset.running =
            "true";


        startMovementBtn.disabled =
            true;


        startMovementBtn.innerHTML =
            "🚑 Ambulance Moving...";


        let progress =
            0;


        let remainingMinutes =
            8;


        const liveEta =
            document.getElementById(
                "liveEta"
            );


        const tripProgress =
            document.getElementById(
                "tripProgress"
            );


        const tripProgressBar =
            document.getElementById(
                "tripProgressBar"
            );


        const tripProgressLabel =
            document.getElementById(
                "tripProgressLabel"
            );


        const etaTripStatus =
            document.getElementById(
                "etaTripStatus"
            );


        const etaRoute =
            document.getElementById(
                "etaRoute"
            );


        if (movementStatus) {

            movementStatus.textContent =
                "Emergency movement active — 0%";

        }


        if (liveEta) {

            liveEta.textContent =
                remainingMinutes +
                " min";

        }


        if (tripProgress) {

            tripProgress.textContent =
                "0%";

        }


        if (tripProgressLabel) {

            tripProgressLabel.textContent =
                "0%";

        }


        if (tripProgressBar) {

            tripProgressBar.style.width =
                "0%";

        }


        if (etaTripStatus) {

            etaTripStatus.textContent =
                "EN ROUTE";

        }


        if (etaRoute) {

            etaRoute.textContent =
                "Emergency Corridor";

        }


        addActivityLog(
            "Ambulance movement started",
            "Simulated emergency vehicle movement is now active."
        );


        const movementTimer =
            setInterval(
                function () {

                    progress +=
                        10;


                    remainingMinutes =
                        Math.max(
                            0,
                            8 -
                            Math.floor(
                                progress /
                                15
                            )
                        );


                    if (movementStatus) {

                        movementStatus.textContent =
                            "Emergency movement active — " +
                            progress +
                            "%";

                    }


                    if (liveEta) {

                        liveEta.textContent =
                            remainingMinutes +
                            " min";

                    }


                    if (tripProgress) {

                        tripProgress.textContent =
                            progress +
                            "%";

                    }


                    if (tripProgressLabel) {

                        tripProgressLabel.textContent =
                            progress +
                            "%";

                    }


                    if (tripProgressBar) {

                        tripProgressBar.style.width =
                            progress +
                            "%";

                    }


                    // -------------------------------------------------
                    // SIMULATED TRAFFIC CHANGE
                    // -------------------------------------------------

                    if (
                        progress >= 50 &&
                        !window.reroutingTriggered
                    ) {

                        window.reroutingTriggered =
                            true;


                        showTrafficChangeAlert();


                        setTimeout(
                            function () {

                                recalculateEmergencyRoute();

                            },
                            1500
                        );

                    }


                    // -------------------------------------------------
                    // TRIP COMPLETION
                    // -------------------------------------------------

                    if (progress >= 100) {

                        clearInterval(
                            movementTimer
                        );


                        if (movementStatus) {

                            movementStatus.textContent =
                                "✅ Ambulance reached destination";

                        }


                        if (liveEta) {

                            liveEta.textContent =
                                "Arrived";

                        }


                        if (tripProgress) {

                            tripProgress.textContent =
                                "100%";

                        }


                        if (tripProgressLabel) {

                            tripProgressLabel.textContent =
                                "100%";

                        }


                        if (tripProgressBar) {

                            tripProgressBar.style.width =
                                "100%";

                        }


                        if (etaTripStatus) {

                            etaTripStatus.textContent =
                                "ARRIVED";

                        }


                        if (etaRoute) {

                            etaRoute.textContent =
                                "Destination Reached";

                        }


                        startMovementBtn.innerHTML =
                            "✅ Trip Completed";


                        startMovementBtn.disabled =
                            false;


                        startMovementBtn.dataset.running =
                            "false";


                        addActivityLog(
                            "Ambulance reached destination",
                            "Simulated emergency trip completed successfully."
                        );

                    }

                },
                1000
            );

    }


    // =========================================================
    // LIVE SYSTEM OVERVIEW
    // =========================================================

    async function loadSystemOverview() {

        const statAmbulances =
            document.getElementById(
                "statAmbulances"
            );


        const statRoads =
            document.getElementById(
                "statRoads"
            );


        const statHighRisk =
            document.getElementById(
                "statHighRisk"
            );


        const statAI =
            document.getElementById(
                "statAI"
            );


        try {

            // -------------------------------------------------
            // LOAD AMBULANCE DATA
            // -------------------------------------------------

            const ambulanceResponse =
                await fetch(
                    "/api/ambulances"
                );


            const ambulanceData =
                await ambulanceResponse.json();


            const ambulances =
                Array.isArray(ambulanceData)
                    ? ambulanceData
                    : (
                        ambulanceData.ambulances ||
                        []
                    );


            // -------------------------------------------------
            // LOAD TRAFFIC DATA
            // -------------------------------------------------

            const trafficResponse =
                await fetch(
                    "/api/traffic"
                );


            const trafficData =
                await trafficResponse.json();


            const traffic =
                Array.isArray(trafficData)
                    ? trafficData
                    : (
                        trafficData.traffic ||
                        []
                    );


            // -------------------------------------------------
            // ACTIVE AMBULANCES
            // -------------------------------------------------

            const activeAmbulances =
                ambulances.filter(
                    function (ambulance) {

                        return (
                            ambulance.status ===
                            "ACTIVE"
                        );

                    }
                ).length;


            // -------------------------------------------------
            // MONITORED ROADS
            // -------------------------------------------------

            const monitoredRoads =
                traffic.length;


            // -------------------------------------------------
            // HIGH-RISK JUNCTIONS
            // -------------------------------------------------

            const highRiskJunctions =
                traffic.filter(
                    function (road) {

                        return road.risk_level ===
                            "HIGH";

                    }
                ).length;


            if (statAmbulances) {

                statAmbulances.textContent =
                    activeAmbulances;

            }


            if (statRoads) {

                statRoads.textContent =
                    monitoredRoads;

            }


            if (statHighRisk) {

                statHighRisk.textContent =
                    highRiskJunctions;

            }


            if (statAI) {

                statAI.textContent =
                    "ACTIVE";

            }


        } catch (error) {

            console.error(
                "Could not load system overview:",
                error
            );

        }

    }


    // =========================================================
    // START ALL SYSTEMS
    // =========================================================

    loadSystemOverview();

    loadAmbulances();

    loadHospitals();

    loadLatestTrip();

    loadTraffic();

    loadTripHistory();


    // =========================================================
    // INITIAL ACTIVITY LOG
    // =========================================================

    addActivityLog(
        "System initialized",
        "SafePass emergency mobility monitoring is active."
    );


    addActivityLog(
        "Traffic monitoring active",
        "Simulated junction conditions are being monitored."
    );


    addActivityLog(
        "AI prediction engine ready",
        "Time-to-clear prediction is available for route analysis."
    );


    // =========================================================
    // AUTOMATIC DASHBOARD REFRESH
    // =========================================================

    setInterval(
        function () {

            loadSystemOverview();

            loadTraffic();

            loadTripHistory();

        },
        10000
    );

});


// =====================================================
// TRAFFIC CHANGE DETECTION
// =====================================================

function showTrafficChangeAlert() {

    console.log(
        "⚠️ Simulated traffic change detected."
    );


    const existingAlert =
        document.getElementById(
            "trafficChangeAlert"
        );


    if (existingAlert) {
        return;
    }


    const message =
        document.createElement(
            "div"
        );


    message.className =
        "alert alert-danger";


    message.id =
        "trafficChangeAlert";


    message.style.position =
        "fixed";


    message.style.top =
        "20px";


    message.style.left =
        "50%";


    message.style.transform =
        "translateX(-50%)";


    message.style.zIndex =
        "99999";


    message.style.width =
        "min(90%, 600px)";


    message.style.textAlign =
        "center";


    message.innerHTML = `
        <strong>
            ⚠️ Traffic Change Detected
        </strong>

        <br>

        Sudden congestion detected on the
        current emergency corridor.

        <br>

        SafePass is monitoring the situation
        for possible rerouting.
    `;


    document.body.prepend(
        message
    );


    setTimeout(
        function () {

            if (message) {

                message.remove();

            }

        },
        5000
    );

}


// =====================================================
// DYNAMIC ROUTE RECALCULATION
// =====================================================

function recalculateEmergencyRoute() {

    const ambulance =
        document.getElementById("ambulance");

    const hospital =
        document.getElementById("hospital");

    if (!ambulance || !hospital) {
        return;
    }

    const etaRoute =
        document.getElementById("etaRoute");

    const corridorRoute =
        document.getElementById("corridorRoute");

    const corridorStatus =
        document.getElementById("corridorStatus");

    const intelligenceDecision =
        document.getElementById("intelligenceDecision");

    /*
     * Re-analyze all available routes after
     * the simulated traffic change.
     */

    fetch(
        "/api/route-analysis?ambulance=" +
        encodeURIComponent(ambulance.value) +
        "&hospital=" +
        encodeURIComponent(hospital.value)
    )
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {

        if (
            !data.success ||
            !data.routes ||
            data.routes.length === 0
        ) {
            throw new Error(
                data.message ||
                "Route recalculation failed."
            );
        }

        /*
         * Find the route with the lowest
         * overall score.
         */

        const bestRoute =
            data.routes.reduce(
                function(best, current) {

                    return current.score <
                        best.score
                        ? current
                        : best;

                }
            );

        /*
         * Update the route cards.
         */

        data.routes.forEach(
            function(route) {

                const routeCards =
                    document.querySelectorAll(
                        ".route-card"
                    );

                routeCards.forEach(
                    function(card) {

                        const title =
                            card.querySelector("h3");

                        if (!title) {
                            return;
                        }

                        if (
                            title.textContent
                                .includes(route.name)
                        ) {

                            card.classList.remove(
                                "recommended"
                            );

                            card.classList.remove(
                                "selected"
                            );

                            if (
                                route.name ===
                                bestRoute.name
                            ) {

                                card.classList.add(
                                    "recommended"
                                );

                            }
                        }
                    }
                );
            }
        );

        /*
         * Update dashboard information.
         */

        if (etaRoute) {

            etaRoute.textContent =
                bestRoute.name +
                " — Rerouted";
        }

        if (corridorRoute) {

            corridorRoute.textContent =
                bestRoute.name;
        }

        if (corridorStatus) {

            corridorStatus.textContent =
                "REROUTED";
        }

        if (intelligenceDecision) {

            intelligenceDecision.textContent =
                bestRoute.name;
        }

        /*
         * Show the rerouting notification.
         */

        const message =
            document.createElement("div");

        message.className =
            "alert alert-warning";

        message.innerHTML =
            "<strong>🔄 Emergency Route Recalculated</strong>" +
            "<br>" +
            "Traffic conditions changed during the journey." +
            "<br>" +
            "SafePass compared the available routes again." +
            "<br>" +
            "<strong>" +
            bestRoute.name +
            "</strong>" +
            " is now the preferred emergency route.";

        message.style.position = "fixed";
        message.style.top = "20px";
        message.style.left = "50%";
        message.style.transform =
            "translateX(-50%)";
        message.style.zIndex = "99999";
        message.style.width =
            "min(90%, 600px)";
        message.style.textAlign = "center";

        document.body.appendChild(message);

        setTimeout(
            function() {

                message.remove();

            },
            5000
        );

        /*
         * Add event to Activity Log.
         */

        addActivityLog(
            "Emergency route recalculated",
            "Traffic changed. SafePass selected " +
            bestRoute.name +
            " after comparing the available routes."
        );

        console.log(
            "Dynamic rerouting selected:",
            bestRoute.name,
            "Score:",
            bestRoute.score
        );

    })
    .catch(function(error) {

        console.error(
            "Rerouting error:",
            error
        );

        addActivityLog(
            "Rerouting failed",
            "SafePass could not recalculate the emergency route."
        );

    });
}