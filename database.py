import sqlite3


DATABASE = "database.db"


def get_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():

    connection = get_connection()
    cursor = connection.cursor()

    # =========================================================
    # AMBULANCE TABLE
    # =========================================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ambulances (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ambulance_code TEXT UNIQUE NOT NULL,
            status TEXT NOT NULL,
            latitude REAL,
            longitude REAL
        )
    """)


    # =========================================================
    # HOSPITAL TABLE
    # =========================================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS hospitals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            emergency_available INTEGER DEFAULT 1
        )
    """)


    # =========================================================
    # EMERGENCY TRIPS TABLE
    # =========================================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS emergency_trips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ambulance_code TEXT NOT NULL,
            hospital_id INTEGER NOT NULL,
            status TEXT NOT NULL,
            start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)


    # =========================================================
    # TRAFFIC TABLE
    # =========================================================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS traffic (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            road_name TEXT NOT NULL,
            traffic_level INTEGER NOT NULL,
            average_speed REAL NOT NULL,
            vehicle_count INTEGER NOT NULL,
            predicted_clear_time INTEGER,
            risk_level TEXT NOT NULL
        )
    """)


    # =========================================================
    # INSERT SIMULATED TRAFFIC DATA
    # =========================================================

    traffic_data = [

        (
            "Junction A",
            25,
            42.0,
            18,
            12,
            "LOW"
        ),

        (
            "Junction B",
            85,
            15.0,
            67,
            52,
            "HIGH"
        ),

        (
            "Junction C",
            55,
            28.0,
            39,
            21,
            "MEDIUM"
        ),

        (
            "Junction D",
            35,
            36.0,
            25,
            16,
            "LOW"
        ),

        (
            "Junction E",
            70,
            20.0,
            52,
            38,
            "HIGH"
        )

    ]


    for traffic in traffic_data:

        cursor.execute("""
            INSERT INTO traffic
            (
                road_name,
                traffic_level,
                average_speed,
                vehicle_count,
                predicted_clear_time,
                risk_level
            )
            SELECT ?, ?, ?, ?, ?, ?
            WHERE NOT EXISTS (
                SELECT 1
                FROM traffic
                WHERE road_name = ?
            )
        """, traffic + (traffic[0],))


    # =========================================================
    # INSERT DEMO AMBULANCES
    # =========================================================

    cursor.execute("""
        INSERT OR IGNORE INTO ambulances
        (
            ambulance_code,
            status,
            latitude,
            longitude
        )
        VALUES (?, ?, ?, ?)
    """, (
        "AMB-101",
        "Available",
        17.3850,
        78.4867
    ))


    cursor.execute("""
        INSERT OR IGNORE INTO ambulances
        (
            ambulance_code,
            status,
            latitude,
            longitude
        )
        VALUES (?, ?, ?, ?)
    """, (
        "AMB-102",
        "Available",
        17.3900,
        78.4800
    ))


    cursor.execute("""
        INSERT OR IGNORE INTO ambulances
        (
            ambulance_code,
            status,
            latitude,
            longitude
        )
        VALUES (?, ?, ?, ?)
    """, (
        "AMB-103",
        "Available",
        17.3800,
        78.4900
    ))


    # =========================================================
    # INSERT DEMO HOSPITALS
    # =========================================================

    cursor.execute("""
        INSERT INTO hospitals
        (
            name,
            latitude,
            longitude,
            emergency_available
        )
        SELECT ?, ?, ?, ?
        WHERE NOT EXISTS (
            SELECT 1
            FROM hospitals
            WHERE name = ?
        )
    """, (
        "City General Hospital",
        17.4000,
        78.5000,
        1,
        "City General Hospital"
    ))


    cursor.execute("""
        INSERT INTO hospitals
        (
            name,
            latitude,
            longitude,
            emergency_available
        )
        SELECT ?, ?, ?, ?
        WHERE NOT EXISTS (
            SELECT 1
            FROM hospitals
            WHERE name = ?
        )
    """, (
        "Emergency Care Hospital",
        17.3750,
        78.4950,
        1,
        "Emergency Care Hospital"
    ))


    cursor.execute("""
        INSERT INTO hospitals
        (
            name,
            latitude,
            longitude,
            emergency_available
        )
        SELECT ?, ?, ?, ?
        WHERE NOT EXISTS (
            SELECT 1
            FROM hospitals
            WHERE name = ?
        )
    """, (
        "Central Medical Center",
        17.3950,
        78.4750,
        1,
        "Central Medical Center"
    ))


    # =========================================================
    # SAVE DATABASE
    # =========================================================

    connection.commit()
    connection.close()


if __name__ == "__main__":

    initialize_database()

    print(
        "SafePass database initialized successfully."
    )