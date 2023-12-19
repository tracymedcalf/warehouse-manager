import type { 
    PickLocation as DbPickLocation, 
    Sku as DbSku 
} from "@prisma/client";

type Sku = Omit<DbSku, 'id'>;
type PickLocation = Omit<DbPickLocation, 'id'>;
export type { PickLocation, Sku };