exports.handler = (event, context, callback) => {
    
    const https = require("https");
   
    var response;
    var userBucket;
    const request = event.Records[0].cf.request;

    // Get experiment name and user ID from URI
    
    const experimentName = getPathParamFromURI(request.uri, /\/experiment\/([a-z0-9]+)/i);
    const userID = getPathParamFromURI(request.uri, /\/user\/([a-z0-9]+)$/i);
    
    if(!experimentName || !userID){
        callback(null, "<p>Experiment name or User ID not found</p>");
    }
    console.log("Experiment Name: "+experimentName);
    console.log("User ID: "+userID);
    
    //Generate hash for userID
    var userHashNumber = getHashNumberMod(userID, 100);
    
    //Call config service which returns experiment details(no of buckets, % for each bucket)
    var url = "https://d3few1dn505ikj.cloudfront.net/experiment/"+experimentName;
    https.get(url, function(res) {
        
        console.log("Got response from config service: " + res.statusCode);
        var bucketInfo ="";
        res.on("data", function(chunk) {
          bucketInfo += chunk;
        });
        res.on("end", function(){
          console.log(bucketInfo);
          bucketInfo = JSON.parse(bucketInfo);
          console.log("Number of buckets: "+Object.keys(bucketInfo.buckets).length);
          
          //Assign user to one of the buckets
          userBucket = getUserBucketAssignment(userHashNumber, bucketInfo);
          
          
          console.log("User hash number: "+userHashNumber);
          console.log("Bucket assignment: "+userBucket);
          
          //Push experimentName, userID, userBucket to kinesis
          pushToKinesis(request, experimentName, userID, userBucket);
        });
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });
   
    callback(null, response);
    
};

function getHashNumberMod(userID, mod){
  
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256');
  hash.update(userID);
  var hex = hash.digest('hex');
  var int = parseInt(hex, 16);
  return int % mod;
}

function getUserBucketAssignment(userBucketInt, data){
  let low = 0;
  let high = 0;
  let bucket = ""
  Object.keys(data.buckets).forEach(function(element) {
    console.log(element+" : "+data.buckets[element]);
    high = high+data.buckets[element];
    if(userBucketInt >= low && userBucketInt < high){
      bucket = element;
    }
    low = high;
  });
  return bucket;
}

function getPathParamFromURI(uri, regex){
  
  const m = uri.match(regex);
  var param =  (Array.isArray(m) && m.length > 1) ? m[1] : null;
  return param;
}

var AWS = require('aws-sdk');
function pushToKinesis(request, experimentName, userID, userBucket){

  request.experimentName = experimentName;
  request.userID = userID;
  request.userBucket = userBucket;
  
  var streamName = 'sampleStream';
  var partitionKey = 'key1';
  var region = 'us-east-1';
  
  var kinesisClient = getKinesisClient(region);
  sendRecord(kinesisClient, streamName, partitionKey, JSON.stringify(request));

   
}
function getKinesisClient(region_name) {
	return new AWS.Kinesis({
		'region' : region_name
	});
}
function sendRecord(kinesisClient, streamName, partitionKey, data) {
	// body...
	var params = {
		'StreamName' : streamName,
		'PartitionKey' : partitionKey,
		'Data' : data
	};

	try {
		kinesisClient.putRecord(params, function(err, data) {
			if (err) {
				console.log('Transmission FAILED: ' + err);
				return;
			}

			console.log('Completed record with PK=' + partitionKey);
		});
	} catch (err) {
		console.log('Transmission FAILED: ' + err);
	}		
}