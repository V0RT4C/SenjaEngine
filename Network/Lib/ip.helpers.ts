// export const int2ip = (ipInt : number) : string => {
//     return ( (ipInt>>>24) +'.' + (ipInt>>16 & 255) +'.' + (ipInt>>8 & 255) +'.' + (ipInt & 255) );
// 

// export const ip2int = (ip : string) : number => {
//     return ip.split('.').reduce(function(ipInt, octet) { return (ipInt<<8) + parseInt(octet, 10)}, 0) >>> 0;
// }

export const ip2int = (ip: string) : number => {
    let d = ip.split('.');
    return ((+d[3]) << 24) + ((+d[2]) << 16) + ((+d[1]) << 8) + (+d[0]);
}