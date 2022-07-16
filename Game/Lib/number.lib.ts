export const isNumber = (value : any) : boolean => {
    return typeof value === 'number';
}

export const isWithinByteBounds = (value : number) : boolean => {
    return value <= 255;
}

export const isLessThan = (value : number, maxValue : number) : boolean => {
    return value < maxValue;
}

export const isLessOrEqual = (value : number, maxValue : number): boolean => {
    return value <= maxValue;
}