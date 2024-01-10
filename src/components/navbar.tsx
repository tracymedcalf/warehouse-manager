import Link from "next/link";

export default function NavBar() {
    return (
        <div className="my-1">
            <div className="text-xl inline px-2 border-r">
                <Link href="/sku">SKUs</Link>
            </div>
            <div className="text-xl inline px-2 border-r">
                <Link href="/picklocation">Pick Locations</Link>
            </div>
            <div className="text-xl inline px-2">
                <Link href="/simulator">Simulator</Link>
            </div>
        </div>
    )
}