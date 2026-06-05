import pandas as pd
import pickle
import os
from datetime import datetime, timedelta

def generate_final_report():
    # 1. Load Model, Features, and Data
    with open('ml/models/fog_model_v1.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('ml/models/features_v1.pkl', 'rb') as f:
        features = pickle.load(f)
        
    metar_df = pd.read_csv('ml/data/metar_enhanced_ml.csv')
    metar_df['timestamp'] = pd.to_datetime(metar_df['timestamp'])
    
    master_report = pd.read_csv('ml/data/fog_impact_master_report.csv')
    
    results = []
    alert_threshold = 0.6
    
    for _, event in master_report.iterrows():
        flight_ts = pd.to_datetime(f"{event['date']} {event['scheduled_departure_UTC']}")
        
        # Calculate prob at scheduled time
        closest_metar = metar_df.iloc[(metar_df['timestamp'] - flight_ts).abs().argsort()[:1]]
        prob_at_sched = 0.0
        if not closest_metar.empty:
            m_sched = closest_metar.iloc[0]
            X_sched = m_sched[features].to_frame().T.apply(pd.to_numeric)
            prob_at_sched = model.predict_proba(X_sched)[0][1]

        # Find earliest alert in 12h window
        start_lookback = flight_ts - timedelta(hours=12)
        window = metar_df[(metar_df['timestamp'] >= start_lookback) & (metar_df['timestamp'] <= flight_ts)].sort_values('timestamp')
        
        alert_ts = "N/A"
        lead_time = 0.0
        prob_at_alert = 0.0
        vis_at_alert = 0
        
        if not window.empty:
            X_win = window[features].apply(pd.to_numeric)
            window['prob'] = model.predict_proba(X_win)[:, 1]
            triggered = window[window['prob'] >= alert_threshold].head(1)
            
            if not triggered.empty:
                t = triggered.iloc[0]
                alert_ts = t['timestamp'].strftime("%H:%M")
                lead_time = (flight_ts - t['timestamp']).total_seconds() / 3600
                prob_at_alert = t['prob']
                vis_at_alert = t['visibility']

        results.append({
            "date": event['date'],
            "flight": event['flight_number'],
            "airline": event['airline'],
            "route": event['route'],
            "scheduled_UTC": event['scheduled_departure_UTC'],
            "fog_onset_UTC": event['fog_onset_estimate_UTC'],
            "aerly_alert_UTC": alert_ts,
            "lead_time_hours": round(lead_time, 1),
            "prob_at_alert": round(prob_at_alert * 100, 2),
            "prob_at_sched": round(prob_at_sched * 100, 2),
            "visibility_at_alert_m": vis_at_alert
        })

    # Save final report
    final_df = pd.DataFrame(results)
    final_df.to_csv('ml/data/aerly_final_pitch_report.csv', index=False)
    
    # Cleanup
    redundant = [
        'ml/data/disruption_probabilities.csv',
        'ml/data/model_validation_log.csv',
        'ml/data/fog_impact_master_report.csv',
        'ml/cleanup_data.py',
        'ml/calculate_probs.py',
        'ml/run_final_validation.py',
        'ml/check_lines.py',
        'ml/validate_cases.py',
        'ml/create_ground_truth.py'
    ]
    for f in redundant:
        if os.path.exists(f):
            os.remove(f)
            
    print(f"Final pitch report saved to ml/data/aerly_final_pitch_report.csv")
    print(f"Cleaned up {len(redundant)} redundant files.")

if __name__ == "__main__":
    generate_final_report()
