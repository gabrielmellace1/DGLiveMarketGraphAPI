import { SUBGRAPH_QUERYS, fetchData } from "./http";
import { TransactionCounterRsp } from "../interfaces";

export const transactionCounter = async (): Promise<TransactionCounterRsp> => {
  try {
    const data = await fetchData<TransactionCounterRsp>(
      SUBGRAPH_QUERYS.transactionCounter()
    );
    return data;
  } catch (err) {
    throw err;
  }
};

export const nftTransactions = async ({
  nftAddress,
  tokenId,
}: {
  nftAddress: string;
  tokenId: string;
}): Promise<TransactionCounterRsp> => {
  try {
    debugger;
    const nftId = `${nftAddress}-${tokenId}`;
    const data = (await fetchData<TransactionCounterRsp>(
      SUBGRAPH_QUERYS.nftTransactions(nftId)
    )) as any;
    if (data?.nft?.transactions) {
      return data.nft.transactions.map((transaction: any) => {
        return {
          transactionId: transaction.id,
          transactionHash: transaction.hash,
          transactionType: transaction.type,
          transactionTimestamp: transaction.timestamp,
          transactionPrice: transaction.price,
          buyerId: transaction.buyer ? transaction.buyer.id : "None",
          sellerId: transaction.seller ? transaction.seller.id : "None",
        };
      });
    } else {
      return {
        transactionCounter: {
          count: 0,
        },
      };
    }
    // return data;
  } catch (err) {
    throw err;
  }
};
