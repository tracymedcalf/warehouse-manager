import Link from "next/link";

export default function PickLocationLink({ id, name }: { id: number; name: string }) {
    return (
        <Link
            href={`/picklocation/${id}`}
        >
            {name}
        </Link>
    )
}