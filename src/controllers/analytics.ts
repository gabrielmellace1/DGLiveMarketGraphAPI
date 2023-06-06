import express, { Request, Response } from "express";

const router = express.Router();

router.get("/totalNftsForSale", async (req, res) => {
  const totalNftsForSale = await fetchTotalNftsForSale();
  res.json({ total: totalNftsForSale });
});

router.get("/topSellingNftAddresses", async (req: Request, res: Response) => {
  const count = Number(req.query.count) || 10;
  const order = typeof req.query.order === "string" ? req.query.order : "desc";

  const topSellingNftAddresses = await fetchTopSellingNftAddresses({
    count,
    order,
  });
  res.json(topSellingNftAddresses);
});

router.get("/topUserSellers", async (req: Request, res: Response) => {
  const count = Number(req.query.count) || 10;
  const order = typeof req.query.order === "string" ? req.query.order : "desc";

  const topUserSellers = await fetchTopUserSellers({
    count,
    order,
  });
  res.json(topUserSellers);
});

export const analyticsRouter = router;
