import React, { useEffect, useRef } from 'react'
import { useHistory } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { GetCompaniesAsync } from '../../services/DataService';
import HandleError from '../../services/ErrorHandler';
import { getFreshUrl, queryDataState } from '../../services/QueryHelper';
import CompanyItem from './CompanyItem';
import LoadingComponent from './LoadingComponent';
import ChartComponent from './ChartComponent'
import { CompaniesAtom } from '../../services/CompaniesAtom'
import MapComponent from './MapComponent';

export default function CompaniesListing(){
    const [companies, setCompanies] = useRecoilState(CompaniesAtom);// useState<Company[]|null>(null);
    const history = useHistory();
  
    const queryData = useRecoilValue(queryDataState);    
    const lastSetUrlRef = useRef<string|null>(null);
    
    useEffect(()=> {
        const newUrl = getFreshUrl(queryData);
        if(lastSetUrlRef.current !== newUrl){
            lastSetUrlRef.current = newUrl;
            history.replace(newUrl);
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
    }, [companies, setCompanies]);

    if(companies === null){
        return <LoadingComponent loadingText="იტვირთება კომპანიები..."/>;
    }

    return <>
        {companies.map(x=><CompanyItem company={x} key={x.key}/>)}
        <ChartComponent/>
        <MapComponent/>
    </>
}
