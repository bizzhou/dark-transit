const request = require('request');
const accountSid = 'AC436f0f54a0da9fae78f50b31a168ae98';
const authToken = '';

// const client = require('twilio')(accountSid, authToken);

var appRouter = function (app) {
    /**
     * get route info
     */
    app.get("/get_route/:route", function (req, res) {
        const url = `http://bustime.mta.info/api/search?q=${req.params.route}`;
        request(url, { json: true }, (err, result, body) => {

            if (err) {
                return res.status(404).send('bad request');
            }

            res.status(200).send(body);
        });
    });

    /**
     * get bidirectional vehicle stops
     */
    app.get("/get_stops/:route", function (req, res) {
        const from = `http://bustime.mta.info/api/stops-on-route-for-direction?routeId=${req.params.route}&directionId=0`;
        const back = `http://bustime.mta.info/api/stops-on-route-for-direction?routeId=${req.params.route}&directionId=1`;
        let dirs = [];

        request(from, { json: true }, (err, result, body) => {
            if (err) res.status(404).send('bad request');
            dirs.push(body);
            request(back, { json: true }, (err, result, body) => {
                if (err) res.status(404).send('bad request');
                dirs.push(body);
                res.status(200).send(dirs);
            });
        });
    });

    /**
     * get vehicle activity
     */
    app.get("/get_vehicle_info/:route", function (req, res) {
        const url = `http://bustime.mta.info/api/siri/vehicle-monitoring.json?key=OBANYC&LineRef=${req.params.route}`;
        request(url, { json: true }, (err, result, body) => {
            if (err) {
                return res.status(404).send('bad request');
            }
            res.status(200).send(body['Siri']['ServiceDelivery']['VehicleMonitoringDelivery']['0']);
        });

    });

    /**
     * get stop monitoring information
     */
    app.get("/get_stop_monitoring/:stopId/", function (req, res) {
        const url = `http://bustime.mta.info/api/siri/stop-monitoring.json?key=OBANYC&OperatorRef=MTA&MonitoringRef=${req.params.stopId}`

        request(url, { json: true }, (err, result, body) => {
            if (err) {
                return res.status(404).send('bad request');
            }

            res.status(200).send(body['Siri']['ServiceDelivery']['StopMonitoringDelivery']);

        });

    });



    app.get("/get_notify/:stopId/:busId/:time", function (req, res) {
        const url = `http://bustime.mta.info/api/siri/stop-monitoring.json?key=OBANYC&OperatorRef=MTA&MonitoringRef=${req.params.stopId}`

        request(url, { json: true }, (err, result, body) => {
            if (err) {
                return res.status(404).send('bad request');
            }

            // res.status(200).send(body['Siri']['ServiceDelivery']['StopMonitoringDelivery']);

            console.log(req.params.busId);

            let minDeduct = parseInt(req.params.time);
            let newTime = undefined;

            for (let item of body['Siri']['ServiceDelivery']['StopMonitoringDelivery'][0]['MonitoredStopVisit']) {
                console.log(item['MonitoredVehicleJourney']['PublishedLineName']);
                if (item['MonitoredVehicleJourney']['PublishedLineName'] === req.params.busId) {
                    console.log('here');
                    let timeStr = item['MonitoredVehicleJourney']['MonitoredCall']['ExpectedArrivalTime'];
                    let busTime = new Date(timeStr);
                    busTime.setMinutes(busTime.getMinutes() - minDeduct);

                    if (busTime > Date.now()) {
                        newTime = busTime;
                        break;
                    } 
                }   
            }

            if (newTime === undefined) {
                res.status(500).send({'error':'No bus within given time range'});
            } else {
                console.log(`receiveing the message in ${newTime}`);

                setTimeout(() => {

                    client.messages
                        .create({
                            to: '+1',
                            from: '+12015286431',
                            body: `${req.params.busId} Bus will arrive in ${minDeduct} mins, get ready!!!`,
                        })
                        .then((message) => console.log(message.sid));
        
                    console.log('done');
            
                }, newTime - Date.now());

                res.status(200).send({'success': 'Done, you will receive a SMS in ' + minDeduct + ' minutes before the bus arrive'});
            }

        });

    });

}

module.exports = appRouter;