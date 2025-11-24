from google.cloud import bigquery
client = bigquery.Client.from_service_account_json("/project/workspace/Schema/big_query.json")
project_id = "stock-market-462609"
dataset_id = "stock_data"


table_name = "Mutual_Fund_Analytics"
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
    bigquery.SchemaField(
        "market_cap", "RECORD", mode="NULLABLE", fields=[
            bigquery.SchemaField("market_cap_large", "FLOAT", mode="NULLABLE"),
            bigquery.SchemaField("market_cap_mid", "FLOAT", mode="NULLABLE"),
            bigquery.SchemaField("market_cap_others", "FLOAT", mode="NULLABLE"),
            bigquery.SchemaField("market_cap_small", "FLOAT", mode="NULLABLE"),
        ]
    ),

    bigquery.SchemaField("yield_to_maturity", "FLOAT", mode="NULLABLE"),
    bigquery.SchemaField(
        "average_maturity", "RECORD", mode="NULLABLE", fields=[
            bigquery.SchemaField("avg_maturity_days", "FLOAT", mode="NULLABLE"),
            bigquery.SchemaField("avg_maturity_months", "FLOAT", mode="NULLABLE"),
            bigquery.SchemaField("avg_maturity_years", "FLOAT", mode="NULLABLE"),
        ]
    ),

    bigquery.SchemaField(
        "modified_duration", "RECORD", mode="NULLABLE", fields=[
            bigquery.SchemaField("modified_maturity_days", "FLOAT", mode="NULLABLE"),
            bigquery.SchemaField("modified_maturity_months", "FLOAT", mode="NULLABLE"),
            bigquery.SchemaField("modified_maturity_years", "FLOAT", mode="NULLABLE"),
        ]
    ),
    bigquery.SchemaField("pe_ratio", "FLOAT", mode="NULLABLE"),
    bigquery.SchemaField("portfolio_turnover_ratio", "FLOAT", mode="NULLABLE")
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



