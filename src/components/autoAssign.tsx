import type { inferRouterOutputs } from '@trpc/server';
import Link from 'next/link';
import type { skuRouter } from '~/server/api/routers/sku';
import { NO_PUTAWAY_TYPE } from '~/constants';

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

export default function AutoAssign({ data }: { data: AutoAssignOutput }) {
    const { assignments, skusCantAssign } = data;
    return (
        <div>
            <div>
                {assignments.map(a => <SkuComponent skuId={a.skuId} skuName={a.skuName} />)}
            </div>
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
    );
}