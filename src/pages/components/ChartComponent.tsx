import React, { useEffect, useRef, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil';
import { chartDataSelector } from '../../services/QueryHelper'
import { Modal } from 'bootstrap'
import { CompaniesAtom } from '../../services/CompaniesAtom';
import { GetCompanyLogoUrl, GetPriceChangesAsync } from '../../services/DataService';
import PricePoint from '../../models/PricePoint';
import LoadingComponent from './LoadingComponent';
import HandleError from '../../services/ErrorHandler';
import { Chart,registerables } from 'chart.js';
Chart.register(...registerables);

function getDateWithoutTime(dateStr:string):Date{
    const vals = dateStr.split('T')[0].split('-');
    return new Date(Number(vals[0]), Number(vals[1]), Number(vals[2]));
}

const monthes = ['იან', 'თებ', 'მარ', 'აპრ', 'მაი', 'ივნ', 'ივლ', 'აგვ', 'სექ', 'ოქტ', 'ნოე', 'დეკ'];

function dateToString(date:Date):string{
    return `${date.getDate()} ${monthes[date.getMonth()]} ${date.getFullYear().toString().substring(2)}`;
}

enum ChartRangeType { all, pastYear, pastMonth }

function ChartItem(props:{originalData:PricePoint[],color:string}){
    const { originalData, color } = props;
    const [chartRange, setChartRange] = useState<ChartRangeType>(ChartRangeType.all);

    const [dateRangesStr, setDateRangesStr] = useState('');

    const canvasRef = useRef<HTMLCanvasElement|null>(null);
    const chartRef = useRef<Chart<"line", Number[], String>|null>(null);
    
    useEffect(()=>{
        const data = originalData;

        if(data.length){
            const mappedData = [...data.map(x=>({
                date: getDateWithoutTime(x.date),
                price: x.price
            })), {
                date: getDateWithoutTime(new Date().toJSON()),
                price:data[data.length - 1].price
            }]

            let chartData:Number[] = [];
            let chartLabels:String[] = [];
            
            
            for(let i = 0; i < mappedData.length - 1; i++){
                console.log('x');
                const currItem = mappedData[i];
                const nextItem = mappedData[i+1].date.getTime();


                console.log(currItem.date.getTime(), nextItem)
                if(currItem.date.getTime() >= nextItem) continue;

                let dateTracker = currItem.date;
                while(dateTracker.getTime() < nextItem){
                    console.log('c')
                    chartData.push(currItem.price);
                    chartLabels.push(dateToString(currItem.date));
                    dateTracker.setDate(dateTracker.getDate() + 1)
                }
            }

            if(chartRange === ChartRangeType.pastYear){
                if(chartData.length > 365){
                    chartData = chartData.splice(chartData.length - 365);
                    chartLabels = chartLabels.splice(chartLabels.length - 365);
                }
            } else if(chartRange === ChartRangeType.pastMonth){
                if(chartData.length > 31){
                    chartData = chartData.splice(chartData.length - 31);
                    chartLabels = chartLabels.splice(chartLabels.length - 31);
                }
            }

            setDateRangesStr(`${chartLabels[0]} - ${chartLabels[chartLabels.length - 1]}`);
            
            chartRef.current?.destroy();
            chartRef.current = new Chart(canvasRef.current!, {
                type: 'line',
                data: {
                    labels: chartLabels,
                    datasets: [{
                        label: 'GEL',
                        data: chartData,
                        stepped: 'before',
                        borderColor:color,
                        pointBackgroundColor:'white'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins:{
                        legend:{
                            display:false
                        }
                    },
                    scales:{
                        y:{
                            type:'linear',
                            grace:'5%',
                            ticks:{
                                callback:function (value, index, values) {
                                    return `${Number(value).toFixed(2)}`
                                }
                            }
                        }
                    }
                }
            });
        }
    },[originalData, chartRange, color]);

    return <div style={{height:'100%', display:'flex', flexDirection:'column'}}>
        <div style={{display:'flex', flexDirection:'row', alignItems:'center', padding:'5px', justifyContent:'center'}}>
            <h6 style={{margin:'0', padding:'0', marginRight:'10px'}}>{dateRangesStr}</h6>
            <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
                <button className={`btn btn-outline-secondary ${chartRange === ChartRangeType.all ? 'active' : ''}`} onClick={()=>setChartRange(ChartRangeType.all)}>ყველა</button>

                <button className={`btn btn-outline-secondary ${chartRange === ChartRangeType.pastYear ? 'active' : ''}`} onClick={()=>setChartRange(ChartRangeType.pastYear)}>1 წლის</button>

                <button className={`btn btn-outline-secondary ${chartRange === ChartRangeType.pastMonth ? 'active' : ''}`} onClick={()=>setChartRange(ChartRangeType.pastMonth)}>1 თვის</button>
            </div>
        </div>
        <div style={{flexGrow:1}}>
            <canvas ref={canvasRef} width="400" height="400" />
        </div>
    </div>
}

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
                    <div className="modal-body" style={{padding:'0'}}>
                        { allHistory === null ? <LoadingComponent loadingText='იტვირთება საწვავის ისტორია...'/> : <ChartItem color={company!.color} originalData={allHistory}/> }
                    </div>
                </div>
            </div>
        </div>
    );
}