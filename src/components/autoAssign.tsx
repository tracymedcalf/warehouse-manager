import type { inferRouterOutputs } from '@trpc/server';
import Link from 'next/link';
import type { NewAssignment, skuRouter } from '~/server/api/routers/sku';

function SkuComponent({ skuId, skuName }: { skuId: number; skuName: string; }) {
    return (
        <Link href={'/sku/' + skuId}>{skuName}</Link>
    );
}


function SkusCantAssignRow(
    { id, name, reason }: { id: number; name: string; reason: string }
) {
    return (
        <tr>
            <td><SkuComponent skuId={id} skuName={name} /></td>
            <td>{reason}</td>
        </tr>
    );
}

type RouterOutput = inferRouterOutputs<typeof skuRouter>;

type AutoAssignOutput = RouterOutput['autoAssign'];

function AssignmentRow({ skuName, skuId, pickLocationId, pickLocationName }: NewAssignment) {
    return (
        <tr>
            <td><SkuComponent skuName={skuName} skuId={skuId} /></td>
            <td>{pickLocationName}</td>
        </tr>
    )
}

export default function AutoAssign({ data }: { data: AutoAssignOutput }) {
    const { assignments, skusCantAssign } = data;
    return (
        <div>
            <div>
                <table>
                    <thead>
                        <th>SKU Name</th>
                        <th>Pick Location</th>
                    </thead>
                    <tbody>
                        {assignments.map(a => <AssignmentRow {...a} />)}
                    </tbody>
                </table>
            </div>
            <div>
                <table>
                    <thead>
                        <th>SKU Name</th>
                        <th>Reason</th>
                    </thead>
                    <tbody>
                        {skusCantAssign.map(s => <SkusCantAssignRow {...s} />)}
                    </tbody>
                </table>
            </div>
        </div>
    );
}