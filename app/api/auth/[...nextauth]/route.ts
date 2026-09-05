import NextAuth from "next-auth";
import { marketingAuthOptions } from "@/lib/marketing-auth";

const handler = NextAuth(marketingAuthOptions);

export { handler as GET, handler as POST };
