import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import patchSchema from "~/schemas/pickLocation";

type Assignment = { sku: { id: number; name: string; }};

const transformSku = (assignment?: Assignment | null) => {
  return assignment == null ? undefined : {
    id: assignment.sku.id, name: assignment.sku.name
  }
}

const putawayTypes = ['Bin', 'Liquid', 'Carton Flow', 'Select Rack'];

export const pickLocationRouter = createTRPCRouter({
  patch: publicProcedure
    .input(patchSchema.extend({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const { id, width, length, height, maxWeight } = input;
      return await ctx.db.pickLocation.update({
        data: { width, length, height, maxWeight },
        where: { id }
      });
    }),

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
      const {
        name,
        putawayType,
        width,
        length,
        height,
        maxWeight,
        assignment
      } = pickLocation;
      return {
        name,
        putawayType,
        width,
        length,
        height,
        maxWeight,
        sku: transformSku(assignment),
        putawayTypes
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
        const { id, name, putawayType, assignment } = row;
        return {
          id,
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
