const axios = require('axios');
const express = require('express');

const SUBGRAPH_ENDPOINT = 'https://api.studio.thegraph.com/query/28179/dglivemarketplacegraph/version/latest';

const fetchData = async (query) => {
  try {
    const response = await axios.post(
      SUBGRAPH_ENDPOINT,
      { query },
    );

    return response.data.data;
  } catch (error) {
    console.error(error);
  }
}

const fetchTransactions = async ({ start, count, order, orderBy = 'timestamp' }) => {
  const query = `
    {
      transactions(first: ${count}, skip: ${start}, orderBy: ${orderBy}, orderDirection: ${order}) {
        id
        hash
        timestamp
        type
        blockNumber
        buyer {
          id
        }
        recipient {
          id
        }
        seller {
          id
        }
        price
        nft {
          id
          nftAddress
          tokenId
        }
      }
    }`;

  const data = await fetchData(query);
  return data.transactions.map((transaction) => {
    return {
      'transactionId': transaction.id,
      'hash': transaction.hash,
      'timestamp': transaction.timestamp,
      'type': transaction.type,
      'blockId': transaction.blockNumber,
      'sellerId': transaction.seller.id,
      'price': transaction.price,
      'nftAddress': transaction.nft.id.split("-")[0],
      'tokenId': transaction.nft.tokenId,
      'buyerId': transaction.buyer ? transaction.buyer.id : 'None',
      'recipientId': transaction.recipient ? transaction.recipient.id : 'None',
    }
  });
}

const fetchAllTransactions = async ({ start = 0, count = 1000, order = 'asc' }) => {
  const transactions = await fetchTransactions({ start, count, order });

  // If the number of transactions is equal to the limit
  // then there might be more transactions
  if (transactions.length === count) {
    // Fetch more transactions
    const nextTransactions = await fetchAllTransactions({ start: start + count, count, order });

    // Append the transactions fetched in the next request
    transactions.push(...nextTransactions);
  }

  return transactions;
};


const fetchNftsForSale = async (start = 0, count = 1000, order = 'desc') => {
  const query = `
    {
      nfts(first: ${count}, skip: ${start}, orderBy: id, orderDirection: ${order}, where: { forSale: true }) {
        id
        tokenId
        currentPrice
        seller {
          id
        }
        nftAddress {
          id
        }
      }
    }`;

  const data = await fetchData(query);
  const nfts = data.nfts.map((nft) => {
    return {
      'NFT ID': nft.id,
      'Token ID': nft.tokenId,
      'Current Price': nft.currentPrice,
      'Seller ID': nft.seller.id,
      'NFT Address': nft.nftAddress.id,
    };
  });

  if (nfts.length === count) {
    return nfts.concat(await fetchNftsForSale(start + count, count, order));
  }

  return nfts;
};


const fetchTotalNftsForSale = async (start = 0, count = 1000) => {
  const query = `
    {
      nfts(first: ${count}, skip: ${start}, where: { forSale: true }) {
        id
      }
    }`;

  const data = await fetchData(query);
  const nfts = data.nfts;

  if (nfts.length === count) {
    return count + await fetchTotalNftsForSale(start + count, count);
  }

  return nfts.length;
};





const app = express();
const port = 3000;

app.get('/transactions', async (req, res) => {
  const start = Number(req.query.start) || 0;
  const count = Number(req.query.count) || 5;
  const order = req.query.order || 'desc';

  const transactions = await fetchTransactions({ start, count, order });
  res.json(transactions);
});

app.get('/fetchAllTransactions', async (req, res) => {
  const start = Number(req.query.start) || 0;
  const transactions = await fetchAllTransactions({ start });
  res.json(transactions);
});

app.get('/nftsForSale', async (req, res) => {
  const nftsForSale = await fetchNftsForSale();
  res.json(nftsForSale);
});

app.get('/totalNftsForSale', async (req, res) => {
  const totalNftsForSale = await fetchTotalNftsForSale();
  res.json({ total: totalNftsForSale });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
