/**
 * That thing is an array, if it's not wrap it into an array.  If it's null then return an empty array.
 */
export function ensureArray<T>(thing: T[] | T | null | undefined): T[] {
    return (thing !== null && thing !== undefined)
        ? (Array.isArray(thing)
            ? thing
            : [thing])
        : [];
}

/**
 * Ensure we get a single thing, either by taking the first element in an array, returning the input, or null
 */
export function ensureSingle<T>(thing: T[] | T | null | undefined): T | null | undefined {
    return (Array.isArray(thing)
        ? thing[0]
        : thing);        
}

export function getUrlFromBase(base: string, path: string): string {
    if (!base) return path
    if (!path) return base.endsWith('/') ? base.slice(0, -1) : base;

    const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
    const normalizedPath = path.length == 0 ? '' : (path.startsWith('/') ? path : `/${path}`);
    return `${normalizedBase}${normalizedPath}`;
}

export function stringToBoolean(stringValue: string | null | undefined): boolean {
    switch (stringValue?.toLowerCase()?.trim()) {
    case 'true':
    case 'yes':
    case '1':
        return true;

    case 'false':
    case 'no':
    case '0':
    case null:
    case undefined:
        return false;

    default:
        return false;
    }
}

export function secondsToTime(timestamp: number): string {
    const hours = Math.floor(timestamp / 60 / 60);
    const minutes = Math.floor(timestamp / 60) - hours * 60;
    const seconds = Math.floor(timestamp % 60);
    return  (hours>0 ? hours.toString().padStart(2,'0') + ":" : "") +
            minutes.toString().padStart(2,'0') + ":" +
            seconds.toString().padStart(2,'0');
}

export function timeToSeconds(timeString: string): number {
    // Pattern: hh:mm:ss.msm or mm:ss.msm or ss.msm
    const parts = timeString.split(':');
    let seconds = 0;
    
    // If there are 3 parts (hh:mm:ss.msm)
    if (parts.length === 3) {
        seconds += parseFloat(parts[0]) * 3600; // Hours
        seconds += parseFloat(parts[1]) * 60;   // Minutes
        seconds += parseFloat(parts[2]);        // Seconds.milliseconds
    } 
    // If there are 2 parts (mm:ss.msm)
    else if (parts.length === 2) {
        seconds += parseFloat(parts[0]) * 60;   // Minutes
        seconds += parseFloat(parts[1]);        // Seconds.milliseconds
    }
    // If there is 1 part (ss.msm)
    else if (parts.length === 1) {
        seconds += parseFloat(parts[0]);
    }
    
    return seconds;
}

// Streams functions
export function splitFlavor(flavor: string): string[] {
    const flavorTypes = flavor.split('/');
    if (flavorTypes.length !== 2 || flavor.startsWith('/') || flavor.endsWith('/')) {
        throw new Error('Invalid flavor');
    }
    return flavorTypes;
}

/**
 * Retrieves a parameter value from the URL hash.
 */
export function getHashParameter(name: string): string | null {
    const search = window.location.hash.replace('#', '?');
    const urlParams = new URLSearchParams(search);
    return urlParams.has(name) ? urlParams.get(name) : null;
}
/**
 * Retrieves a parameter value from the URL query string.
 */
export function getUrlParameter(name: string): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has(name) ? urlParams.get(name) : null;
}

export function getHashOrUrlParameter(param: string): string | null {
    return getHashParameter(param) ?? getUrlParameter(param);
}