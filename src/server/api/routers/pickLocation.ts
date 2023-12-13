import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const transformSku = (assignment: any) => {
  return assignment == null ? undefined : {
    id: assignment.sku.id, name: assignment.sku.name
  }
}

export const pickLocationRouter = createTRPCRouter({
  getById: publicProcedure
  .input(z.object({
    pickLocationId: z.number().int(),
  }))
  .query(async ({ ctx, input }) => {
    const pickLocation = await ctx.db.pickLocation
      .findUniqueOrThrow({
        include: {
          assignment: {
            include: { sku: true }
          }
        },
        where: { id: input.pickLocationId }
      });

      const { name, putawayType, width, length, height, maxWeight, assignment } = pickLocation;
      return {
        name,
        putawayType,
        width,
        length,
        height,
        maxWeight,
        sku: transformSku(assignment),
      };
  }),

  getAll: publicProcedure
    .query(async ({ ctx }) => {
      return (await ctx.db.pickLocation
        .findMany({ 
          include: {
            assignment: {
              include: { sku: true }
            }
          },
          take: 100 
        })
        ).map(row => {
          const { name, putawayType, assignment } = row;
          return {
            name,
            putawayType,
            sku: transformSku(assignment),
          };
        })

    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "You are logged into Warehouse Manager!";
  }),
});
