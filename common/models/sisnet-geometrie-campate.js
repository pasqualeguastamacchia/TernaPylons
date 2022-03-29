'use strict';

module.exports = function (Sisnetgeometriecampate) {
    Sisnetgeometriecampate.list = function (page, callback) {
        page = page | 0;
        Sisnetgeometriecampate.getDataSource().connector.connect(function (err, db) {
            var collection = db.collection('Sisnet_Geometrie_Campate');
            collection.aggregate([/*{
                $lookup:{
                    from: 'Sisnet_LIV2_Campate',
                    localField: 'STRNO',
                    foreignField: 'CODICE_CAMPATA',
                    as: 'details'
                }
            },{
                $unwind: '$details'
            },*/{
                    $lookup: {
                        from: 'Mappatura_Meteo_Campate',
                        localField: 'STRNO',
                        foreignField: 'codice_campata',
                        as: 'meteo_campata'
                    }
                }, {
                    $unwind: '$meteo_campata'
                }, {
                    $lookup: {
                        from: 'RadarMeteo',
                        let: { lat: "$meteo_campata.lat_meteo", lon: "$meteo_campata.lon_meteo" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$LATITUDINE", "$$lat"] },
                                        { $eq: ["$LONGITUDINE", "$$lon"] },
                                        { $gte: ["$DATA_ORA_UTC", new Date('2021-01-01T00:00:00.000Z')] },
                                        { $lt: ["$DATA_ORA_UTC", new Date('2021-01-02T00:00:00.000Z')] }
                                    ]
                                }
                            }
                        }, {
                            $group: {
                                _id: null,
                                maxTemp: { $max: "$TEMPERATURA_GC" },
                                minTemp: { $min: "$TEMPERATURA_GC" },
                                maxUmid: { $max: "$PRECIPITAZIONI_MM" },
                                minUmid: { $min: "$PRECIPITAZIONI_MM" },
                                maxVent: { $max: "$VELOCITA_VENTO_KMH" },
                                minVent: { $min: "$VELOCITA_VENTO_KMH" }

                            }
                        }],
                        as: 'meteo'
                    }
                }, {
                    $unwind: '$meteo'
                }, {
                    $project: {
                        "ID_ELEMENTO": "$ID_ELEMENTO",
                        "STRNO": "$STRNO",
                        "STRNO_INI": "$STRNO_INI",
                        "STRNO_FIN": "$STRNO_FIN",
                        "LON_INI": "$COORD_X_INI",
                        "LAT_INI": "$COORD_Y_INI",
                        "LON_FIN": "$COORD_X_FIN",
                        "LAT_FIN": "$COORD_Y_FIN",
                        "TRIF": "$TRIF",
                        "INSERT_DATE": "$INSERT_DATE",
                        /*"AOT":"$details.AOT",*/
                        "LIVELLO_TENSIONE": "$meteo_campata.livello_di_tensione",
                        "LUNGHEZZA_CAMPATA": "$meteo_campata.lunghezza_campata",
                        "TEMPERATURA_MASSIMA": "$meteo.maxTemp",
                        "TEMPERATURA_MINIMA": "$meteo.minTemp",
                        "PRECIPITAZIONI_MASSIME": "$meteo.maxUmid",
                        "PRECIPITAZIONI_MINIME": "$meteo.maxUmid",
                        "VENTO_MASSIMO": "$meteo.maxVent",
                        "VENTO_MINIMO": "$meteo.minVent",
                    }
                }, {
                    $limit: 1000
                }], function (err, aggregationCursor) {
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
    Sisnetgeometriecampate.details = function (codiceCampata, data, callback) {
        var currentDate = new Date(data || new Date().toISOString());
        var fromDate = new Date(currentDate.getTime())
        fromDate.setHours(currentDate.getHours() - 36);
        var toDate = new Date(currentDate.getTime());
        toDate.setDate(currentDate.getDate() + 7);
        Sisnetgeometriecampate.getDataSource().connector.connect(function (err, db) {
            var collection = db.collection('Sisnet_Geometrie_Campate');
            collection.aggregate([
                { $match: { STRNO: codiceCampata } },
                {
                    $lookup:
                    {
                        from: "Mappatura_Sensori",
                        let: { sost_ini: "$STRNO_INI", sost_fin: "$STRNO_FIN" },
                        pipeline: [
                            {
                                $match:
                                {
                                    $expr:
                                    {
                                        $or:
                                            [
                                                { $eq: ["$sostegno fine campata", "$$sost_ini"] },
                                                { $eq: ["$sostegno fine campata", "$$sost_fin"] }
                                            ]
                                    }
                                }
                            },
                            { $project: { _id: 0, "Client ID": 1, "sostegno fine campata": 1 } }
                        ],
                        as: "mapSens"
                    }
                },
                { $unwind: "$mapSens" },
                {
                    $lookup:
                    {
                        from: "IoT",
                        let: { clientId: "$mapSens.Client ID" },
                        pipeline: [
                            {
                                $match:
                                {
                                    $expr:
                                    {
                                        $and:
                                            [
                                                { $eq: ["$deviceID", "$$clientId"] },
                                                { $gte: ["$timestamp", fromDate] },
                                                { $lt: ["$timestamp", toDate] }
                                            ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    "eitload04b_min": 1
                                    , "eitload08a_min": 1
                                    , "eitload08a_max": 1
                                    , "eitload12a_min": 1
                                    , "eitload08b_min": 1
                                    , "eitload12b_max": 1
                                    , "eitload12b_avg": 1
                                    , "eitload04a_min": 1
                                    , "eitload12a_avg": 1
                                    , "eitload04b_avg": 1
                                    , "eitload12b_min": 1
                                    , "eitload04a_avg": 1
                                    , "eitload04a_max": 1
                                    , "eitload04b_max": 1
                                    , "eitload08b_avg": 1
                                    , "eitload08b_max": 1
                                    , "eitload08a_avg": 1
                                }
                            }
                        ],
                        as: "IoT"
                    }
                },
                { $unwind: "$IoT" },
                {
                    $project: {
                        "_id": 0,
                        "Codice_Campata": "$STRNO",
                        "ClientId": "$mapSens.Client ID",
                        "Sostegno": "$mapSens.sostegno fine campata"
                        , "eitload04b_min": "$IoT.eitload04b_min"
                        , "eitload08a_min": "$IoT.eitload08a_min"
                        , "eitload08a_max": "$IoT.eitload08a_max"
                        , "eitload12a_min": "$IoT.eitload12a_min"
                        , "eitload08b_min": "$IoT.eitload08b_min"
                        , "eitload12b_max": "$IoT.eitload12b_max"
                        , "eitload12b_avg": "$IoT.eitload12b_avg"
                        , "eitload04a_min": "$IoT.eitload04a_min"
                        , "eitload12a_avg": "$IoT.eitload12a_avg"
                        , "eitload04b_avg": "$IoT.eitload04b_avg"
                        , "eitload12b_min": "$IoT.eitload12b_min"
                        , "eitload04a_avg": "$IoT.eitload04a_avg"
                        , "eitload04a_max": "$IoT.eitload04a_max"
                        , "eitload04b_max": "$IoT.eitload04b_max"
                        , "eitload08b_avg": "$IoT.eitload08b_avg"
                        , "eitload08b_max": "$IoT.eitload08b_max"
                        , "eitload08a_avg": "$IoT.eitload08a_avg"
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
    Sisnetgeometriecampate.remoteMethod(
        'list', {
            http: {
                path: '/list',
                verb: 'get',
            },
            accepts: {
                arg: 'page',
                type: 'number',
            },
            returns: {
                arg: 'results',
                type: 'string',
            }
        }
    );
    Sisnetgeometriecampate.remoteMethod(
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
};
