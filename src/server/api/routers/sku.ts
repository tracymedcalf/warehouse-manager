import _ from "lodash";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { NO_PICK_LOC, NO_PUTAWAY_TYPE } from "~/constants";
import patchSchema from "~/schemas/sku";

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

type SkuLocSubset = {
  id: number
  putawayType: string
  name: string
}

export type NewAssignment = {
  pickLocationId: number
  pickLocationName: string
  skuId: number
  skuName: string
}

interface SkuSubset {
  id: number
  name: string
  putawayType: string | null
}

interface SkuCantAssign {
  id: number
  name: string
  reason: string
}

function suggestAssignments(
  skus: SkuSubset[],
  locs: SkuLocSubset[]
): { assignments: NewAssignment[]; skusCantAssign: SkuCantAssign[] } {

  const [skusWithPutawayTypes, skusWithout] = _.partition(
    skus,
    (s): s is SkuLocSubset => s.putawayType != null
  );

  const skusCantAssign = skusWithout.map((s) => {
    const result = {...s, reason: NO_PUTAWAY_TYPE };
    return result;
  });

  const assignments: NewAssignment[] = [];

  for (const s of skusWithPutawayTypes) {
    let indexOfP = -1;
    const p = locs.find((p, i): p is SkuLocSubset => {
      indexOfP = i;
      return p != null && p.putawayType === s.putawayType;
    });

    if (p == null) {
      skusCantAssign.push({...s, reason: NO_PICK_LOC}); 
      continue;
    }

    delete locs[indexOfP];

    assignments.push({
      skuId: s.id,
      skuName: s.name,
      pickLocationId: p.id,
      pickLocationName: p.name,
    });
  }

  return { assignments, skusCantAssign };
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

    autoAssign: protectedProcedure
    .input(z.array(z.number().int()))
    .mutation(async ({ ctx, input }) => {

      const skus = await ctx.db.sku.findMany({
        select: { id: true, name: true, putawayType: true },
        where: { 
          id: { in: input },
          // How do we check that assignment is an array with length 0?
          assignment: {
            none: {}
          },
        }
      });

      const locs = await ctx.db.pickLocation.findMany({
        select: { id: true, name: true, putawayType: true },
        where: { assignment: null }
      });


      const result = suggestAssignments(skus, locs);

      for (const { pickLocationId, skuId } of result.assignments) {
        await ctx.db.assignment.create({
          data: { pickLocationId, skuId }
        });
      }

      return result;
    }),
});
