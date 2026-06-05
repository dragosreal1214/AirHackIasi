import pandas as pd
import re
import os
from datetime import datetime

def parse_metar_line(line):
    # Format: LRIA,YYYY,MM,DD,HH,mm,METAR LRIA ...=
    parts = line.split(',')
    if len(parts) < 7:
        return None
    
    try:
        icao = parts[0]
        year = parts[1]
        month = parts[2]
        day = parts[3]
        hour = parts[4]
        minute = parts[5]
        metar_str = ",".join(parts[6:]).strip()
        
        dt_str = f"{year}-{month}-{day} {hour}:{minute}"
        
        # Basic Feature Extraction using Regex
        
        # Temperature and Dewpoint: 16/16 or M01/M02
        temp = None
        dewp = None
        td_match = re.search(r' (M?\d{2})/(M?\d{2})[ =]', metar_str)
        if td_match:
            def parse_temp(t):
                if t.startswith('M'):
                    return -int(t[1:])
                return int(t)
            temp = parse_temp(td_match.group(1))
            dewp = parse_temp(td_match.group(2))
            
        # Wind Speed: 29003KT -> 03
        wind_speed = None
        wind_match = re.search(r' \d{3}(\d{2})(G\d{2})?KT', metar_str)
        if wind_match:
            wind_speed = int(wind_match.group(1))
            
        # Visibility: 9999 or 0500 or CAVOK
        visibility = None
        if "CAVOK" in metar_str:
            visibility = 10000
        else:
            vis_match = re.search(r' (\d{4}) ', metar_str)
            if vis_match:
                visibility = int(vis_match.group(1))
        
        # Fog Check
        is_fog = 1 if (" FG " in metar_str or " FZFG " in metar_str) else 0
        is_mist = 1 if " BR " in metar_str else 0
        
        return {
            "timestamp": dt_str,
            "icao": icao,
            "temperature": temp,
            "dewpoint": dewp,
            "wind_speed": wind_speed,
            "visibility": visibility,
            "is_fog": is_fog,
            "is_mist": is_mist,
            "raw_metar": metar_str
        }
    except Exception as e:
        # print(f"Error parsing line: {e}")
        return None

def convert_to_csv(input_file, output_file):
    data = []
    if not os.path.exists(input_file):
        print(f"File {input_file} not found.")
        return
        
    with open(input_file, 'r') as f:
        for line in f:
            parsed = parse_metar_line(line.strip())
            if parsed:
                data.append(parsed)
    
    df = pd.DataFrame(data)
    # Feature Engineering: Dewpoint Depression
    if 'temperature' in df.columns and 'dewpoint' in df.columns:
        df['dewpoint_depression'] = df['temperature'] - df['dewpoint']
        
    df.to_csv(output_file, index=False)
    print(f"Successfully converted to {output_file}. Processed {len(df)} lines.")

if __name__ == "__main__":
    input_path = "ml/data/metar_lria_2y_v2.txt"
    output_path = "ml/data/metar_lria_2y.csv"
    convert_to_csv(input_path, output_path)
