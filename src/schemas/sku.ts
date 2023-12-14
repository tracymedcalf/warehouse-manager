import * as z from 'zod';
import { box } from "~/schemas/pickLocation";

const schema = box.extend({
    weight: z.number().optional(),
})
export default schema;