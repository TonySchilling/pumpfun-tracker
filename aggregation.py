import pandas as pd

# def aggregateTransactions(tf):
#     tf['date']=pd.to_datetime(tf['date'])
#     tf['absSol']=abs(tf['sol'])
#     tf['absTokenAmount']=abs(tf['tokenAmount'])
#     gf=tf.groupby('owner').agg({'hash':'count', 'tokenAmount':'sum', 'absTokenAmount':'sum', 'sol':'sum', 'absSol':'sum', 'date':['min', 'max']})
#     gf.columns=gf.columns.droplevel(0)
#     gf=gf.reset_index()
#     gf.columns=['owner', 'trades', 'netTokens', 'totalTokensTraded', 'netSol', 'totalSolVol', 'firstTrade', 'lastTrade']
#     gf=gf.sort_values('netTokens', ascending=False).reset_index()
#     gf['supply_pct']=gf['netTokens']/gf['netTokens'].sum()
#     # gf.to_csv('testtest.csv')
#     return gf


def aggregateTransactions(tf):
    # tf['date']=pd.to_datetime(tf['blockTime'], unit='s')
    # tf['sol']=tf['sol']/10**9
    # tf['tokenAmount']=tf['tokenAmount']/1000000
    # tf['tradeType'] = tf['tradeType'].astype('str')
    # tf.loc[tf['tradeType']=='1', 'sol']=-tf['sol']
    # tf.loc[tf['tradeType']=='0', 'tokenAmount']=-tf['tokenAmount']
    # tf.loc[tf['tradeType']=='1', 'tradeType']='buy'
    # tf.loc[tf['tradeType']=='0', 'tradeType']='sell'

    # tf['absSol']=abs(tf['sol'])
    # tf['absTokenAmount']=abs(tf['tokenAmount'])
    gf=tf.groupby('owner').agg({'hash':'count', 'tokenAmount':'sum', 'absTokenAmount':'sum', 'sol':'sum', 'absSol':'sum', 'date':['min', 'max']})
    gf.columns=gf.columns.droplevel(0)
    gf=gf.reset_index()
    gf.columns=['owner', 'trades', 'netTokens', 'totalTokensTraded', 'netSol', 'totalSolVol', 'firstTrade', 'lastTrade']
    gf=gf.sort_values('netTokens', ascending=False).reset_index()
    gf['supply_pct']=gf['netTokens']/gf['netTokens'].sum()
    # gf.to_csv('testtest.csv')
    return gf

def getBondingTimeStr(bondingTime):
    days = bondingTime.days
    total_seconds = bondingTime.seconds  # Total seconds within the day
    hours = total_seconds // 3600  # 1 hour = 3600 seconds
    remaining_seconds = total_seconds % 3600
    minutes = remaining_seconds // 60  # 1 minute = 60 seconds
    seconds = remaining_seconds % 60
    # formatted_time = f"{days} days, {hours} hours, {minutes} minutes, {seconds} seconds"
    data={'d':days, 'h':hours, 'm':minutes, 's':seconds}
    return data


def getTransactionSummary(gf, tf, df):
    redFlags=[]
    bondingFlag=None
    bondingStr=''
    bt=tf['date'].max()-tf['date'].min()
    bondingSeconds=(bt.days*86400)+bt.seconds
    bondingData=getBondingTimeStr(bt)
    if bondingSeconds<60:
        bondingFlag='Fast Bond'
        bondingStr=f'{bt.seconds} seconds'
    elif bondingSeconds<172800:
        bondingStr=f'{bondingData["h"]} hr {bondingData["m"]} mn {bondingData["s"]} sec'
    else:
        bondingStr=f'{bondingData["d"]} days {bondingData["h"]} hr {bondingData["m"]} mn {bondingData["s"]} sec'
        if bt.days>3:
            bondingFla='Old Token Suddenly Bonding'
    if bondingFlag != None:
        redFlags.append(bondingFlag)
    transactions=len(tf)
    if transactions<10:
        redFlags.append('Few Transactions')
    totalTokens=gf['netTokens'].sum()
    holders=len(gf[gf['netTokens']>0])
    holders1m=len(gf[gf['netTokens']>1000000])
    creator=df['creator'].iloc[0]
    heldByDev=gf[gf['owner']==creator]['netTokens'].mean()/totalTokens
    heldByTop5=gf.sort_values('netTokens', ascending=False).head(5)['netTokens'].sum()/totalTokens
    heldByTop10=gf.sort_values('netTokens', ascending=False).head(10)['netTokens'].sum()/totalTokens
    if heldByTop5>.7:
        redFlags.append('Supply Control')
    if heldByDev>.5:
        redFlags.append('Supply Control - Dev')

    data = {'bondingTime':bondingStr, 'transactions': transactions, 'holders':holders, 'holders1m':holders1m, 'dev':creator, 'heldByDev':f'{round(heldByDev*100,1)}%','heldByTop5':f'{round(heldByTop5*100,1)}%','heldByTop10':f'{round(heldByTop10*100,1)}%', 'redFlags':redFlags}
    return data