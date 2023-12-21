import _ from "lodash";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { NO_PUTAWAY_TYPE } from "~/constants";
import patchSchema from "~/schemas/sku";

const putawayTypes = ['Bin', 'Liquid', 'Carton Flow', 'Select Rack'];

type PickLocAssignment = { pickLocation: { id: number; name: string; }};

const transformPickLocation = (assignment: PickLocAssignment | null) => {
  return assignment == null ? undefined : {
    id: assignment.pickLocation.id, name: assignment.pickLocation.name
  }
}

type SkuLocSubset = {
  id: number
  putawayType: string
  name: string
}

function sortToBins(array: SkuLocSubset[]) {
  const bins: { [key: string]: SkuLocSubset[] } = {};

  for (const el of array) {
    const { putawayType } = el;
    const bin = bins[putawayType];
    if (bin != null) {
      bin.push(el);
    } else {
      bins[putawayType] = [el];
    }
  }

  return bins;
}

type NewAssignment = {
  pickLocationId: number
  pickLocationName: string
  skuId: number
  skuName: string
}

function assignBin(
  assignments: NewAssignment[],
  skuBin: SkuLocSubset[],
  locBin: SkuLocSubset[]
) {
  for (const sku of skuBin) {
    for (const loc of locBin) {
      assignments.push({
        pickLocationId: loc.id,
        pickLocationName: loc.name,
        skuId: sku.id,
        skuName: sku.name,
      })
    }
  }
}

function suggestAssignments(skus: SkuLocSubset[], locs: SkuLocSubset[]) {
  const skuBins = sortToBins(skus);
  const locBins = sortToBins(locs);

  const assignments: NewAssignment[] = [];

  for (const [key, skuBin] of Object.entries(skuBins)) {
    const locBin = locBins[key];
    if (locBin != null) {
      assignBin(assignments, skuBin, locBin)
    } // else couldn't assign!
  }

  return assignments;
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
          take: 1000
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
        // where putawayType in skus.map(s => putawayType)
        // have to figure out how Prisma does `in`
        // `Prisma.StringFilter<PickLocation>` would seem to be the solution
      });

      const [skusWithPutawayTypes, skusWithout] = _.partition(
        skus,
        (s): s is SkuLocSubset => s.putawayType != null
      );

      const skusCantAssign = skusWithout.map((s) => {
        const result = {...s, reason: NO_PUTAWAY_TYPE };
        return result;
      });

      const assignments = suggestAssignments(skusWithPutawayTypes, locs);

      for (const a of assignments) {
        await ctx.db.assignment.create({
          data: a
        });
      }

      return { assignments, skusCantAssign }
    }),
});
