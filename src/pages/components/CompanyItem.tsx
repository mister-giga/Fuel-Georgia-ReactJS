import React, {  useRef } from 'react'
import {  useRecoilState, useSetRecoilState } from 'recoil';
import Company from '../../models/Company';
import { GetCompanyLogoUrl } from '../../services/DataService';
import { chartDataSelector, isCompanyOpenedSelector } from '../../services/QueryHelper';

function getSign(number:number){
    if(number>0)
        return '+';
    if(number<0)
        return '-';
    return '';
}
function getBadgeClass(number:number){
    if(number>0)
        return 'bg-danger';
    if(number<0)
        return 'bg-success';
    return 'bg-secondary';
}

export default function CompanyItem(props:{company:Company}){
    const { company } = props;
    const [isOpen, setIsOpen] = useRecoilState(isCompanyOpenedSelector(company.key));
    const isOpenRef = useRef(isOpen);

    const setDisplayChart = useSetRecoilState(chartDataSelector);

    const collapsableDivId = `collapsable_${company.key}`;

    const onOpenClose = () => setIsOpen(x=>!x);

    return (
        <div className="accordion card mb-3" style={{ margin:'10px' }}>
            <div className={`accordion-item`}>
                <h2 className="accordion-header">
                    <button className={`accordion-button ${isOpenRef.current ? '' : 'collapsed'}`} type="button"  data-bs-toggle="collapse" data-bs-target={`#${collapsableDivId}`} aria-expanded="true" aria-controls="collapseOne" onClick={onOpenClose}>
                        <div style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:'100%', marginRight:'16px'}}>
                            <div style={{display:'flex', flexDirection:'row'}}>
                                <img src={GetCompanyLogoUrl(company.key)} alt={`${company.key} logo`} width='50' height='50' style={{marginRight:'16px'}}/>
                                <h3>{company.name}</h3>
                            </div>
                            <button type="button" className="btn btn-primary" style={{backgroundColor:company.color, borderColor:company.color}} title='რუკა'><i className="fas fa-map-marked-alt"></i></button>
                        </div>
                    </button>
                </h2>
                <div id={collapsableDivId} className={`accordion-collapse collapse ${isOpenRef.current ? 'show' : ''}`}>
                    <div className="accordion-body" style={{padding:'0'}}>
                        <table className="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">საწვავი</th>
                                    <th scope="col">ფასი</th>
                                    <th scope="col">ცვლილება</th>
                                    <th scope="col" style={{textAlign:'end'}}>ისტორია</th>
                                </tr>
                            </thead>
                            <tbody>
                                {company.fuels.map((f,i)=> (
                                    <tr key={f.key}>
                                        <th scope="row">{i+1}</th>
                                        <td>{f.name}</td>
                                        <td>{f.price.toFixed(2)}</td>
                                        <td><span className={`badge ${getBadgeClass(f.change)}`}>{getSign(f.change)}{Math.abs(f.change).toFixed(2)}</span></td>
                                        <td style={{textAlign:'end'}}><button type="button" onClick={()=>setDisplayChart({companyKey:company.key, fuelKey:f.key})} className="btn btn-secondary" title='ისტორიის გრაფიკულად ნახვა'><i className="fas fa-chart-line"></i></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}