import _ from "lodash";

import { NO_PICK_LOC, NO_PUTAWAY_TYPE } from "~/constants";

export type NewAssignment = {
    pickLocationId: number
    pickLocationName: string
    skuId: number
    skuName: string
}

type SkuCantAssign = {
    id: number
    name: string
    reason: string
}

type LocationSubset = {
    id: number
    name: string
    putawayType: string
}

type WithPutawayType = SkuSubset & {
    putawayType: string
}

type SkuSubset = {
    id: number
    name: string
    putawayType: string | null
    hits: number
}

export default function suggestAssignments(
    skus: SkuSubset[],
    emptyLocs: LocationSubset[],
): { assignments: NewAssignment[]; skusCantAssign: SkuCantAssign[] } {

    const [skusWithPutawayTypes, skusWithout] = _.partition(
        skus,
        (s): s is WithPutawayType => s.putawayType != null
    );

    const skusCantAssign = skusWithout.map((s) => {
        const result = { ...s, reason: NO_PUTAWAY_TYPE };
        return result;
    });

    const assignments: NewAssignment[] = [];

    const skuPutawayTypeBins = _.groupBy(skusWithPutawayTypes, "putawayType");
    const locationPutawayTypeBins = _.groupBy(emptyLocs, "putawayType");

    for (const key in skuPutawayTypeBins) {

        const locationBin = locationPutawayTypeBins[key];

        const skuBin = skuPutawayTypeBins[key];

        skuBin.forEach(sku => {

            const loc = locationBin.pop();

            if (loc == null) {

                skusCantAssign.push({
                    reason: NO_PICK_LOC,
                    ...sku
                });

                return;
            }

            assignments.push({
                pickLocationId: loc.id,
                pickLocationName: loc.name,
                skuId: sku.id,
                skuName: sku.name,
            });
        })
    }

    return { assignments, skusCantAssign };
}