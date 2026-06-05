import pandas as pd
import pickle
from datetime import timedelta

def generate_fog_windows(target_date):
    # 1. Load Model and Data
    with open('ml/models/fog_model_v1.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('ml/models/features_v1.pkl', 'rb') as f:
        features = pickle.load(f)
        
    df = pd.read_csv('ml/data/metar_enhanced_ml.csv')
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # 2. Filter for the target day
    day_data = df[df['timestamp'].dt.date == pd.to_datetime(target_date).date()].sort_values('timestamp')
    
    if day_data.empty:
        return "No data for this date."

    # 3. Predict probabilities
    X = day_data[features].apply(pd.to_numeric)
    day_data['prob'] = model.predict_proba(X)[:, 1]
    
    # 4. Identify windows (prob >= 0.65)
    threshold = 0.65
    day_data['is_high_risk'] = day_data['prob'] >= threshold
    
    windows = []
    start_time = None
    
    for i, row in day_data.iterrows():
        if row['is_high_risk'] and start_time is None:
            start_time = row['timestamp']
        elif not row['is_high_risk'] and start_time is not None:
            end_time = row['timestamp']
            windows.append((start_time, end_time))
            start_time = None
            
    # Handle case where fog lasts until end of data
    if start_time is not None:
        windows.append((start_time, day_data.iloc[-1]['timestamp']))

    # 5. Format output
    output = []
    for start, end in windows:
        # Rounding for clean UI display
        start_str = start.strftime("%H:%M")
        end_str = end.strftime("%H:%M")
        output.append(f"{start_str} — {end_str}")
        
    return output

if __name__ == "__main__":
    test_dates = ["2024-12-20", "2025-11-10", "2026-01-21"]
    
    print("=== AERLY TIME-WINDOW PREDICTION ENGINE ===\n")
    for date in test_dates:
        print(f"DATE: {date}")
        windows = generate_fog_windows(date)
        if windows:
            print(f"  [!] High Risk Windows: {', '.join(windows)} (UTC)")
        else:
            print("  [✓] No significant fog windows predicted.")
        print("-" * 40)
