interface LdTyped {
    "@type": string[] | string;
}

interface LdGraph {
    "@graph": (LdTyped | LdWebPageProduct)[];
}

interface LdWebPageProduct {
    "@type": ["WebPage", "Product"];
    url: string;
    name: string;
    description: string;
    mainEntity: LdItemList;
}

interface LdItemList {
    "@type": "ItemList";
    numberOfItems: number;
    itemListElement: LdListItem[];
}

interface LdListItem {
    "@type": "ListItem";
    position: number;
    item: LdApartmentProduct;
}

interface LdApartmentProduct {
    "@type": ["Apartment", "Product"];
    url: string;
    name: string;
    geo: LdGeoCoordinates;
}

interface LdHouse {
    "@type": "House";
    name: string;
    description: string;
    address: LdPostalAddress;
    geo: LdGeoCoordinates;
}

interface LdPostalAddress {
    "@type": "PostalAddress";
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    streetAddress: string;
}

interface LdGeoCoordinates {
    "@type": "GeoCoordinates";
    latitude: number;
    longitude: number;
}
