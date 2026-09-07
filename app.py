from flask import Flask, render_template, jsonify, request
from traffic_predictor import predict_clear_time
from database import get_connection, initialize_database
import math

app = Flask(__name__)

# Make sure the database exists
initialize_database()


# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():
    return render_template("index.html")


# =========================================================
# DASHBOARD
# =========================================================

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")


# =========================================================
# AMBULANCES API
# =========================================================

@app.route("/api/ambulances")
def get_ambulances():

    connection = get_connection()

    ambulances = connection.execute(
        "SELECT * FROM ambulances"
    ).fetchall()

    connection.close()

    return jsonify([
        dict(ambulance)
        for ambulance in ambulances
    ])


# =========================================================
# HOSPITALS API
# =========================================================

@app.route("/api/hospitals")
def get_hospitals():

    connection = get_connection()

    hospitals = connection.execute(
        "SELECT * FROM hospitals"
    ).fetchall()

    connection.close()

    return jsonify([
        dict(hospital)
        for hospital in hospitals
    ])


# =========================================================
# TRAFFIC API
# =========================================================

@app.route("/api/traffic")
def get_traffic():

    connection = get_connection()

    traffic = connection.execute(
        "SELECT * FROM traffic"
    ).fetchall()

    connection.close()

    return jsonify([
        dict(item)
        for item in traffic
    ])


# =========================================================
# CREATE EMERGENCY TRIP
# =========================================================

@app.route("/api/trips", methods=["POST"])
def create_trip():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No trip data received."
        }), 400

    ambulance_code = data.get("ambulance_code")
    hospital_id = data.get("hospital_id")

    if not ambulance_code or not hospital_id:

        return jsonify({
            "success": False,
            "message": "Ambulance and hospital are required."
        }), 400

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO emergency_trips
        (ambulance_code, hospital_id, status)
        VALUES (?, ?, ?)
    """, (
        ambulance_code,
        hospital_id,
        "Reported"
    ))

    connection.commit()

    trip_id = cursor.lastrowid

    connection.close()

    return jsonify({
        "success": True,
        "trip_id": trip_id,
        "message": "Emergency trip created successfully."
    })


# =========================================================
# LATEST EMERGENCY TRIP
# =========================================================

@app.route("/api/trips/latest")
def get_latest_trip():

    connection = get_connection()

    trip = connection.execute("""
        SELECT
            emergency_trips.id,
            emergency_trips.ambulance_code,
            emergency_trips.hospital_id,
            emergency_trips.status,
            emergency_trips.start_time,
            hospitals.name AS hospital_name
        FROM emergency_trips
        LEFT JOIN hospitals
        ON emergency_trips.hospital_id = hospitals.id
        ORDER BY emergency_trips.id DESC
        LIMIT 1
    """).fetchone()

    connection.close()

    if trip is None:

        return jsonify({
            "success": False,
            "message": "No emergency trip found."
        })

    return jsonify({
        "success": True,
        "trip": dict(trip)
    })
# =========================================================
# TRIP HISTORY API
# =========================================================


    connection = get_connection()

    trips = connection.execute("""
        SELECT
            trips.id,
            trips.ambulance_code,
            hospitals.name AS hospital_name,
            trips.status,
            trips.start_time
        FROM trips
        LEFT JOIN hospitals
            ON trips.hospital_id = hospitals.id
        ORDER BY trips.id DESC
        LIMIT 10
    """).fetchall()

    connection.close()

    return jsonify({
        "success": True,
        "trips": [dict(trip) for trip in trips]
    })



# =========================================================
# EMERGENCY TRIP HISTORY
# =========================================================

@app.route("/api/trips/history")
def trip_history():

    connection = get_connection()

    trips = connection.execute("""
        SELECT
            emergency_trips.id,
            emergency_trips.ambulance_code,
            emergency_trips.hospital_id,
            emergency_trips.status,
            emergency_trips.start_time,
            hospitals.name AS hospital_name
        FROM emergency_trips
        LEFT JOIN hospitals
        ON emergency_trips.hospital_id = hospitals.id
        ORDER BY emergency_trips.id DESC
        LIMIT 20
    """).fetchall()

    connection.close()

    return jsonify({
        "success": True,
        "trips": [
            dict(trip)
            for trip in trips
        ]
    })


# =========================================================
# ROUTE ANALYSIS
# =========================================================

@app.route("/api/route-analysis")
def route_analysis():

    ambulance_code = request.args.get("ambulance")
    hospital_id = request.args.get("hospital")

    if not ambulance_code or not hospital_id:
        return jsonify({
            "success": False,
            "message": "Ambulance and hospital are required."
        }), 400

    connection = get_connection()

    ambulance = connection.execute(
        "SELECT * FROM ambulances WHERE ambulance_code = ?",
        (ambulance_code,)
    ).fetchone()

    hospital = connection.execute(
        "SELECT * FROM hospitals WHERE id = ?",
        (hospital_id,)
    ).fetchone()

    traffic = connection.execute(
        "SELECT * FROM traffic"
    ).fetchall()

    connection.close()

    if ambulance is None or hospital is None:
        return jsonify({
            "success": False,
            "message": "Ambulance or hospital not found."
        }), 404

    # -------------------------------------------------
    # DISTANCE CALCULATION
    # -------------------------------------------------

    lat_difference = (
        hospital["latitude"] -
        ambulance["latitude"]
    )

    lon_difference = (
        hospital["longitude"] -
        ambulance["longitude"]
    )

    distance = (
        math.sqrt(
            lat_difference ** 2 +
            lon_difference ** 2
        ) * 111
    )

    # -------------------------------------------------
    # TRAFFIC ANALYSIS
    # -------------------------------------------------

    traffic_data = [
        dict(item)
        for item in traffic
    ]

    high_risk_count = sum(
        1
        for item in traffic_data
        if item["risk_level"] == "HIGH"
    )

    medium_risk_count = sum(
        1
        for item in traffic_data
        if item["risk_level"] == "MEDIUM"
    )

    total_clear_time = sum(
        item["predicted_clear_time"]
        for item in traffic_data
        if item["predicted_clear_time"] is not None
    )

    # -------------------------------------------------
    # AI TIME-TO-CLEAR
    # -------------------------------------------------

    ai_clear_times = []

    for item in traffic_data:

        try:

            ai_time = predict_clear_time(
                traffic_level=item["traffic_level"],
                average_speed=item["average_speed"],
                vehicle_count=item["vehicle_count"]
            )

            ai_clear_times.append(ai_time)

        except Exception as error:

            print(
                "AI prediction error:",
                error
            )

    if ai_clear_times:

        ai_average_clear_time = (
            sum(ai_clear_times) /
            len(ai_clear_times)
        )

    else:

        ai_average_clear_time = (
            total_clear_time /
            len(traffic_data)
            if traffic_data
            else 0
        )

    # -------------------------------------------------
    # ROUTE OPTIONS
    # -------------------------------------------------

    routes = [

        {
            "name": "Route A",
            "distance": round(
                distance * 1.00,
                2
            ),
            "traffic_delay":
                high_risk_count * 35 +
                medium_risk_count * 15,
            "clear_time":
                round(ai_average_clear_time * 1.00),
            "risk": "HIGH"
        },

        {
            "name": "Route B",
            "distance": round(
                distance * 1.15,
                2
            ),
            "traffic_delay":
                high_risk_count * 15 +
                medium_risk_count * 8,
            "clear_time":
                round(ai_average_clear_time * 0.55),
            "risk": "LOW"
        },

        {
            "name": "Route C",
            "distance": round(
                distance * 1.08,
                2
            ),
            "traffic_delay":
                high_risk_count * 20 +
                medium_risk_count * 12,
            "clear_time":
                round(ai_average_clear_time * 0.70),
            "risk": "MEDIUM"
        }

    ]

    # -------------------------------------------------
    # ROUTE SCORING
    # -------------------------------------------------

    for route in routes:

        base_time = (
            route["distance"] /
            40
        ) * 60

        route["estimated_time"] = round(
            base_time +
            route["traffic_delay"] / 60,
            1
        )

        route["score"] = round(
            route["estimated_time"] +
            route["clear_time"] / 60 +
            route["distance"] * 0.5,
            2
        )

    # -------------------------------------------------
    # AI-BASED RECOMMENDATION
    # -------------------------------------------------

    best_route = min(
        routes,
        key=lambda route: route["score"]
    )

    return jsonify({

        "success": True,

        "ambulance": ambulance_code,

        "hospital": hospital["name"],

        "ai_average_clear_time":
            round(
                ai_average_clear_time,
                1
            ),

        "routes": routes,

        "recommended_route":
            best_route["name"]

    })# =========================================================
# RUN APPLICATION
# =========================================================
@app.route("/api/ai-predict")
def ai_predict():

    traffic_level = request.args.get("traffic_level", type=float)
    average_speed = request.args.get("average_speed", type=float)
    vehicle_count = request.args.get("vehicle_count", type=int)

    if (
        traffic_level is None
        or average_speed is None
        or vehicle_count is None
    ):
        return jsonify({
            "success": False,
            "message": "Traffic data is required."
        }), 400

    predicted_time = predict_clear_time(
        traffic_level,
        average_speed,
        vehicle_count
    )

    return jsonify({
        "success": True,
        "traffic_level": traffic_level,
        "average_speed": average_speed,
        "vehicle_count": vehicle_count,
        "predicted_clear_time": predicted_time
    })
if __name__ == "__main__":

    app.run(debug=True)
