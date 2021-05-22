import React, { useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import Company from '../../models/Company';
import { GetCompaniesAsync } from '../../services/DataService';
import HandleError from '../../services/ErrorHandler';
import { getFreshUrl, queryDataState } from '../../services/QueryHelper';
import CompanyItem from './CompanyItem';
import LoadingComponent from './LoadingComponent';
import ChartComponent from './ChartComponent'



export default function CompaniesListing(){
    const [companies, setCompanies] = useState<Company[]|null>(null);
    const history = useHistory();
  
    const queryData = useRecoilValue(queryDataState);    
    const lastSetUrlRef = useRef<string|null>(null);
    
    useEffect(()=> {
        const newUrl = getFreshUrl(queryData);
        if(lastSetUrlRef.current !== newUrl){
            lastSetUrlRef.current = newUrl;
            history.push(newUrl);
        }
     }, [queryData,history]);

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

    return <>
        {companies.map(x=><CompanyItem company={x} key={x.key}/>)}
        <ChartComponent/>
    </>
}