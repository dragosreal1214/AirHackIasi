import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def calculate_humidity(temp, dewp):
    if pd.isna(temp) or pd.isna(dewp):
        return None
    # August-Roche-Magnus approximation
    rh = 100 * (np.exp((17.625 * dewp) / (243.04 + dewp)) / np.exp((17.625 * temp) / (243.04 + temp)))
    return round(rh, 2)

def perform_feature_engineering():
    # 1. Load Data
    metar_df = pd.read_csv('ml/data/metar_lria_2y.csv')
    gt_df = pd.read_csv('ml/data/ground_truth_disruptions.csv')
    
    # 2. Prepare Timestamps
    metar_df['timestamp'] = pd.to_datetime(metar_df['timestamp'])
    gt_df['timestamp_utc'] = pd.to_datetime(gt_df['date'] + ' ' + gt_df['scheduled_departure_UTC'])
    
    # 3. Add Temporal Features
    metar_df['hour'] = metar_df['timestamp'].dt.hour
    metar_df['month'] = metar_df['timestamp'].dt.month
    metar_df['day_of_week'] = metar_df['timestamp'].dt.dayofweek
    
    # 4. Add Humidity
    metar_df['humidity'] = metar_df.apply(lambda row: calculate_humidity(row['temperature'], row['dewpoint']), axis=1)
    
    # 5. Labeling: is_disrupted
    # We mark a METAR record as disrupted if it's within a +/- 3 hour window of any cancelled/diverted flight
    metar_df['is_disrupted'] = 0
    
    for _, flight in gt_df.iterrows():
        flight_time = flight['timestamp_utc']
        # Window of 3 hours around scheduled departure
        start_win = flight_time - timedelta(hours=3)
        end_win = flight_time + timedelta(hours=1)
        
        mask = (metar_df['timestamp'] >= start_win) & (metar_df['timestamp'] <= end_win)
        metar_df.loc[mask, 'is_disrupted'] = 1
    
    # 6. Save Enhanced Dataset
    output_path = 'ml/data/metar_enhanced_ml.csv'
    metar_df.to_csv(output_path, index=False)
    print(f"Enhanced dataset saved to {output_path}")
    print(f"Total records: {len(metar_df)}")
    print(f"Disrupted records labeled: {metar_df['is_disrupted'].sum()}")
    
    # 7. Create a specific "Disruption Profile" CSV for analysis
    # Get weather for every disrupted flight specifically
    disruption_profiles = []
    for _, flight in gt_df.iterrows():
        # Find closest METAR record
        closest_metar = metar_df.iloc[(metar_df['timestamp'] - flight['timestamp_utc']).abs().argsort()[:1]]
        if not closest_metar.empty:
            m = closest_metar.iloc[0]
            profile = {
                "flight_number": flight['flight_number'],
                "date": flight['date'],
                "sched_dep": flight['scheduled_departure_UTC'],
                "temp": m['temperature'],
                "dewp_dep": m['dewpoint_depression'],
                "wind": m['wind_speed'],
                "humidity": m['humidity'],
                "visibility": m['visibility'],
                "hour": m['hour'],
                "month": m['month']
            }
            disruption_profiles.append(profile)
            
    profile_df = pd.DataFrame(disruption_profiles)
    profile_df.to_csv('ml/data/disruption_weather_profiles.csv', index=False)
    print("Disruption weather profiles saved to ml/data/disruption_weather_profiles.csv")

if __name__ == "__main__":
    perform_feature_engineering()
