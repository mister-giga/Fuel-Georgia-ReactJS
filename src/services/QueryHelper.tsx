export interface QueryData {
    openedCompanyKeys:string[]
}

export function getQueryData(){
    const parameters = new URLSearchParams(window.location.search);

    const cmp = parameters.get('cmp');

    return {
        openedCompanyKeys: Boolean(cmp) ? cmp!.split('.') : []
    }
}

export function getFreshUrl(data:QueryData) {
    var searchParams = new URLSearchParams(window.location.search);
    searchParams.set("cmp", data.openedCompanyKeys.join('.'));
    return "?" + searchParams.toString();
}