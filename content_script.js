"use strict";

// Put all the javascript code here, that you want to execute after page load.
// [[5.107182, 52.089177][5.110602,52.091212],[5.109631,52.087322],[5.107835,52.091186]]

const queryPolygons = (async () => {
    const { default: ors_route_jaarbeursplein } =
        /** @type {Import<OrsRoute>} */ (await import(
            browser.runtime.getURL("isochrones/ors-route-jaarbeursplein.json"),
            { with: { type: "json" } }
        ));
    const { default: ors_route_knoop } =
        /** @type {Import<OrsRoute>} */ (await import(
            browser.runtime.getURL("isochrones/ors-route-knoop.json"),
            { with: { type: "json" } }
        ));
    const { default: ors_route_sijpesteijn } =
        /** @type {Import<OrsRoute>} */ (await import(
            browser.runtime.getURL("isochrones/ors-route-sijpesteijn.json"),
            { with: { type: "json" } }
        ));
    const { default: ors_route_stationsplein } =
        /** @type {Import<OrsRoute>} */ (await import(
            browser.runtime.getURL("isochrones/ors-route-stationsplein.json"),
            { with: { type: "json" } }
        ));

    const entrances = {
        jaarbeursplein: ors_route_jaarbeursplein,
        knoop: ors_route_knoop,
        sijpesteijn: ors_route_sijpesteijn,
        stationsplein: ors_route_stationsplein,
    };

    return (/** @type {LdGeoCoordinates} */ geo) => {
        return Object.entries(entrances).map(([name, data]) => [
            name,
            data.polygons.findLast((polygon) => (
                pointInPoly(
                    geo.longitude,
                    geo.latitude,
                    polygon.geometry
                        .coordinates[0],
                )
            )),
        ]);
    };
})();

console.log(document.location.pathname);

if (document.location.pathname.startsWith("/apartment-for-rent")) {
    const ld_json_script = htmlElement(
        unwrap(document.querySelector(
            "script[type='application/ld+json']",
        )),
        HTMLScriptElement,
    );

    const ld_json = /** @type {LdHouse} */ (JSON.parse(
        ld_json_script.text,
    ));

    console.log(
        ld_json.address.streetAddress,
        ld_json.address.postalCode,
        ld_json.address.addressLocality,
    );
    console.log(ld_json.geo.latitude, ld_json.geo.longitude);

    queryPolygons.then((queryPolygons) =>
        console.dir(queryPolygons(ld_json.geo))
    );
} else if (document.location.pathname.startsWith("/apartments")) {
    const ld_json_script = htmlElement(
        unwrap(document.querySelector(
            "script[type='application/ld+json']",
        )),
        HTMLScriptElement,
    );

    const ld_json = /** @type {LdGraph} */ (JSON.parse(
        ld_json_script.text,
    ));

    const list = /** @type {LdWebPageProduct} */ (ld_json["@graph"].find((p) =>
        new Set(p["@type"]).isSupersetOf( // TODO: make the function again
            new Set(
                /** @satisfies {LdWebPageProduct["@type"]} */
                (["WebPage", "Product"]),
            ),
        )
    )).mainEntity.itemListElement;

    queryPolygons.then((queryPolygons) =>
        list.map((item) =>
            console.dir(queryPolygons(item.item.geo))
        )
    );
}

// LIB

/**
 * @template T
 * @param {T | null | undefined} optional
 * @returns {T}
 */
function unwrap(optional) {
    if (optional === null) {
        throw new TypeError("null value unwrapped");
    }

    if (optional === undefined) {
        throw new TypeError("undefined value unwrapped");
    }

    return optional;
}

/**
 * @template {HTMLElement} T
 * @param {Element} element
 * @param {new (...args: unknown[]) => T} type
 * @returns {T}
 */
function htmlElement(element, type) {
    if (element instanceof type) {
        return element;
    }

    throw new TypeError(
        `element ${element.constructor.name} is not an instance of ${type.name}`,
    );
}

/**
 * @param {string} value
 * @param {string} prefix
 * @returns string | null
 */
function stripPrefix(value, prefix) {
    if (value.startsWith(prefix)) {
        return value.substring(prefix.length);
    }
    return null;
}

// Pointinpoly.js
// https://github.com/metafloor/pointinpoly/blob/master/pointinpoly.js

/**
 * @param {number} x
 * @param {number} y
 * @param {[number,number][]} poly an array of [ x, y ] elements
 * @returns
 */
function pointInPoly(x, y, poly) {
    let c = false;
    for (let l = poly.length, i = 0, j = l - 1; i < l; j = i++) {
        // @ts-expect-error
        let xj = poly[j][0], yj = poly[j][1], xi = poly[i][0], yi = poly[i][1];
        let where = (yi - yj) * (x - xi) - (xi - xj) * (y - yi);
        if (yj < yi) {
            if (y >= yj && y < yi) {
                if (where == 0) return true; // point on the line
                if (where > 0) {
                    if (y == yj) { // ray intersects vertex
                        // @ts-expect-error
                        if (y > poly[j == 0 ? l - 1 : j - 1][1]) {
                            c = !c;
                        }
                    } else {
                        c = !c;
                    }
                }
            }
        } else if (yi < yj) {
            if (y > yi && y <= yj) {
                if (where == 0) return true; // point on the line
                if (where < 0) {
                    if (y == yj) { // ray intersects vertex
                        // @ts-expect-error
                        if (y < poly[j == 0 ? l - 1 : j - 1][1]) {
                            c = !c;
                        }
                    } else {
                        c = !c;
                    }
                }
            }
        } else if (y == yi && (x >= xj && x <= xi || x >= xi && x <= xj)) {
            return true; // point on horizontal edge
        }
    }
    return c;
}
