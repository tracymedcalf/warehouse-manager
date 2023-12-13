import * as z from 'zod';

const schema = z.object({
    width: z.number().optional(),
    length: z.number().optional(),
    height: z.number().optional(),
    maxWeight: z.number().optional(),
})
export default schema;