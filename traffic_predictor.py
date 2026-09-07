import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent

DATA_FILE = BASE_DIR / "data" / "traffic_data.csv"
MODEL_FILE = BASE_DIR / "ai" / "traffic_model.pkl"


def train_model():

    data = pd.read_csv(DATA_FILE)

    X = data[
        [
            "traffic_level",
            "average_speed",
            "vehicle_count"
        ]
    ]

    y = data["clear_time"]

    model = RandomForestRegressor(
        n_estimators=100,
        random_state=42
    )

    model.fit(X, y)

    joblib.dump(model, MODEL_FILE)

    print("AI model trained successfully!")
    print("Model saved at:", MODEL_FILE)


def predict_clear_time(
    traffic_level,
    average_speed,
    vehicle_count
):

    model = joblib.load(MODEL_FILE)

    input_data = pd.DataFrame(
        [[
            traffic_level,
            average_speed,
            vehicle_count
        ]],
        columns=[
            "traffic_level",
            "average_speed",
            "vehicle_count"
        ]
    )

    prediction = model.predict(input_data)

    return round(float(prediction[0]), 1)


if __name__ == "__main__":

    train_model()

    result = predict_clear_time(
        traffic_level=85,
        average_speed=15,
        vehicle_count=67
    )

    print("Predicted time-to-clear:", result, "seconds")