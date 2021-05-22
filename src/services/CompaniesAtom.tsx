import { atom } from "recoil";
import Company from '../models/Company';

export const CompaniesAtom = atom<Company[]|null>({
    key: "companiesAtom",
    default: null
});
