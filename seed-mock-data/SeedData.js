import LocationBuilder from "./LocationBuilder.js";
import Attributes, { MaxType } from "./Attributes.js";
import { Prisma } from "@prisma/client";

/**
 * @typedef { import("./types.d.ts").Sku } Sku
 * @typedef { import("./types.d.ts").PickLocation } PickLocation
 */

const { Decimal } = Prisma;
const maxType = new MaxType();
const attributes = new Attributes();

function shuffle(/** @type{any[]} */ arr) {
    return arr
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
}

export default class SeedData {
    /** @type{PickLocation[]} */
    pickLocations;
    /** @type{Sku[]} */
    skus;

    generatePickLocations() {
        const locationBuilder = new LocationBuilder();
        locationBuilder.createPickLocations();
        return locationBuilder.pickLocations;
    }

    generateSkus() {
        /** @type{Sku[]} */
        const data = [
            {
                name: "1001",
                description: "Pot holders",
                maxType: maxType.volume,
                putawayType: attributes.bin,
                width: 4,
                length: 4,
                height: 4,
                weight: 1,
                price: new Decimal(2.5),
                hits: 0.5,
            },
            {
                name: "1002",
                description: "The Amazing Adventures of Zig and Zag: A parable about friendship",
                maxType: maxType.box,
                putawayType: attributes.bin,
                width: 4,
                length: 6,
                height: 1,
                weight: 0.5,
                price: new Decimal(2.5),
                hits: 0.5,
            },
            {
                name: "1003",
                description: "Lipstick",
                maxType: maxType.volume,
                putawayType: attributes.bin,
                width: 2,
                length: 3,
                height: 1,
                weight: 0.2,
                price: new Decimal(2.5),
                hits: 0.5,
            },
            {
                name: "1004",
                description: "Light Wall Plate",
                maxType: maxType.volume,
                putawayType: attributes.bin,
                width: 2.5,
                length: 3,
                height: 0.2,
                weight: 0.1,
                price: new Decimal(2.5),
                hits: 0.5,
            },
            {
                name: "1005",
                description: "Chrome Faucet Handle",
                maxType: maxType.box,
                putawayType: attributes.bin,
                width: 4,
                length: 3,
                height: 4,
                weight: 5,
                price: new Decimal(2.5),
                hits: 1,
            },
            {
                name: "1006",
                description: "Hedge Trimmer",
                maxType: maxType.box,
                putawayType: attributes.cartonFlow,
                width: 9,
                length: 20,
                height: 10,
                weight: 15,
                price: new Decimal(2.5),
                hits: 1,
            },
            {
                name: "1007",
                description: "Water Filter Replacements (3-pack)",
                maxType: maxType.box,
                putawayType: attributes.bin,
                width: 7,
                length: 3,
                height: 5,
                weight: 2,
                price: new Decimal(2.5),
                hits: 1,
            },
            {
                name: "1008",
                description: "Small Pocket Binoculors",
                maxType: maxType.box,
                putawayType: attributes.bin,
                width: 5,
                length: 3,
                height: 2.2,
                weight: 0.6,
                price: new Decimal(2.5),
                hits: 0.5,
            },
        ];

        return [...data, ...this.programmaticallyGenerateSkus()];
    }

    programmaticallyGenerateSkus() {

        /** @type{number[]} */
        const numbers = [];
        let starterNumber = 1001001001;
        for (let i = 0; i < 999999; i += 117) {
            numbers.push(starterNumber + i);
        }
        shuffle(numbers);

        /** @type{number[]} */
        const randomlyPicked = numbers.slice(0, 100);

        const text = [
            "lorem ipsum dolor sit amet", "consectetur adipiscing elit maecenas non", "lacus rutrum semper ante nec", "tincidunt justo cras gravida lorem", "vel egestas sollicitudin proin sed", "est cursus ultrices neque a", "rutrum turpis sed in nisl", "mollis mattis nibh in euismod", "arcu mauris lorem nibh interdum", "quis risus eu ultricies blandit", "est etiam risus massa ornare", "et odio imperdiet facilisis lobortis", "sem nunc rutrum gravida sapien", "eget iaculis nulla semper diam", "erat et gravida orci iaculis", "nec suspendisse nisi eros iaculis", "non ultricies et egestas quis", "justo pellentesque habitant morbi tristique", "senectus et netus et malesuada", "fames ac turpis egestas pellentesque", "iaculis at nunc fermentum egestas", "orci varius natoque penatibus et", "magnis dis parturient montes nascetur", "ridiculus mus aliquam eget tempus", "ipsum ac iaculis enimpellentesque commodo", "odio sit amet tellus malesuada", "sagittis sit amet sed tellus", "pellentesque ultrices tortor eu ante", "laoreet sodales faucibus turpis dignissim", "nam porttitor tortor odio non", "pellentesque dolor ultricies maximus aliquam", "sit amet lorem eu sapien", "accumsan rutrum at eget lacus", "nam vitae lacus tempor euismod", "enim non posuere nibh nunc", "et cursus lectus donec non", "eleifend eros ut consectetur ex", "pellentesque est lacus auctor id", "ligula laoreet commodo iaculis lectus", "phasellus pharetra lorem ac ipsum", "congue ultricesaliquam erat volutpat curabitur", "iaculis diam ut lacinia efficitur", "dolor orci blandit tellus at", "ultricies dui magna eget elit", "cras semper ligula eget neque", "egestas eleifend fringilla libero consectetur", "mauris vitae magna vitae nibh", "mattis maximus quis eget tortor", "sed dictum diam at eros", "faucibus tincidunt aliquam commodo augue", "in molestie ultricies vivamus ultrices", "sapien dolor eu semper lacus", "porttitor vel suspendisse potentimorbi libero", "magna laoreet sed viverra at", "aliquet non ante vestibulum ante", "ipsum primis in faucibus orci", "luctus et ultrices posuere cubilia", "suspendisse quam dui porttitor et", "purus sit amet fermentum convallis", "sapien curabitur consequat arcu a", "commodo congue neque diam molestie", "sapien sit amet gravida mi", "nisi sed nisi phasellus eu", "fringilla eros eu aliquam nisl", "quisque in magna venenatis cursus", "eros sed ultricies leo sed", "tempor nisl leo morbi lacus", "nunc viverra nec pulvinar a", "efficitur nec sem donec gravida", "luctus nisl et dapibus vestibulum", "ante ipsum primis in faucibus", "orci luctus et ultrices posuere", "nunc eros diam faucibus a", "diam vitae dictum venenatis elit", "donec eu pellentesque sapien sit", "amet sodales elit proin nec", "lacus duifusce eget mi id", "leo volutpat suscipit a quis", "ipsum etiam nibh augue fermentum", "dictum iaculis quis aliquet vel", "lectus curabitur mattis tempor consequat", "nam molestie accumsan neque id", "aliquet mauris et efficitur dolor", "nunc porttitor odio ac pellentesque", "elementum vivamus congue turpis ac", "ex aliquet id feugiat ligula", "accumsan quisque vel imperdiet augue", "cras non odio vel dui", "elementum aliquet vitae et est", "donec neque tortor commodo sed", "ornare eget mollis id purus", "cras imperdiet ex velit at", "sodales erat molestie necvestibulum ante", "ipsum primis in faucibus orci", "luctus et ultrices posuere cubilia", "nulla et nulla facilisis neque", "posuere hendrerit morbi tempor tempor", "diam sed molestie semper ante"
        ];

        let putawayTypesIndex = 0;
        let textIndex = 0;
        const data = [];
        for (const number of randomlyPicked) {
            const putawayType = attributes.putawayTypes[
                putawayTypesIndex % attributes.putawayTypes.length
            ];

            data.push({
                name: number + "",
                maxType: maxType.volume,
                putawayType: putawayType ?? null,
                description: text[textIndex % text.length] ?? "",
                width: 1,
                length: 1,
                height: 1,
                weight: 1,
                price: new Decimal(2.5),

                // randomly generate a number between 1 and 5
                hits: Math.trunc(100 * Math.random() ** 3) / 10
            });
            putawayTypesIndex++;
            textIndex++;
        }
        return data;
    }
    constructor() {
        this.skus = this.generateSkus();
        this.pickLocations = this.generatePickLocations();
    }
}