import { Collapse } from 'bootstrap';
import React, {  useEffect, useRef } from 'react'
import {  useRecoilState, useSetRecoilState } from 'recoil';
import Company from '../../models/Company';
import { GetCompanyLogoUrl } from '../../services/DataService';
import { chartDataSelector, isCompanyOpenedSelector, mapDataSelector } from '../../services/QueryHelper';

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
    
    const collapseRef = useRef<HTMLDivElement|null>(null);
    const collapseObjRef = useRef<Collapse|null>(null);
    const isAnimatingRef = useRef<boolean>(false);
    useEffect(()=>{
        if(collapseRef.current){
            if(collapseObjRef.current === null){
                collapseRef.current.addEventListener('shown.bs.collapse', function () {
                    isAnimatingRef.current = false;
                });
                collapseRef.current.addEventListener('hidden.bs.collapse', function () {
                    isAnimatingRef.current = false;
                });
                collapseRef.current.addEventListener('show.bs.collapse', function () {
                    isAnimatingRef.current = true;
                });
                collapseRef.current.addEventListener('hide.bs.collapse', function () {
                    isAnimatingRef.current = true;
                });
                const collapse = collapseObjRef.current ?? new Collapse(collapseRef.current, { toggle: isOpen });
                collapseObjRef.current = collapse;
            } else {
                const collapse = collapseObjRef.current;
                if(isOpen){
                    collapse.show();
                } else {
                    collapse.hide();
                }
            }            
        }
    },[isOpen]);

    const setDisplayChart = useSetRecoilState(chartDataSelector);
    const setDisplayMap = useSetRecoilState(mapDataSelector);

    const onOpenClose = () => !isAnimatingRef.current && setIsOpen(x=>!x);

    return (
        <div className="card mb-3" style={{ margin:'10px' }}>
            
            <div onClick={onOpenClose} style={{alignItems:'center', display:'flex', flexDirection:'row', padding:'16px', justifyContent:'space-between', cursor:'pointer'}}>
                <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
                    <img src={GetCompanyLogoUrl(company.key)} alt={`${company.key} logo`} width='50' height='50' style={{marginRight:'16px'}}/>
                    <h3 style={{padding:'0'}}>{company.name}</h3>
                </div>
                <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
                    <button type="button" className="btn btn-primary" style={{backgroundColor:company.color, borderColor:company.color, marginRight:'10px'}} title='რუკა' onClick={(e)=>{e.stopPropagation(); setDisplayMap({companyKey:company.key});}}><i className="fas fa-map-marked-alt"></i></button>
                    <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`} style={{marginLeft:'10px', marginRight:'10px'}}></i>
                </div>
            </div>
            
            <div ref={collapseRef} className='collapse'>
                <table className="table table-striped table-hover" style={{borderTop:'1px solid rgba(0,0,0,.125)'}}>
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">საწვავი</th>
                            <th scope="col">ფასი</th>
                            <th scope="col" style={{textAlign:'center'}}>+/-</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {company.fuels.map((f,i)=> (
                            <tr key={f.key}>
                                <th scope="row">{i+1}</th>
                                <td>{f.name}</td>
                                <td>{f.price.toFixed(2)}</td>
                                <td style={{textAlign:'center'}}><span className={`badge ${getBadgeClass(f.change)}`}>{getSign(f.change)}{Math.abs(f.change).toFixed(2)}</span></td>
                                <td style={{textAlign:'end'}}><button type="button" onClick={()=>setDisplayChart({companyKey:company.key, fuelKey:f.key})} className="btn btn-sm btn-secondary" title='ისტორიის გრაფიკულად ნახვა'><i className="fas fa-chart-line"></i></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}