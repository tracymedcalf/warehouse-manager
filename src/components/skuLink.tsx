import Link from "next/link";

export default function SkuLink({ id, name }: { id: number; name: string }) {
    return (
        <Link href={'/sku/' + id}>{name}</Link>
    );
}