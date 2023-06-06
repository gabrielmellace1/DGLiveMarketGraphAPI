export const fetchTopUserSellers = async ({
  count = 10,
  order = "desc",
}: {
  count: number;
  order: string;
}): Promise<any> => {
  const query = `
  {
    users(first: 10, orderBy:totalRevenue, orderDirection: desc) {
      id
      totalRevenue
      totalSales
    }
  }`;

  const data = await fetchData(query);
  return data.users.map((user: any) => {
    return {
      wallet: user.id,
      totalSales: user.totalSales,
      totalRevenue: user.totalRevenue,
    };
  });
};
