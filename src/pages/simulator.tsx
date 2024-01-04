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

    const [entities, setEntities] = useState<Entity[]>([
        { id: uuidv4(), x: 1, y: 1, type: "racking" },
    ]);

    const [selected, setSelected] = useState<Entity | null>(null);

    const handleNewRacking = () => {
        setSelected({
            id: uuidv4(),
            type: "racking",
            x: 0,
            y: 0,
        }); 
    };

    const handleClick = (ev: React.MouseEvent) => {

        if (selected == null) return;

        setSelected(null);
    };

    return (
        <div>
            <div
                onClick={handleClick}
                className="bg-gray-400 w-screen h-screen"
            >

                {entities.map(({ id, x, y }) => {
                    const style = { top: x + "px", left: y + "px" };
                    return (
                        <div
                            key={id}
                            className="bg-orange-500 w-10 h-10"
                            style={style}
                        >

                        </div>
                    );
                })}

            </div>
            <button onClick={handleNewRacking}>New Racking</button>
        </div>
    );
}