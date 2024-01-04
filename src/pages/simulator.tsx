import GridLayout from "react-grid-layout";


export default function Simulator() {
    const cols = 13;
    const width= 1300;
    const cellSize = width / cols;
    const style = {
        "height": "100vh",
        "backgroundImage": "repeating-linear-gradient(#ccc 0 1px, transparent 1px 100%),repeating-linear-gradient(90deg, #ccc 0 1px, transparent 1px 100%)",
        "backgroundSize": `${cellSize}px ${cellSize}px`
    };
    const layout = [
        { i: "a", x: 0, y: 0, w: 1, h: 1 },
        { i: "b", x: 1, y: 0, w: 1, h: 1 },
        { i: "c", x: 4, y: 4, w: 1, h: 1 }
    ];

    return (
        <div className="h-screen">
            <GridLayout
                className="layout h-screen w-full"
                margin={[0, 0]}
                layout={layout}
                cols={cols}
                rowHeight={cellSize}
                width={width}
                style={style}
            >
                <div className="bg-orange-500 m-0" key="a">a</div>
                <div className="bg-orange-500 m-0" key="b">b</div>
                <div className="bg-orange-500 m-0" key="c">c</div>
            </GridLayout>
        </div>
    );
}