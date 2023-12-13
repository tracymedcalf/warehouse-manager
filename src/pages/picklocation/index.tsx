import Link from "next/link";
import { api } from "~/utils/api";

type RowProps = {
    id: number,
    name: string,
    putawayType: string,
    sku?: { name: string, id: number }
};
const Row = ({ id, name, putawayType, sku }: RowProps) => {
    return (
        <tr>
            <td><Link href={`/${id}`}>{name}</Link></td>
            <td>{putawayType}</td>
            {sku == null ? 
                <td></td>
                :
                <td><Link href={`/sku/${sku.id}`}></Link>{sku.name}</td>
            }
        </tr>
    );
}
export default function PickLocations() {
    const { data, isLoading } = api.pickLocation.getAll.useQuery();

    if (isLoading) return <div>Loading...</div>;

    return (
        <table className="table-auto">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Putaway Type</th>
                    <th>Assigned SKU</th>
                </tr>
            </thead>
            <tbody>
                {data?.map((p) => <Row {...p} />)}
            </tbody>
        </table>
    );
}