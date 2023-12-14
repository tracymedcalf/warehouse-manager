import * as z from 'zod';
const box = z.object({
    width: z.number().optional(),
    length: z.number().optional(),
    height: z.number().optional(),
    putawayType: z.string().optional(),
});
export { box };
const schema = box.extend({
    maxWeight: z.number().optional(),
})
export default schema;