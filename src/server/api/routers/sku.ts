import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import patchSchema from "~/schemas/sku";

const putawayTypes = ['Bin', 'Liquid', 'Carton Flow', 'Select Rack'];

type Assignment = { pickLocation: { id: number; name: string; }};

const transformPickLocation = (assignment: Assignment | null) => {
  return assignment == null ? undefined : {
    id: assignment.pickLocation.id, name: assignment.pickLocation.name
  }
}

export const skuRouter = createTRPCRouter({
  patch: protectedProcedure
    .input(z.object({ id: z.number().int(), data: patchSchema }))
    .mutation(async ({ ctx, input: { id, data } }) => {
      return await ctx.db.sku.update({
        data,
        where: { id }
      });
    }),

  getById: publicProcedure
    .input(z.object({
      skuId: z.number().int(),
    }))
    .query(async ({ ctx, input }) => {
      const sku = await ctx.db.sku
        .findUniqueOrThrow({
          include: {
            assignment: {
              include: { pickLocation: true }
            }
          },
          where: { id: input.skuId }
        });
      const {
        name,
        putawayType,
        width,
        length,
        height,
        weight,
        assignment
      } = sku;
      return {
        name,
        putawayType,
        width,
        length,
        height,
        weight,
        pickLocation: assignment.map(transformPickLocation),
        putawayTypes
      };
    }),

  getAll: publicProcedure
    .query(async ({ ctx }) => {
      return (await ctx.db.sku
        .findMany({
          include: {
            assignment: {
              include: { sku: true }
            }
          },
          take: 100
        })
      ).map(row => {
        const { id, name, putawayType, assignment } = row;
        return {
          id,
          name,
          putawayType,
          numPickLocations: assignment.length,
        };
      })

    }),
});
