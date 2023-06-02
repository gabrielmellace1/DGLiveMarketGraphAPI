import axios from "axios";
import express, { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const SUBGRAPH_ENDPOINT =
  "https://api.studio.thegraph.com/query/28179/dglivemarketplacegraph/version/latest";

const { PORT } = process.env;

const fetchData = async (query: string) => {
  try {
    const response = await axios.post(SUBGRAPH_ENDPOINT, { query });

    return response.data.data;
  } catch (error) {
    console.error(error);
  }
};

interface Transaction {
  transactionId: string;
  hash: string;
  timestamp: string;
  type: string;
  blockId: string;
  sellerId: string;
  price: string;
  nftAddress: string;
  tokenId: string;
  buyerId: string;
  recipientId: string;
}

const fetchTransactions = async ({
  start,
  count,
  order,
  orderBy = "timestamp",
}: {
  start: number;
  count: number;
  order: string;
  orderBy?: string;
}): Promise<Transaction> => {
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
  return data.transactions.map((transaction: any) => {
    return {
      transactionId: transaction.id,
      hash: transaction.hash,
      timestamp: transaction.timestamp,
      type: transaction.type,
      blockId: transaction.blockNumber,
      sellerId: transaction.seller.id,
      price: transaction.price,
      nftAddress: transaction.nft.id.split("-")[0],
      tokenId: transaction.nft.tokenId,
      buyerId: transaction.buyer ? transaction.buyer.id : "None",
      recipientId: transaction.recipient ? transaction.recipient.id : "None",
    };
  }) as Transaction;
};

const fetchAllTransactions = async ({
  start = 0,
  count = 1000,
  order = "asc",
}: {
  start: number;
  count?: number;
  order?: string;
}) => {
  const transactions: any = await fetchTransactions({ start, count, order });

  // If the number of transactions is equal to the limit
  // then there might be more transactions
  if (transactions.length === count) {
    // Fetch more transactions
    const nextTransactions = await fetchAllTransactions({
      start: start + count,
      count,
      order,
    });

    // Append the transactions fetched in the next request
    transactions.push(...nextTransactions);
  }

  return transactions;
};

const fetchNftsForSale = async (
  start = 0,
  count = 1000,
  order = "desc"
): Promise<any> => {
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
  const nfts = data.nfts.map((nft: any) => {
    return {
      "NFT ID": nft.id,
      "Token ID": nft.tokenId,
      "Current Price": nft.currentPrice,
      "Seller ID": nft.seller.id,
      "NFT Address": nft.nftAddress.id,
    };
  });

  if (nfts.length === count) {
    return nfts.concat(await fetchNftsForSale(start + count, count, order));
  }

  return nfts;
};

const fetchTotalNftsForSale = async (start = 0, count = 1000): Promise<any> => {
  const query = `
    {
      nfts(first: ${count}, skip: ${start}, where: { forSale: true }) {
        id
      }
    }`;

  const data = await fetchData(query);
  const nfts = data.nfts;

  if (nfts.length === count) {
    return count + (await fetchTotalNftsForSale(start + count, count));
  }

  return nfts.length;
};

const fetchTopSellingNftAddresses = async ({
  count = 10,
  order = "desc",
}: {
  count: number;
  order: string;
}): Promise<any> => {
  const query = `
    {
      nfts(first: ${count}, orderBy: totalSales, orderDirection: ${order}) {
        id
        totalSales
        nftAddress {
          id
        }
      }
    }`;

  const data = await fetchData(query);
  return data.nfts.map((nft: any) => {
    return {
      nftAddress: nft.nftAddress.id,
      totalSales: nft.totalSales,
    };
  });
};

const app = express();

app.get("/", async (req, res) => {
  const routes = `
  <h1>Hello from DG Live Marketplace Subgraph API!</h1>
  <p>Here are the routes available:</p>
  <p>/transactions?start=0&count=5&order=asc</p>
  <p>/fetchAllTransactions?start=0</p>
  <p>/nftsForSale?start=0&count=5&order=desc</p>
  <p>/totalNftsForSale?start=0&count=5</p>

  `;
  res.send(routes);
});

app.get("/transactions", async (req, res) => {
  const start = Number(req.query.start) || 0;
  const count = Number(req.query.count) || 5;
  const order = typeof req.query.order === "string" ? req.query.order : "asc";

  const transactions = await fetchTransactions({ start, count, order });
  res.json(transactions);
});

app.get("/fetchAllTransactions", async (req, res) => {
  const start = Number(req.query.start) || 0;
  const transactions = await fetchAllTransactions({ start });
  res.json(transactions);
});

app.get("/nftsForSale", async (req, res) => {
  const nftsForSale = await fetchNftsForSale();
  res.json(nftsForSale);
});

app.get("/totalNftsForSale", async (req, res) => {
  const totalNftsForSale = await fetchTotalNftsForSale();
  res.json({ total: totalNftsForSale });
});

app.get("/topSellingNftAddresses", async (req: Request, res: Response) => {
  const count = Number(req.query.count) || 10;
  const order = typeof req.query.order === "string" ? req.query.order : "desc";

  const topSellingNftAddresses = await fetchTopSellingNftAddresses({
    count,
    order,
  });
  res.json(topSellingNftAddresses);
});

app.listen(PORT || 3000, () => {
  console.log(`Server running on http://localhost:${PORT || 3000}`);
});
