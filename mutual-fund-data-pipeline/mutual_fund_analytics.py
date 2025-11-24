import asyncio
import aiohttp
from google.cloud import bigquery
client = bigquery.Client.from_service_account_json("/project/workspace/Schema/big_query.json")
mutual_funds_analytics_url = "https://sandbox.dpiwealth.com/v1/api/mf_data/analytics?scheme_code="

project_id = "stock-market-462609"
dataset_id = "stock_data"

query = f"SELECT scheme_code FROM {project_id}.{dataset_id}.Mutual_Fund_Detailed"

result = client.query(query).result()
scheme_codes = [row[0] for row in result]

async def get_mutual_funds_analytics(session,url, scheme_code):
    method = "GET"
    headers = {"accept": "application/json"}
    async with session.get(url, headers = headers) as response:
        mf = await response.json()
        mf["response"]["data"][scheme_code]["scheme_code"] = scheme_code
        return mf["response"]["data"][scheme_code]



async def fetch_all_mutual_funds_analytics(scheme_codes):
    async with aiohttp.ClientSession() as session:
        results = []
        for scheme in scheme_codes:
            url = f"{mutual_funds_analytics_url}{scheme}"
            results.append(get_mutual_funds_analytics(session, url, scheme))
        
        return await asyncio.gather(*results)


def insert_into_database(fund_data, table_name):
    table_id = f"{project_id}.{dataset_id}.{table_name}"
    errors = client.insert_rows_json(table_id, fund_data)  
    if errors:
        print("Errors while inserting:", errors)
    else:
        print("Data inserted successfully!")
    

mutual_funds_analytics =  asyncio.run(fetch_all_mutual_funds_analytics(scheme_codes))

for mutual_fund in mutual_funds_analytics:
    mutual_fund.pop("asset_break_up", None)
    mutual_fund.pop("credit_breakup", None)

    

table_name = "Mutual_Fund_Analytics"
insert_into_database(mutual_funds_analytics, table_name)




