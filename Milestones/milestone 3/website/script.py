import os
import re
import json

base_path = 'data/surfaces'
tournament_data = []

for year in os.listdir(base_path):
    year_path = os.path.join(base_path, year)
    if not os.path.isdir(year_path):
        continue
    for circuit in os.listdir(year_path):
        circuit_path = os.path.join(year_path, circuit, 'tournament_goat')
        if not os.path.isdir(circuit_path):
            continue
        for filename in os.listdir(circuit_path):
            match = re.match(r'(.+)_goat_players_on_(Hard|Clay|Grass)_(\d{4})\.csv', filename)
            if match:
                tournament_name, surface, file_year = match.groups()
                tournament_data.append({
                    'name': tournament_name,
                    'surface': surface,
                    'year': file_year,
                    'circuit': circuit,
                    'filename': filename
                })

with open('tournaments.json', 'w') as f:
    json.dump(tournament_data, f, indent=2)
