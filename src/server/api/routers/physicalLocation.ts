import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

export const physicalLocationRouter = createTRPCRouter({
    getAll: publicProcedure
        .query(({ ctx }) => {
            return ctx.db.physicalLocation.findMany({
                include: { 
                    PickLocation: {
                        include: {
                            Inventory: {
                                include: {
                                    sku: true
                                }
                            }
                        }
                    } 
                }
            });
        }),

    post: protectedProcedure
        .input(z.array(z.object({
            x: z.number(),
            y: z.number(),
            type: z.string(),
            putawayType: z.string().nullable(),
        })))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.physicalLocation.deleteMany();
            for (const data of input) {
                await ctx.db.physicalLocation.create({ data });
            }
        })
});