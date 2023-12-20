import React from 'react';
import { GetStaticProps } from "next";
import { createSsgHelpers } from "~/helpers/ssgHelper";
import { FieldValues, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from "~/utils/api";
import schema from "~/schemas/pickLocation";
import Layout from '~/components/layout';

const setValueAs = (v: string) => {
    if (v === '') return undefined;
    const n = Number(v);
    return isNaN(n) ? undefined : n;
}

export default
    function SinglePagePickLocation(props: { pickLocationId: number }) {
    const { pickLocationId } = props;

    const { data, isLoading, refetch } = api.pickLocation.getById.useQuery({ pickLocationId });

    if (isLoading) return <div>Loading...</div>;

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema)
    });

    const mutation = api.pickLocation.patch.useMutation()
    const utils = api.useUtils();
    if (mutation.isSuccess) {
        utils.pickLocation.getById.invalidate({ pickLocationId });
    }
    const onSubmit = (data: FieldValues) => {
        mutation.mutate({ id: pickLocationId, data });
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
                    <label>Max Weight</label>
                    <input
                        type="number"
                        placeholder={`${data.maxWeight}`}
                        {...register("maxWeight", { setValueAs })}
                    />
                    <label>Putaway Type</label>
                    <select placeholder={data.putawayType}>
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

    const pickLocationId = parseInt(id);

    if (isNaN(pickLocationId)) throw new Error("Post id must be an integer");

    await ssg.pickLocation.getById.prefetch({ pickLocationId });

    return {
        props: {
            trpcState: ssg.dehydrate(),
            pickLocationId,
        }
    }
}

export const getStaticPaths = () => {
    return { paths: [], fallback: "blocking" };
}