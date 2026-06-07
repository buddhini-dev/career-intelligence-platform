import requests
import pandas as pd
from datetime import datetime
import time
import json

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; CareerPlatformBot/1.0)"
}

def scrape_remoteok():
    print("🔍 Scraping RemoteOK...")
    url = "https://remoteok.com/api"
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        data = response.json()
        data = [job for job in data if isinstance(job, dict) and "position" in job]
        
        jobs = []
        for job in data:
            jobs.append({
                "title":        job.get("position", ""),
                "company":      job.get("company", ""),
                "location":     job.get("location", "Remote"),
                "description":  job.get("description", ""),
                "tags":         ", ".join(job.get("tags", [])),
                "salary_min":   job.get("salary_min", None),
                "salary_max":   job.get("salary_max", None),
                "posting_date": job.get("date", str(datetime.utcnow())),
                "source_url":   "https://remoteok.com/remote-jobs/" + str(job.get("id", "")),
            })
        
        print(f"✅ Scraped {len(jobs)} jobs from RemoteOK")
        return pd.DataFrame(jobs)

    except Exception as e:
        print(f"❌ Error scraping RemoteOK: {e}")
        return pd.DataFrame()

if __name__ == "__main__":
    df = scrape_remoteok()
    df.to_csv("../data/raw_jobs.csv", index=False)
    print("💾 Raw data saved to data/raw_jobs.csv")