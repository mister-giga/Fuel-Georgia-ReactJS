import React, { useEffect, useRef, useState } from 'react'
import Company from '../../models/Company';
import { GetCompanyLogoUrl } from '../../services/DataService';

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

export default function CompanyItem(props:{company:Company, isOpen:boolean, isOpenChanged:(companyKey:string, isOpen:boolean) => void}){
    const { company, isOpenChanged } = props;

    const [isOpen, setIsOpen] = useState<boolean>(props.isOpen);
    const isOpenRef = useRef(isOpen);

    useEffect(()=>{
        isOpenChanged(company.key, isOpen);
    }, [isOpen, isOpenChanged, company.key]);

    const collapsableDivId = `collapsable_${company.key}`;

    const onOpenClose = () => setIsOpen(x=>!x);

    return (
        <div className="accordion card mb-3" style={{ margin:'10px' }}>
            <div className={`accordion-item`}>
                <h2 className="accordion-header">
                    <button className={`accordion-button ${isOpenRef.current ? '' : 'collapsed'}`} type="button"  data-bs-toggle="collapse" data-bs-target={`#${collapsableDivId}`} aria-expanded="true" aria-controls="collapseOne" onClick={onOpenClose}>
                        <img src={GetCompanyLogoUrl(company.key)} alt={`${company.key} logo`} width='50' height='50' style={{marginRight:'16px'}}/>
                        <h3>{company.name}</h3>
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
                                </tr>
                            </thead>
                            <tbody>
                                {company.fuels.map((f,i)=> (
                                    <tr key={f.key}>
                                        <th scope="row">{i+1}</th>
                                        <td>{f.name}</td>
                                        <td>{f.price.toFixed(2)}</td>
                                        <td><span className={`badge ${getBadgeClass(f.change)}`}>{getSign(f.change)}{Math.abs(f.change).toFixed(2)}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        // <div className="card mb-3" style={{ margin:'10px' }}>
        //     <h2 className="accordion-header">
        //         <button className="accordion-button" type="button" onClick={onOpenClose}>
        //             <img src={GetCompanyLogoUrl(company.key)} width='50' height='50'/>
        //             {company.name}
        //         </button>
        //     </h2>
        //     <div className={`${isOpen ? '' : 'collapse'}`}>
        //         <div className="accordion-body">
        //             <strong>This is the first item's accordion body.</strong> It is shown by default, until the collapse plugin adds the appropriate classes that we use to style each element. These classes control the overall appearance, as well as the showing and hiding via CSS transitions. You can modify any of this with custom CSS or overriding our default variables. It's also worth noting that just about any HTML can go within the <code>.accordion-body</code>, though the transition does limit overflow.
        //         </div>
        //     </div>
        // </div>
    );
}