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
    capacity: number
    skus: inferRouterOutputs<typeof skuRouter>["orderedByHits"]
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

    const handleNew = (type: "hotspot" | "racking") => {
        setSelected({
            id: uuidv4(),
            type,
            x: 0,
            y: 0,
        });
    };

    const handleNewMod = () => {
        setSelected({
            id: uuidv4(),
            type: "mod",
            skus: [],
            capacity: 5,
            x: 0,
            y: 0,
        });
    }

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
            .filter(e => e.type === "mod" && e.skus.length === e.capacity);
       
        let id: Entity["id"] | undefined;
        let currentLeastDistance = Infinity;

        for (const h of hotspots) {
            for (const e of emptyPickLocations) {

                const distance = manhattanDistance(h, e);

                if (distance < currentLeastDistance) {
                    id = e.id;
                    currentLeastDistance = distance;
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
            return (e.id === id) ? {...e, sku: first } : e;
        }));
    };

    const Row = ({ row }: { row: number }) => {

        const a = [];

        for (let i = 0; i < 25; i++) {

            const entity = entities.find(e => {
                return e.x === i && e.y === row
            });

            const classMap = {
                mod: "max-w-full max-h-full w-full h-full m-0 bg-orange-500 box-border",
                racking: "w-full h-full m-0 bg-orange-900 box-border",
                hotspot: "w-5 h-5 m-2.5 rounded-full bg-red-500",
            };

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
                            className={myClass}
                        >
                            {entity?.type === "mod" ? 
                            `${entity.skus.length}/5` : 
                            null}
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
            </div>
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
                    onClick={handleNewMod}
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