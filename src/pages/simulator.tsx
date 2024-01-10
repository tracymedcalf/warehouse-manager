import { useRef, useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { api } from "~/utils/api";
import type { skuRouter } from "~/server/api/routers/sku";
import type { inferRouterOutputs } from "@trpc/server";

type Point = {
    x: number
    y: number
}

type PointWId = Point & {
    id: string
}

type Hotspot = PointWId & {
    type: "hotspot"
}

type Mod = PointWId & {
    sku?: inferRouterOutputs<typeof skuRouter>["orderedByHits"][0]
    type: "mod"
}

type Racking = PointWId & {
    type: "racking"
}

type Entity = Hotspot | Racking | Mod

function manhattanDistance(p1: Point, p2: Point) {
    return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}

export default function Simulator() {

    const [state, setState] = useState<typeof data>();

    const { data, isLoading } = api.sku.orderedByHits.useQuery(undefined, {
        onSuccess: (data) => {
            setState(data);
        },
    });

    const [entities, setEntities] = useState<Entity[]>([]);

    const [selected, setSelected] = useState<Entity | null>(null);

    const handleNew = (type: Entity["type"]) => {
        setSelected({
            id: uuidv4(),
            type,
            x: 0,
            y: 0,
        });
    };

    const handleClick = (x: number, y: number) => {

        if (selected == null) return;

        setEntities([...entities, { ...selected, x, y }]);
        setSelected(null);
    };

    const handleClearAll = () => {
        setEntities([]);
    };

    const handleAutoAssign = () => {

        const first = state?.[0];

        if (first == null) return;

        // find the first pick location that's closest to a hotspot and empty
        const hotspots = entities.filter(e => e.type === "hotspot");
        const emptyPickLocations = entities
            .filter(e => e.type === "mod" && e.sku == null);
       
        let id: Entity["id"] | undefined;
        let currentLeastDistance = Infinity;

        for (const h of hotspots) {
            for (const e of emptyPickLocations) {

                const d = manhattanDistance(h, e);

                if (d < currentLeastDistance) {
                    id = e.id;
                    currentLeastDistance = d;
                }
            }
        }

        if (id == null) {
            toast(
                `There are either no hotspots or open pick locations.
            (Did you place at least one of both?)`
            );
            return;
        }

        setState(state?.splice(1));

        setEntities(entities.map(e => {
            if (e.id === id) {
                return {
                    ...e,
                    sku: first,
                };
            }

            return e;
        }));
    };

    const Row = ({ row }: { row: number }) => {

        const a = [];

        const classMap = {
            mod: "w-10 h-10 bg-orange-500",
            racking: "w-10 h-10 bg-orange-900",
            hotspot: "w-5 h-5 m-2.5 rounded-full bg-red-500",
        };

        for (let i = 0; i < 25; i++) {

            const entity = entities.find(e => {
                return e.x === i && e.y === row
            });

            const myClass = entity == null ?
                null :
                classMap[entity.type] + " ";

            a.push(
                <div
                    className="w-10 h-10 border inline-block m-0 border-white-900"
                    onClick={() => handleClick(i, row)}
                    key={"" + i}
                >
                    {myClass == null ?
                        null :
                        <div
                            className={myClass + "m-0"}
                        >
                        </div>
                    }
                </div>
            );
        }
        return a;
    };

    const Grid = () => {
        const a = [];
        for (let i = 0; i < 10; i++) {
            a.push(
                <div
                    className="-mt-8px m-0 p-0"
                    key={"" + i}
                >
                    <Row row={i} />
                </div>
            );
        }
        return a;
    };

    return (
        <div>
            <Toaster />
            <div className="flex gap-3 h-100 m-3">
                <div className="bg-scroll flex-shrink overflow-auto whitespace-nowrap" style={{ paddingTop: "8px" }}>
                    <Grid />
                </div>
                <div className="bg-scroll overflow-y-auto">
                    <table className="mr-1">
                        <thead>
                            <tr>
                                <th className="text-left" style={{ width: "6rem" }}>SKU</th>
                                <th className="ml-4 text-left w-8">Hits</th>
                            </tr>
                        </thead>
                        <tbody>
                            {state?.map(s => {
                                return (
                                    <tr key={"" + s.id}>
                                        <td>{s.name}</td>
                                        <td>{s.hits}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            T</div>
            <div className="flex gap-3">
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleNew("racking")}
                >
                    Add Racking
                </button>
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleNew("hotspot")}>
                    Add Hotspot
                </button>
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleNew("mod")}
                >
                    Add Mod
                </button>
                <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    onClick={handleClearAll}
                >
                    Clear All
                </button>
                <button
                    disabled={isLoading}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    onClick={handleAutoAssign}
                >
                    Auto-Assign
                </button>
            </div>
        </div>
    );
}