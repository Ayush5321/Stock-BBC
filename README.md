# Real-Time Mutual Fund Analytics Platform

A **real-time data analytics platform** that ingests live stock market ticker data, computes mutual fund portfolio value changes over time (day/week/month), and visualizes insights through an interactive dashboard.

---

## Objective

Build an end-to-end, cloud-based analytics system that:

* Ingests **real-time stock ticker data**.
* Computes **mutual fund value changes** for a portfolio of 8–10 stocks.
* Analyzes performance across multiple time windows (daily/weekly/monthly).
* Visualizes insights using an interactive dashboard.
* Supports **predictive analytics** using historical trends.

---

## Learning Outcomes

By completing this project, you will gain hands-on experience in:

* Real-time data ingestion and streaming architectures.
* Serverless computing and managed data pipelines.
* ETL design: windowing, aggregation, and enrichment.
* Building optimized analytical tables in BigQuery (partitioning/clustering).
* Designing interactive dashboards and drill-down UX.
* Applying simple predictive models for time-series forecasting.

---

## Recommended Tech Stack (GCP example)

| Component                   | Purpose                                         |
| --------------------------- | ----------------------------------------------- |
| Pub/Sub                     | Real-time ingestion of stock ticker streams     |
| Dataflow (Apache Beam)      | Streaming ETL: cleaning, windowing, aggregation |
| BigQuery                    | Processed data storage and analytics            |
| Looker Studio (Data Studio) | Dashboarding and interactive visualizations     |
| Cloud Functions             | Event-driven tasks and lightweight transforms   |
| Cloud Storage               | Staging raw messages or snapshots               |

---

## Architecture (High-level)

<img width="519" height="452" alt="image" src="https://github.com/user-attachments/assets/7d7594ed-f80d-4b87-ac74-af94f0aea3a6" />



---

## Data Schema (suggested)

**Pub/Sub message (JSON):**

```json
{
  "symbol": "RELIANCE",
  "price": 2543.25,
  "timestamp": "2025-11-24T12:34:56.789Z",
  "volume": 1200
}
```

**Processed BigQuery table (example)**

| Column              |      Type | Description                        |
| ------------------- | --------: | ---------------------------------- |
| event_ts            | TIMESTAMP | Original event timestamp           |
| ingested_at         | TIMESTAMP | Ingestion time                     |
| symbol              |    STRING | Stock symbol                       |
| avg_price_1m        |     FLOAT | 1-minute average price             |
| avg_price_5m        |     FLOAT | 5-minute average price             |
| price_change_pct_1d |     FLOAT | 1-day price change %               |
| volume_1m           |     INT64 | 1-minute total volume              |
| sector              |    STRING | Sector (enrichment)                |
| fund_value          |     FLOAT | Current mutual fund computed value |

---

## Data Processing & ETL Details

1. **Ingestion**

   * Publish stock tick JSON to a Pub/Sub topic.
   * Ensure each message contains `symbol`, `price`, `timestamp`, and `volume`.

2. **Enrichment (optional)**

   * Map `symbol` → sector, market-cap tier, or index membership.
   * Attach benchmark index values if available.

3. **Streaming ETL (Dataflow / Apache Beam)**

   * Deserialize messages and validate schema.
   * Assign event time and handle late data (allowed lateness).
   * Windowing (tumbling or sliding windows) for 1m / 5m / 1h aggregations.
   * Compute aggregates: avg price, high, low, total volume, price-change %.
   * Compute `fund_value` using portfolio weights: `Σ(price_i * weight_i)`.
   * Write denormalized rows to BigQuery streaming insert or to Cloud Storage for batch load.

4. **BigQuery Table Design**

   * Use **partitioning** on `DATE(event_ts)`.
   * **Cluster** on `symbol` (and optionally `sector`) for faster scans.
   * Use denormalized tables for fast dashboarding queries.

---

## Dashboard & Visualization Requirements

**Key Metrics**

* Current mutual fund value.
* Daily / weekly / monthly % change.
* Comparison against benchmark indices (e.g., NIFTY50 / S&P 500).
* Alerts or highlights for unusual price/volume spikes.

**Interactive Charts**

* Line charts for historical price & mutual fund value.
* Candlestick charts for detailed stock price movements (OHLC).
* Bar charts for volume trends.
* Pie or stacked bar for portfolio allocation.

**User Interactions**

* Filters: date-range, stock symbol, sector.
* Drill-down from fund → individual stock → tick-level view.
* Time-window selector: 1d / 1w / 1m.

---

## Predictive Analytics (Optional)

* Use historical BigQuery data to train simple forecasting models:

  * Moving averages, ARIMA, or Prophet for baseline forecasting.
  * BigQuery ML for linear regression or time-series models.
* Forecast fund value for short-term horizons (next day / next week).
* Surface confidence intervals and basic risk indicators.

---



## Quickstart (local test & deploy)

1. **Create a Pub/Sub topic**

```bash
# replace <project-id>
gcloud pubsub topics create stock-ticker-stream --project=<project-id>
```

2. **Run local publisher (test data)**

```bash
python3 pubsub/publisher.py --project <project-id> --topic stock-ticker-stream
```

3. **Run Dataflow pipeline (local runner for testing)**

```bash
python3 dataflow/pipeline.py --runner DirectRunner --project <project-id>

# For production, use DataflowRunner with temp_location & region
```

4. **Deploy pipeline on Dataflow (example)**

```bash
python3 dataflow/pipeline.py \
  --runner DataflowRunner \
  --project <project-id> \
  --region <region> \
  --temp_location gs://<bucket>/temp \
  --staging_location gs://<bucket>/staging
```

5. **Connect BigQuery to Looker Studio**

   * Add BigQuery as a data source in Looker Studio and build the dashboard using the processed tables.

---


