import dotenv from "dotenv";
dotenv.config();

const { PORT, SUBGRAPH_ENDPOINT, SUBGRAPH_VERSION } = process.env;
export const envConfig = {
  port: PORT ? +PORT : 3000,
  subgraphEndpoint: SUBGRAPH_ENDPOINT || "",
  subgraphVersion: SUBGRAPH_VERSION || "latest",
};
