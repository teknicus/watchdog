import config from 'config'
import axios from 'axios'
import { logSuccess, logFail } from '../logger/index.js'

const pingUrl = config.crons.checkWebsite.pingUrl
let checkWebsiteInterval, watchdogAction, watchdogRevert;

async function websiteWatchdog(action, revert) {

    watchdogAction = action
    watchdogRevert = revert

    console.log("Starting checkWebsiteInterval")
    checkWebsite()

    checkWebsiteInterval = setInterval(checkWebsite, config.crons.checkWebsite.i)
}

async function checkWebsite() {

    const startTime = Date.now()

    axios.get(pingUrl)
        .then(response => {
            if (response.status >= 200 && response.status < 300) {
                let latency = Date.now() - startTime;
                logSuccess('websiteWatchdog', null, { latency })
            } else {
                logFail('websiteWatchdog', `request failed with status code ${response.status}`, { status: response.status })
                grace();
            }
        })
        .catch(error => {
            logFail('websiteWatchdog', `Error:`, { status: error?.status })
            grace();
        });
}

async function grace() {
    clearInterval(checkWebsiteInterval);

    let interval = config.crons?.checkWebsite?.grace?.i || 2000;
    let iterations = config.crons?.checkWebsite?.grace?.n || 15;
    let graceCounter = 0;

    let graceInterval = setInterval(async () => {

        console.log(`Grace Counter: ${graceCounter}`)

        axios.get(pingUrl).then(response => {
            if (response.status >= 200 && response.status < 300) {
                clearInterval(graceInterval);
                console.log("Website restored")
                websiteWatchdog(watchdogAction);
            }
            else {
                graceCounter++;

                if (graceCounter >= iterations) {
                    console.log("End of grace period")
                    clearInterval(graceInterval);

                    watchdogAction()
                }
            }
        }).catch(e => {
            graceCounter++;

            if (graceCounter >= iterations) {
                console.log("End of grace period")
                clearInterval(graceInterval);

                watchdogAction()
            }
        })


    }, interval)

}

export default websiteWatchdog;


