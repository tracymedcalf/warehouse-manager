import _ from "lodash";

import { NO_PICK_LOC, NO_PUTAWAY_TYPE } from "~/constants";
import manhattanDistance from "./manhattanDistance";

type NewAssignment = {
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
    x: number | null
    y: number | null
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

type Hotspot = {
    x: number
    y: number
    putawayType: string
}

type WithDistance = LocationSubset & {
    distance: number
}

export default function suggestAssignments(
    skus: SkuSubset[],
    emptyLocs: LocationSubset[],
    hotspots: Hotspot[]
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
    const hotspotPutawayTypeBins = _.groupBy(hotspots, "putawayType");


    for (const key in skuPutawayTypeBins) {

        const locationBin = locationPutawayTypeBins[key];
        const hotspotBin = hotspotPutawayTypeBins[key];

        // Distance to closest hotspot
        const withDistances = createWithDistances(
            locationBin, hotspotBin
        );

        const sortedByDistance = _.sortBy(withDistances, "distance");

        const skuBin = skuPutawayTypeBins[key];

        skuBin.forEach((sku, index) => {

            const loc = sortedByDistance[index];

            if (loc == null) {
                skusCantAssign.push({
                    ...sku,
                    reason: NO_PICK_LOC,
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

function createWithDistances(
    locations: LocationSubset[], hotspots: Hotspot[]
): WithDistance[] {

    return locations.map(loc => {
        let minDistance = Infinity;

        if (loc.x != null && loc.y != null) {
            for (const hotspot of hotspots) {
                const distance = manhattanDistance(
                    loc.x, loc.y, hotspot.x, hotspot.y
                );
                if (distance < minDistance) {
                    minDistance = distance;
                }
            }
        }

        return {...loc, distance: minDistance };
    });
}
