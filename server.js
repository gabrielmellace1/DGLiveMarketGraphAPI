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

const fetchTransactions = async (start, count, order) => {
  const query = `
    {
      transactions(first: ${count}, skip: ${start}, orderBy: id, orderDirection: ${order}) {
        id
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
      'Transaction ID': transaction.id,
      'Timestamp': transaction.timestamp,
      'Type': transaction.type,
      'Block ID': transaction.blockNumber,
      'Seller ID': transaction.seller.id,
      'Price': transaction.price,
      'NFT Address': transaction.nft.id.split("-")[0],
      'Token ID': transaction.nft.tokenId,
      'Buyer ID': transaction.buyer ? transaction.buyer.id : 'None',
      'Recipient ID': transaction.recipient ? transaction.recipient.id : 'None',
    }
  });
}

const app = express();
const port = 3000;

app.get('/transactions', async (req, res) => {
  const start = Number(req.query.start) || 0;
  const count = Number(req.query.count) || 5;
  const order = req.query.order || 'desc';

  const transactions = await fetchTransactions(start, count, order);
  res.json(transactions);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
