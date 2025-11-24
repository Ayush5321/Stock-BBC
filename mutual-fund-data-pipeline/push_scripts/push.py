
from google.cloud import bigquery

def push_to_big_query(
        data, 
        schema, 
        project_id = "stock-market-462609", 
        dataset_id = "stock_data", 
        table_name = "asset_subcategory",  
        conf=".env"
        ):
    """Push the data to the BigQuery Table."""
    table_id = f"{project_id}.{dataset_id}.{table_name}"
    client = bigquery.Client.from_service_account_json(".env")

    ## Sample  Schema
    # schema = [
    # bigquery.SchemaField("asset_category", "STRING", mode="NULLABLE"),
    # bigquery.SchemaField("asset_sub_category", "STRING", mode="NULLABLE"),
    # ]

    
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
    
    errors = client.insert_rows_json(table_id, data)
    if errors:
        print("[ERROR]: ❌ Error inserting data: ", errors)
    else:
        print("[INFO]: ✅ Data inserted successfully.")

    

    



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















