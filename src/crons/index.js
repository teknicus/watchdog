import websiteWatchdog from "./website-watchdog.js"; 
import {fallbackPagerule} from "../actions/cf-update-pagerule.js"

async function startCrons(){

    console.log("Starting Website Watchdog")
    websiteWatchdog(fallbackPagerule )


}

export default startCrons;