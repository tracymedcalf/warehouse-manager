import { useRef, useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { api } from "~/utils/api";
import type { skuRouter } from "~/server/api/routers/sku";
import type { inferRouterOutputs } from "@trpc/server";
import { useImmer } from "use-immer";

type Hotspot = {
    type: "hotspot"
}

type Mod = {
    capacity: number
    skus: inferRouterOutputs<typeof skuRouter>["orderedByHits"]
    type: "mod"
}

type Racking = {
    type: "racking"
}

type Entity = Hotspot | Racking | Mod

function Mod(): Mod {
    return {
        type: "mod",
        skus: [],
        capacity: 5,
    };
}

function gridForEach<T>(grid: T[][], f: (x: number, y: number, cell: T) => void) {

    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            f(x, y, grid[y][x]);
        }
    }
}

function manhattanDistance(x1: number, y1: number, x2: number, y2: number) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function createGridArray(): (null | Entity)[][] {

    return [
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, Mod(), { type: "hotspot" }, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
    ];
}

export default function Map() {

    const [state, setState] = useState<typeof data>();

    const { data, isLoading } = api.sku.orderedByHits.useQuery(undefined, {
        onSuccess: (data) => {
            setState(data);
        },
    });

    const [selected, setSelected] = useState<Entity | null>(null);

    const [gridState, setGridState] = useImmer(createGridArray());

    const handleNew = (type: "hotspot" | "racking") => {
        setSelected({ type });
    };

    const handleNewMod = () => {
        setSelected({
            type: "mod",
            skus: [],
            capacity: 5,
        });
    }

    const handleClick = (x: number, y: number) => {

        if (selected == null) return;

        setGridState(draft => {
            draft[y][x] = selected;
        });

        setSelected(null);
    };

    const handleClearAll = () => {
        setGridState(draft => {
            for (let i = 0; i < draft.length; i++) {
                for (let j = 0; j < draft[i].length; j++) {
                    draft[i][j] = null;
                }
            }
        });
    };

    const handleAutoAssign = () => {
        if (state == null) return;

        const hotspots: [number, number][] = [];

        gridForEach(gridState, (x, y, cell) => {
            if (cell?.type === "hotspot") {
                hotspots.push([x, y]);
            }
        });

        setGridState(draft => {
            let minDistance = Infinity;
            let chosen: undefined | Mod;

            gridForEach(draft, (x1, y1, cell) => {

                if (cell?.type !== "mod") return;
                if (cell.skus.length >= cell.capacity) return;

                for (const [x2, y2] of hotspots) {
                    
                    const distance = manhattanDistance(x1, y1, x2, y2);

                    if (distance < minDistance) {
                        minDistance = distance;
                        chosen = cell;
                    }
                }
            });

            const [first, ...rest] = state;
            chosen?.skus.push(first);
            setState(rest);
        });
    };

    const Grid = () => {
        const array = [];
        
        // I always see row-major being used in computing, so that's what
        // we're gonna use
        for (let y = 0; y < gridState.length; y++) {
            for (let x = 0; x < gridState[y].length; x++) {

                const entity = gridState[y][x];

                array.push(
                    <div
                        className="absolute bg-gray-900 border border-gray-300 m-0 w-10 h-10"
                        style={{
                            left: `${x * 2.5}rem`,
                            top: `${y * 2.5}rem`,
                        }}
                        onClick={() => handleClick(x, y)}
                    >
                        {entity != null ?
                            <EntityComponent entity={entity} /> :
                            null}
                    </div>
                );
            }
        }

        return array;
    };

    return (
        <div>
            <Toaster />
            <div className="flex gap-3 h-100 m-3">
                <div
                    className="bg-scroll flex-grow flex-shrink overflow-scroll relative whitespace-nowrap"
                    style={{ minWidth: "80%" }}
                >
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

function EntityComponent({ entity }: { entity: Entity }) {
    switch (entity.type) {
        case "mod":
            return (
                <div className="bg-orange-500 h-full w-full text-center">
                    {`${entity.skus.length}/${entity.capacity}`}
                </div>
            );
        case "racking":
            return <div className="bg-orange-900 h-full w-full"></div>
        case "hotspot":
            return (
                <div className="w-5 h-5 m-2.5 rounded-full bg-red-500"></div>
            );
    }
}