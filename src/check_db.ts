import "dotenv/config";
import { db } from "./server/db";

async function main() {
  try {
    const transactions = await db.transaction.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
    console.log("Transactions Count:", transactions.length);
    if (transactions.length > 0) {
      console.log("Latest Transaction:", JSON.stringify(transactions[0], null, 2));
    }

    const users = await db.user.findMany({
      select: { id: true, emailAddress: true, credits: true },
    });
    console.log("Users Count:", users.length);
    console.log("Users Data:", JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Database check failed:", error);
  } finally {
    process.exit(0);
  }
}

main();
