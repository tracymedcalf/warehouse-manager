import superjson from "superjson";
import { appRouter } from "~/server/api/root";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { db } from "~/server/db";

export const createSsgHelpers = () => createServerSideHelpers({
    router: appRouter,
    ctx: { db, session: null, headers: new Headers() },
    transformer: superjson,
});