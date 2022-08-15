import { IPosition } from "Types";

export const stringifyPosition = (position : IPosition) => {
    return `{ x:${position.x}, y:${position.y}, z:${position.z} }`;
}