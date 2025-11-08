"""
Guerillagenics NFL Depth Chart Scraper
--------------------------------------
Scrapes ESPN depth charts and writes to Notion.
"""

import os
import time
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import re

# Configuration
NOTION_API_KEY = os.getenv("NOTION_API_KEY")
DATA_SOURCE_ID = "2df99f74-45c0-40e2-8392-e497dacd0dd7"

if not NOTION_API_KEY:
    raise EnvironmentError("Missing NOTION_API_KEY environment variable.")

NOTION_HEADERS = {
    "Authorization": f"Bearer {NOTION_API_KEY}",
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28"
}

NFL_TEAMS = [
    "nyj", "ne", "bal", "pit", "cle", "cin",
    "hou", "ind", "jax", "ten", "kc", "lv", "lac", "den",
    "dal", "phi", "nyg", "was", "gb", "chi", "min", "det",
    "sf", "sea", "lar", "ari", "atl", "no", "tb", "car"
]
SKIP_TEAMS = ["buf", "mia"]

POSITION_GROUPS = {
    "QB": "Offense", "RB": "Offense", "WR": "Offense", "TE": "Offense", "FB": "Offense",
    "LT": "Offense", "LG": "Offense", "C": "Offense", "RG": "Offense", "RT": "Offense",
    "LDE": "Defense", "LDT": "Defense", "NT": "Defense", "RDT": "Defense", "RDE": "Defense",
    "WLB": "Defense", "MLB": "Defense", "LILB": "Defense", "RILB": "Defense", "SLB": "Defense",
    "LCB": "Defense", "SS": "Defense", "FS": "Defense", "RCB": "Defense", "NB": "Defense",
    "PK": "Special Teams", "P": "Special Teams", "H": "Special Teams",
    "PR": "Special Teams", "KR": "Special Teams", "LS": "Special Teams"
}

DEPTH_MAP = ["Starter", "2nd", "3rd", "4th"]

log_lines = []

def log(message):
    """Log to console and file."""
    print(message)
    log_lines.append(message)

def parse_player_injury(player_text):
    """Extract player name and injury status."""
    injury_pattern = r'\s+(O|Q|IR|PUP|SUS|D)$'
    match = re.search(injury_pattern, player_text)
    if match:
        status_map = {
            "O": "O (Out)", "Q": "Q (Questionable)", "IR": "IR (Injured Reserve)",
            "PUP": "PUP (Physically Unable to Perform)", "SUS": "SUS (Suspended)", "D": "Healthy"
        }
        return player_text[:match.start()].strip(), status_map.get(match.group(1), "Healthy")
    return player_text.strip(), "Healthy"

def scrape_depth_chart(team_code):
    """Scrape ESPN depth chart."""
    url = f"https://www.espn.com/nfl/team/depth/_/name/{team_code}"
    log(f"🕷️  Scraping {team_code.upper()} → {url}")
    
    try:
        resp = requests.get(url, timeout=15)
        if resp.status_code != 200:
            log(f"❌ Failed ({resp.status_code})")
            return []
        
        soup = BeautifulSoup(resp.text, "html.parser")
        entries = []
        
        for table in soup.select("table.Table"):
            rows = table.select("tbody tr")
            for row in rows:
                cols = row.select("td")
                if len(cols) < 2:
                    continue
                    
                position = cols[0].get_text(strip=True)
                if not position or position not in POSITION_GROUPS:
                    continue
                
                for depth_idx in range(1, min(5, len(cols))):
                    player_text = cols[depth_idx].get_text(strip=True)
                    if player_text and player_text != "-":
                        player_name, injury_status = parse_player_injury(player_text)
                        entries.append({
                            "team": team_code.upper(),
                            "position": position,
                            "depth": DEPTH_MAP[depth_idx - 1],
                            "player_name": player_name,
                            "injury_status": injury_status,
                            "position_group": POSITION_GROUPS[position]
                        })
        
        log(f"✅ {len(entries)} entries parsed")
        return entries
    except Exception as e:
        log(f"❌ Error: {e}")
        return []

def create_notion_page(entry):
    """Create Notion page."""
    entry_name = f"{entry['team']} - {entry['position']} - {entry['depth']}"
    payload = {
        "parent": {"database_id": DATA_SOURCE_ID},
        "properties": {
            "Entry Name": {"title": [{"text": {"content": entry_name}}]},
            "Team": {"select": {"name": entry['team']}},
            "Position": {"select": {"name": entry['position']}},
            "Depth": {"select": {"name": entry['depth']}},
            "Position Group": {"select": {"name": entry['position_group']}},
            "Injury Status": {"select": {"name": entry['injury_status']}},
            "Notes": {"rich_text": [{"text": {"content": entry['player_name']}}]},
            "Last Updated": {"date": {"start": datetime.now().strftime("%Y-%m-%d")}}
        }
    }
    
    try:
        r = requests.post("https://api.notion.com/v1/pages",
                         headers=NOTION_HEADERS, json=payload, timeout=10)
        if r.status_code != 200:
            log(f"⚠️  Failed {entry_name}: {r.status_code} {r.text}")
            return False
        return True
    except Exception as e:
        log(f"⚠️  Failed: {entry_name} - {e}")
        return False

def main():
    log("🏈 NFL Depth Chart Import Starting...\n")
    start = datetime.now()
    
    all_entries = []
    for team in NFL_TEAMS:
        if team in SKIP_TEAMS:
            log(f"⏩ Skipping {team.upper()}")
            continue
        entries = scrape_depth_chart(team)
        all_entries.extend(entries)
        time.sleep(1)
    
    log(f"\n📊 Total entries to import: {len(all_entries)}")
    log("⏸️  Starting upload...\n")
    
    success_count = 0
    for i, entry in enumerate(all_entries, 1):
        if create_notion_page(entry):
            success_count += 1
        if i % 10 == 0:
            log(f"Progress: {i}/{len(all_entries)}")
            time.sleep(0.5)
    
    duration = (datetime.now() - start).seconds // 60
    log(f"\n✅ Complete: {success_count}/{len(all_entries)} entries added in {duration}m")
    
    # Write log file
    with open("sync-log.txt", "w") as f:
        f.write("\n".join(log_lines))

if __name__ == "__main__":
    main()