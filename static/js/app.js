const alertSound = new Audio('static/calmAlert.wav')

class tokenData {
    constructor(tokenAddress, tokenName) {
        this.tokenAddress=tokenAddress;
        this.tokenName=tokenName;
    }
}

class AppManager {
    constructor(audio) {
        this.currentTokens=[];
        this.previousTokens=[];
        this.newTokens=[];

        this.activeTabs=[];
        this.alertInterval=null;
        this.audio=audio;

        this.alerting=false;

    }

    toggleAlerts() {
        const alertButton = document.getElementById('alert-toggle');
        const alertText = alertButton.children[0];

        if (this.alerting === true) {
            alertButton.classList.remove('alerting');
            alertText.textContent='OFF';
            this.alerting = false;
            clearInterval(this.interval);
        }
        else {
            getTokenList();
            alertButton.classList.add('alerting');
            alertText.textContent='ON';
            this.alerting = true;
            this.interval = setInterval(getTokenList, 60000);
        }
    }
    
    triggerAlert() {
        
        if (this.newTokens.length>0 & this.alerting===true) {
            this.audio.play().catch(error => console.error("Error playing sound:", error));
            console.log("played alert sound");
        }
    }
}

const appManager = new AppManager(alertSound);

document.getElementById('alert-toggle').addEventListener('click', () => {
    appManager.toggleAlerts();

})


function createElementAndAppend(parent, tagName, element_classes=null, element_id = null, elementText=null, href=null, src=null, alt=null) {
    const element = document.createElement(tagName);

    if (element_classes != null) {
        element.classList.add(...element_classes)
    }
    if (element_id != null) {
        element.id = element_id
    }
    if (elementText != null) {
        element.textContent=elementText;
    }
    if (href != null) {
        element.href=href;
        element.target='_blanks';
    }

    if (src != null) {
        element.src=src;
    }
    if (alt != null) {
        element.alt=alt;

    }

    parent.appendChild(element);

    return element;
}

document.getElementById('popup-close').addEventListener('click', () => {
    const popup=document.getElementById('popup');
    popup.style.display="none";
})

document.getElementById('about-button').addEventListener('click', () => {
    updateInfoPopup('about')
})

document.getElementById('topTokens-button').addEventListener('click', () => {
    updateInfoPopup('topTokens')
})

document.getElementById('futurePlans-button').addEventListener('click', () => {
    updateInfoPopup('futurePlans')
})
function updateInfoPopup(message) {
    const popupDic = {about: {title: 'ABOUT', message: "The goal of this app is to share real-time alerts and data every time a pump.fun token bonds, to help you avoid scams and sift through the nonsense. It's still a work in progress but I've got a lot of cool ideas. So follow along and share your suggestions on X @ShiteCoinQUant"},
    topTokens: {title: "TOP TOKENS", message: "Nothing here yet. But as this app develops and grows, I'd like to add cool things like analyses of the most successful tokens and see what we can learn from them! More to come."},
    futurePlans: {title: "FUTURE PLANS", message: "I'm just getting started. The next step will be implementing alerts and real-time data so users can see new tokens right as they bond. After that, who knows. I'd like to incorporate more data from various API's to give people as much information as possible, maybe expand the data beyond pumpfun tokens, and much more. Stay tuned!"}}

    const popup=document.getElementById('popup');
    const popupTitle=document.getElementById('popup-title');
    const popupMessage=document.getElementById('popup-text');
    popupTitle.textContent=popupDic[message].title;
    popupMessage.textContent=popupDic[message].message;
    popup.style.display="flex";

}


const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
});

const formatDollars = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
})

const formatNumbersSimple = new Intl.NumberFormat('en-US');

function switchBetweenPages(activeTab, activePage, mainDataContainer, selectRibbon) {

    // const mainDataContainer = document.getElementById('all-data-container');
    // const selectRibbon = document.getElementById('main-tabs');
    for (let i=0; i<selectRibbon.children.length; i++) {
        selectRibbon.children[i].classList.remove('active');
    }
    activeTab.classList.add('active');
    for (let i=0; i<mainDataContainer.children.length; i++) {
        mainDataContainer.children[i].style.display="none"
    }
    activePage.style.display = "block";
    window.scrollTo(0, 0);
}

function checkBeforeSwitching(activeTab) {
    const tab = document.getElementById(activeTab);

}


const tokenTab = document.getElementById('main-tab-tokens');
tokenTab.addEventListener('click', function(event) {
    switchBetweenPages(event.currentTarget, document.getElementById('data-page-tokens'),document.getElementById('all-data-container'),document.getElementById('main-tabs'));

})

async function fetchTokenData(tokenAddress) {
    const url = `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${tokenAddress}`;
    
    const params = new URLSearchParams({
        include: 'top_pools'
    });

    try {
        const response = await fetch(`${url}?${params.toString()}`, {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        // console.log(data);
        return data;
    } catch (error) {
        console.error("Error fetching token data:", error);
    }
}

function getTokenList() {
    console.log(`Checked for tokens ${new Date()}`);
    fetch('/tokens')
        .then(response => response.json())  // Parse the JSON response
        .then(data => {
            appManager.previousTokens=appManager.currentTokens;
            appManager.currentTokens=[];
            appManager.newTokens=[];

            const tableBody = document.getElementById('table-body-token')
            tableBody.innerHTML = "";

            data.forEach((token) => {
                const tokenAddress = token.token_address;
                const row = document.createElement("tr");

                // Create table cells
                const nameCell = document.createElement("td");
                nameCell.textContent = token.name;
                row.appendChild(nameCell);

                const symbolCell = document.createElement("td");
                symbolCell.textContent = token.symbol;
                row.appendChild(symbolCell);

                const marketCapCell = document.createElement("td");
                marketCapCell.textContent = formatDollars.format(token.usd_market_cap);
                row.appendChild(marketCapCell);

                const createdCell = document.createElement("td");
                const createdDate=new Date(token.created_timestamp);
                createdCell.textContent = formatter.format(createdDate);
                row.appendChild(createdCell);
                
                const bondedCell = document.createElement("td");
                const bondedDate = new Date(token.last_trade_timestamp);
                bondedCell.textContent = formatter.format(bondedDate);
                row.appendChild(bondedCell);

                const addressCell = document.createElement("td");
                addressCell.textContent = tokenAddress;
                row.appendChild(addressCell);

                if (!appManager.previousTokens.includes(tokenAddress) & appManager.previousTokens.length>0) {
                    row.classList.add('new-token');
                    appManager.newTokens.push(tokenAddress);

                }
                appManager.currentTokens.push(tokenAddress);
                
                row.addEventListener('click', () => {
                    row.classList.remove('new-token');
                    const tokenAddress = token.token_address;
                    openTokenData(tokenAddress);
                })

                // Append the row to the table body
                tableBody.appendChild(row);
            });
            // console.log(appManager);
            appManager.triggerAlert();
        })
        .catch(error => {
            console.error('Error fetching token data:', error);
        });
}

getTokenList();
// setInterval(getTokenList, 30000);


function createTokenDetailsTab(tokenAddress, data) {
    // still need to figure out how to reference and loop
    const mainDataContainer = document.getElementById('all-data-container');
    const selectRibbon = document.getElementById('main-tabs');
    for (let i=0; i<mainDataContainer.children.length; i++) {
        mainDataContainer.children[i].style.display="none"
    }
    // createElementAndAppend(parent, tagName, element_classes=null, element_id = null, elementText=null)
    const newTab=createElementAndAppend(selectRibbon, "div", element_classes=["select-tab"], element_id = `data-tab-${tokenAddress}`, elementText=data.token[0].name);
    const x_button=createElementAndAppend(newTab, "div", element_classes=["x_button"], element_id = `x_button-${tokenAddress}`, elementText="x");
    const newPage=createElementAndAppend(mainDataContainer, "div", element_classes=["content-container"], element_id = `data-page-${tokenAddress}`, elementText=null);
    x_button.addEventListener('click', function(event) {
        event.stopPropagation();
        newTab.remove();
        newPage.remove();
        switchBetweenPages(document.getElementById('main-tab-tokens'), document.getElementById('data-page-tokens'),document.getElementById('all-data-container'),document.getElementById('main-tabs'));
    })
    const detailsRibbon=createElementAndAppend(newPage, "div", element_classes=["select-ribbon"], element_id = `ribbon-details-${tokenAddress}`, elementText=null);
    const detailsPageContainer=createElementAndAppend(newPage, "div", element_classes=null, element_id = `ribbon-page-container-${tokenAddress}`, elementText=null);
    const detailedTabs = {overview:['Overview'], transactionSummary:['Transaction Summary'], transactionFull:['Transactions Full'], recentActivity:['recentActivity'], socialAnalytics:['Social Analytics']}

    for (const key in detailedTabs) {
        const detailedTab=createElementAndAppend(detailsRibbon, "div", element_classes=["select-tab"], element_id = `detailed-tab-${key}-${tokenAddress}`, elementText=detailedTabs[key][0]);
        const detailedPage=createElementAndAppend(detailsPageContainer, "div", element_classes=null, element_id = `detailed-page-${key}-${tokenAddress}`, elementText=null);
        // detailedTab.addEventListener
        detailedTab.addEventListener('click', () => {
            switchBetweenPages(detailedTab, detailedPage, detailsPageContainer, detailsRibbon);


        })
    }
    document.getElementById(`detailed-tab-recentActivity-${tokenAddress}`).addEventListener('click', () => {
        fetchTokenData(tokenAddress).then(data => {
            if (data) {
                // Process the data here
                console.log(data);
                
                // Example: Update the UI with the fetched data

            }
        }).catch(error => {
            console.error("Error handling token data:", error);
        });

    })

    
    // Overview data
    const overviewPage=document.getElementById(`detailed-page-overview-${tokenAddress}`);
    const topRow=createElementAndAppend(overviewPage, "div", element_classes=["top-row"], element_id = `overview-top-row-${tokenAddress}`, elementText=null);
    const leftColumn=createElementAndAppend(topRow, "div", element_classes=["left-column"], element_id = `overview-left-column-${tokenAddress}`, elementText=null);
    const tokenData = data.token[0];
    const nameAndSymbolContainer=createElementAndAppend(leftColumn, "p", element_classes=["datapoint-name"], element_id = null, elementText=`${tokenData.name} - ${tokenData.symbol}`);
    const description=createElementAndAppend(leftColumn, "p", element_classes=["data-field-named"], element_id = null, elementText=`${tokenData.description}`);
    // switchBetweenPages(newTab, newPage);
    
    const allDetailedData = {Created: formatter.format(new Date(tokenData.created_timestamp)), Bonded: formatter.format(new Date(tokenData.last_trade_timestamp)), MC: formatDollars.format(tokenData.usd_market_cap)}
    for (const key in allDetailedData) {
        const container=createElementAndAppend(leftColumn, "div", element_classes=["data-field-named"], element_id = null, elementText=null);
        const title=createElementAndAppend(container, "p", element_classes=["datapoint-name"], element_id = null, elementText=`${key}:  `);
        const fieldValue=createElementAndAppend(container, "p", element_classes=null, element_id = null, elementText=allDetailedData[key]);
        
    }


    const summaryData=data.summaryData;
    const devLink=`https://solscan.io/account/${summaryData.dev}`
    const devContainer=createElementAndAppend(leftColumn, "div", element_classes=["data-field-named"], element_id = null, elementText=null);
    const devTitle=createElementAndAppend(devContainer, "p", element_classes=["datapoint-name"], element_id = null, elementText='Dev:');
    // const devField=createElementAndAppend(devContainer, "p", element_classes=null, element_id = null, elementText=null, href=traderLink);
    // const devHashField=createElementAndAppend(devField, "a", element_classes=null, element_id = null, elementText=`${summaryData.dev.substring(0,7)}...`, href=devLink);
    const devField=createElementAndAppend(devContainer, "a", element_classes=null, element_id = null, elementText=`${summaryData.dev.substring(0,7)}...`, href=devLink);

    const summaryDic={bondingTime:'Bond Time', transactions:'Transactions', holders:'Holders', heldByDev:'Held by Dev', heldByTop5:'Held by top 5', heldByTop10:'Held by top 10'}
    for (const key in summaryDic) {
        const container=createElementAndAppend(leftColumn, "div", element_classes=["data-field-named"], element_id = null, elementText=null);
        const title=createElementAndAppend(container, "p", element_classes=["datapoint-name"], element_id = null, elementText=`${summaryDic[key]}:`);
        const fieldValue=createElementAndAppend(container, "p", element_classes=null, element_id = null, elementText=summaryData[key]);
        
    }

    const pfNote=createElementAndAppend(leftColumn, "p", element_classes=null, element_id = null, elementText="*data as of bonding on pump.fun");
    pfNote.style.fontSize="12px";
    pfNote.style.fontStyle="italic";

    const rightColumn=createElementAndAppend(topRow, "div", element_classes=["right-column"], element_id = `overview-right-column-${tokenAddress}`, elementText=null);
    const largeImage=document.createElement('img');
    largeImage.src=tokenData.image_url;
    largeImage.alt='Token Image'
    largeImage.classList.add('large-image');
    rightColumn.appendChild(largeImage);
    const smallImageContainer=createElementAndAppend(rightColumn, "div", element_classes=["small-images"], element_id =null, elementText=null,);
    const smallImgDic={pumpfun:['pflogo.png', `https://pump.fun/coin/${tokenData.token_address}`], dex:['dexlogo.png', `https://dexscreener.com/solana/${tokenData.raydium_pool}`], solscan:['solscanlogo.png', `https://solscan.io/token/${tokenData.token_address}`], bubblempas:['bubblemapslogo.png', `https://app.bubblemaps.io/sol/token/${tokenData.token_address}`]};
    for (const key in smallImgDic) {
        smallLink=document.createElement('a');
        smallLink.href=smallImgDic[key][1];
        smallLink.target='_blank';
        const smallImage=document.createElement('img');
        smallImage.src=`static/${smallImgDic[key][0]}`;
        smallImage.alt='small image'
        smallLink.appendChild(smallImage);
        smallImageContainer.appendChild(smallLink);
    }

    const bottomContainer=createElementAndAppend(overviewPage, "div", element_classes=["bottom-container"], element_id = `overview-bottom-row-${tokenAddress}`, elementText=null);
    const redFlagsTitle=createElementAndAppend(bottomContainer, "p", element_classes=["datapoint-name"], element_id = null, elementText='RED FLAGS');
    data.summaryData.redFlags.forEach(flag => {
        const redFlag=createElementAndAppend(bottomContainer, "p", element_classes=["red-flag"], element_id = null, elementText=flag);
        redFlag.style.color='red';

    })

    const tranSummary=document.getElementById(`detailed-page-transactionSummary-${tokenAddress}`);
    const tranSummarySection=createElementAndAppend(tranSummary, "section", element_classes=["section"], element_id = `tranSummary-section-${tokenAddress}`, elementText=null);
    const tranSummaryHeader=createElementAndAppend(tranSummarySection, "h1", element_classes=null, element_id = null, elementText='Transaction Summary');
    const tranSummaryTable=createElementAndAppend(tranSummarySection, "table", element_classes=null, element_id = `tranSummary-table-${tokenAddress}`, elementText=null);
    const tranSummaryTableHead=createElementAndAppend(tranSummaryTable, "thead", element_classes=null, element_id = null, elementText=null);
    const tranSummaryTableRow1=createElementAndAppend(tranSummaryTableHead, "tr", element_classes=null, element_id = null, elementText=null);
    const tableTitles = ['owner', 'trades', 'netTokens', 'totalTokensTraded', 'netSol', 'totalSolVol', 'firstTrade', 'lastTrade', 'supply%']
    tableTitles.forEach(title => {
        const tableTitle=createElementAndAppend(tranSummaryTableRow1, "th", element_classes=null, element_id = null, elementText=title);

    })
    const tranSummaryTableBody=createElementAndAppend(tranSummaryTable, "tbody", element_classes=null, element_id = null, elementText=null);
    data.aggregation.forEach((owner) => {
        const tranSummaryRow=createElementAndAppend(tranSummaryTableBody, "tr", element_classes=null, element_id = null, elementText=null);
        const wallet=owner.owner
        const traderLink=`https://solscan.io/account/${wallet}`
        const traderField=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=null, href=traderLink);
        const traderFieldHref=createElementAndAppend(traderField, "a", element_classes=null, element_id = null, elementText=`${wallet.substring(0,7)}...`, href=traderLink);
        // summaryData.dev
        const tradesField=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=owner.trades);
        const netTokensField=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=formatNumbersSimple.format(parseInt(owner.netTokens)));
        const totalTokensField=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=formatNumbersSimple.format(parseInt(owner.totalTokensTraded)));
        const solField=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=Math.round(owner.netSol*100)/100);
        const totalSolField=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=Math.round(owner.totalSolVol*100)/100);
        const firstTradeField=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=formatter.format(new Date(owner.firstTrade)));
        const lastTradeField=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=formatter.format(new Date(owner.lastTrade)));
        const percentField=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=Math.round(owner.supply_pct*1000)/10);
        

    })

    const tranFull=document.getElementById(`detailed-page-transactionFull-${tokenAddress}`);
    const tranFullSection=createElementAndAppend(tranFull, "section", element_classes=["section"], element_id = `tranSummary-section-${tokenAddress}`, elementText=null);
    const tranFullHeader=createElementAndAppend(tranFullSection, "h1", element_classes=null, element_id = null, elementText='All Transactions');
    const tranFullTable=createElementAndAppend(tranFullSection, "table", element_classes=null, element_id = `tranSummary-table-${tokenAddress}`, elementText=null);
    const tranFullTableHead=createElementAndAppend(tranFullTable, "thead", element_classes=null, element_id = null, elementText=null);
    const tranFullTableRow1=createElementAndAppend(tranFullTableHead, "tr", element_classes=null, element_id = null, elementText=null);
    const tableTitles2 = ['date', 'owner', 'tradeType', 'sol', 'tokenAmount', 'hash']
    tableTitles2.forEach(title => {
        const tableTitle=createElementAndAppend(tranFullTableRow1, "th", element_classes=null, element_id = null, elementText=title);

    })
    const tranFullTableBody=createElementAndAppend(tranFullTable, "tbody", element_classes=null, element_id = null, elementText=null);
    data.transactions.forEach((trade) => {
        const tranSummaryRow=createElementAndAppend(tranFullTableBody, "tr", element_classes=null, element_id = null, elementText=null);
        // const tradeDate=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=formatter.format(new Date(trade.date)));
        const tradeDate=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=formatter.format(new Date(trade.date)));
        const wallet=trade.owner
        const traderLink=`https://solscan.io/account/${wallet}`
        const traderField=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=null, href=traderLink);
        const traderFieldHref=createElementAndAppend(traderField, "a", element_classes=null, element_id = null, elementText=`${wallet.substring(0,7)}...`, href=traderLink);
        // summaryData.dev
        const tradeTypeField=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=trade.tradeType);
        const solField=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=Math.round(trade.sol*100)/100);
        const tokenAmountField=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=formatNumbersSimple.format(parseInt(trade.tokenAmount)));
        const tradeHash=trade.hash
        const hashLink=`https://solscan.io/tx/${tradeHash}`
        const hashField=createElementAndAppend(tranSummaryRow, "td", element_classes=null, element_id = null, elementText=null, href=traderLink);
        const hashFieldHref=createElementAndAppend(hashField, "a", element_classes=null, element_id = null, elementText=`${tradeHash.substring(0,10)}...`, href=hashLink);
    


    })
    const recentActivityPage=document.getElementById(`detailed-page-recentActivity-${tokenAddress}`);
    const bottomContainerRecentActivity=createElementAndAppend(recentActivityPage, "div", element_classes=["bottom-container"], element_id = null, elementText=null);
    const largeTitle=createElementAndAppend(bottomContainerRecentActivity, "p", element_classes=["large-text"], element_id = null, elementText='IN PROGRESS...');
    const raWords = ["Things I'd like to add but am not able to scale/automate at the moment:", "-Include recent data from geckoterminal or dex's API, like price, volume and other metrics", 
        "-Pull recent data from Solscan's API"]
        raWords.forEach(phrase => {
            const line=createElementAndAppend(bottomContainerRecentActivity, "p", element_classes=["large-text2"], element_id = null, elementText=phrase);

        })

    const socialAnalyticsPage=document.getElementById(`detailed-page-socialAnalytics-${tokenAddress}`);
    const bottomContainerSocialAnalytics=createElementAndAppend(socialAnalyticsPage, "div", element_classes=["bottom-container"], element_id = null, elementText=null);
    const largeTitleSA=createElementAndAppend(bottomContainerSocialAnalytics, "p", element_classes=["large-text"], element_id = null, elementText='IN PROGRESS...');
    const saWords = ["Things I'd like to add, if I could justify the price of X's API:", "-Number of mentions/interactions on X", 
        "-Show what KOL's are shilling what tokens (especially the bad ones)", "Social media interactions over time", "-And much more..."]
        saWords.forEach(phrase => {
            const line=createElementAndAppend(bottomContainerSocialAnalytics, "p", element_classes=["large-text2"], element_id = null, elementText=phrase);

        })

    switchBetweenPages(newTab, newPage,document.getElementById('all-data-container'),document.getElementById('main-tabs'));
    // switchBetweenPages(`detailed-tab-overview-${tokenAddress}`, `detailed-page-overview-${tokenAddress}`, detailsPageContainer, detailsRibbon);
    newTab.addEventListener('click', () => {
        switchBetweenPages(newTab, newPage,document.getElementById('all-data-container'),document.getElementById('main-tabs'));

        
    })
    // const largeImage=createElementAndAppend(rightColumn, "img", element_classes=["large-image"], element_id =null, elementText=null, src=tokenData.image_url, alt='Large Image');
    // const smallImageContainer=createElementAndAppend(rightColumn, "div", element_classes=["small-images"], element_id =null, elementText=null,);
}


function openTokenData(tokenAddress) {

    fetch(`/token_details/${tokenAddress}`)
    .then(response => response.json())  // Parse the JSON response
    .then(data => {

        createTokenDetailsTab(tokenAddress, data)
    
    })
    .catch(error => {
        console.error('Error fetching token data:', error);
    });

}
