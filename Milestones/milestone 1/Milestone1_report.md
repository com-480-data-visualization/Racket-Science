# Milestone 1
## Racket Sciences

| Student's name | SCIPER |
| -------------- | ------ |
| Réza Machraoui | 344029 |
| Leila Sidjanski | 330810 |
| Luna Ralet | 330765 |
---

## Dataset

We found multiple data sources containing various files over the years for both men and women, covering multiple tournaments.

**Datasets:**

1. [Jeff Sackmann's ATP Matches Dataset](https://github.com/JeffSackmann/tennis_atp/tree/master): Provides ATP match outcomes, player statistics (titles, aces, first serves, win percentage), and details for major tournaments (Grand Slams, Masters 1000, Finals, Olympics).

2. [Jeff Sackmann's ATP Doubles Matches Dataset](https://github.com/JeffSackmann/tennis_wta/tree/master): Focuses on doubles match outcomes and team performance, including player statistics such as titles, aces, and first serve percentage.

3. [Jeff Sackmann's WTA Matches Dataset](https://github.com/JeffSackmann/tennis_atp/tree/master): Provides WTA match outcomes and player statistics (titles, aces, first serves, win percentage), with details for major tournaments (Grand Slams, Masters 1000, Finals, Olympics).

4. [Jeff Sackmann's Match Charting Project](https://github.com/JeffSackmann/tennis_MatchChartingProject): Compiles detailed shot-by-shot data from professional tennis matches (ATP and WTA). Includes shot types, directions, errors, statistics, and match metadata. We specifically utilized Net Points data to identify top players at net.

5. [Ultimate Tennis Matches Dataset](https://www.kaggle.com/datasets/mexwell/ultimate-tennis-matches-dataset): Kaggle dataset covering men's and women's tennis tournaments, including match details and player information. We extracted data related to playing surfaces.

6. [Huge Tennis Database](https://www.kaggle.com/datasets/guillemservera/tennis?resource=download): Comprehensive men's player rankings, match results, and statistics dataset on Kaggle, ideal for extensive tennis analytics.

7. [Association of Tennis Professionals Matches](https://www.kaggle.com/datasets/gmadevs/atp-matches-dataset): Detailed records of ATP matches from 2000-2017, including comprehensive statistics, player info, match outcomes, and performance metrics.

---

## Problematic

Tennis has long been the stage for debates about greatness, with fans and analysts constantly comparing players across different eras. The emergence of statistical analysis and data-driven insights allows moving beyond subjective opinions towards objective approaches in determining the Greatest of All Time (GOAT) across various aspects of tennis.

This project aims to provide a visual exploration of the GOAT debate in tennis, using data to assess player performances across multiple dimensions. Our goal is to make complex statistics accessible and engaging for casual tennis enthusiasts and dedicated followers alike.

We will develop visualizations enabling users to explore:

1. **The Overall GOAT Debate** – Comparing Djokovic, Federer, and Nadal using key performance indicators such as Grand Slam titles, total wins, head-to-head records, and longevity.

2. **The Best Server in History** – Analyzing ace counts, first serve percentage, service games won, and break points saved.

3. **GOAT by Surface** – Identifying dominant players on clay, grass, and hard courts based on win percentages and titles.

4. **GOAT in Doubles** – Highlighting legendary doubles players through Grand Slam titles and team chemistry.

5. **GOAT of Specific Tournaments** – Investigating dominance at Grand Slam events and Masters 1000 tournaments.

6. **The Best at Net Play** – Evaluating volleyers based on net points won and serve-and-volley efficiency.

Our objective is to offer a data-driven perspective on tennis greatness, creating interactive visualizations allowing users to compare, filter, and interpret key insights. Leveraging historical data, we aim to spark discussion and deepen understanding of what defines a tennis legend.

---

## Exploratory Data Analysis

See notebooks. We used various notebooks to demonstrate processing performed on the datasets.

---

## Related Work

We utilize multiple datasets from various sources, significantly sourced from [Jeff Sackmann’s GitHub repository](https://github.com/JeffSackmann). His datasets are also the foundation of [Ultimate Tennis Statistics](https://ultimatetennisstatistics.com/), a comprehensive platform analyzing professional tennis matches, player performance, rankings, and match statistics from ATP and WTA tours.

Our approach is original because it moves beyond traditional rankings (such as Grand Slam titles or ATP rankings), incorporating multiple characteristics to evaluate the GOAT comprehensively. While numerous analyses exist, our visualization seeks to be more interactive and engaging, allowing users to directly compare great players and their unique attributes.

To our knowledge, existing GOAT rankings rarely offer detailed breakdowns by specific categories, enabling nuanced and customizable comparisons. Our interactive visualization makes the GOAT debate insightful, interactive, and enjoyable for fans, analysts, and tennis enthusiasts.

