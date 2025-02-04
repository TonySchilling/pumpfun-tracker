import pandas as pd
import sqlite3
import os
import datetime


#Drop table
def droptTable(databaseName="appDatabase.db.db", tableName='tokens'):
    conn = sqlite3.connect(databaseName)
    cursor = conn.cursor()

    # Drop the old table (be careful, this will delete all data!)
    cursor.execute(f"DROP TABLE IF EXISTS {tableName}")

    conn.commit()
    conn.close()

#Create table right way
def createTokenTable(databaseName="appDatabase.db.db"):
    conn = sqlite3.connect(databaseName)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE tokens (
            token_address TEXT PRIMARY KEY,  -- Set token_address as the primary key
            name TEXT,
            symbol TEXT,
            description TEXT,
            image_url TEXT,
            metadata_uri TEXT,
            twitter TEXT,
            telegram TEXT,
            bonding_curve TEXT,
            associated_bonding_curve TEXT,
            creator TEXT,
            created_timestamp TIMESTAMP,
            last_trade_timestamp TIMESTAMP,
            raydium_pool TEXT,
            virtual_sol_reserves TEXT,
            virtual_token_reserves TEXT,
            total_supply INT,
            website TEXT,
            usd_market_cap REAL
        )
    """)

    conn.commit()
    conn.close()


def updateTokensTable(token_data, databaseName="appDatabase.db.db"):
    conn = sqlite3.connect(databaseName)
    cursor = conn.cursor()

    sql = """
        INSERT INTO tokens (
            token_address, name, symbol, description, image_url, metadata_uri, twitter, telegram, 
            bonding_curve, associated_bonding_curve, creator, created_timestamp, 
            last_trade_timestamp, raydium_pool, virtual_sol_reserves, virtual_token_reserves, 
            total_supply, website, usd_market_cap
        ) 
        VALUES (
            :mint, :name, :symbol, :description, :image_uri, :metadata_uri, :twitter, :telegram, 
            :bonding_curve, :associated_bonding_curve, :creator, :created_timestamp, 
            :last_trade_timestamp, :raydium_pool, :virtual_sol_reserves, :virtual_token_reserves, 
            :total_supply, :website, :usd_market_cap
        ) 
        ON CONFLICT(token_address) DO UPDATE SET 
            name=excluded.name,
            symbol=excluded.symbol,
            description=excluded.description,
            image_url=excluded.image_url,
            metadata_uri=excluded.metadata_uri,
            twitter=excluded.twitter,
            telegram=excluded.telegram,
            bonding_curve=excluded.bonding_curve,
            associated_bonding_curve=excluded.associated_bonding_curve,
            creator=excluded.creator,
            created_timestamp=excluded.created_timestamp,
            last_trade_timestamp=excluded.last_trade_timestamp,
            raydium_pool=excluded.raydium_pool,
            virtual_sol_reserves=excluded.virtual_sol_reserves,
            virtual_token_reserves=excluded.virtual_token_reserves,
            total_supply=excluded.total_supply,
            website=excluded.website,
            usd_market_cap=excluded.usd_market_cap;
    """
    cursor.executemany(sql, token_data)
    conn.commit()
    conn.close()

#Create table right way
def createTransactionTable(databaseName="appDatabase.db.db"):
    conn = sqlite3.connect(databaseName)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        blockTime TIMESTAMP,
        owner TEXT,
        tradeType INTEGER,
        sol REAL,
        tokenAmount REAL,
        mint TEXT,
        hash TEXT,
        UNIQUE (blockTime, owner, tradeType, sol, tokenAmount, mint, hash),
        FOREIGN KEY (mint) REFERENCES tokens (token_address)
    )
    """)


    conn.commit()
    conn.close()

def updateTransactionsTable(transactions, databaseName="appDatabase.db.db"):
    conn = sqlite3.connect(databaseName)
    cursor = conn.cursor()

    sql = """
        INSERT INTO transactions (blockTime, owner, tradeType, sol, tokenAmount, mint, hash)
        VALUES (:timestamp, :user, :is_buy, :sol_amount, :token_amount, :mint, :signature)
        ON CONFLICT(blockTime, owner, tradeType, sol, tokenAmount, mint, hash) DO NOTHING;
    """


    cursor.executemany(sql, transactions)
    conn.commit()
    conn.close()


#REFORMATTING

# tf['tradeType'] = tf['tradeType'].astype('str')
# tf.loc[tf['tradeType']=='1', 'tradeType']='buy'
# tf.loc[tf['tradeType']=='0', 'tradeType']='sell'
# tf['sol']=tf['sol']/10**9
# tf['tokenAmount']=tf['tokenAmount']/1000000