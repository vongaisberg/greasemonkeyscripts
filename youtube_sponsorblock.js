// ==UserScript==
// @name         Sponsorblock
// @version      1.0.0
// @description  Skip sponsor segments automatically
// @author       afreakk
// @match        *://*.youtube.com/*
// @exclude      *://*.youtube.com/subscribe_embed?*
// ==/UserScript==
const tryFetchSkipSegments = async (videoID) => {
    try {
        const responseJson = await fetch(
            `https://sponsor.ajay.app/api/skipSegments?videoID=${videoID}`
        ).then((r) => r.json());
        return responseJson
            .filter((a) => a.actionType === 'skip')
            .map((a) => a.segment);
    } catch (e) {
        console.log(
            `Sponsorblock: error fetching skipSegments for ${videoID}, ${e}`
        );
        return [];
    }
};
const skipSegments = async () => {
    const videoID = new URL(document.location).searchParams.get('v');
    if (!videoID) {
        return;
    }
    const v = document.querySelector('video');
    if (!v) {
        console.log("Sponsorblock: couldn't find video element");
        return;
    }
    const key = `segmentsToSkip-${videoID}`;
    window[key] = window[key] || (await tryFetchSkipSegments(videoID));
    for (const [start, end] of window[key]) {
        if (v.currentTime < end && v.currentTime > start) {
            v.currentTime = end;
            console.log(`Sponsorblock: skipped video to ${end}`);
            return;
        }
    }
};
if (!window.skipSegmentsIntervalID) {
    window.skipSegmentsIntervalID = setInterval(skipSegments, 1000);
}
