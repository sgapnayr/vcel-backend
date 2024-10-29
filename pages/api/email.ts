import { NextApiRequest, NextApiResponse } from "next";
import rateLimit from "../../middleware/rateLimiter";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";
import dotenv from "dotenv";

dotenv.config();

const rateLimiter = rateLimit(100, 60 * 60 * 1000);

const dynamoDbClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await rateLimiter(req, res, async () => {
    switch (req.method) {
      case "POST":
        return await postUserEmailAddress(req, res);
      default:
        res.status(405).end();
        break;
    }
  });
}

async function postUserEmailAddress(req: NextApiRequest, res: NextApiResponse) {
  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: "Email and name are required" });
  }

  const userId = randomUUID();

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: {
        id: { S: userId },
        email: { S: email },
        name: { S: name },
      },
    };

    await dynamoDbClient.send(new PutItemCommand(params));
    res.status(201).json({ id: userId, email, name });
  } catch (error) {
    console.error("Error creating item in DynamoDB:", error);
    res
      .status(500)
      .json({ error: (error as Error).message || "Internal server error" });
  }
}
