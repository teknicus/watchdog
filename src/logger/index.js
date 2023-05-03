async function logSuccess(func, msg, opt){
    console.log(`${func} was successful. Opt: ${JSON.stringify(opt)}`)
}

async function logFail(func, msg, opt){
    console.log(`${func} Failed. Opt: ${JSON.stringify(opt)}`)
}


export { logSuccess, logFail }