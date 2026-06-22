"use client";

import React, { useEffect, useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Polyline,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";

interface Place {
  place_name: string;
  latitude: string | number;
  longitude: string | number;
  description?: string;
  address?: string;
}

interface ItineraryItem {
  day: number | string;
  places: Place[];
}

const dayColors = ["#2563EB", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444"];

function SingleDayDirections({
  places,
  color,
}: {
  places: Place[];
  color: string;
}) {
  const map = useMap();
  const [routePath, setRoutePath] = useState<google.maps.LatLngLiteral[]>([]);

  useEffect(() => {
    if (!map || !places || places.length < 2) return;

    // 💡 window 객체 내 구글 지도가 정상 로드되었는지 타입 안전성 보장 확인
    if (typeof google === "undefined" || !google.maps) return;

    const directionsService = new google.maps.DirectionsService();
    const origin = {
      lat: Number(places[0].latitude),
      lng: Number(places[0].longitude),
    };
    const destination = {
      lat: Number(places[places.length - 1].latitude),
      lng: Number(places[places.length - 1].longitude),
    };
    const waypoints = places.slice(1, -1).map((p) => ({
      location: { lat: Number(p.latitude), lng: Number(p.longitude) },
      stopover: true,
    }));

    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
      },

      (result: google.maps.DirectionsResult | null, status: any) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          const legPaths = result.routes[0].legs.flatMap(
            (leg: google.maps.DirectionsLeg) =>
              leg.steps.flatMap((step: google.maps.DirectionsStep) =>
                step.path.map((p: google.maps.LatLng) => ({
                  lat: p.lat(),
                  lng: p.lng(),
                })),
              ),
          );
          setRoutePath(legPaths);
        } else {
          setRoutePath(
            places.map((p) => ({
              lat: Number(p.latitude),
              lng: Number(p.longitude),
            })),
          );
        }
      },
    );
  }, [map, places]);

  if (routePath.length === 0) return null;
  return (
    <Polyline
      path={routePath}
      strokeColor={color}
      strokeOpacity={0.85}
      strokeWeight={5}
    />
  );
}

export default function GoogleMapSection({
  itinerary,
}: {
  itinerary: ItineraryItem[];
}) {
  const [openWindowId, setOpenWindowId] = useState<string | null>(null);

  if (!itinerary || itinerary.length === 0) return null;

  const allPlaces = itinerary.flatMap((dayItem) => dayItem.places || []);
  if (allPlaces.length === 0) return null;

  const defaultCenter = {
    lat: Number(allPlaces[0].latitude),
    lng: Number(allPlaces[0].longitude),
  };

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
      <div className="w-full h-64 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <Map
          defaultZoom={13}
          defaultCenter={defaultCenter}
          gestureHandling={"cooperative"}
          disableDefaultUI={true}
          mapId="DEMO_MAP_ID"
        >
          {/* 일차별 도로 동선 */}
          {itinerary.map((dayItem, dayIdx) => {
            const currentColor = dayColors[dayIdx % dayColors.length];
            return (
              <SingleDayDirections
                key={`line-day-${dayItem.day}`}
                places={dayItem.places}
                color={currentColor}
              />
            );
          })}

          {/* 일차별 마커 및 인포윈도우 툴팁 */}
          {itinerary.map((dayItem, dayIdx) => {
            const currentColor = dayColors[dayIdx % dayColors.length];

            return dayItem.places?.map((place, pIdx) => {
              const lat = Number(place.latitude);
              const lng = Number(place.longitude);
              const markerId = `${dayItem.day}-${pIdx}`;

              if (isNaN(lat) || isNaN(lng)) return null;

              return (
                <React.Fragment key={`group-${markerId}`}>
                  <AdvancedMarker
                    position={{ lat, lng }}
                    onClick={() => setOpenWindowId(markerId)}
                  >
                    <div className="p-2 -mt-6 -ml-6 cursor-pointer select-none group flex items-center justify-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-md text-white font-black text-[10px] transition-transform group-hover:scale-110 group-active:scale-95"
                        style={{ backgroundColor: currentColor }}
                      >
                        {dayItem.day}-{pIdx + 1}
                      </div>
                    </div>
                  </AdvancedMarker>

                  {openWindowId === markerId && (
                    <InfoWindow
                      position={{ lat, lng }}
                      onCloseClick={() => setOpenWindowId(null)}
                      headerDisabled={true}
                    >
                      <div className="relative p-2.5 min-w-[190px] max-w-[230px] bg-white rounded-lg flex flex-col gap-1 text-left select-none text-gray-900">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenWindowId(null);
                          }}
                          className="absolute top-1.5 right-2 text-gray-400 hover:text-gray-600 transition-colors text-xs font-bold w-4 h-4 flex items-center justify-center rounded"
                          title="닫기"
                        >
                          ✕
                        </button>

                        <div className="flex items-center gap-1.5 border-b border-gray-100 pb-1 pr-5">
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-black text-white shrink-0"
                            style={{ backgroundColor: currentColor }}
                          >
                            {dayItem.day}-{pIdx + 1}
                          </span>
                          <h4 className="text-xs font-bold text-gray-900 truncate">
                            {place.place_name}
                          </h4>
                        </div>

                        {place.address && (
                          <p className="text-[10px] text-gray-600 leading-normal font-medium break-all whitespace-pre-wrap mt-0.5 pr-2">
                            {place.address}
                          </p>
                        )}
                      </div>
                    </InfoWindow>
                  )}
                </React.Fragment>
              );
            });
          })}
        </Map>
      </div>
    </APIProvider>
  );
}
