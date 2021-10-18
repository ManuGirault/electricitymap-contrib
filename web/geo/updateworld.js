const { polygon, getCoords, getType, featureEach, featureCollection, dissolve, unkinkPolygon, area } = require("@turf/turf")
const fs = require("fs");
const newFileCallback = fileName => console.log("Created new file: " + fileName);
const getJSON = (fileName, encoding = "utf8", callBack = () => { }) =>
    typeof fileName === "string" ?
        JSON.parse(fs.readFileSync(fileName, encoding, () => callBack())) :
        fileName;

const writeJSON = (fileName, obj, callBack = newFileCallback, encoding = 'utf8') =>
    fs.writeFile(fileName, JSON.stringify(obj), encoding, () => callBack(fileName));

const config = {
    MIN_AREA_HOLES: 800000000
}

const fc = getJSON("./world.geojson");
validateGeometry(fc)

function validateGeometry(fc) {
    // countGaps(fc);
    ensureComplexity(fc)
    // find overlaps
    // find complexity
    // ensure ids
    // ensure physical consistency
    // ensure geojson specification
    // bound on complexity
}

function detectChanges() {
    // get added
    // get removed
    // all zonekeys affected
}

function generateTopojson() {

}


// create world.geojson
// const data = getJSON("../src/world.json")
// Object.keys(data.objects).forEach(key => {
//     data.objects[key]['id'] = key;
//     data.objects[key]["properties"] = {"zoneName": key}
// })

// writeJSON("./world.json", data);

// console.log(data.objects["DK-DK1"]);


/* Helper functions */

function ensureComplexity(fc) {
        
}

function countGaps(fc) {
    const dissolved = getPolygons(dissolve(getPolygons(fc)));
    writeJSON("./tmp/dissolved.geojson", dissolved)
    let holes = getHoles(dissolved);
    console.log(holes.features.length);
    writeJSON("./tmp/holes.geojson", holes)

}


function getPolygons(data) {
    const handlePolygon = (feature, props) => polygon(getCoords(feature), props)
    const handleMultiPolygon = (feature, props) => getCoords(feature).map(coord => polygon(coord, props));
    const handleGeometryCollection = (feature) => feature.geometries.map((ft) => getType(ft) === "Polygon" ? handlePolygon(ft) : handleMultiPolygon(ft));

    const polygons = [];

    const dataGeojsonType = getType(data)
    if (dataGeojsonType !== "FeatureCollection") {
        data = featureCollection([data]);
    }
    featureEach(data, (feature) => {
        const type = getType(feature);
        switch (type) {
            case "Polygon":
                polygons.push(handlePolygon(feature, feature.properties))
                break;
            case "MultiPolygon":
                polygons.push(...handleMultiPolygon(feature, feature.properties))
                break;
            default:
                throw Error("Encountered unhandled type: " + type);
        }
    })

    return featureCollection(polygons);
}

function getHoles(fc) {
    const holes = []
    featureEach(fc, (ft) => {
        const coords = getCoords(ft);
        if (coords.length > 1) {
            for (let i = 1; i < coords.length; i++) {
                const pol = polygon([coords[i]]);
                if (area(pol) < config.MIN_AREA_HOLES) {
                    holes.push(pol);
                }
            }
        }
    });
    return featureCollection(holes);
}