import React from 'react'
import { useRecoilState } from 'recoil';
import { chartDataSelector } from '../../services/QueryHelper'

export default function ChartComponent(){
    const [chartData, setChartData] = useRecoilState(chartDataSelector);

    if(chartData === null){
        return <></>
    }

    return (
        <div className="modal-dialog modal-fullscreen">
            <h1>asdadasdasdas</h1>
        </div>
    );

    //return <button onClick={()=>setChartData(null)}>chart is shown for {chartData.companyKey} and {chartData.fuelKey}</button>
}