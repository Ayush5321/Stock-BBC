from google.cloud import bigquery
client = bigquery.Client.from_service_account_json("/project/workspace/Schema/big_query.json")
project_id = "stock-market-462609"
dataset_id = "stock_data"


table_name = "Fund_list"
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
    bigquery.SchemaField("scheme_name", "STRING", mode="REQUIRED"),
    bigquery.SchemaField("nav", "FLOAT", mode="REQUIRED"),
    bigquery.SchemaField("vr_rating", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("amc_code", "STRING", mode="REQUIRED"),
    bigquery.SchemaField("scheme_code", "STRING", mode="REQUIRED"),
    bigquery.SchemaField("bse_code_payout_or_growth", "STRING", mode="REQUIRED"),
    bigquery.SchemaField("nav_date", "TIMESTAMP", mode="REQUIRED"),
    bigquery.SchemaField("scheme_name_unique", "STRING", mode="REQUIRED"),
    bigquery.SchemaField("option_name", "STRING", mode="REQUIRED"),
    bigquery.SchemaField("plan_name", "STRING", mode="REQUIRED"),
    bigquery.SchemaField("bse_code_reinvest", "STRING", mode="NULLABLE"),
    bigquery.SchemaField("asset_category", "STRING", mode="REQUIRED"),
    bigquery.SchemaField("asset_sub_category", "STRING", mode="REQUIRED"),
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


