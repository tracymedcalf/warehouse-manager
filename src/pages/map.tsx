import { useRef, useEffect, useState } from "react";
import { api } from "~/utils/api";
import NavBar from "~/components/navbar";
import type { inferRouterOutputs } from "@trpc/server";
import { pickLocationRouter } from "~/server/api/routers/pickLocation";
import type { physicalLocationRouter } from "~/server/api/routers/physicalLocation";
import type { skuRouter } from "~/server/api/routers/sku";
import { useImmer } from "use-immer";
import { Canvas } from "@react-three/fiber";
import { MapControls } from "@react-three/drei";

type PhysicalLocation = Omit<inferRouterOutputs<typeof physicalLocationRouter>['getAll'][0], 'id'>;
type PickLocationsWithoutPhysical = inferRouterOutputs<typeof pickLocationRouter>['getAllWithoutPhysical'];
type Sku = inferRouterOutputs<typeof skuRouter>['orderedByHits'][0];

export default function Map() {

    const [skuState, setSkuState] = useState<Sku[]>();

    api.sku.orderedByHits.useQuery(undefined, {
        onSuccess: (data) => {
            setSkuState(data);
        },
    });

    const mutation = api.sku.autoAssign.useMutation();

    const [gridState, setGridState] = useImmer<PhysicalLocation[]>([]);

    const physicalLocationQueryResult = api.physicalLocation.getAll.useQuery(undefined, {
        onSuccess: (data) => {
            setGridState(data);
        }
    });

    const gridData = physicalLocationQueryResult.data;
    const gridIsLoading = physicalLocationQueryResult.isLoading;

    const [selected, setSelected] = useState<PhysicalLocation['type'] | null>(null);

    const [pickLocationState, setPickLocationState]
        = useState<PickLocationsWithoutPhysical>();

    api.pickLocation.getAllWithoutPhysical.useQuery(undefined, {
        onSuccess: (data) => {
            setPickLocationState(data);
        }
    });

    const handleNew = (type: PhysicalLocation['type']) => {
        setSelected(type);
    };

    const handleClick = (x: number, y: number) => {

        if (selected == null) return;

        // need to place the `selected` on the map
        setGridState(draft => {
            draft?.push({
                x,
                y,
                type: selected,
                PickLocation: [],
                putawayType: null,
            });
        });

        setSelected(null);
    };

    const handleClearAll = () => {
        setGridState([]);
    };

    const handleAutoAssign = () => {
        if (skuState == null || skuState.length === 0) {
            return;
        }
        mutation.mutate([skuState[0].id]);
        setSkuState(skuState.slice(1));
    };

    const physicalLocationMutation = api.physicalLocation.post.useMutation();

    const handleSave = () => {

        if (gridState == null) return;
        console.log(gridState);
        physicalLocationMutation.mutate(gridState);
    };

    const Grid = () => {

        if (gridIsLoading) {
            return <div>Loading...</div>
        }

        const width = window.innerWidth * .7;
        const height = window.innerHeight * .7;

        return (
            <Simulation
                locations={gridState}
                width={width}
                height={height}
            />
        );
    };

    return (
        <div>
            <NavBar />
            <div className="h-screen">
                <div className="h-3/4">
                    <div className="h-full inline-block w-3/4">
                        <Grid />
                    </div>
                    <div className="inline-block h-full w-1/4">
                        {skuState == null ? "Loading" : <SkusTable skus={skuState} />}
                        {pickLocationState == null ? "Loading" : <PickLocationsTable pickLocations={pickLocationState} />}
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
                        onClick={() => handleNew("hotspot")}
                    >
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
                        disabled={skuState == null}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        onClick={handleAutoAssign}
                    >
                        Auto-Assign
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
type SimulationProps = { locations: PhysicalLocation[], width: number, height: number };
function Simulation(props: SimulationProps) {

    const shelves = [];
    for (let j = 0; j < 8; j++) {
        shelves.push(
            <mesh position={[0, 9 * j, 0]}>
                <boxGeometry args={[]} />
                <meshPhongMaterial color={0xeeeeee} />
            </mesh>
        );
    }
    
    const WALL_Y = 9 * 8 * .5;

    return (
        <div>
            <Canvas>
                <MapControls />
                <group>
                    <mesh position={[-24, WALL_Y, 0]}>
                        <boxGeometry args={[1, 8 * 9, 24]} />
                        <meshPhongMaterial color={0xeeeeee} />
                    </mesh>
                    <mesh>
                        <boxGeometry args={[24, WALL_Y, 0]} />
                        <meshPhongMaterial color={0xeeeeee} />
                    </mesh>
                    {shelves}
                </group>
            </Canvas>
        </div>
    );
    //    for (const loc of props.locations) {

    //        group.position.x = loc.x
    //        group.position.y = 0;
    //        group.position.z = loc.y
    //        group.updateMatrix();
    //        group.matrixAutoUpdate = false;
    //        scene.add(group);
    //    }


    //    const rectGeometry = new THREE.BoxGeometry(48, 1, 48)

    //    for (let i = 0; i < 10; i++) {
    //        const rectMesh = new THREE.Mesh(rectGeometry, material);

    //        rectMesh.position.set(i * 48, 0, 0);
    //        scene.add(rectMesh);
    //    }

    //    // lights

    //    const dirLight1 = new THREE.DirectionalLight(0xffffff, 3);
    //    dirLight1.position.set(1, 1, 1);
    //    scene.add(dirLight1);

    //    const dirLight2 = new THREE.DirectionalLight(0x002288, 3);
    //    dirLight2.position.set(- 1, - 1, - 1);
    //    scene.add(dirLight2);

    //    const ambientLight = new THREE.AmbientLight(0x555555);
    //    scene.add(ambientLight);

    //    window.addEventListener('resize', () => {
    //        camera.aspect = props.width / props.height;
    //        camera.updateProjectionMatrix();

    //        renderer.setSize(props.width, props.height);
    //    });

    //    const animate = () => {
    //        requestAnimationFrame(animate);
    //        renderer.render(scene, camera);
    //    };

    //    animate();

    //    const raycaster = new THREE.Raycaster();
    //    const pointer = new THREE.Vector2();

    //    const handleClick = (ev: MouseEvent) => {
    //        console.log("click fired")
    //        pointer.x = ev.clientX;
    //        pointer.y = ev.clientY; 
    //        raycaster.setFromCamera(pointer, camera);
    //        const intersected = raycaster.intersectObjects(scene.children, false);

    //        if (intersected.length > 0) {
    //            console.log("clicked something");
    //        }
    //    }

    //    document.addEventListener("click", handleClick);

    //    return () => {
    //        ref.current?.removeChild(renderer.domElement);
    //        renderer.dispose();
    //        renderer.forceContextLoss();
    //        document.removeEventListener("click", handleClick);
    //    }
    //}, [props.locations, props.width, props.height]);

    //return (
    //    <div ref={ref}>
    //    </div>
    //);
}

function SkusTable({ skus }: { skus: Sku[] }) {
    return (
        <div className="bg-scroll overflow-y-auto h-1/2">
            <table className="mr-1">
                <thead>
                    <tr>
                        <th className="text-left" style={{ width: "6rem" }}>SKU</th>
                        <th className="ml-4 text-left w-8">Hits</th>
                    </tr>
                </thead>
                <tbody>
                    {skus?.map(s => {
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
    );
}

function PickLocationsTable({ pickLocations }: { pickLocations: PickLocationsWithoutPhysical }) {
    return (
        <div
            className="bg-scroll overflow-y-auto h-1/2"
        >
            <table className="mr-1">
                <thead>
                    <tr>
                        <th className="text-left">Name</th>
                        <th className="ml-4 text-left w-8">Putaway Type</th>
                    </tr>
                </thead>
                <tbody>
                    {pickLocations.map(p => {
                        return (
                            <tr key={"" + p.id}>
                                <td>{p.name}</td>
                                <td>{p.putawayType}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}