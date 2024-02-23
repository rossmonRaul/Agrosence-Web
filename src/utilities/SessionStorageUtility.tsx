export const persisSessionStorage = <T,>(key: string, value: T) =>{
    sessionStorage.setItem(key, JSON.stringify({...value}));
};

export const clearSessionStorage = (key: string) =>{
    sessionStorage.removeItem(key);
};