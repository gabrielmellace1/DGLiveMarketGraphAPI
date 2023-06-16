// src/users/usersController.ts
import {
  Body,
  Controller,
  FieldErrors,
  Get,
  Path,
  Post,
  Query,
  Route,
  SuccessResponse,
  Tags,
  ValidateError,
} from "tsoa";

import { nftTransactions, transactionCounter } from "../services/index";
import { TransactionCounterRsp } from "../interfaces";
import { DGLiveGraphResponse } from "../interfaces/common";

@Tags("Transactions")
@Route("/transactions")
export class TransactionsController extends Controller {
  /**
   * Gets all the transactions in the contract
   * @returns TransactionCounterRsp
   */
  @Get("counter")
  @SuccessResponse(200, "Success")
  public async fetchTransactionCounter(): Promise<
    DGLiveGraphResponse<TransactionCounterRsp>
  > {
    try {
      const data = await transactionCounter();
      return {
        data,
        message: "Success fetching transaction counter",
      };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Gets nft treansactions
   * @query nftAddress
   * @query tokenId
   * @returns TransactionCounterRsp
   */
  @Get("nftTransactions")
  @SuccessResponse(200, "Success")
  public async fetchNftTransactions(
    @Query() nftAddress: string,
    @Query() tokenId: string
  ): Promise<DGLiveGraphResponse<TransactionCounterRsp>> {
    const errors: FieldErrors = {};
    if (!nftAddress || !tokenId) {
      if (!nftAddress)
        errors.nftAddress = {
          message: "nftAddress is required",
          value: nftAddress,
        };
      else
        errors.tokenId = {
          message: "tokenId is required",
          value: tokenId,
        };
    }
    if (Object.keys(errors).length) {
      throw new ValidateError(errors, "Error fetching nft transactions");
    }
    try {
      const data = await nftTransactions({
        nftAddress,
        tokenId,
      });
      return {
        data,
        message: "Success fetching transaction counter",
      };
    } catch (err) {
      throw err;
    }
  }
}
