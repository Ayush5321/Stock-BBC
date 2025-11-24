from fastapi import Request, HTTPException, status, Depends
from firebase_admin import auth as firebase_auth
from typing import Dict, List
from app.bigquery import run_bigquery
from app.db import users_collection


async def verify_firebase_token(request: Request) -> Dict:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing token"
        )

    id_token = auth_header.split("Bearer ")[1]
    try:
        decoded_token = firebase_auth.verify_id_token(id_token)
        print("[Auth Success] Token verified successfully")
        return decoded_token
    except Exception as e:
        print(f"[Auth Error] Token verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token verification failed"
        )


def get_uid(token_payload: Dict = Depends(verify_firebase_token)) -> str:
    return token_payload["uid"]


async def get_portfolio_nav_history():  # uid: str = Depends(get_uid)):
    """
    Calculates the historical Net Asset Value (NAV) for the entire portfolio,
    assuming all fund records contain 'units'.

    The logic uses a single, efficient BigQuery query that joins the user's
    fund list against the entire NAV history table. It calculates the
    daily portfolio value by summing the value of all 'active' funds for each day.
    """
    uid = "0520MubIFDW59HdFnvBcv5Iv0T03"  # For testing
    project_id = "stock-market-462609"
    dataset_id = "stock_data"
    table_name = "nav_history"
    TABLE_ID = f"{project_id}.{dataset_id}.{table_name}"

    # 1. Get user data from MongoDB
    user = users_collection.find_one({"_id": uid})
    if not user:
        return []
    funds: List[Dict] = user.get("portfolio", {}).get("funds", [])
    if not funds:
        return []

    valid_funds = [
        f for f in funds if f.get("units") is not None and f.get("date") is not None
    ]
    if not valid_funds:
        return []

    # Pass scheme_code, date_added, and units for every valid fund
    struct_clauses_with_units = ",\n    ".join(
        f"STRUCT('{f['schemeCode']}' AS scheme_code, DATE '{f['date']}' AS date_added, {f['units']} AS units)"
        for f in valid_funds
    )

    history_query = f"""
    WITH user_funds_with_units AS (
      SELECT * FROM UNNEST([
        {struct_clauses_with_units}
      ])
    )
    SELECT
      -- The date for the aggregated portfolio value
      CAST(nh.date AS STRING) AS date,
      -- Sum the value (nav * units) for all funds active on this date
      SUM(nh.nav_value * uf.units) AS portfolio_value
    FROM
      `{TABLE_ID}` AS nh
    -- Join with the user's fund data
    JOIN
      user_funds_with_units AS uf ON nh.scheme_code = uf.scheme_code
    WHERE
      -- CRITICAL: Only include NAV data on or after the fund was added to the portfolio
      DATE(nh.date) >= uf.date_added
    GROUP BY
      -- Aggregate the sums for each day
      nh.date
    ORDER BY
      -- Return a clean time series
      nh.date ASC
    """

    print(history_query)

    rows, err = run_bigquery(query=history_query)
    if err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"BigQuery error: {err}",
        )

    # 3. Format the results for the API response
    portfolio_history = [
        {"date": row["date"], "value": round(float(row["portfolio_value"]), 2)}
        for row in rows
    ]

    return portfolio_history
