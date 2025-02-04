from flask import Flask, render_template, jsonify, request
import pandas as pd
import os
import sqlite3
from aggregation import *
from updateDatabase import *
import json
from databaseManagement import *

app=Flask(__name__)

# conn = sqlite3.connect("pump_fun.db")  # Creates a file called pump_fun.db
# cursor = conn.cursor()

# pd.to_datetime(df['last_trade_timestamp'] / 1000, unit='s')
# df['lastTrade']=pd.to_datetime(df['last_trade_timestamp'] / 1000, unit='s')
# database="pump_fun.db"
# database="pump_fun_database.db"
database="appDatabase.db"

def basicQuery(query):
    conn = sqlite3.connect(database)  # Creates a file called pump_fun.db
    cursor = conn.cursor()
    cursor.execute(query)
    data=cursor.fetchall()
    conn.close()

    return data


def getTokensDf():
    conn = sqlite3.connect(database)
    cursor = conn.cursor()
    # query="SELECT * FROM tokens"
    query='SELECT * FROM tokens ORDER BY last_trade_timestamp DESC LIMIT 50'
    df=pd.read_sql(query, conn)
    conn.close()
    return df

def getTokensData(address):
    conn = sqlite3.connect(database)  # Creates a file called pump_fun.db
    cursor = conn.cursor()
    # address='2J3uWcDQ1AcWH4bUaiuiBfsc782RkPPDQ4RhLLbdpump'
    # cursor.execute(f'SELECT * FROM transactions WHERE mint = "{address}"')
    # cursor.fetchall()
    query=f'SELECT * FROM transactions WHERE mint = "{address}"'
    df=pd.read_sql(query, conn)
    conn.close()
    return df

def getSingleTokenData(address):
    conn = sqlite3.connect(database)  # Creates a file called pump_fun.db
    cursor = conn.cursor()
    query=f'SELECT * FROM tokens WHERE token_address = "{address}"'
    df=pd.read_sql(query, conn)
    conn.close()
    return df


def getTokensTransactions(address):
    conn = sqlite3.connect(database)  # Creates a file called pump_fun.db
    cursor = conn.cursor()
    # address='2J3uWcDQ1AcWH4bUaiuiBfsc782RkPPDQ4RhLLbdpump'
    # cursor.execute(f'SELECT * FROM transactions WHERE mint = "{address}"')
    # cursor.fetchall()
    query=f'SELECT * FROM transactions WHERE mint = "{address}"'
    tf=pd.read_sql(query, conn)
    conn.close()
    tf['date']=pd.to_datetime(tf['blockTime'], unit='s')
    tf['sol']=tf['sol']/10**9
    tf['tokenAmount']=tf['tokenAmount']/1000000
    tf['tradeType'] = tf['tradeType'].astype('str')
    tf.loc[tf['tradeType']=='1', 'sol']=-tf['sol']
    tf.loc[tf['tradeType']=='0', 'tokenAmount']=-tf['tokenAmount']
    tf.loc[tf['tradeType']=='1', 'tradeType']='buy'
    tf.loc[tf['tradeType']=='0', 'tradeType']='sell'

    tf['absSol']=abs(tf['sol'])
    tf['absTokenAmount']=abs(tf['tokenAmount'])
    return tf



@app.route('/')
def home():
    df=getTokensDf()
    data = df.to_dict(orient='records')[:5]
    return render_template('index.html', tokenData=data)

@app.route('/createTables')
def createTables():
    createTokenTable(databaseName="appDatabase.db")
    createTransactionTable(databaseName="appDatabase.db")
    return 

@app.route('/tokens')
def tokens():
    df=getTokensDf()
    data = df.to_dict(orient='records')
    return jsonify(data)

@app.route('/token_transactions/<token_address>')
def token_transactions(token_address):

    # return render_template('token_details.html')
    tf = getTokensData(token_address) 
    data = tf.to_dict(orient='records')
    if data:
        return jsonify(data)
    else:
        return "Token not found", 404
    
@app.route('/token_details/<token_address>')
def token_details(token_address):
    print(f'THIS IS THE TOKEN ADDRESS!!! {token_address}')
    # return render_template('token_details.html')
    tf = getTokensTransactions(token_address) 
    transactionData = tf.head(20).to_dict(orient='records')
    gf=aggregateTransactions(tf)
    traderData=gf.head(50).to_dict(orient='records')
    df = getSingleTokenData(token_address)
    tokenData = df.to_dict(orient='records')

    summaryData=getTransactionSummary(gf, tf, df)
    data = {'token': tokenData, 'transactions': transactionData, 'aggregation': traderData, 'summaryData':summaryData}
    # data={'test':1, 'test2':2}
    # with open('test.txt', 'w') as f:
    #     f.write(json.dumps(data))
    if data:
        return jsonify(data)
    else:
        return "Token not found", 404

@app.route('/update_database', methods=['POST'])
def update_database():
    data=request.json
    if not data:
        return jsonify({'error':'No data received'}), 400
    
    try:
        updateTransactionsTable(data['transaction'], databaseName=database)
        updateTokensTable(data['token'], databaseName=database)
        with open('dataTest.txt', 'w') as f:
            f.write(json.dumps(data))
        # updateTokensTableJson(data['token'])
        # updateTransactionsTableJson(data['transaction'])
    except:
        print('errpr')
    
    else:
        return jsonify({'message':'Data received!'}), 200
    
@app.route('/existing_tokens')
def existing_tokens():
    data=basicQuery("SELECT DISTINCT token_address FROM tokens")

    return jsonify(data)

# if __name__=='__main__':
#     app.run(debug=True)