class Attributes {
    bin = "Bin";
    bn1 = "BN1";
    cf1 = "CF1";
    cartonFlow = "Carton Flow";
    constructor() {
        this.putawayTypes = [this.bin, this.cartonFlow, "Select Rack"];
    }
}

class MaxType {
    box = "Box";
    liquid = "Liquid";
    volume = "Volume";
}

export { MaxType }
export default Attributes;