import { NextApiRequest, NextApiResponse } from "next";
import rateLimit from "../../middleware/rateLimiter";

const rateLimiter = rateLimit(100, 60 * 60 * 1000);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  rateLimiter(req, res, async () => {
    switch (req.method) {
      case "POST":
        return await postUser(req, res);
      default:
        res.status(405).end();
        break;
    }
  });
}

async function postUser(req: NextApiRequest, res: NextApiResponse) {
  res.json({
    userId: "12345",
    firstName: "Alex",
    lastName: "Smith",
    email: "alex.smith@example.com",
    dateOfBirth: "1990-05-15",
    gender: "Non-binary",
    isVerified: true,
    profilePhotoUrl: "https://example.com/photos/alex.jpg",
    subscriptionTier: "Premium",
    createdAt: "2024-10-26T12:34:56Z",
    updatedAt: "2024-10-26T12:34:56Z",
  });
}
