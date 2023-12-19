import Attributes from "./Attributes.js";

/** @typedef { import("./types.d.ts").PickLocation } PickLocation */

const attributes = new Attributes();

export default class LocationBuilder
{
    counter = 0;
    putawayType = attributes.bin;
    zone = attributes.bn1;
    /** @type{PickLocation[]} */
    pickLocations = [];

    createRange(
        /** @type{number} */ bay1, 
        /** @type{number} */ sublevel1, 
        /** @type{number} */ position1, 
        /** @type{number} */ bay2, 
        /** @type{number} */ sublevel2, 
        /** @type{number} */ position2)
    {
        for (let b = bay1; b <= bay2; b++)
        {
            for (let s = sublevel1; s <= sublevel2; s++)
            {
                for (let p = position1; p <= position2; p++)
                {
                    if (p % 2 == 0)
                    {
                        continue;
                    }
                    const bay = b.toString().padStart(3, '0');
                    const position = p.toString().padStart(3, '0');
                    
                    this.counter++;

                    this.pickLocations.push({
                        barcode: this.counter.toString().padStart(6, '0'),
                        maxWeight: 500,
                        name: `${this.zone}-A01-${bay}-${s}${position}`,
                        //Notes: notes,
                        putawayType: this.putawayType,
                        width: 12,
                        length: 24,
                        height: 14,
                        ranking: 50,
                        zone: this.zone
                    });
                }
            }
        }
    }

    createPickLocations()
    {
        this.createRange(9, 1, 1, 25, 4, 20);
        this.zone = attributes.cf1;
        this.putawayType = attributes.cartonFlow;
        this.createRange(9, 1, 1, 20, 4, 20);
    }
}