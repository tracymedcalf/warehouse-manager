import { useRef, useEffect, useState } from "react";

class Entity {
    element: HTMLDivElement;
    constructor() {
        this.element = document.createElement("div");
    }
}

class Racking extends Entity {

    constructor() {
        super();
        this.element.setAttribute(
            "style",
            "background-color: orange; width: 20px; height: 20px;"
        );
    }
}

class Hotspot extends Entity {

    constructor() {
        super();
        this.element.setAttribute(
            "style",
            "background-color: orange;"
        );
    }
}

export default function Simulator() {

    const divRef = useRef<HTMLDivElement>(null);

    const [state, setState] = useState<Entity[]>([]);

    const buttonHandler = () => {
        setState([...state, new Racking()]);
    };

    useEffect(() => {
        const div = divRef.current;
        if (div == null) throw "DIV ref is null";
    }, [state]);

    return (
        <div>
            <div ref={divRef}>

            </div>
            <button onClick={buttonHandler}>Create Entity</button>
        </div>
    );
}


function effect(div: HTMLDivElement) {

}