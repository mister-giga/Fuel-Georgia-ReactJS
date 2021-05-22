import React, { useEffect, useRef, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil';
import { chartDataSelector } from '../../services/QueryHelper'
import { Modal } from 'bootstrap'
import { CompaniesAtom } from '../../services/CompaniesAtom';
import { GetCompanyLogoUrl, GetPriceChangesAsync } from '../../services/DataService';
import PricePoint from '../../models/PricePoint';
import LoadingComponent from './LoadingComponent';
import HandleError from '../../services/ErrorHandler';

export default function ChartComponent(){
    const [chartData, setChartData] = useRecoilState(chartDataSelector);
    const companies = useRecoilValue(CompaniesAtom);

    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(()=>{
        if(chartData !== null && modalRef.current !== null && companies !== null){
            let modal = Modal.getInstance(modalRef.current, {  });
            if(modal === null){
                modal = new Modal(modalRef.current);
                modalRef.current.addEventListener('hidden.bs.modal', function (event) {
                    setChartData(null);
                });
            } 
            modal.show();
        }
    },[chartData, setChartData, companies]);

    const [allHistory, setAllHistory] = useState<PricePoint[]|null>(null);
    const chartKeyRef = useRef<string|null>(null);

    useEffect(()=>{
        const chartKey = chartData === null ? null : `${chartData.companyKey}.${chartData.fuelKey}`;
        chartKeyRef.current = chartKey;
        if(chartKey !== null){
            (async () => {
                try {
                    const resp = await GetPriceChangesAsync(chartData!.companyKey, chartData!.fuelKey);
                    if(resp?.length && chartKey === chartKeyRef.current){
                        setAllHistory(resp);
                    }
                } catch (ex){
                    HandleError(ex);
                }
            })();
        } else {
            setAllHistory(null);
        }
    }, [chartData]);

    const company = companies?.find(c=>c.key === chartData?.companyKey);
    const fuel = company?.fuels?.find(c=>c.key === chartData?.fuelKey);
    if(!Boolean(fuel)){
        return <></>;
    }

    

    return (
        <div className="modal fade" ref={modalRef} data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog modal-fullscreen"> 
                <div className="modal-content">
                    <div className="modal-header">
                        <h3 className="modal-title">
                            <img src={GetCompanyLogoUrl(company!.key)} alt={`${company!.key} logo`} width='50' height='50' style={{marginRight:'16px'}}/>
                            {`${company?.name} - ${fuel?.name}`}
                        </h3>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        { allHistory === null ? <LoadingComponent loadingText='იტვირთება საწვავის ისტორია...'/> : (
                            <p>{allHistory.length}</p>
                        ) }
                    </div>
                </div>
            </div>
        </div>
    );
}