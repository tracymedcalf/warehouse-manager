import SkuLink from './skuLink';
import type { NewAssignment } from "~/utils/suggestAssignments";
import type { inferRouterOutputs } from '@trpc/server';
import type { skuRouter } from '~/server/api/routers/sku';

function SkusCantAssignRow(
    { id, name, reason }: { id: number; name: string; reason: string }
) {
    return (
        <tr>
            <td><SkuLink id={id} name={name} /></td>
            <td>{reason}</td>
        </tr>
    );
}

type RouterOutput = inferRouterOutputs<typeof skuRouter>;

type AutoAssignOutput = RouterOutput['autoAssign'];

function AssignmentRow({ skuName, skuId, pickLocationId, pickLocationName }: NewAssignment) {
    return (
        <tr>
            <td><SkuLink id={skuId} name={skuName} /></td>
            <td>{pickLocationName}</td>
        </tr>
    )
}

export default function AutoAssign({ data }: { data: AutoAssignOutput }) {
    console.log("data ", data);
    const { assignments, skusCantAssign } = data;
    return (
        <div>
            <div>
                <table>
                    <thead>
                        <tr>
                            <th>SKU Name</th>
                            <th>Pick Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assignments.map(a => <AssignmentRow {...a} />)}
                    </tbody>
                </table>
            </div>
            <div>
                <table>
                    <thead>
                        <tr>
                            <th>SKU Name</th>
                            <th>Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        {skusCantAssign.map(s => <SkusCantAssignRow {...s} />)}
                    </tbody>
                </table>
            </div>
        </div>
    );
}