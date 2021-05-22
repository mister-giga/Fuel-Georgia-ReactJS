import React from 'react'

export default function LoadingComponent(props:{loadingText:string}){
    return (
        <div className="horizontallyCentered">
            <div className="spinner-border text-success" role="status">
                <span className="visually-hidden"></span>
            </div>
            <p className="lead">{props.loadingText}</p>
        </div>
    );
}