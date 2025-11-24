
from google.cloud import bigquery
client = bigquery.Client.from_service_account_json(".env")
project_id = "stock-market-462609"
dataset_id = "stock_data"


table_name = "asset_subcategory"
table_id = f"{project_id}.{dataset_id}.{table_name}"


def check_dataset_exists(client, dataset_id):
    try:
        client.get_dataset(dataset_id)
        print(f"Dataset '{dataset_id}' already exists.")
        return True
    except Exception as e:
        print(f"[ERROR]: {str(e)}")
        return False

def check_table_exists(client, table_id):
    try:
        client.get_table(table_id)
        print(f"Table '{table_id}' already exists.")
        return True
    except Exception as e:
        return False


schema = [
    bigquery.SchemaField("asset_category", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("asset_sub_category", "STRING", mode="NULLABLE"),

]


if not check_dataset_exists(client, dataset_id):
    dataset_ref = client.dataset(dataset_id)
    dataset = bigquery.Dataset(dataset_ref)
    dataset.location = "asia-south1"
    client.create_dataset(dataset, exists_ok=True)
    print(f"Dataset '{dataset_id}' created.")


if not check_table_exists(client, table_id):
    table = bigquery.Table(table_id, schema=schema)
    client.create_table(table, exists_ok=True)
    print(f"Table '{table_id}' created.")



data = [
    {
        "asset_category": "Commodity",
        "asset_sub_category": "ETF"
    },
    {
        "asset_category": "Commodity",
        "asset_sub_category": "ETF Units"
    },
    {
        "asset_category": "Commodity",
        "asset_sub_category": "Fund of Funds - Gold"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "ETF"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "ETF Units"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Equity - FOF"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Flexi - Cap"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Focused"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Index"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Large & Mid Cap"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Large Cap"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Mid Cap"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Multi - Cap"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Sector Specific - Banks & Financial Services"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Sector Specific - Defence"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Sector Specific - FMCG"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Sector Specific - Pharma"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Sector Specific - Technology"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Sector Specific - Transportation"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Small Cap"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Solution Oriented - Retirement"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Tax Savings"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Thematic - Agriculture & Food"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Thematic - Business Cycles"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Thematic - Commodities"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Thematic - Consumption"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Thematic - Contra"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Thematic - Dividend Yield"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Thematic - ESG"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Thematic - Energy"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Thematic - IPO"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Thematic - Infrastructure"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Thematic - Innovation"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Thematic - MNC"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Thematic - Manufacturing"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Thematic - Momentum"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Thematic - PSU"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Thematic - Quant"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Thematic - Service Industries"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Thematic - Shariah"
    },
    {
        "asset_category": "Equity",
        "asset_sub_category": "Value Fund"
    },
    {
        "asset_category": "Fixed Income",
        "asset_sub_category": "10 Y Gilt"
    },
    {
        "asset_category": "Fixed Income",
        "asset_sub_category": "Banking & PSU Fund"
    },
    {
        "asset_category": "Fixed Income",
        "asset_sub_category": "Corporate Bond Fund"
    },
    {
        "asset_category": "Fixed Income",
        "asset_sub_category": "Credit Risk Fund"
    },
    {
        "asset_category": "Fixed Income",
        "asset_sub_category": "Dynamic Bond"
    },
    {
        "asset_category": "Fixed Income",
        "asset_sub_category": "ETF"
    },
    {
        "asset_category": "Fixed Income",
        "asset_sub_category": "ETF Units"
    },
    {
        "asset_category": "Fixed Income",
        "asset_sub_category": "Floater Fund"
    },
    {
        "asset_category": "Fixed Income",
        "asset_sub_category": "Gilt Fund"
    },
    {
        "asset_category": "Fixed Income",
        "asset_sub_category": "Global - FOF"
    },
    {
        "asset_category": "Fixed Income",
        "asset_sub_category": "Liquid"
    },
    {
        "asset_category": "Fixed Income",
        "asset_sub_category": "Long Duration Fund"
    },
    {
        "asset_category": "Fixed Income",
        "asset_sub_category": "Low Duration Fund"
    },
    {
        "asset_category": "Fixed Income",
        "asset_sub_category": "Medium Duration Fund"
    },
    {
        "asset_category": "Fixed Income",
        "asset_sub_category": "Medium to Long Duration Fund"
    },
    {
        "asset_category": "Fixed Income",
        "asset_sub_category": "Money Market Fund"
    },
    {
        "asset_category": "Fixed Income",
        "asset_sub_category": "Overnight Fund"
    },
    {
        "asset_category": "Fixed Income",
        "asset_sub_category": "Short Duration Fund"
    },
    {
        "asset_category": "Fixed Income",
        "asset_sub_category": "Solution Oriented - Retirement"
    },
    {
        "asset_category": "Fixed Income",
        "asset_sub_category": "Ultra Short Duration Fund"
    },
    {
        "asset_category": "Global",
        "asset_sub_category": "Country Specific - Brazil"
    },
    {
        "asset_category": "Global",
        "asset_sub_category": "Country Specific - China"
    },
    {
        "asset_category": "Global",
        "asset_sub_category": "Country Specific - Japan"
    },
    {
        "asset_category": "Global",
        "asset_sub_category": "Country Specific - Taiwan"
    },
    {
        "asset_category": "Global",
        "asset_sub_category": "Country Specific - US"
    },
    {
        "asset_category": "Global",
        "asset_sub_category": "Diversified"
    },
    {
        "asset_category": "Global",
        "asset_sub_category": "ETF - FOF"
    },
    {
        "asset_category": "Global",
        "asset_sub_category": "ETF Units"
    },
    {
        "asset_category": "Global",
        "asset_sub_category": "Fund of Fund"
    },
    {
        "asset_category": "Global",
        "asset_sub_category": "Index"
    },
    {
        "asset_category": "Global",
        "asset_sub_category": "Region Specific - ASEAN"
    },
    {
        "asset_category": "Global",
        "asset_sub_category": "Region Specific - ASIA"
    },
    {
        "asset_category": "Global",
        "asset_sub_category": "Region Specific - Emerging Markets"
    },
    {
        "asset_category": "Global",
        "asset_sub_category": "Region Specific - Europe"
    },
    {
        "asset_category": "Global",
        "asset_sub_category": "Thematic - Agriculture & Food"
    },
    {
        "asset_category": "Global",
        "asset_sub_category": "Thematic - Energy"
    },
    {
        "asset_category": "Global",
        "asset_sub_category": "Thematic - Mining & Metals"
    },
    {
        "asset_category": "Global",
        "asset_sub_category": "Thematic - Precious Metals"
    },
    {
        "asset_category": "Hybrid",
        "asset_sub_category": "Aggressive Hybrid Fund"
    },
    {
        "asset_category": "Hybrid",
        "asset_sub_category": "Arbitrage"
    },
    {
        "asset_category": "Hybrid",
        "asset_sub_category": "Balanced Hybrid Fund"
    },
    {
        "asset_category": "Hybrid",
        "asset_sub_category": "Conservative Hybrid Fund"
    },
    {
        "asset_category": "Hybrid",
        "asset_sub_category": "Dynamic Asset Allocation"
    },
    {
        "asset_category": "Hybrid",
        "asset_sub_category": "Equity Savings Fund"
    },
    {
        "asset_category": "Hybrid",
        "asset_sub_category": "Multi Asset Allocation"
    },
    {
        "asset_category": "Hybrid",
        "asset_sub_category": "Solution Oriented - Children's Fund"
    },
    {
        "asset_category": "Hybrid",
        "asset_sub_category": "Solution Oriented - Retirement"
    }
]

# data = [
#     {
#         "scheme_name": "Angel One Nifty 50 Index Fund-Direct-Growth",
#         "nav": 10.2142,
#         "vr_rating": "",
#         "amc_code": "AMC50",
#         "scheme_code": "153529",
#         "bse_code_payout_or_growth": "AONFIDG-GR",
#         "nav_date": "2025-06-10T00:00:00.000Z",
#         "scheme_name_unique": "Angel One Nifty 50 Index Fund",
#         "option_name": "Growth",
#         "plan_name": "Direct",
#         "bse_code_reinvest": "",
#         "asset_category": "Equity",
#         "asset_sub_category": "Index"
#     }
# ]

errors = client.insert_rows_json(table_id, data)
if errors:
    print("❌ Error inserting data:", errors)
else:
    print("✅ Data inserted successfully.")
