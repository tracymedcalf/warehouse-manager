import { PrismaClient } from "@prisma/client";
import SeedData from "./SeedData.js";
const prisma = new PrismaClient();

async function main() {
    const data = new SeedData();

    for (const p of data.pickLocations) {
        await prisma.pickLocation.create({
            data: p
        });
    }

    for (const s of data.skus) {
        await prisma.sku.create({
            data: s
        })
    }
}

main();