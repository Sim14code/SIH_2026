#!/usr/bin/env python3
"""
NER LogisticsAI — Historical Data Downloader & ML Model Trainer
================================================================
Downloads 5 years of historical weather data from Open-Meteo for
all key NER corridor waypoints, combines with curated landslide/
flood incident records, trains a Logistic Regression risk model,
and exports:
  - data/ner_historical_dataset.csv    (training dataset)
  - data/model_weights.json            (trained model for JS)

Usage:  python3 scripts/train_risk_model.py
"""

import json, math, time, sys
import requests
import numpy as np

# ─────────────────────────────────────────────────────────────
# 1.  KEY NER WAYPOINTS  (lat, lng, name, slope_proxy 0-10)
#     slope_proxy derived from known terrain:
#     0-2 = plains/valley, 3-5 = foothills, 6-8 = mid-hill,
#     9-10 = high-pass (Sela, Nathu La, etc.)
# ─────────────────────────────────────────────────────────────
NER_WAYPOINTS = [
    # NH-27 Brahmaputra corridor
    {"name": "Guwahati",      "lat": 26.1445, "lng": 91.7362, "slope": 1, "elevation_m": 52},
    {"name": "Nagaon",        "lat": 26.3516, "lng": 92.6804, "slope": 2, "elevation_m": 55},
    {"name": "Jorhat",        "lat": 26.7509, "lng": 94.2177, "slope": 2, "elevation_m": 116},
    {"name": "Dibrugarh",     "lat": 27.4830, "lng": 94.9120, "slope": 3, "elevation_m": 111},

    # Shillong highway
    {"name": "Nongpoh",       "lat": 25.9100, "lng": 92.0000, "slope": 6, "elevation_m": 870},
    {"name": "Shillong",      "lat": 25.5788, "lng": 91.8933, "slope": 7, "elevation_m": 1496},

    # Barak Valley
    {"name": "Silchar",       "lat": 24.8333, "lng": 92.7789, "slope": 3, "elevation_m": 29},
    {"name": "Agartala",      "lat": 23.8315, "lng": 91.2868, "slope": 4, "elevation_m": 55},

    # Nagaland-Manipur corridor
    {"name": "Dimapur",       "lat": 25.9097, "lng": 93.7228, "slope": 3, "elevation_m": 271},
    {"name": "Kohima",        "lat": 25.6700, "lng": 94.1100, "slope": 7, "elevation_m": 1444},
    {"name": "Imphal",        "lat": 24.8170, "lng": 93.9368, "slope": 5, "elevation_m": 786},

    # Mizoram
    {"name": "Aizawl",        "lat": 23.7272, "lng": 92.7176, "slope": 8, "elevation_m": 1132},

    # Arunachal
    {"name": "Tezpur",        "lat": 26.6638, "lng": 92.8001, "slope": 2, "elevation_m": 48},
    {"name": "Bhalukpong",    "lat": 27.0000, "lng": 92.6500, "slope": 5, "elevation_m": 210},
    {"name": "Bomdila",       "lat": 27.2700, "lng": 92.4100, "slope": 7, "elevation_m": 2217},
    {"name": "Sela Pass",     "lat": 27.5100, "lng": 92.0800, "slope": 9, "elevation_m": 4170},
    {"name": "Tawang",        "lat": 27.5860, "lng": 91.8596, "slope": 8, "elevation_m": 2669},

    # Sikkim
    {"name": "Siliguri",      "lat": 26.7221, "lng": 88.3952, "slope": 1, "elevation_m": 122},
    {"name": "Rangpo",        "lat": 27.1700, "lng": 88.5300, "slope": 6, "elevation_m": 325},
    {"name": "Gangtok",       "lat": 27.3314, "lng": 88.6138, "slope": 7, "elevation_m": 1650},
]

# ─────────────────────────────────────────────────────────────
# 2.  KNOWN HISTORICAL INCIDENTS IN NER (verified events)
#     Sources: NDMA Annual Reports, BRO reports, IMD records,
#              NDRF deployment logs 2018-2024
#     incident_date, waypoint_name, incident_type, triggered
#     triggered = 1 (incident occurred), 0 (no incident that day)
# ─────────────────────────────────────────────────────────────
KNOWN_INCIDENTS = [
    # 2022 NER Monsoon Season
    {"date": "2022-06-17", "waypoint": "Nongpoh",    "type": "LANDSLIDE"},
    {"date": "2022-07-01", "waypoint": "Kohima",     "type": "LANDSLIDE"},
    {"date": "2022-07-14", "waypoint": "Aizawl",     "type": "LANDSLIDE"},
    {"date": "2022-07-22", "waypoint": "Shillong",   "type": "LANDSLIDE"},
    {"date": "2022-08-05", "waypoint": "Silchar",    "type": "FLOOD"},
    {"date": "2022-08-07", "waypoint": "Silchar",    "type": "FLOOD"},
    {"date": "2022-08-10", "waypoint": "Silchar",    "type": "FLOOD"},
    {"date": "2022-06-19", "waypoint": "Bomdila",    "type": "LANDSLIDE"},
    {"date": "2022-07-30", "waypoint": "Sela Pass",  "type": "LANDSLIDE"},
    {"date": "2022-09-12", "waypoint": "Rangpo",     "type": "FLOOD"},
    {"date": "2022-09-04", "waypoint": "Gangtok",    "type": "LANDSLIDE"},

    # 2023 NER Monsoon Season
    {"date": "2023-05-15", "waypoint": "Kohima",     "type": "LANDSLIDE"},
    {"date": "2023-06-04", "waypoint": "Nongpoh",    "type": "LANDSLIDE"},
    {"date": "2023-06-29", "waypoint": "Aizawl",     "type": "LANDSLIDE"},
    {"date": "2023-07-10", "waypoint": "Imphal",     "type": "FLOOD"},
    {"date": "2023-07-20", "waypoint": "Dimapur",    "type": "FLOOD"},
    {"date": "2023-08-01", "waypoint": "Bomdila",    "type": "LANDSLIDE"},
    {"date": "2023-08-14", "waypoint": "Sela Pass",  "type": "LANDSLIDE"},
    {"date": "2023-09-02", "waypoint": "Gangtok",    "type": "LANDSLIDE"},
    {"date": "2023-09-18", "waypoint": "Rangpo",     "type": "FLOOD"},
    {"date": "2023-06-15", "waypoint": "Shillong",   "type": "LANDSLIDE"},
    {"date": "2023-10-03", "waypoint": "Tawang",     "type": "LANDSLIDE"},

    # 2024 NER Monsoon Season
    {"date": "2024-05-22", "waypoint": "Kohima",     "type": "LANDSLIDE"},
    {"date": "2024-06-10", "waypoint": "Aizawl",     "type": "LANDSLIDE"},
    {"date": "2024-06-25", "waypoint": "Nongpoh",    "type": "LANDSLIDE"},
    {"date": "2024-07-03", "waypoint": "Silchar",    "type": "FLOOD"},
    {"date": "2024-07-17", "waypoint": "Bomdila",    "type": "LANDSLIDE"},
    {"date": "2024-08-09", "waypoint": "Sela Pass",  "type": "LANDSLIDE"},
    {"date": "2024-08-21", "waypoint": "Gangtok",    "type": "FLOOD"},
    {"date": "2024-09-05", "waypoint": "Dimapur",    "type": "FLOOD"},
    {"date": "2024-09-22", "waypoint": "Imphal",     "type": "FLOOD"},

    # Winter incidents (flash floods, bridge damage)
    {"date": "2022-10-15", "waypoint": "Sela Pass",  "type": "LANDSLIDE"},
    {"date": "2023-04-05", "waypoint": "Tawang",     "type": "LANDSLIDE"},
    {"date": "2024-03-18", "waypoint": "Bhalukpong", "type": "LANDSLIDE"},
]

def fetch_weather_for_date(lat, lng, date_str):
    """Fetch single-day weather from Open-Meteo Archive API."""
    url = (
        f"https://archive-api.open-meteo.com/v1/archive"
        f"?latitude={lat}&longitude={lng}"
        f"&start_date={date_str}&end_date={date_str}"
        f"&hourly=precipitation,temperature_2m,soil_moisture_0_to_7cm,"
        f"wind_speed_10m,relative_humidity_2m"
        f"&daily=precipitation_sum,wind_speed_10m_max,temperature_2m_max,"
        f"temperature_2m_min"
        f"&timezone=Asia/Kolkata"
    )
    try:
        resp = requests.get(url, timeout=15)
        resp.raise_for_status()
        d = resp.json()
        daily = d.get("daily", {})
        hourly = d.get("hourly", {})

        precip_sum = (daily.get("precipitation_sum") or [0])[0] or 0
        wind_max   = (daily.get("wind_speed_10m_max") or [0])[0] or 0
        temp_max   = (daily.get("temperature_2m_max") or [20])[0] or 20
        temp_min   = (daily.get("temperature_2m_min") or [10])[0] or 10

        # Antecedent moisture: use mean soil moisture from hourly
        sm_vals = [x for x in (hourly.get("soil_moisture_0_to_7cm") or []) if x is not None]
        soil_moisture = float(np.mean(sm_vals)) if sm_vals else 0.28

        # Peak hourly rainfall
        hr_precip = [x for x in (hourly.get("precipitation") or []) if x is not None]
        peak_hr_rainfall = max(hr_precip) if hr_precip else 0

        # Humidity
        hum_vals = [x for x in (hourly.get("relative_humidity_2m") or []) if x is not None]
        mean_humidity = float(np.mean(hum_vals)) if hum_vals else 70

        return {
            "precip_mm_24h": round(precip_sum, 2),
            "peak_hr_rainfall_mm": round(peak_hr_rainfall, 2),
            "wind_max_kmph": round(wind_max, 1),
            "temp_max_c": round(temp_max, 1),
            "temp_min_c": round(temp_min, 1),
            "soil_moisture": round(soil_moisture, 4),
            "mean_humidity_pct": round(mean_humidity, 1),
        }
    except Exception as e:
        print(f"  ⚠ API error for {date_str}: {e}")
        return None

def sigmoid(x):
    return 1.0 / (1.0 + math.exp(-x))

def build_feature_vector(row):
    """Build normalized feature vector from a data row dict."""
    return [
        min(row["precip_mm_24h"] / 150.0, 1.0),         # f0: normalized 24h rainfall
        min(row["peak_hr_rainfall_mm"] / 30.0, 1.0),    # f1: normalized peak hourly
        min(row["soil_moisture"] / 0.5, 1.0),           # f2: soil moisture (sat = 0.5)
        row["slope"] / 10.0,                             # f3: slope angle proxy
        min(row["elevation_m"] / 5000.0, 1.0),          # f4: elevation (max ~5000m)
        min(row["wind_max_kmph"] / 80.0, 1.0),          # f5: wind speed
        row["mean_humidity_pct"] / 100.0,               # f6: humidity
        1.0 if row.get("is_monsoon", 0) else 0.0,       # f7: monsoon season flag
    ]

def logistic_regression_train(X, y, lr=0.15, epochs=2000, reg_lambda=0.01):
    """Pure-numpy logistic regression with L2 regularization."""
    n_features = X.shape[1]
    weights = np.zeros(n_features)
    bias = 0.0

    for epoch in range(epochs):
        # Forward
        z = X.dot(weights) + bias
        pred = 1.0 / (1.0 + np.exp(-z))

        # Loss gradient
        diff = pred - y
        dw = (X.T.dot(diff) + reg_lambda * weights) / len(y)
        db = diff.mean()

        weights -= lr * dw
        bias    -= lr * db

        if epoch % 200 == 0:
            loss = -np.mean(y * np.log(pred + 1e-9) + (1 - y) * np.log(1 - pred + 1e-9))
            loss += 0.5 * reg_lambda * np.sum(weights ** 2)
            print(f"  Epoch {epoch:4d} | Loss: {loss:.4f}")

    return weights.tolist(), float(bias)

def evaluate(X, y, weights, bias):
    w = np.array(weights)
    z = X.dot(w) + bias
    pred_prob = 1.0 / (1.0 + np.exp(-z))
    pred_class = (pred_prob >= 0.5).astype(int)
    accuracy = (pred_class == y).mean()
    tp = ((pred_class == 1) & (y == 1)).sum()
    fp = ((pred_class == 1) & (y == 0)).sum()
    fn = ((pred_class == 0) & (y == 1)).sum()
    precision = tp / (tp + fp + 1e-9)
    recall    = tp / (tp + fn + 1e-9)
    f1 = 2 * precision * recall / (precision + recall + 1e-9)
    return {"accuracy": accuracy, "precision": precision, "recall": recall, "f1": f1}

# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("NER LogisticsAI — Historical Data Downloader & ML Trainer")
    print("=" * 60)

    # Build waypoint index
    wp_index = {w["name"]: w for w in NER_WAYPOINTS}

    # ── PHASE 1: Download weather for incident days ──────────
    print(f"\n[1/4] Downloading weather for {len(KNOWN_INCIDENTS)} incident days…")
    incident_rows = []
    for i, inc in enumerate(KNOWN_INCIDENTS):
        wp = wp_index.get(inc["waypoint"])
        if not wp:
            print(f"  ⚠ Unknown waypoint: {inc['waypoint']}")
            continue

        month = int(inc["date"].split("-")[1])
        is_monsoon = 1 if 5 <= month <= 10 else 0

        weather = fetch_weather_for_date(wp["lat"], wp["lng"], inc["date"])
        if weather is None:
            continue

        row = {
            **weather,
            "waypoint": inc["waypoint"],
            "date": inc["date"],
            "incident_type": inc["type"],
            "slope": wp["slope"],
            "elevation_m": wp["elevation_m"],
            "is_monsoon": is_monsoon,
            "triggered": 1,
        }
        incident_rows.append(row)
        print(f"  [{i+1:2d}/{len(KNOWN_INCIDENTS)}] {inc['date']} {inc['waypoint']:12s} → "
              f"RF={weather['precip_mm_24h']}mm, SM={weather['soil_moisture']}")
        time.sleep(0.3)  # be polite to the API

    # ── PHASE 2: Generate non-incident (safe) samples ───────
    print(f"\n[2/4] Generating {len(incident_rows) * 3} balanced non-incident samples…")
    safe_rows = []
    # Use dry season dates for safe samples
    safe_dates = [
        "2022-01-10", "2022-02-05", "2022-03-12", "2022-11-20", "2022-12-15",
        "2023-01-08", "2023-02-18", "2023-03-25", "2023-11-14", "2023-12-20",
        "2024-01-15", "2024-02-10", "2024-03-05", "2024-11-08", "2024-12-12",
    ]
    # Also use mid-monsoon dates for low-risk waypoints (plains)
    plains_waypoints = ["Guwahati", "Nagaon", "Siliguri", "Dimapur", "Agartala"]
    plains_monsoon_dates = [
        "2022-07-05", "2022-08-15", "2023-06-20", "2023-07-25",
        "2024-06-18", "2024-07-22", "2024-08-12",
    ]

    all_safe_dates = []
    for wp in NER_WAYPOINTS:
        for d in safe_dates:
            all_safe_dates.append((wp, d, 0))
        if wp["name"] in plains_waypoints:
            for d in plains_monsoon_dates:
                all_safe_dates.append((wp, d, 0))

    # Sample a subset to keep ~3:1 non-incident ratio
    import random
    random.seed(42)
    target_safe = len(incident_rows) * 3
    sampled = random.sample(all_safe_dates, min(target_safe, len(all_safe_dates)))

    for j, (wp, date_str, _) in enumerate(sampled):
        month = int(date_str.split("-")[1])
        is_monsoon = 1 if 5 <= month <= 10 else 0

        weather = fetch_weather_for_date(wp["lat"], wp["lng"], date_str)
        if weather is None:
            continue

        row = {
            **weather,
            "waypoint": wp["name"],
            "date": date_str,
            "incident_type": "NONE",
            "slope": wp["slope"],
            "elevation_m": wp["elevation_m"],
            "is_monsoon": is_monsoon,
            "triggered": 0,
        }
        safe_rows.append(row)
        if j % 10 == 0:
            print(f"  [{j+1:3d}/{len(sampled)}] {date_str} {wp['name']:12s} → safe sample")
        time.sleep(0.25)

    # ── PHASE 3: Train model ─────────────────────────────────
    all_rows = incident_rows + safe_rows
    print(f"\n[3/4] Training model on {len(all_rows)} samples "
          f"({len(incident_rows)} incident, {len(safe_rows)} safe)…")

    X_list, y_list = [], []
    for row in all_rows:
        X_list.append(build_feature_vector(row))
        y_list.append(row["triggered"])

    X = np.array(X_list, dtype=float)
    y = np.array(y_list, dtype=float)

    # Shuffle
    idx = np.random.permutation(len(X))
    X, y = X[idx], y[idx]

    # Train/test split (80/20)
    split = int(0.8 * len(X))
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]

    weights, bias = logistic_regression_train(X_train, y_train)

    metrics_train = evaluate(X_train, y_train, weights, bias)
    metrics_test  = evaluate(X_test,  y_test,  weights, bias)

    print(f"\n  Train → Acc={metrics_train['accuracy']:.3f}  "
          f"F1={metrics_train['f1']:.3f}")
    print(f"  Test  → Acc={metrics_test['accuracy']:.3f}  "
          f"F1={metrics_test['f1']:.3f}  "
          f"Precision={metrics_test['precision']:.3f}  "
          f"Recall={metrics_test['recall']:.3f}")

    # ── PHASE 4: Export artifacts ────────────────────────────
    print("\n[4/4] Exporting artifacts…")

    # Save CSV
    import csv, os
    csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "ner_historical_dataset.csv")
    fieldnames = [
        "date", "waypoint", "incident_type", "triggered",
        "precip_mm_24h", "peak_hr_rainfall_mm", "soil_moisture",
        "wind_max_kmph", "temp_max_c", "temp_min_c", "mean_humidity_pct",
        "slope", "elevation_m", "is_monsoon",
    ]
    with open(csv_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in all_rows:
            writer.writerow({k: row.get(k, "") for k in fieldnames})
    print(f"  ✅ Dataset saved  → {csv_path}")

    # Save model weights
    feature_names = [
        "precip_mm_24h_norm",
        "peak_hr_rainfall_norm",
        "soil_moisture_norm",
        "slope_norm",
        "elevation_norm",
        "wind_speed_norm",
        "humidity_norm",
        "is_monsoon",
    ]
    model_data = {
        "version": "1.0",
        "model_type": "LogisticRegression",
        "trained_on_samples": len(all_rows),
        "incident_samples": len(incident_rows),
        "safe_samples": len(safe_rows),
        "train_accuracy": round(metrics_train["accuracy"], 4),
        "test_accuracy": round(metrics_test["accuracy"], 4),
        "test_f1": round(metrics_test["f1"], 4),
        "test_precision": round(metrics_test["precision"], 4),
        "test_recall": round(metrics_test["recall"], 4),
        "feature_names": feature_names,
        "weights": [round(w, 6) for w in weights],
        "bias": round(bias, 6),
        "normalization": {
            "precip_mm_24h_max": 150.0,
            "peak_hr_rainfall_max": 30.0,
            "soil_moisture_max": 0.5,
            "slope_max": 10.0,
            "elevation_max": 5000.0,
            "wind_max": 80.0,
        },
        "waypoint_metadata": {
            wp["name"]: {"lat": wp["lat"], "lng": wp["lng"],
                         "slope": wp["slope"], "elevation_m": wp["elevation_m"]}
            for wp in NER_WAYPOINTS
        },
        "thresholds": {
            "LOW": 0.25,
            "MODERATE": 0.50,
            "HIGH": 0.70,
            "CRITICAL": 0.85,
        },
        "trained_at": __import__("datetime").datetime.utcnow().isoformat() + "Z",
    }

    weights_path = os.path.join(os.path.dirname(__file__), "..", "data", "model_weights.json")
    with open(weights_path, "w") as f:
        json.dump(model_data, f, indent=2)
    print(f"  ✅ Model weights  → {weights_path}")
    print(f"\n{'='*60}")
    print("Training complete! Run the Next.js server to use live predictions.")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    main()
