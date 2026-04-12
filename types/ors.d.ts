interface OrsRoute {
    polygons: OrsPolygon[];
}

interface OrsPolygon {
    geometry: OrsPolygonGeometry;
    properties: OrsPolygonProperties;
}

interface OrsPolygonProperties {
    total_pop: number;
    range_type: "time";
    color: `#${string}`;
    fillColor: `#${string}`;
    label: string;
    area: string;
}

interface OrsPolygonGeometry {
    coordinates: [[number, number][]];
    type: "Polygon";
}

interface Import<T> {
    default: T;
}
