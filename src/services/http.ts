import axios from "axios";

const SUBGRAPH_ENDPOINT =
  "https://api.studio.thegraph.com/query/28179/dglivemarketplacegraph/version/latest";

const { PORT } = process.env;

const httpClient = axios.create({
  baseURL: SUBGRAPH_ENDPOINT,
  timeout: 5000,
});

const fetchData = async (query: string) => {
  try {
    const response = await axios.post(SUBGRAPH_ENDPOINT, { query });

    return response.data.data;
  } catch (error) {
    console.error(error);
  }
};
