import { useRef, useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { api } from "~/utils/api";
import NavBar from "~/components/navbar";
import type { inferRouterOutputs } from "@trpc/server";
import type { pickLocationRouter } from "~/server/api/routers/pickLocation";
import type { physicalLocationRouter } from "~/server/api/routers/physicalLocation";
import { useImmer } from "use-immer";
import * as THREE from "three";
import { MapControls } from "three/addons/controls/MapControls.js";

type PhysicalLocation = Omit<inferRouterOutputs<typeof physicalLocationRouter>['getAll'][0], 'id'>;
type PickLocationsWithoutPhysical = inferRouterOutputs<typeof pickLocationRouter>['getAllWithoutPhysical'];


export default function Map() {

    const [state, setState] = useState<typeof data>();

    const { data, isLoading } = api.sku.orderedByHits.useQuery(undefined, {
        onSuccess: (data) => {
            setState(data);
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
        = useState<PickLocationsWithoutPhysical>([]);

    const pickLocationQueryResult = api.pickLocation.getAllWithoutPhysical.useQuery(undefined, {
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
        if (state == null || state.length === 0) {
            return;
        }
        mutation.mutate([state[0].id]);
        setState(state.slice(1));
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

        const array = [];

        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 25; x++) {
                array.push(
                    <div
                        className="absolute bg-gray-900 border border-gray-300 m-0 w-10 h-10"
                        style={{
                            left: `${x * 2.5}rem`,
                            top: `${y * 2.5}rem`,
                        }}
                        onClick={() => handleClick(x, y)}
                    >
                    </div>
                );
            }
        }

        return array;

    };

    return (
        <div>
            <Threed />
            <NavBar />
            <Toaster />
            <div className="flex gap-3 h-100 m-3">
                <div
                    className="bg-scroll flex-grow flex-shrink overflow-scroll relative whitespace-nowrap"
                    style={{ minWidth: "80%" }}
                >
                    <Grid />
                    {gridState?.map(entity =>
                        <EntityComponent entity={entity} />)
                    }
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
                <button
                    onClick={handleSave}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                    Save
                </button>
            </div>
            <div
                className="bg-scroll overflow-y-auto inline-block"
                style={{ height: "10rem" }}
            >
                <table className="mr-1">
                    <thead>
                        <tr>
                            <th className="text-left">Name</th>
                            <th className="ml-4 text-left w-8">Putaway Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pickLocationState.map(p => {
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
        </div>
    );
}

function EntityComponent({ entity }: { entity: PhysicalLocation }) {
    switch (entity.type) {
        case "mod":

            const numFilledPickLocations = entity
                .PickLocation
                .filter(p => p.Inventory.length > 0)
                .length;

            return (
                <div
                    className="absolute bg-orange-500 m-0 w-10 h-10"
                    style={{
                        left: `${entity.x * 2.5}rem`,
                        top: `${entity.y * 2.5}rem`
                    }}
                >
                    {`${numFilledPickLocations}/5`}
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

function Threed() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {

        if (ref.current == null) {
            return;
        }

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xcccccc);
        scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        ref.current.appendChild(renderer.domElement);

        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.set(0, 200, - 400);

        // controls

        const controls = new MapControls(camera, renderer.domElement);

        //controls.addEventListener('change', render); // call this only in static scenes (i.e., if there is no animation loop)

        controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        controls.dampingFactor = 0.05;

        controls.screenSpacePanning = false;

        controls.minDistance = 100;
        controls.maxDistance = 500;

        controls.maxPolarAngle = Math.PI / 2;

        // world

        const geometry = new THREE.BoxGeometry(48, 1, 24);
        const material = new THREE.MeshPhongMaterial({ color: 0xeeeeee, flatShading: true });

        const wallGeometry = new THREE.BoxGeometry(1, 8 * 9, 24);

        const WALL_Y = 9 * 8 * .5;

        for (let i = 0; i < 500; i ++) {
            const group = new THREE.Group();
            const rightWallMesh = new THREE.Mesh(wallGeometry, material);
            rightWallMesh.position.set(-24, WALL_Y, 0);
            group.add(rightWallMesh);
            
            const leftWallMesh = new THREE.Mesh(wallGeometry, material);
            leftWallMesh.position.set(24, WALL_Y, 0);
            group.add(leftWallMesh);

            for (let j = 0; j < 8; j++) {
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(0, 9 * j, 0);
                group.add(mesh);
            }

            group.position.x = Math.random() * 1600 - 800;
            group.position.y = 0;
            group.position.z = Math.random() * 1600 - 800;
            group.updateMatrix();
            group.matrixAutoUpdate = false;
            scene.add(group);
        }

        // lights

        const dirLight1 = new THREE.DirectionalLight(0xffffff, 3);
        dirLight1.position.set(1, 1, 1);
        scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0x002288, 3);
        dirLight2.position.set(- 1, - 1, - 1);
        scene.add(dirLight2);

        const ambientLight = new THREE.AmbientLight(0x555555);
        scene.add(ambientLight);

        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };

        animate();
        //

        //window.addEventListener('resize', onWindowResize);
        return () => {
            ref.current?.removeChild(renderer.domElement);
        }
    }, []);

    return (
        <div ref={ref} style={{backgroundColor: "white"}}>
            Mount something here.
        </div>
    );
}