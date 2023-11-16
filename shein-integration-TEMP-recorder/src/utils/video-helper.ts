export const createBase64FromBlob = async (blob: Blob) => {
    const reader = new FileReader();
    return await new Promise<string | null>((resolve) => {
        reader.onload = (e) => {
            const url = e.target?.result;
            if (!url) { resolve(null); return; }
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            resolve(url?.toString());
        };
        reader.readAsDataURL(blob);
    });
};

export const getBlobDuration = async (blob: Blob): Promise<number | null> => {
    const tempVideoEl = document.createElement("video");

    const durationP = new Promise<number | null>((resolve, reject) => {
        tempVideoEl.addEventListener("loadedmetadata", () => {
            if (tempVideoEl.duration === Infinity) {
                tempVideoEl.currentTime = Number.MAX_SAFE_INTEGER;
                tempVideoEl.ontimeupdate = () => {
                    tempVideoEl.ontimeupdate = null;
                    resolve(tempVideoEl.duration);
                    tempVideoEl.currentTime = 0;
                };
            } else { resolve(null); };
        });
        tempVideoEl.onerror = (event) => { reject(event.target.error); };
    });

    tempVideoEl.src = URL.createObjectURL(blob);

    return await durationP;
};
