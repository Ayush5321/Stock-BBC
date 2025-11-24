import asyncio
import aiohttp
from google.cloud import bigquery

asset_category_url = "https://sandbox.dpiwealth.com/v1/api/mf_data/asset_categories"
base_asset_sub_category_url = "https://sandbox.dpiwealth.com/v1/api/mf_data/asset_sub_categories?category="
fund_list_url = "https://sandbox.dpiwealth.com/v1/api/mf_data/funds_list"
mf_detailed_url = "https://sandbox.dpiwealth.com/v1/api/mf_data/mf_detailed?scheme_code="
client = bigquery.Client.from_service_account_json("/project/workspace/Schema/big_query.json")

plan_names = ["Direct", "Regular"]
option_names = ["Growth", "Dividend"]
project_id = "stock-market-462609"
dataset_id = "stock_data"
default_size = 1000
    
async def get_asset_category():
    async with aiohttp.ClientSession() as session:
        async with session.get(asset_category_url, headers={"accept": "application/json"}) as response:
            data = await response.json()

    if data["response"]["code"] == 400:
        raise ValueError("Bad request: Unable to get Asset Category data")
    
    return data["response"]["data"]

async def get_asset_subcategories(session, asset):
    url = base_asset_sub_category_url + asset
    headers = {"accept": "application/json"}

    async with session.get(url, headers=headers) as response:
        data = await response.json()

    if data["response"]["code"] == 400:
        raise ValueError("Bad request: Unable to get Asset Subcategory data")
    
    return data["response"]["data"]

async def get_fund_list(session, asset, asset_subcategory, plan_name, option_name):
    payload = {
        "asset_category": asset,
        "asset_sub_category": asset_subcategory,
        "plan_name": plan_name,
        "option_name": option_name,
        "size": default_size
    }

    headers = {
        "accept": "application/json",
        "content-type": "application/json"
    }

    async with session.post(url=fund_list_url, json=payload, headers=headers) as response:
        fund_list = await response.json()

    if fund_list["response"]["message"] == "ZERO_RECORDS":
        return []
    
    return fund_list["response"]["data"]


def get_scheme_codes(all_funds):
    scheme_code = []
    for fund in all_funds:
        scheme_code.append(fund["scheme_code"])
    
    return scheme_code

async def get_mutual_funds_details(session,url, scheme_code):
    method = "GET"
    headers = {"accept": "application/json"}
    async with session.get(url, headers = headers) as response:
        mf = await response.json()
        return mf["response"]["data"][scheme_code]

async def fetch_all_funds():
    async with aiohttp.ClientSession() as session:
        asset_category = await get_asset_category()

        tasks = []
        metadata = []
        all_funds = []

        for asset in asset_category:
            asset_sub_categories = await get_asset_subcategories(session, asset)
            for asset_sub_category in asset_sub_categories:
                for plan in plan_names:
                    for option in option_names:
                        tasks.append(get_fund_list(session, asset, asset_sub_category, plan, option))
                        metadata.append((asset, asset_sub_category))

        results = await asyncio.gather(*tasks)

        for idx, mutual_funds in enumerate(results):
            if not mutual_funds:
                continue
            asset, asset_sub_category = metadata[idx]
            for mutual_fund in mutual_funds:
                mutual_fund["asset_category"] = asset
                mutual_fund["asset_sub_category"] = asset_sub_category
                all_funds.append(mutual_fund)
        
        return all_funds



async def fetch_all_mutual_funds_detailed(scheme_codes):
    async with aiohttp.ClientSession() as session:
        results = []
        for scheme in scheme_codes:
            url = f"{mf_detailed_url}{scheme}"
            results.append(get_mutual_funds_details(session, url, scheme))
        
        return await asyncio.gather(*results)

def insert_into_database(fund_data, table_name):
    table_id = f"{project_id}.{dataset_id}.{table_name}"
    errors = client.insert_rows_json(table_id, fund_data)  
    if errors:
        print("Errors while inserting:", errors)
    else:
        print("Data inserted successfully!")
    

all_funds = asyncio.run(fetch_all_funds())
scheme_codes = get_scheme_codes(all_funds)
mutual_funds_data =  asyncio.run(fetch_all_mutual_funds_detailed(scheme_codes))


for mutual_fund in mutual_funds_data:
    mutual_fund["expense_ratio_s_d"] = mutual_fund.pop("expense_ratio(s)_&_(d)")


table_name = "Mutual_Fund_Detailed"
insert_into_database(mutual_funds_data, table_name)
