import React from 'react';
import { GetStaticProps } from "next";
import { createSsgHelpers } from "~/helpers/ssgHelper";
import { FieldValues, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from "~/utils/api";
import schema from "~/schemas/sku";
import { setValueAs } from "~/helpers/setValueAs";
import Link from 'next/link';
import Layout from '~/components/layout';

type PickLocation = {
    name: string;
    id: number;
    putawayType: string;
};

function Row({ id, name, putawayType }: PickLocation) {
    return (
        <tr>
            <td><Link href={`/picklocation/${id}`}>{name}</Link></td>
        </tr>
    )
}
function AssignedPickLocations({ pickLocations }: { pickLocations: PickLocation[] }) {
    return (
        <table className="table-auto">
            <thead>
                <th>Name</th>
                <th>Putaway Type</th>
            </thead>
            <tbody>
                {pickLocations.map(p => <Row {...p}></Row>)}
            </tbody>
        </table>
    )
}
export default
    function SinglePagesku(props: { skuId: number }) {
    const { skuId } = props;

    const { data, isLoading, refetch } = api.sku.getById.useQuery({ skuId });

    if (isLoading) return <div>Loading...</div>;

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema)
    });

    const mutation = api.sku.patch.useMutation()
    const utils = api.useUtils();
    if (mutation.isSuccess) {
        void utils.sku.getById.invalidate({ skuId });
    }
    const onSubmit = (data: FieldValues) => {
        mutation.mutate({ id: skuId, data });
        reset();
    }
    console.log("errors", errors);
    if (data == null) {
        return <p>404 Not Found</p>;
    }
    return (
        <Layout>
        <div>
            <div className="sm:px-6 px-2 py-4">
                <h1 className="text-4xl">{data.name}</h1>
            </div>
            <form
                className="gap-y-4 grid grid-cols-1 sm:px-6 px-2"
                onSubmit={handleSubmit(onSubmit)}
            >
                <label>Width</label>
                <input
                    type="number"
                    placeholder={`${data.width}`}
                    {...register("width", { setValueAs })}
                />
                <label>Length</label>
                <input
                    type="number"
                    placeholder={`${data.length}`}
                    {...register("length", { setValueAs })}
                />
                <label>Height</label>
                <input
                    type="number"
                    placeholder={`${data.height}`}
                    {...register("height", { setValueAs })}
                />
                <label>Weight</label>
                <input
                    type="number"
                    placeholder={`${data.weight}`}
                    {...register("weight", { setValueAs })}
                />
                <label>Putaway Type</label>
                <select placeholder={data.putawayType ?? "None"}>
                    {data.putawayTypes.map(p => <option value={p}>{p}</option>)}
                </select>
                <input
                    className="border-2 max-w-xs border-white hover:bg-slate-500"
                    disabled={mutation.isLoading}
                    type="submit"
                />
                {mutation.error && <p>Something went wrong!</p>}
            </form>
        </div>
        </Layout>
    );
}

export const getStaticProps: GetStaticProps = async (context) => {

  const ssg = createSsgHelpers();

  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("No id");
  
  const skuId = parseInt(id);
  
  if (isNaN(skuId)) throw new Error("Post id must be an integer");

  await ssg.sku.getById.prefetch({ skuId });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      skuId,
    }
  }
}

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
}