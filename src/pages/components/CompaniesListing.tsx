import React, { useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom';
import Company from '../../models/Company';
import { GetCompaniesAsync } from '../../services/DataService';
import HandleError from '../../services/ErrorHandler';
import { getFreshUrl, getQueryData, QueryData } from '../../services/QueryHelper';
import CompanyItem from './CompanyItem';
import LoadingComponent from './LoadingComponent';


export default function CompaniesListing(){
    const [companies, setCompanies] = useState<Company[]|null>(null);
    const history = useHistory();
  
    const queryDataRef = useRef<QueryData>(getQueryData());
    const [queryData, setQeuryData] = useState<QueryData>(queryDataRef.current);
    
    useEffect(()=> { history.push(getFreshUrl(queryData)); }, [queryData, history]);

    useEffect(()=>{
        if(companies === null){
            (async () => {
                try {
                    setCompanies(await GetCompaniesAsync());
                } catch(ex){
                    HandleError(ex);
                }
            })();
        }
    }, [companies]);

    if(companies === null){
        return <LoadingComponent loadingText="იტვირთება კომპანიები..."/>;
    }

    const isCompanyOpenChanged = (companyKey:string, isOpen:boolean) => {
        setQeuryData(x=> ({...x, openedCompanyKeys: isOpen ? Array.from(new Set([...x.openedCompanyKeys, companyKey])): x.openedCompanyKeys.filter(c=>c!== companyKey)}));
    }

    return <>
        {companies.map(x=><CompanyItem company={x} key={x.key} isOpen={queryDataRef.current.openedCompanyKeys.some(c=>c === x.key)} isOpenChanged={isCompanyOpenChanged}/>)}
    </>
}