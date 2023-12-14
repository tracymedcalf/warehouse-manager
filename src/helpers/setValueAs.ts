export const setValueAs = (v: string) => {
    if (v === '') return undefined;
    const n = Number(v);
    return isNaN(n) ? undefined : n;
}