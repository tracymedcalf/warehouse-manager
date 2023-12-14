import Link from "next/link";
import { api } from "~/utils/api";

type RowProps = {
    id: number,
    name: string,
    putawayType: string | null,
    numPickLocations: number,
};
const Row = ({ id, name, putawayType, numPickLocations }: RowProps) => {
    return (
        <tr>
            <td><Link href={`/sku/${id}`}>{name}</Link></td>
            <td>{putawayType ?? "None"}</td>
            <td>{numPickLocations}</td>
        </tr>
    );
}
export default function skus() {
    const { data, isLoading } = api.sku.getAll.useQuery();

    if (isLoading) return <div>Loading...</div>;

    return (
        <table className="table-auto">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Putaway Type</th>
                    <th># Pick Locations</th>
                </tr>
            </thead>
            <tbody>
                {data?.map((p) => <Row {...p} />)}
            </tbody>
        </table>
    );
}