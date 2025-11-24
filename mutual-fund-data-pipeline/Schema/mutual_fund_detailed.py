from google.cloud import bigquery
client = bigquery.Client.from_service_account_json("/project/workspace/Schema/big_query.json")
project_id = "stock-market-462609"
dataset_id = "stock_data"


table_name = "Mutual_Fund_Detailed"
table_id = f"{project_id}.{dataset_id}.{table_name}"


def check_dataset_exists(client, dataset_id):
    try:
        client.get_dataset(dataset_id)
        print(f"Dataset '{dataset_id}' already exists.")
        return True
    except Exception as e:
        return False

def check_table_exists(client, table_id):
    try:
        client.get_table(table_id)
        print(f"Table '{table_id}' already exists.")
        return True
    except Exception as e:
        return False


schema = [
    bigquery.SchemaField("scheme_code", "STRING", mode="REQUIRED"),
    bigquery.SchemaField("amc_code", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("amc_name", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("scheme_name", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("scheme_name_unique", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("date_of_inception", "STRING", mode="NULLABLE"),  # Keeping as STRING to store formatted dates
    bigquery.SchemaField("asset_category", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("asset_sub_category", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("option_name", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("plan_name", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("risk_profile", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("risk_rating", "FLOAT", mode="NULLABLE"),
    bigquery.SchemaField("benchmark", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("nav", "FLOAT", mode="NULLABLE"),
    bigquery.SchemaField("nav_date", "TIMESTAMP", mode="NULLABLE"),
    bigquery.SchemaField("fund_size", "FLOAT", mode="NULLABLE"),
    bigquery.SchemaField("fund_manager", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("isin_dividend_payout_or_growth", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("isin_dividend_reinvest", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("bse_txn", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("bse_code_payout_or_growth", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("bse_code_reinvest", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("expense_ratio_s_d", "FLOAT", mode="NULLABLE"),
    bigquery.SchemaField("objective", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("scheme_doc_url", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("riskometer", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("vr_rating", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("final_benchmark", "STRING", mode="NULLABLE"),

    # Nested JSON for 'exit_load'
    bigquery.SchemaField(
        "exit_load", "RECORD", mode="NULLABLE", fields=[
            bigquery.SchemaField("exit_load_period", "FLOAT", mode="NULLABLE"),
            bigquery.SchemaField("exit_load_rate", "FLOAT", mode="NULLABLE"),
            bigquery.SchemaField("exit_load_period_remark", "STRING", mode="NULLABLE")
        ]
    ),

    # Nested JSON for 'txn_info'
    bigquery.SchemaField(
        "txn_info", "RECORD", mode="NULLABLE", fields=[
            bigquery.SchemaField("min_invest", "FLOAT", mode="NULLABLE"),
            bigquery.SchemaField("min_invest_sip", "FLOAT", mode="NULLABLE"),
            bigquery.SchemaField("min_invest_x", "FLOAT", mode="NULLABLE"),
            bigquery.SchemaField("min_invest_sip_x", "FLOAT", mode="NULLABLE")
        ]
    )
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



