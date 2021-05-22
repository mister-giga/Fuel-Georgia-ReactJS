import { atom, selector, selectorFamily } from "recoil";

export interface MapDialogData{
    companyKey:string
}
export interface ChartDialogData extends MapDialogData {
    fuelKey:string
}

export enum DialogType { Map = 'map', Chart = 'chart' }

export interface QueryData {
    openedCompanyKeys:string[],
    dialog: DialogType|null,
    dialogData: MapDialogData | ChartDialogData | null
}

function getQueryData():QueryData{
    const parameters = new URLSearchParams(window.location.search);

    const cmp = parameters.get('cmp');

    let dialog : DialogType|null = null;
    let dialogData : MapDialogData | ChartDialogData | null = null

    const dlg = parameters.get('dlg');

    if(Boolean(dlg)){
        const splitted = dlg!.split('.');
        if(splitted.length === 2 && splitted[0] === 'map'){
            const companyKey = splitted[1];
            if(Boolean(companyKey)){
                dialog = DialogType.Map;
                dialogData = {
                    companyKey: companyKey
                }
            }
        } else if(splitted.length === 3 && splitted[0] === 'chart'){
            const companyKey = splitted[1];
            const fuelKey = splitted[2];
            if(Boolean(companyKey) && Boolean(fuelKey)){
                dialog = DialogType.Chart;
                dialogData = {
                    companyKey: companyKey,
                    fuelKey: fuelKey
                }
            }
        }
    }

    return {
        openedCompanyKeys: Boolean(cmp) ? cmp!.split('.') : [],
        dialog: dialog,
        dialogData: dialogData
    }
}

export function getFreshUrl(data:QueryData) {
    var searchParams = new URLSearchParams(window.location.search);
    searchParams.set("cmp", data.openedCompanyKeys.join('.'));

    let dialogParam = "";
    if(data.dialog){
        if(data.dialog === DialogType.Map){
            dialogParam = `map.${data.dialogData?.companyKey}`;
        } else if(data.dialog === DialogType.Chart){
            dialogParam = `chart.${data.dialogData?.companyKey}.${(data.dialogData as ChartDialogData)?.fuelKey}`;
        }
    }
    searchParams.set('dlg', dialogParam);

    const url = "?" + searchParams.toString();
    return url;
}


export const queryDataState = atom<QueryData>({
    key: 'queryDataState', 
    default: getQueryData(), 
});

export const isCompanyOpenedSelector = selectorFamily<boolean, string>({
    key:'isCompanyOpenedSelector',
    get: param => ({get})=> get(queryDataState).openedCompanyKeys.some(c=>c === param),
    set: companyKey => ({get, set}, isOpen) => {
        const x =  get(queryDataState);
        set(queryDataState, {...x, openedCompanyKeys: isOpen ? Array.from(new Set([...x.openedCompanyKeys, companyKey])): x.openedCompanyKeys.filter(c=>c!== companyKey)});
    }
})

export const chartDataSelector = selector<ChartDialogData|null>({
    key: 'chartDataSelector',
    get: ({get}) => {
        const data = get(queryDataState);
        if(data.dialog === DialogType.Chart){
            return data.dialogData as ChartDialogData;
        }
        return null;
    },
    set: ({get, set}, newData) => {
        const data = get(queryDataState);
        if(newData === null) {
            set(queryDataState, {...data, dialog: null, dialogData: null})
        } else {
            set(queryDataState, {...data, dialog: DialogType.Chart, dialogData: newData as ChartDialogData});
        }
    }
});

// export const isDisplayingChartSelector = selectorFamily<boolean, {companyKey:string, fuelKey:string}>({
//     key: 'isDisplayingChartSelector',
//     get: param => ({get}) => {
//         const data = get(queryDataState);
//         if(data.dialog === DialogType.Chart){
//             const dialogData = data.dialogData as ChartDialogData;
//             if(dialogData.companyKey === param.companyKey && dialogData.fuelKey === param.fuelKey){
//                 return true;
//             }
//         }
//         return false;
//     },
//     set: chartData => ({get, set}, wantsToDisplay) => {
//         const data = get(queryDataState);
//         if(wantsToDisplay){
//             set(queryDataState, {...data, dialog: DialogType.Chart, dialogData: chartData});
//         } else {
//             //maybe check if this is the one who opened chart?
//             set(queryDataState, {...data, dialog: null, dialogData: null});
//         }
//     }
// });