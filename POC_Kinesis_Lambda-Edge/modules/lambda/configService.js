exports.handler = (event, context, callback) => {
    
    const request = event.Records[0].cf.request;
    const m = request.uri.match(/^\/experiment\/([a-z0-9]+)/i);
    const experimentName = (Array.isArray(m) && m.length > 1) ? m[1] : null;
    console.log("Experiment: "+experimentName);
    
    let body = "";
    
    if(experimentName == "buttons"){
        body = {
            buckets : {
                orange: 20,
                blue: 80
            }
        };
    }
    else if(experimentName == "heading"){
        body = {
            buckets : {
                h1: 30,
                h2: 40,
                h3: 30
            }
        };
    }
    let response = {
            status: '200',
            headers: {
            'content-type': [{
                key: 'Content-Type',
                value: 'application/json'
            }]
            },
            body: JSON.stringify(body)
        };   
    callback(null, response);
}