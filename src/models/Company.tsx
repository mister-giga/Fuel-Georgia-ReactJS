import FuelPrice from "./FuelPrice";

export default interface Company{
    key:string,
    name:string,
    color:string,
    fuels:FuelPrice[]
}