import requests
import os
from datetime import datetime, timedelta
import time

def scrape_ogimet(icao, start_date, end_date, output_file):
    base_url = "https://www.ogimet.com/cgi-bin/getmetar"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    current_start = start_date
    with open(output_file, "a") as f:
        while current_start < end_date:
            current_end = min(current_start + timedelta(days=30), end_date)
            
            params = {
                "icao": icao,
                "begin": current_start.strftime("%Y%m%d%H%M"),
                "end": current_end.strftime("%Y%m%d%H%M")
            }
            
            print(f"Fetching data from {params['begin']} to {params['end']}...")
            try:
                response = requests.get(base_url, params=params, headers=headers, timeout=30)
                if response.status_code == 200:
                    content = response.text
                    # Check if it's wrapped in <pre> or if it's raw
                    if "<pre>" in content and "</pre>" in content:
                        clean_content = content.split("<pre>")[1].split("</pre>")[0]
                    else:
                        clean_content = content
                    
                    if clean_content.strip():
                        f.write(clean_content.strip())
                        f.write("\n")
                    else:
                        print(f"No METAR data found in response for {current_start}")
                else:
                    print(f"Error fetching data: {response.status_code}")
            except Exception as e:
                print(f"Exception: {e}")
            
            current_start = current_end
            time.sleep(2) # Be nice to the server

if __name__ == "__main__":
    icao = "LRIA"
    # 2 years back from today (June 5, 2026 as per session context)
    end_date = datetime(2026, 6, 5)
    start_date = end_date - timedelta(days=2*365)
    
    output_dir = "ml/data"
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "metar_lria_2y.txt")
    
    # Check if file exists to resume? (Simplification: overwrite for now or append)
    # If we append, we should handle duplicates later.
    scrape_ogimet(icao, start_date, end_date, output_file)
    print(f"Scraping completed. Data saved to {output_file}")
