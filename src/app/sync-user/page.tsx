import { db } from "@/server/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import React from "react";

const page = async () => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not found");
  }

  const client = await clerkClient();
  console.log("CLERK CLIENT looks like - ", client);
  const user = await client.users.getUser(userId);
  console.log("USER looks like - ", user);

  if (!user.emailAddresses[0]?.emailAddress) {
    return notFound();
  }

  console.log(db);

  await db.user.upsert({
    where: {
      id: userId,
    },
    update: {
      imageUrl: user.imageUrl,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    create: {
      id: userId,
      emailAddress: user.emailAddresses[0]?.emailAddress ?? "",
      imageUrl: user.imageUrl,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });

  return redirect("/dashboard");
};

export default page;
