import { useRef, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";


type Point = {
    id: string
    x: number
    y: number
}

type Hotspot = Point & {
    type: "hotspot"
}

type Mod = Point & {
    type: "mod"
}

type Racking = Point & {
    type: "racking"
}

type Entity = Hotspot | Racking | Mod

export default function Simulator() {

    const [entities, setEntities] = useState<Entity[]>([]);

    const [selected, setSelected] = useState<Entity | null>(null);

    const handleNewRacking = () => {
        setSelected({
            id: uuidv4(),
            type: "racking",
            x: 0,
            y: 0,
        }); 
    };

    const handleClick = (row: number, col: number) => {

        if (selected == null) return;
        setEntities([...entities, {...selected, x: col, y: row }]);
        setSelected(null);
    };

    const Row = ({ row }: { row: number }) => {
        const a = [];
        for (let i = 0; i < 12; i++) {
            a.push(
                <div
                    className="border inline-block m-0 w-10 h-10 border-white-900"
                    onClick={() => handleClick(row, i)}
                >
                </div>
            );
        }
        return a;
    };

    const Grid = () => {
        const a = [];
        for (let i = 0; i < 10; i++) {
            a.push(
                <div className="-mt-8px m-0 p-0">
                    <Row row={i} />
                </div>
            );
        }
        return a;
    };

    return (
        <div style={{ paddingTop: "8px"}}>
            {entities?.map(e => <div className="absolute w-10 h-10 z-10 bg-orange-500"></div>)}
            <Grid />
            <button onClick={handleNewRacking}>Add Racking</button>
        </div>
    );
}
