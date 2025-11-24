from google.cloud import bigquery
from typing import List, Dict
from google.oauth2 import service_account

import dotenv
import os

dotenv.load_dotenv()


key_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
credentials = service_account.Credentials.from_service_account_file(key_path)
client = bigquery.Client(credentials=credentials)


def run_bigquery(query: str):
    try:
        print("[INFO]: Running the query...")
        query_job = client.query(query)
        results = query_job.result()
        print(
            "[INFO]: Query executed successfully. results",
        )
        return [dict(row) for row in results], None
    except Exception as e:
        print(f"[ERROR]: BigQuery error: {e}")
        return [], e
