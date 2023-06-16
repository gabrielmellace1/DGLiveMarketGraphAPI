import axios, { AxiosResponse } from "axios";
import { envConfig } from "../config/index";

const http = axios.create({
  baseURL: `${envConfig.subgraphEndpoint}/${envConfig.subgraphVersion}`,
  timeout: 5000,
});

type QueryFunction<T> = (params?: T) => string;

type SubgraphQueries = {
  [key: string]: QueryFunction<any>;
};

export const SUBGRAPH_QUERYS: SubgraphQueries = {
  transactionCounter: () => `{
    transactionCounter(id:"global") {
      count
    }
  }`,
  nftTransactions: (nftId) => `{
    nft(id: "${nftId}") {
      id
      tokenId
      currentPrice
      forSale
      transactions(first:10, orderBy: timestamp, orderDirection: desc) {
        id
        hash
        type
        timestamp
        price
        buyer {
          id
        }
        seller {
          id
        }
      }
    }
  }`,
};

export const fetchData = async <T>(query: string): Promise<T> => {
  try {
    const response = await http.post<AxiosResponse<T>>("", {
      query,
    });
    debugger;
    return response.data.data;
  } catch (err) {
    throw err;
  }
};
