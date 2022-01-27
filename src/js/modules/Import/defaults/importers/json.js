export default function(input){
    try {
        return JSON.parse(input);
    } catch(e) {
        console.warn("JSON Import Error - File contents is invalid JSON", e);
        return Promise.reject();
    }
}