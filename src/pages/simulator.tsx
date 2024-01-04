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

        // Make the DIV element draggable:
        for (const child of div.children) {

            if (child.nodeName?.toLowerCase() === "div") {
                dragElement(child as HTMLDivElement);
            }
        }

        function dragElement(elmnt: HTMLDivElement) {
            var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            elmnt.onmousedown = dragMouseDown;

            function dragMouseDown(e: MouseEvent) {
                e.preventDefault();
                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }

            function elementDrag(e: MouseEvent) {
                e.preventDefault();
                // calculate the new cursor position:
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                // set the element's new position:
                elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
                elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
            }

            function closeDragElement() {
                // stop moving when mouse button is released:
                document.onmouseup = null;
                document.onmousemove = null;
            }
        }
    }, [state]);

    return (
        <div>
            <div ref={divRef} className="bg-gray-400 w-screen h-screen">

            </div>
            <button onClick={buttonHandler}>Create Entity</button>
        </div>
    );
}