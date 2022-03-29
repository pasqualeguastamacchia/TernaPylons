'use strict';

module.exports = function (Mappaturameteocampate) {
    Mappaturameteocampate.details = function (codiceCampata,data, callback) {
        var currentDate = new Date(data||new Date().toISOString());
        var fromDate = new Date(currentDate.getTime())
        fromDate.setHours(currentDate.getHours()-36);
        var toDate = new Date(currentDate.getTime());
        toDate.setDate(currentDate.getDate()+7);
        Mappaturameteocampate.getDataSource().connector.connect(function (err, db) {
            var collection = db.collection('Mappatura_Meteo_Campate');
            collection.aggregate([
                { $match: { codice_campata: codiceCampata } },
                {
                    $lookup:
                    {
                        from: "RadarMeteo",
                        let: { lat: "$lat_meteo", lon: "$lon_meteo" },
                        pipeline: [
                            {
                                $match:
                                {
                                    $expr:
                                    {
                                        $and:
                                            [
                                                { $eq: ["$LATITUDINE", "$$lat"] },
                                                { $eq: ["$LONGITUDINE", "$$lon"] },
                                                { $gte: ["$DATA_ORA_UTC", fromDate] },
                                                { $lt: ["$DATA_ORA_UTC", toDate] }
                                            ]
                                    }
                                }
                            },
                            { $project: { _id: 0, "DATA_ORA_UTC": 1, "LATITUDINE": 1, "LONGITUDINE": 1, "TEMPERATURA_GC": 1, "PRECIPITAZIONI_MM": 1 } }
                        ],
                        as: "RMdata"
                    }
                },
                { $unwind: "$RMdata" },
                {
                    $project: {
                        "Codice_Campata": "$codice_campata",
                        "Codice_Linea": "$codice_linea",
                        "Lat_Campata_ini": "$coord_lat_ini",
                        "Lon_Campata_ini": "$coord_lon_ini",
                        "Lat_Campata_fin": "$coord_lat_fin",
                        "Lon_Campata_fin": "$coord_lon_fin",
                        "lat_meteo": 1,
                        "lon_meteo": 1,
                        "DATA": "$RMdata.DATA_ORA_UTC",
                        "TEMPERATURA_GC": "$RMdata.TEMPERATURA_GC",
                        "PRECIPITAZIONI_MM": "$RMdata.PRECIPITAZIONI_MM"
                    }
                }
            ], function (err, aggregationCursor) {
                if (err != null) {
                    callback(null, err);
                } else {
                    aggregationCursor.toArray(function (err, entity) {
                        if (err != null) {
                            callback(null, err);
                        } else {
                            callback(null, entity);
                        }
                    });
                }
            });
        });
    }
    Mappaturameteocampate.riskPredictionDaily = function(data,callback){
        var currentDate = new Date(data+'T00:00:00.000+00:00'||new Date().toISOString());
        Mappaturameteocampate.getDataSource().connector.connect(function (err, db) {
            var collection = db.collection('Mappatura_Meteo_Campate');
            collection.aggregate([
                { $lookup:
                    {
                        from: 'Manicotto_RiskPrediction_daily_agg',
                        let:{codiceCampata: "$codice_campata"},
                        pipeline:[{
                        $match:{
                            $expr:
                            {
                                $and:
                                    [
                                    {$eq:['$id_campata','$$codiceCampata']},
                                    {$eq:['$timestamp',currentDate]}
                                    ]
                            }
                        }
                        }],
                        as: 'risk'
                    }
                }
            ], function (err, aggregationCursor) {
                if (err != null) {
                    callback(null, err);
                } else {
                    aggregationCursor.toArray(function (err, entity) {
                        if (err != null) {
                            callback(null, err);
                        } else {
                            callback(null, entity);
                        }
                    });
                }
            });
        });
    }
    Mappaturameteocampate.remoteMethod(
        'details', {
        http: {
            path: '/details',
            verb: 'get',
        },
        accepts: [{
            arg: 'codiceCampata',
            type: 'string',
        },{
            arg: 'data',
            type: 'string'
        }],
        returns: {
            arg: 'results',
            type: 'string',
        }
    }
    );
    Mappaturameteocampate.remoteMethod(
        'riskPredictionDaily',{
            http: {
                path: '/riskPredictionDaily',
                verb: 'get',
            },
            accepts: [{
                arg: 'data',
                type: 'string'
            }],
            returns: {
                arg: 'results',
                type: 'string',
            }
        }
    )
};
