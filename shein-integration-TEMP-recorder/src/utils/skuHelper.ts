import itemsConfig from "@/itemsConfig.json";
import { type SwitchOption } from "@/store/store";
import { prependBaseToUrl } from "./url";

export type SKUKeys = keyof typeof ModelNameBySKU;

export const NativeARExperienceTypeNames = {
    cushion: "cushion"
} as const;

export const BodyExperienceTypeNames = {
    clothes: "clothes",
    bag: "bag",
    shoulderbag: "shoulderbag"
} as const;

export const FaceExperienceTypeNames = {
    hat: "hat",
    glasses: "glasses",
    earmuffs: "earmuffs",
    headbands: "headbands",
    earrings: "earrings",
    hairclips: "hairclips"
} as const;

export const ExperienceTypeNames = {
    ...BodyExperienceTypeNames,
    ...FaceExperienceTypeNames,
    ...NativeARExperienceTypeNames
} as const;
type ExperienceType = keyof typeof ExperienceTypeNames;

// TODO: for developers to understand which sku belongs to which model
export enum ModelNameBySKU {
    I24wbvokdezb = "Women_Fashion_Glasses",
    I54wbn8j9dtx = "Pink_Plush_Fisherman_Hat",
    I74w9sfky3yx = "Women_Earmuffs",
    I3jkod0mtl7o = "Headband",
    I3jkx2cfgb25 = "Earring_Sets",
    I3jmo4x3ucxr = "Hairclips",
    I917ahyltmtz = "Hairclips_fur",
    I437t0h4j81a = "Plus_Size_Sweaters_1XL",
    I13ed01uvbvb = "Women_Twopiece_Outfits_M",
    I1ogpw7yzzr9 = "Christmas_Style_Heart_Bear_Earrings",
    I24y0yrkqis2 = "Women_Satchels",
    I64w9oo7dsww = "scarf"
}
export const skuTypeMap: Record<string, ExperienceType> = {
    I937t4xx2lwj: ExperienceTypeNames.clothes,
    I937t4xx5av0: ExperienceTypeNames.clothes,
    I937t4xx7ibf: ExperienceTypeNames.clothes,
    I937t4xxa5m0: ExperienceTypeNames.clothes,
    I139kas0mty2: ExperienceTypeNames.clothes,
    I139kas0pmya: ExperienceTypeNames.clothes,
    I139kas0slq1: ExperienceTypeNames.clothes,
    I139kas0vicu: ExperienceTypeNames.clothes,
    I139kas0zew0: ExperienceTypeNames.clothes,
    I139kas121fm: ExperienceTypeNames.clothes,
    I13ed01v53mr: ExperienceTypeNames.clothes,
    I13ed01uq3wu: ExperienceTypeNames.clothes,
    I13ed01us9yj: ExperienceTypeNames.clothes,
    I13ed01uvbvb: ExperienceTypeNames.clothes,
    I13ed01uxj66: ExperienceTypeNames.clothes,
    I13ed01v0odc: ExperienceTypeNames.clothes,
    I13ed01v34uj: ExperienceTypeNames.clothes,
    I03cwz99ejmv: ExperienceTypeNames.clothes,
    I03cwz98znrb: ExperienceTypeNames.clothes,
    I03cwz992bsd: ExperienceTypeNames.clothes,
    I03cwz994vtc: ExperienceTypeNames.clothes,
    I03cwz996v2x: ExperienceTypeNames.clothes,
    I03cwz9997nv: ExperienceTypeNames.clothes,
    I03cwz99c171: ExperienceTypeNames.clothes,
    I337t06uuz4d: ExperienceTypeNames.clothes,
    I337t06ui8ak: ExperienceTypeNames.clothes,
    I337t06ukjk7: ExperienceTypeNames.clothes,
    I337t06umtzi: ExperienceTypeNames.clothes,
    I337t06upfmy: ExperienceTypeNames.clothes,
    I337t06urdjm: ExperienceTypeNames.clothes,
    I337t06utf5t: ExperienceTypeNames.clothes,
    I639kem909be: ExperienceTypeNames.clothes,
    I639kem8opy0: ExperienceTypeNames.clothes,
    I639kem8qmo1: ExperienceTypeNames.clothes,
    I639kem8snqy: ExperienceTypeNames.clothes,
    I639kem8uh1b: ExperienceTypeNames.clothes,
    I639kem8wfco: ExperienceTypeNames.clothes,
    I639kem8ydt2: ExperienceTypeNames.clothes,
    I33cwzt7n5jz: ExperienceTypeNames.clothes,
    I33cwzt79zoa: ExperienceTypeNames.clothes,
    I33cwzt7c1sy: ExperienceTypeNames.clothes,
    I33cwzt7egcy: ExperienceTypeNames.clothes,
    I33cwzt7gh1y: ExperienceTypeNames.clothes,
    I33cwzt7im2g: ExperienceTypeNames.clothes,
    I33cwzt7kl68: ExperienceTypeNames.clothes,
    I23a9nfmi5j0: ExperienceTypeNames.clothes,
    I23a9nfmkx7o: ExperienceTypeNames.clothes,
    I23a9nfmo3c7: ExperienceTypeNames.clothes,
    I23a9nfms6hg: ExperienceTypeNames.clothes,
    I23a9nfmvpuh: ExperienceTypeNames.clothes,
    I23a9nfmy7qu: ExperienceTypeNames.clothes,
    I73cmkcqwuzq: ExperienceTypeNames.clothes,
    I73cmkcqz0hu: ExperienceTypeNames.clothes,
    I73cmkcr156y: ExperienceTypeNames.clothes,
    I73cmkcr3cew: ExperienceTypeNames.clothes,
    I73cmkcr5jul: ExperienceTypeNames.clothes,
    I73cmkcr7qch: ExperienceTypeNames.clothes,
    I437t0h4hm6n: ExperienceTypeNames.clothes,
    I437t0h4j81a: ExperienceTypeNames.clothes,
    I437t0h4kth3: ExperienceTypeNames.clothes,
    I437t0h4memf: ExperienceTypeNames.clothes,
    I437t0h4o22x: ExperienceTypeNames.clothes,
    I437t0h4ptqr: ExperienceTypeNames.clothes,
    I73cmj24mdey: ExperienceTypeNames.clothes,
    I73cmj24om0v: ExperienceTypeNames.clothes,
    I73cmj24qoie: ExperienceTypeNames.clothes,
    I73cmj24srti: ExperienceTypeNames.clothes,
    I73cmj24v0zj: ExperienceTypeNames.clothes,
    I73cmj24x8sw: ExperienceTypeNames.clothes,
    I42vyhh8r8jy: ExperienceTypeNames.clothes,
    I42vyhh8tfy2: ExperienceTypeNames.clothes,
    I42vyhh8vdji: ExperienceTypeNames.clothes,
    I42vyhh8x8sf: ExperienceTypeNames.clothes,
    I42vyhh8zejg: ExperienceTypeNames.clothes,
    I42vyhh910n3: ExperienceTypeNames.clothes,
    I630r5dvqbcx: ExperienceTypeNames.clothes,
    I630r5dvsbvk: ExperienceTypeNames.clothes,
    I630r5dvu5fk: ExperienceTypeNames.clothes,
    I630r5dvvszx: ExperienceTypeNames.clothes,
    I630r5dvxpr2: ExperienceTypeNames.clothes,
    I630r5dvzusv: ExperienceTypeNames.clothes,
    I630r5dw1u3b: ExperienceTypeNames.clothes,
    I630r5dw3y0o: ExperienceTypeNames.clothes,
    I630r5dw6tc0: ExperienceTypeNames.clothes,
    I43cmi8ij869: ExperienceTypeNames.clothes,
    I43cmi8il71w: ExperienceTypeNames.clothes,
    I43cmi8imevg: ExperienceTypeNames.clothes,
    I43cmi8inuto: ExperienceTypeNames.clothes,
    I43cmi8ipc56: ExperienceTypeNames.clothes,
    I43cmi8irgcf: ExperienceTypeNames.clothes,
    I43cmi8isy1s: ExperienceTypeNames.clothes,
    I43cmi8iuiny: ExperienceTypeNames.clothes,
    I43cmi8ivy9h: ExperienceTypeNames.clothes,
    I03cwzergjeo: ExperienceTypeNames.clothes,
    I03cwzeril0y: ExperienceTypeNames.clothes,
    I03cwzerko7i: ExperienceTypeNames.clothes,
    I03cwzermoyd: ExperienceTypeNames.clothes,
    I03cwzerpcj6: ExperienceTypeNames.clothes,
    I03cwzerrfs0: ExperienceTypeNames.clothes,
    I03cwzertvtg: ExperienceTypeNames.clothes,
    I43a9rajlke6: ExperienceTypeNames.clothes,
    I43a9rajpemm: ExperienceTypeNames.clothes,
    I43a9rajrwbv: ExperienceTypeNames.clothes,
    I43a9rajtvza: ExperienceTypeNames.clothes,
    I43a9rajw0u9: ExperienceTypeNames.clothes,
    I43a9rak08gk: ExperienceTypeNames.clothes,
    I43a9rak3c32: ExperienceTypeNames.clothes,
    I93cwlz9azay: ExperienceTypeNames.clothes,
    I93cwlz9cuod: ExperienceTypeNames.clothes,
    I93cwlz9ep74: ExperienceTypeNames.clothes,
    I93cwlz9gfcn: ExperienceTypeNames.clothes,
    I93cwlz9icau: ExperienceTypeNames.clothes,
    I93cwlz9lx71: ExperienceTypeNames.clothes,
    I93cwlz9nx2v: ExperienceTypeNames.clothes,
    I42v1l3ropxn: ExperienceTypeNames.clothes,
    I42v1l3rftv1: ExperienceTypeNames.clothes,
    I42v1l3rhsnm: ExperienceTypeNames.clothes,
    I42v1l3rjqzb: ExperienceTypeNames.clothes,
    I42v1l3rluvt: ExperienceTypeNames.clothes,
    I93a9ns0mcqw: ExperienceTypeNames.clothes,
    I93a9ns0clhi: ExperienceTypeNames.clothes,
    I93a9ns0f5f6: ExperienceTypeNames.clothes,
    I93a9ns0hqrb: ExperienceTypeNames.clothes,
    I93a9ns0jz94: ExperienceTypeNames.clothes,
    I138p7ebxejv: ExperienceTypeNames.clothes,
    I138p7ec04i9: ExperienceTypeNames.clothes,
    I138p7ec24ry: ExperienceTypeNames.clothes,
    I138p7ec4mos: ExperienceTypeNames.clothes,
    I138p7ec9tif: ExperienceTypeNames.clothes,
    I138p7eccpeg: ExperienceTypeNames.clothes,
    I138p7ecmghk: ExperienceTypeNames.clothes,
    I23cx37383ze: ExperienceTypeNames.clothes,
    I23cx3739qjf: ExperienceTypeNames.clothes,
    I23cx373etv6: ExperienceTypeNames.clothes,
    I23cx373gi4x: ExperienceTypeNames.clothes,
    I23cx373i9i1: ExperienceTypeNames.clothes,
    I037t3qzyp7y: ExperienceTypeNames.clothes,
    I037t3qzqt90: ExperienceTypeNames.clothes,
    I037t3qzsr1q: ExperienceTypeNames.clothes,
    I037t3qzumef: ExperienceTypeNames.clothes,
    I037t3qzwmai: ExperienceTypeNames.clothes,
    I64w9oo7dsww: ExperienceTypeNames.clothes,
    I23cx373bdaz: ExperienceTypeNames.clothes,
    I23cx373cwao: ExperienceTypeNames.clothes,
    I74w9sfky3yx: ExperienceTypeNames.earmuffs,
    I54wbn8j9dtx: ExperienceTypeNames.hat,
    I24wbvokdezb: ExperienceTypeNames.glasses,
    I24x1j7ffe1e: ExperienceTypeNames.shoulderbag,
    I74x1sodwcnx: ExperienceTypeNames.shoulderbag,
    I24y0yrkqis2: ExperienceTypeNames.bag,
    I1ogpw7yzzr9: ExperienceTypeNames.earrings,
    I3jkx2cfgb25: ExperienceTypeNames.earrings,
    I917ahyltmtz: ExperienceTypeNames.hairclips,
    I3jmo4x3ucxr: ExperienceTypeNames.hairclips,
    I3jkod0mtl7o: ExperienceTypeNames.headbands,
    I4s3v8xrtni: ExperienceTypeNames.headbands,
    I6rmjogs3tx: ExperienceTypeNames.cushion,
    I64xyuqldx3m: ExperienceTypeNames.cushion,
    I04xyv16xr48: ExperienceTypeNames.cushion,
    I04xyvowmrme: ExperienceTypeNames.cushion
};

export type ImplementedSkus = keyof typeof skuTypeMap;

export const getModelNameBySKU = (sku: SKUKeys, index?: number): string => {
    return index ? `${sku}_${index}` : sku;
};

export const getSKUUrl = (sku: SKUKeys, index?: number): string => prependBaseToUrl(`models/${getModelNameBySKU(sku, index)}.glb`);

export const SwiperOptionsConfig: Record<string, SwitchOption[]> = {
    I3jkod0mtl7o: [itemsConfig.I3jkod0mtl7o, itemsConfig.I3jkod0mtl7o_1],
    I3jmo4x3ucxr: [itemsConfig.I3jmo4x3ucxr, itemsConfig.I3jmo4x3ucxr_1, itemsConfig.I3jmo4x3ucxr_2],
    I1ogpw7yzzr9: [itemsConfig.I1ogpw7yzzr9, itemsConfig.I1ogpw7yzzr9_1],
    I3jkx2cfgb25: [itemsConfig.I3jkx2cfgb25, itemsConfig.I3jkx2cfgb25_1, itemsConfig.I3jkx2cfgb25_2],
    I917ahyltmtz: [itemsConfig.I917ahyltmtz, itemsConfig.I917ahyltmtz_1, itemsConfig.I917ahyltmtz_2, itemsConfig.I917ahyltmtz_3]
};
