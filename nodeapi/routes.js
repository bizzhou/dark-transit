const request = require('request');

var appRouter = function (app) {
    app.get("/get_route/:route", function (req, res) {
        const url = `http://bustime.mta.info/api/search?q=${req.params.route}`;
        request(url, { json: true }, (err, result, body) => {

            if (err) {
                return res.status(404).send('bad request');
            }

            res.status(200).send(body);
        });
    });


    app.get("/get_stops/:route", function (req, res) {
        const from = `http://bustime.mta.info/api/stops-on-route-for-direction?routeId=MTA+NYCT_${req.params.route}&directionId=0`;
        const back = `http://bustime.mta.info/api/stops-on-route-for-direction?routeId=MTA+NYCT_${req.params.route}&directionId=1`;
        let dirs = [];


        request(from, { json: true }, (err, result, body) => {
            if (err) res.status(404).send();
            dirs.push(body);
            request(back, { json: true }, (err, result, body) => {
                if (err) res.status(404).send();
                dirs.push(body);
                res.status(200).send(dirs);
            });
        });

    });


    

    app.get("/get_vehicle_info/:route", function (req, res) {
        const url = `http://bustime.mta.info/api/siri/vehicle-monitoring.json?key=OBANYC&OperatorRef=MTA+NYCT&LineRef=${req.params.route}`;
        request(url, { json: true }, (err, result, body) => {
            if (err) {
                return res.status(404).send('bad request');
            }
            res.status(200).send(body['Siri']['ServiceDelivery']['VehicleMonitoringDelivery']);
        });

    })

}








module.exports = appRouter;