import pandas as pd
import sqlite3
import os
import datetime


def updateTokensTableJson(data):

    conn = sqlite3.connect("appDatabase.db")
    cursor = conn.cursor()

    for row in data:
        cursor.execute("INSERT INTO tokens (token_address, name, symbol, description, image_url, metadata_uri, twitter, telegram, bonding_curve, associated_bonding_curve, creator, created_timestamp, last_trade_timestamp, raydium_pool, virtual_sol_reserves, virtual_token_reserves, total_supply, website, usd_market_cap) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                    (row['mint'],row['name'],row['symbol'],row['description'],row['image_uri'],row['metadata_uri'],row['twitter'],row['telegram'],row['bonding_curve'],row['associated_bonding_curve'],row['creator'],row['created_timestamp'],row['last_trade_timestamp'],row['raydium_pool'],row['virtual_sol_reserves'],row['virtual_token_reserves'],row['total_supply'],row['website'],row['usd_market_cap']))

    conn.commit()
    conn.close()

def updateTransactionsTableJson(data):
    conn = sqlite3.connect("appDatabase.db")
    cursor = conn.cursor()

    for d in data:
        # blockTime=datetime.datetime.fromtimestamp(d['timestamp'])
        tradeType=""
        if d['is_buy']:
            tradeType='buy'
            sol = -(d['sol_amount']/10**9)
            tokenAmount=(d['token_amount']/10**6)
        else:
            tradeType='sell'
            sol = (d['sol_amount']/10**9)
            tokenAmount=-(d['token_amount']/10**6)
        cursor.execute("INSERT INTO transactions (blockTime, owner, tradeType, sol, tokenAmount, mint, hash) VALUES (?,?,?,?,?,?,?)",
                       (d['timestamp'], d['user'], tradeType , sol, tokenAmount, d['mint'], d['signature']))

    conn.commit()
    conn.close()