import { Modal } from 'bootstrap';
import React, { useEffect, useRef, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil';
import PinPoint from '../../models/PinPoint';
import { CompaniesAtom } from '../../services/CompaniesAtom';
import { GetCompanyLogoUrl, GetLocationsAsync } from '../../services/DataService';
import HandleError from '../../services/ErrorHandler';
import { mapDataSelector } from '../../services/QueryHelper';
import LoadingComponent from './LoadingComponent';

function MapItem(props:{originalData:PinPoint[],color:string}){
    const { originalData, color } = props;
    const mapDivRef = useRef<HTMLDivElement|null>(null);
    const [ map, setMap] = useState<google.maps.Map|null>(null);
    const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

    useEffect(()=>{
        setMap(new google.maps.Map(mapDivRef.current!, {
            center: { lat: -34.397, lng: 150.644 },
            zoom: 8,
            minZoom: 8
        }));
    },[]);

    useEffect(()=>{
        if(map !== null){
            const svgMarker = {
                path:"m12 0c-4.962 0-9 4.066-9 9.065 0 7.103 8.154 14.437 8.501 14.745.143.127.321.19.499.19s.356-.063.499-.189c.347-.309 8.501-7.643 8.501-14.746 0-4.999-4.038-9.065-9-9.065zm0 14c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z",
                fillColor: color,
                fillOpacity: 0.9,
                strokeWeight: 0,
                rotation: 0,
                scale: 2,
                anchor: new google.maps.Point(15, 30),
            };
            setMarkers(originalData.map(x=>new google.maps.Marker({
                position: new google.maps.LatLng({
                    lat: x.lat,
                    lng: x.lng
                }),
                map,
                title: x.address,
                icon: svgMarker
              })));
        }
    }, [map, originalData, color]);

    useEffect(()=>{
        if(map !== null && markers.length){

            // const clusterer = new MarkerClusterer(map, markers, {
            //     imagePath:
            //       "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
            //   });

            var latlngbounds = new google.maps.LatLngBounds();

            markers.forEach(m => {
                latlngbounds.extend(m.getPosition()!)
            });     

            map.setCenter(latlngbounds.getCenter());
            map.fitBounds(latlngbounds);

            return () => {
                markers.forEach(m=>m.setMap(null));
            }
        }
    },[map, markers]);

    return <div style={{height:'100%'}} ref={mapDivRef}/>
}

export default function MapComponent(){
    const [mapData, setMapData] = useRecoilState(mapDataSelector);
    const companies = useRecoilValue(CompaniesAtom);
    
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(()=>{
        if(mapData !== null && modalRef.current !== null && companies !== null){
            let modal = Modal.getInstance(modalRef.current, {  });
            if(modal === null){
                modal = new Modal(modalRef.current);
                modalRef.current.addEventListener('hidden.bs.modal', function (event) {
                    setMapData(null);
                });
            } 
            modal.show();
        }
    },[mapData, setMapData, companies]);

    const [locations, setLocations] = useState<PinPoint[]|null>(null);
    const mapKeyRef = useRef<string|null>(null);

    useEffect(()=>{
        const mapKey = mapData === null ? null : mapData.companyKey;
        mapKeyRef.current = mapKey;
        if(mapKey !== null){
            (async () => {
                try {
                    const resp = await GetLocationsAsync(mapData!.companyKey);
                    if(resp?.length && mapKey === mapKeyRef.current){
                        setLocations(resp);
                    }
                } catch (ex){
                    HandleError(ex);
                }
            })();
        } else {
            setLocations(null);
        }
    }, [mapData]);

    const company = companies?.find(c=>c.key === mapData?.companyKey);
    if(!Boolean(company)){
        return <></>;
    }

    return (
        <div className="modal fade" ref={modalRef} data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog modal-fullscreen"> 
                <div className="modal-content">
                    <div className="modal-header">
                        <h3 className="modal-title">
                            <img src={GetCompanyLogoUrl(company!.key)} alt={`${company!.key} logo`} width='50' height='50' style={{marginRight:'16px'}}/>
                            {`${company?.name} - მისამართები`}
                        </h3>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body" style={{padding:'0'}}>
                        { locations === null ? <LoadingComponent loadingText='იტვირთება სადგურების მისამართები...'/> : <MapItem originalData={locations} color={company!.color}/> }
                    </div>
                </div>
            </div>
        </div>
    );
}