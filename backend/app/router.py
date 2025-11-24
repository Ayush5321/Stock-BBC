from fastapi import APIRouter, Depends, Query, Path
from fastapi.responses import JSONResponse, Response
from typing import List, Optional
from datetime import datetime
from dateutil.relativedelta import relativedelta

from app.helpers import verify_firebase_token, get_uid
from app.bigquery import run_bigquery
import json

router = APIRouter()


@router.get("/mutual-fund/filter")
def filter_mutual_funds(
    amc_code: str = Query(default=None),
    asset_category: str = Query(default=None),
    asset_sub_category: str = Query(default=None),
):
    """
    Returns:
    - If no `amc_code`: just return all unique AMC names and their codes.
    - If `amc_code` is provided: return matching mutual funds and AMC codes.
    """

    project_id = "stock-market-462609"
    dataset_id = "stock_data"
    table = f"{project_id}.{dataset_id}.Mutual_Fund_Detailed"

    if not amc_code:
        query = f"""
        SELECT DISTINCT amc_name, amc_code
        FROM `{table}`
        WHERE amc_name IS NOT NULL AND amc_code IS NOT NULL
        """

        results, error = run_bigquery(query)
        if error:
            return JSONResponse({"error": error}, status_code=500)

        amc_codes = {
            row["amc_name"]: row["amc_code"]
            for row in results
            if row["amc_name"] and row["amc_code"]
        }

        return JSONResponse(content={"amc_codes": amc_codes}, status_code=200)

    filters = [f"amc_code = '{amc_code}'"]
    if asset_category:
        filters.append(f"asset_category = '{asset_category}'")
    if asset_sub_category:
        filters.append(f"asset_sub_category = '{asset_sub_category}'")

    where_clause = "WHERE " + " AND ".join(filters)

    if amc_code == "all":
        where_clause = ""

    query = f"""
    SELECT
        scheme_code,
        amc_code,
        amc_name,
        scheme_name_unique,
        date_of_inception,
        asset_category,
        asset_sub_category,
        risk_rating,
        nav,
        nav_date,
        fund_size,
        expense_ratio_s_d,
        vr_rating
    FROM `{table}`
    {where_clause}
    LIMIT 1000
    """

    results, error = run_bigquery(query)
    if error:
        return JSONResponse({"error": error}, status_code=500)

    mutual_funds = []
    amc_codes = {}

    for row in results:
        if row["amc_name"] and row["amc_code"]:
            amc_codes[row["amc_name"]] = row["amc_code"]

        nav_date = row["nav_date"]
        if isinstance(nav_date, datetime):
            nav_date = nav_date.strftime("%d-%m-%Y")
        elif isinstance(nav_date, str):
            try:
                nav_date = datetime.fromisoformat(nav_date).strftime("%d-%m-%Y")
            except Exception:
                nav_date = None

        if row["vr_rating"] and len(row["vr_rating"].strip()) > 5:
            continue  # Skip poorly rated funds

        mutual_funds.append(
            {
                "scheme_name": row["scheme_name_unique"],
                "scheme_code": row["scheme_code"],
                "amc_name": row["amc_name"],
                "amc_code": row["amc_code"],
                "asset_category": row["asset_category"],
                "asset_sub_category": row["asset_sub_category"],
                "risk_rating": row["risk_rating"],
                "fund_size": row["fund_size"],
                "nav": row["nav"],
                "nav_date": nav_date,
                "expense_ratio_s_d": row["expense_ratio_s_d"],
                "vr_rating": row["vr_rating"],
            }
        )

    return JSONResponse(
        content={"mutual_funds": mutual_funds, "amc_codes": amc_codes}, status_code=200
    )


@router.get("/test")
def something(user_details=Depends(verify_firebase_token)):
    return Response(content="Hi", status_code=200)


@router.get("/mutual-fund/nav-data")
def get_nav_data(
    scheme_code: str, time_range: str = Query(default=None)
):  # , user_details=Depends(verify_firebase_token))
    scheme_code = str(scheme_code)
    project_id = "stock-market-462609"
    dataset_id = "stock_data"
    table_name = "nav_history"
    table_id = f"{project_id}.{dataset_id}.{table_name}"

    today = datetime.utcnow().date()
    date_filter = "TRUE"
    if time_range is None:
        date_filter = "TRUE"
    elif time_range.lower() == "ytd":
        start_date = datetime(today.year, 1, 1).date()
        date_filter = f"CAST(date AS DATE) >= DATE('{start_date}')"
    elif time_range.lower() == "1y":
        start_date = today - relativedelta(years=1)
        date_filter = f"CAST(date AS DATE) >= DATE('{start_date}')"
    elif time_range.lower() == "5y":
        start_date = today - relativedelta(years=5)
        date_filter = f"CAST(date AS DATE) >= DATE('{start_date}')"
    elif time_range.lower() == "3m":
        start_date = today - relativedelta(months=3)
        date_filter = f"CAST(date AS DATE) >= DATE('{start_date}')"
    elif time_range.lower() == "6m":
        start_date = today - relativedelta(months=6)
        date_filter = f"CAST(date AS DATE) >= DATE('{start_date}')"

    query = f"""
        SELECT date, nav_value
        FROM `{table_id}`
        WHERE scheme_code = '{scheme_code}'
        AND {date_filter}
        ORDER BY date DESC
    """

    data, error = run_bigquery(query=query)

    if not error:
        return JSONResponse(content=data, status_code=200)
    return JSONResponse(content={"error": str(error)}, status_code=400)


@router.get("/mutual-fund/recommendations")
def get_mutual_fund_recommendations():
    """Endpoint to get mutual fund recommendations."""
    project_id = "stock-market-462609"
    dataset_id = "stock_data"
    nav_table = f"{project_id}.{dataset_id}.nav_history"
    detail_table = f"{project_id}.{dataset_id}.Mutual_Fund_Detailed"
    scheme_risk_tbl = f"{project_id}.{dataset_id}.Scheme_Level_Risks"

    query = """
    WITH
    latest_nav AS (
        SELECT
        scheme_code,
        nav_value AS nav_latest
        FROM `stock-market-462609.stock_data.nav_history`
        QUALIFY ROW_NUMBER() OVER (
        PARTITION BY scheme_code
        ORDER BY CAST(date AS DATE) DESC
        ) = 1
    ),

    nav_90d AS (
        SELECT
        scheme_code,
        nav_value AS nav_90d
        FROM `stock-market-462609.stock_data.nav_history`
        WHERE CAST(date AS DATE) <= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
        QUALIFY ROW_NUMBER() OVER (
        PARTITION BY scheme_code
        ORDER BY CAST(date AS DATE) DESC
        ) = 1
    ),

    nav_prev AS (
        SELECT
        scheme_code,
        nav_value AS nav_prev
        FROM (
        SELECT
            scheme_code,
            nav_value,
            ROW_NUMBER() OVER (
            PARTITION BY scheme_code
            ORDER BY CAST(date AS DATE) DESC
            ) AS rn
        FROM `stock-market-462609.stock_data.nav_history`
        )
        WHERE rn = 2
    ),

    gains AS (
        SELECT
        l.scheme_code,
        (l.nav_latest - p.nav_prev) / NULLIF(p.nav_prev, 0) * 100  AS gain_1d,
        (l.nav_latest - q.nav_90d ) / NULLIF(q.nav_90d, 0) * 100  AS gain_1q    
        FROM latest_nav l
        JOIN nav_prev  p USING (scheme_code)
        JOIN nav_90d   q USING (scheme_code)
    ),

    cleaned_data AS (
        SELECT
        d.scheme_name,
        d.scheme_code,
        ROUND(g.gain_1d, 2) AS gain_1d,
        ROUND(g.gain_1q, 2) AS gain_1q,
        d.vr_rating,
        LENGTH(REPLACE(TRIM(d.vr_rating), " ", "")) AS vr_stars,
        d.risk_rating,
        d.expense_ratio_s_d,
        d.fund_size,
        d.date_of_inception,
        r.sharpe_ratio
        FROM gains g
        JOIN `stock-market-462609.stock_data.Mutual_Fund_Detailed` d
        ON g.scheme_code = d.scheme_code
        JOIN `stock-market-462609.stock_data.Scheme_Level_Risks` r
        ON SAFE_CAST(d.scheme_code AS INT64) = r.scheme_code
        WHERE
        SAFE.PARSE_DATE('%d-%b-%y', d.date_of_inception) < DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR)
        AND LENGTH(REPLACE(TRIM(d.vr_rating), " ", "")) >= 3
        AND d.vr_rating != "Not Rated"
        AND g.gain_1d > 0
        AND g.gain_1q > 0
        AND r.sharpe_ratio>=0.1
    )

    SELECT *
    FROM cleaned_data
    ORDER BY gain_1q DESC
    LIMIT 6
        """

    data, error = run_bigquery(query=query)
    if error:
        return JSONResponse(content={"error": str(error)}, status_code=400)
    return JSONResponse(content=data, status_code=200)


@router.get("/mutual-fund/")
def get_full_mutual_fund_details(scheme_code: str):
    if not scheme_code or not scheme_code.strip().isdigit():
        return JSONResponse(
            content={"error": "A valid numeric `scheme_code` is required."},
            status_code=400,
        )

    scheme_code_safe = str(int(scheme_code.strip()))

    query = f"""
    -- Main mutual fund details (latest by nav_date)
    WITH MainDetails AS (
      SELECT
        scheme_code,
        scheme_name_unique,
        asset_category,
        asset_sub_category,
        riskometer,
        fund_size,
        date_of_inception,
        fund_manager,
        final_benchmark,
        expense_ratio_sd,
        exit_load_rate,
        exit_load_period
      FROM `stock-market-462609.trail_transformations.mutual_fund_data`
      WHERE scheme_code = '{scheme_code_safe}'
      ORDER BY nav_date DESC
      LIMIT 1
    ),

    -- Latest and previous NAV for change calculation
    NavChange AS (
      SELECT
        nav_value,
        date,
        nav_value - LAG(nav_value) OVER (ORDER BY date) AS nav_change,
        SAFE_DIVIDE(nav_value - LAG(nav_value) OVER (ORDER BY date), LAG(nav_value) OVER (ORDER BY date)) * 100 AS nav_change_percent
      FROM `stock-market-462609.stock_data.nav_history`
      WHERE scheme_code = '{scheme_code_safe}'
    ),

    LatestNav AS (
      SELECT *
      FROM NavChange
      WHERE nav_value IS NOT NULL
      ORDER BY date DESC
      LIMIT 1
    ),

    -- AMC name and code
    AMCData AS (
      SELECT amc_name, amc_code
      FROM `stock-market-462609.trail_transformations.fund_details`
      WHERE scheme_code = '{scheme_code_safe}'
      LIMIT 1
    )

    SELECT 
      md.scheme_code,
      md.scheme_name_unique,
      md.asset_category,
      md.asset_sub_category,
      md.riskometer,
      ln.nav_value,
      ln.date,
      ln.nav_change,
      ln.nav_change_percent,
      md.fund_size,
      md.date_of_inception,
      md.fund_manager,
      md.final_benchmark,
      md.expense_ratio_sd,
      md.exit_load_rate,
      md.exit_load_period,
      ad.amc_code,
      ad.amc_name
    FROM MainDetails md
    JOIN LatestNav ln ON TRUE
    JOIN AMCData ad ON TRUE
    """

    data, error = run_bigquery(query=query)

    if error:
        return JSONResponse(content={"error": str(error)}, status_code=500)

    if not data:
        return JSONResponse(
            content={"error": f"No data found for scheme_code {scheme_code_safe}"},
            status_code=404,
        )

    row = data[0]

    # Format the response JSON
    fund_data = {
        "schemeCode": row["scheme_code"],
        "schemeName": row["scheme_name_unique"],
        "amcName": row["amc_name"],
        "assetCategory": row["asset_category"],
        "assetSubCategory": row["asset_sub_category"],
        "riskometer": row["riskometer"],
        "nav": row["nav_value"],
        "navChange": round(row["nav_change"], 2),
        "navChangePercent": round(row["nav_change_percent"], 2),
        "navDate": row["date"],
        "fundSize": row["fund_size"],
        "inceptionDate": row["date_of_inception"],
        "fundManager": row["fund_manager"],
        "benchmark": row["final_benchmark"],
        "expenseRatio": row["expense_ratio_sd"],
        "exitLoad": (
            f"{row['exit_load_rate']}% for redemption within {row['exit_load_period']} year"
            if row["exit_load_rate"] is not None and row["exit_load_period"] is not None
            else None
        ),
    }

    return JSONResponse(content=fund_data)


@router.get("/mutual-fund/quarter-nav")
def get_mutual_fund_quarter_nav(scheme_code: List[str] = Query(default=[])):
    """Endpoint to get the NAV of mutual funds for the last 1 quarter."""
    print(f"[DEBUG]: Received scheme_code: {scheme_code}, type: {type(scheme_code)}, len: {len(scheme_code)}")
    if not scheme_code or len(scheme_code) == 0:
        return JSONResponse({"error": "`scheme_code` is required"}, status_code=400)

    project_id = "stock-market-462609"
    dataset_id = "stock_data"
    table_name = "nav_history"
    table_id = f"{project_id}.{dataset_id}.{table_name}"

    # Convert list to comma-separated quoted values
    scheme_code_str = ", ".join([f"'{code}'" for code in scheme_code])
    print("[INFO]: Scheme Codes:", scheme_code_str)

    query = f"""
        SELECT scheme_code, nav_value, date
        FROM `{table_id}`
        WHERE scheme_code IN ({scheme_code_str})
          AND DATE(date) >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 MONTH)
        ORDER BY date ASC
    """

    data, error = run_bigquery(query=query)
    if error:
        return JSONResponse({"error": str(error)}, status_code=500)

    # Group NAV values by scheme_code
    response_data = {}

    for row in data:
        code = row["scheme_code"]
        if code not in response_data:
            response_data[code] = []
        response_data[code].append({"date": row["date"], "nav_value": row["nav_value"]})

    return JSONResponse(response_data, status_code=200)


@router.get("/mutual-fund/risk")
def get_mutual_fund_risk(scheme_code: str = Query(default=None)):
    """Get the mutual funds data about risk and other ratios"""

    if not scheme_code:
        return JSONResponse({"error": "Scheme Code is required"}, status_code=400)

    scheme_code = str(int(scheme_code.strip()))
    project_id = "stock-market-462609"
    dataset_id = "trail_transformations"
    table_id = f"{project_id}.{dataset_id}.funds_returns_table"
    mf_data_id = f"{project_id}.{dataset_id}.mutual_fund_data"
    asset_category_avgs = f"{project_id}.stock_data.Category_Level_Risks"

    query = f"""
    WITH FundRisk AS (
        SELECT 
            fund_return_1yr_pct, 
            fund_return_3yr_pct, 
            fund_return_5yr_pct, 
            sharpe_ratio,
            beta, 
            jensens_alpha, 
            annual_sd
        FROM `{table_id}`
        WHERE scheme_code = '{scheme_code}'
        LIMIT 1
    ),
    FundAssetCategory AS (
        SELECT 
            asset_category, 
            asset_sub_category 
        FROM `{mf_data_id}`
        WHERE scheme_code = '{scheme_code}'
        LIMIT 1
    ),
    CategoryAvgs AS (
        SELECT 
            avg_annual_sd, 
            avg_beta, 
            avg_sharpe_ratio, 
            avg_jensens_alpha,
            avg_sortino_ratio
        FROM `{asset_category_avgs}`
        WHERE asset_sub_category = (
            SELECT asset_sub_category FROM FundAssetCategory
        )
        LIMIT 1
    )
    SELECT 
        FR.*, 
        CA.*
    FROM FundRisk FR
    CROSS JOIN CategoryAvgs CA
    """

    data, error = run_bigquery(query)
    if error:
        return JSONResponse({"error": str(error)}, 500)

    if not data:
        return JSONResponse(data, status_code=404)

    risk_ratios = [
        {
            "metric": "Sharpe Ratio",
            "fund": data[0]["sharpe_ratio"],
            "categoryAvg": data[0]["avg_sharpe_ratio"],
        },
        {"metric": "Beta", "fund": data[0]["beta"], "categoryAvg": data[0]["avg_beta"]},
        {
            "metric": "Jensens Alpha",
            "fund": data[0]["jensens_alpha"],
            "categoryAvg": data[0]["avg_jensens_alpha"],
        },
        {
            "metric": "Std. Deviation",
            "fund": data[0]["annual_sd"],
            "categoryAvg": data[0]["avg_annual_sd"],
        },
    ]

    trailing_returns = [
        {
            "period": "1Y",
            "fund": data[0]["fund_return_1yr_pct"],
            "category": None,
            "benchmark": None,
        },
        {
            "period": "3Y",
            "fund": data[0]["fund_return_3yr_pct"],
            "category": None,
            "benchmark": None,
        },
        {
            "period": "5Y",
            "fund": data[0]["fund_return_5yr_pct"],
            "category": None,
            "benchmark": None,
        },
    ]

    return JSONResponse(
        {"trailing_returns": trailing_returns, "risk_ratios": risk_ratios},
        status_code=200,
    )
