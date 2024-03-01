import _ from "lodash";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import patchSchema from "~/schemas/sku";
import suggestAssignments from "~/utils/suggestAssignments";

const putawayTypes = ['Bin', 'Liquid', 'Carton Flow', 'Select Rack'];

type SkuWithAssignment = Prisma.SkuGetPayload<{ include: { assignment: true }}>

type PickLocAssignment = {
  pickLocation: { 
    id: number
    name: string
    putawayType: string
  }
};

const transformPickLocation = (assignment: PickLocAssignment) => {
  return {
    id: assignment.pickLocation.id, 
    name: assignment.pickLocation.name,
    putawayType: assignment.pickLocation.putawayType,
  };
}

export const skuRouter = createTRPCRouter({

  orderedByHits: publicProcedure
  .query(({ ctx }) => {
    return ctx.db.sku.findMany({
      select: { id: true, name: true, hits: true },
      // where sku has no assigned pick locations
      where: { assignment: { none: {} } },
      orderBy: { hits: "desc" },
    });
  }),

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
          take: 1000
        })
      ).map((row: SkuWithAssignment) => {
        const { id, name, putawayType, assignment } = row;
        return {
          id,
          name,
          putawayType,
          numPickLocations: assignment.length,
        };
      })

    }),

    autoAssign: publicProcedure
    .input(z.array(z.number().int()))
    .mutation(async ({ ctx, input }) => {
      const skus = await ctx.db.sku.findMany({
        select: { id: true, name: true, putawayType: true, hits: true, assignment: true },
        where: { 
          id: { in: input },
        },
        orderBy: {
          hits: "desc"
        }
      });
     
      const [skusWithoutAssignments, skusWithAssignments] = _.partition(
        skus,
        s => s.assignment.length === 0
      );
      
      const locs = await ctx.db.pickLocation.findMany({
        select: {
          id: true,
          name: true,
          putawayType: true,
        },
        where: { assignment: null }
      });

      const result = suggestAssignments(skusWithoutAssignments, locs);

      for (const { pickLocationId, skuId } of result.assignments) {
        await ctx.db.assignment.create({
          data: { pickLocationId, skuId }
        });
      }

      const HAS_ASSIGNMENT = "HAS ASSIGNMENT";

      for (const s of skusWithAssignments) {
        result.skusCantAssign.push({ reason: HAS_ASSIGNMENT, ...s });
      }

      return result;
    }),
});
