/** Static hotel data — partner hotels near Iași airport (LRIA) for overnight disruptions. */
export interface Hotel {
  id: string;
  name: string;
  /** Distance from LRIA in km. */
  distanceKm: number;
  /** Price per night in EUR. */
  pricePerNight: number;
  /** Rating out of 5. */
  rating: number;
  /** Number of reviews. */
  reviews: number;
  /** Short Romanian descriptor. */
  blurb: string;
  /** Tailwind gradient classes for the placeholder image (fallback). */
  gradient: string;
  /** Representative photo URL (hotel/room/lobby). */
  image: string;
  /** Booking URL. */
  bookingUrl: string;
  /** Phone number for direct contact. */
  phone: string;
  /** Amenities list (Romanian). */
  amenities: string[];
  /** Longer Romanian description shown on the detail page. */
  description: string;
}

export const HOTELS: Hotel[] = [
  {
    id: "international",
    name: "Hotel International Iași",
    distanceKm: 7.4,
    pricePerNight: 89,
    rating: 4.6,
    reviews: 1284,
    blurb: "5 stele în centru · spa și transfer gratuit",
    gradient: "from-[#c8a24e] via-[#e8c97a] to-[#b8924e]",
    image:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=70",
    bookingUrl: "https://www.booking.com/hotel/ro/international-iasi.ro.html",
    phone: "+40232942020",
    amenities: [
      "Transfer gratuit la aeroport",
      "Centru spa și piscină",
      "Wi-Fi rapid gratuit",
      "Restaurant și bar",
      "Parcare privată",
      "Recepție 24/7",
    ],
    description:
      "Hotel de 5 stele situat în inima Iașului, ideal pentru o noapte confortabilă în cazul unui zbor anulat. Oferă transfer gratuit de la și către Aeroportul Iași, un centru spa complet și camere spațioase cu vedere spre oraș.",
  },
  {
    id: "unirea",
    name: "Grand Hotel Unirea",
    distanceKm: 8.1,
    pricePerNight: 76,
    rating: 4.4,
    reviews: 942,
    blurb: "Vedere panoramică · restaurant la etaj 13",
    gradient: "from-[#5b8fa8] via-[#7ab5cc] to-[#3d7090]",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/d/df/Ia%C5%9Fi_%2C_Hotel_Unirea_3.JPG",
    bookingUrl: "https://www.booking.com/hotel/ro/grand-unirea-iasi.ro.html",
    phone: "+40232205000",
    amenities: [
      "Restaurant panoramic la etajul 13",
      "Centru de fitness și saună",
      "Wi-Fi gratuit",
      "Mic dejun bufet",
      "Săli de conferințe",
      "Recepție 24/7",
    ],
    description:
      "Emblemă a Iașului, Grand Hotel Unirea îmbină eleganța clasică cu priveliști panoramice asupra orașului. Restaurantul de la etajul 13 și centrul de relaxare fac dintr-o escală neplanificată o experiență plăcută.",
  },
  {
    id: "select",
    name: "Hotel Select",
    distanceKm: 6.2,
    pricePerNight: 64,
    rating: 4.3,
    reviews: 671,
    blurb: "Aproape de aeroport · mic dejun inclus",
    gradient: "from-[#7c6f5a] via-[#a8987c] to-[#6a5e48]",
    image:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=70",
    bookingUrl: "https://www.booking.com/hotel/ro/select-iasi.ro.html",
    phone: "+40232415415",
    amenities: [
      "Mic dejun inclus",
      "Aproape de aeroport",
      "Wi-Fi gratuit",
      "Parcare gratuită",
      "Restaurant tradițional",
      "Check-in rapid",
    ],
    description:
      "Hotel boutique cu un raport excelent calitate-preț, situat la doar câteva minute de Aeroportul Iași. Camerele primitoare și micul dejun inclus îl fac alegerea practică pentru o ședere de o noapte.",
  },
  {
    id: "pleiada",
    name: "Hotel Pleiada Boutique",
    distanceKm: 9.8,
    pricePerNight: 112,
    rating: 4.8,
    reviews: 528,
    blurb: "Boutique de lux · piscină interioară",
    gradient: "from-[#8b6b8a] via-[#b090ae] to-[#6e5070]",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=70",
    bookingUrl: "https://www.booking.com/hotel/ro/pleiada-iasi.ro.html",
    phone: "+40232270000",
    amenities: [
      "Piscină interioară încălzită",
      "Spa și tratamente de lux",
      "Wi-Fi gratuit",
      "Restaurant gourmet",
      "Parcare privată",
      "Concierge 24/7",
    ],
    description:
      "Cel mai rafinat hotel boutique din zonă, Pleiada oferă lux discret, o piscină interioară și un restaurant gourmet apreciat. Perfect dacă vrei să transformi o noapte neașteptată într-un mic răsfăț.",
  },
  {
    id: "moldova",
    name: "Hotel Moldova",
    distanceKm: 8.6,
    pricePerNight: 58,
    rating: 4.1,
    reviews: 803,
    blurb: "Clasic și confortabil · parcare gratuită",
    gradient: "from-[#5a7a5a] via-[#82a882] to-[#3e5e3e]",
    image:
      "https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=800&q=70",
    bookingUrl: "https://www.booking.com/hotel/ro/moldova-iasi.ro.html",
    phone: "+40232142100",
    amenities: [
      "Parcare gratuită",
      "Wi-Fi gratuit",
      "Restaurant clasic",
      "Mic dejun disponibil",
      "Camere familiale",
      "Recepție 24/7",
    ],
    description:
      "Un hotel clasic și confortabil, cu tarife accesibile și o atmosferă caldă. Hotel Moldova este o opțiune sigură și liniștită pentru pasagerii care au nevoie de cazare peste noapte aproape de aeroport.",
  },
  {
    id: "ramada",
    name: "Ramada by Wyndham Iași",
    distanceKm: 5.1,
    pricePerNight: 95,
    rating: 4.5,
    reviews: 1097,
    blurb: "Cel mai aproape de LRIA · check-in 24/7",
    gradient: "from-[#c8a24e] via-[#e8c97a] to-[#b8924e]",
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=70",
    bookingUrl: "https://www.booking.com/hotel/ro/ramada-iasi.ro.html",
    phone: "+40232999999",
    amenities: [
      "Cel mai aproape de aeroport",
      "Check-in 24/7",
      "Wi-Fi rapid gratuit",
      "Centru de fitness",
      "Restaurant și bar",
      "Parcare privată",
    ],
    description:
      "Parte a lanțului internațional Wyndham, Ramada Iași este cel mai apropiat hotel partener de Aeroportul Iași. Cu check-in non-stop și standarde de brand consecvente, este ideal pentru sosiri întârziate sau zboruri reprogramate.",
  },
];

/** Returns the hotel matching the given id, or undefined if none exists. */
export function getHotel(id: string): Hotel | undefined {
  return HOTELS.find((hotel) => hotel.id === id);
}
