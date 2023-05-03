import websiteWatchdog from '../crons/website-watchdog.js'
import axios from 'axios';
import config from 'config'

const zoneId = config.ZONE_ID;
const ruleId = config.actions.updatePagerule.id;
const token = config.CF_TOKEN;

async function fallbackPagerule() {
    console.log(`fallbackPagerule`)

    await activateFallback();

    let restoreCheck = setInterval(async () => {
        axios.get(config.actions.updatePagerule.healthCheckUrl)
            .then(async response => {
                if (response.status >= 200 && response.status < 300) {
                    clearInterval(restoreCheck)
                    await disableFallback();
                    websiteWatchdog(fallbackPagerule)



                } else {
                    logFail('appledore', `healthcheck failed`, { status: response.status })
                }
            })
            .catch(error => {
                logFail('appledore', `healthcheck failed`, { status: error?.status })
            });
    }, config.actions.updatePagerule.restoreCheckInterval)

}


async function activateFallback() {
    console.log("Activating Fallback rule")
    const endpoint = `https://api.cloudflare.com/client/v4/zones/${zoneId}/pagerules/${ruleId}`;
    const headers = {
        'Authorization': `Bearer ${token}`
    };
    const data = {
        "status": "active"
    }

    await axios.patch(endpoint, data, { headers }).then(response => {
        console.log(response?.data)
    }).catch(e => {
        console.log('PATCH failed')
    })
}

async function disableFallback() {
    console.log("deactivating Fallback rule")


    const endpoint = `https://api.cloudflare.com/client/v4/zones/${zoneId}/pagerules/${ruleId}`;
    const headers = {
        'Authorization': `Bearer ${token}`
    };
    const data = {
        "status": "disabled"
    }

    await axios.patch(endpoint, data, { headers }).then(response => {
        console.log(response?.data)
    }).catch(e => {
        console.log('PATCH failed')
    })
}



export { fallbackPagerule }
