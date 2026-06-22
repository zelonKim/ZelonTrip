"use client";

import React, { useEffect, useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Polyline,
  InfoWindow,
  useMap,
  useMapsLibrary,
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
  const routesLibrary = useMapsLibrary("routes");
  const [routePath, setRoutePath] = useState<google.maps.LatLngLiteral[]>([]);

  useEffect(() => {
    if (!map || !places || places.length < 2 || !routesLibrary) return;

    const directionsService = new routesLibrary.DirectionsService();

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
        travelMode: "DRIVING" as google.maps.TravelMode,
        optimizeWaypoints: true,
      },
      (result, status) => {
        // 🎯 [보완] status가 OK여도 result.routes 구조가 완벽히 존재하는지 한 번 더 이중 검증합니다.
        if (status === "OK" && result && result.routes && result.routes[0]) {
          try {
            const legs = result.routes[0].legs || [];
            const legPaths = legs.flatMap((leg: any) => {
              const steps = leg.steps || [];
              return steps.flatMap((step: any) => {
                // step.path가 없거나 비어있을 경우를 대비해 안전하게 방어합니다.
                const pathArray =
                  typeof step.path?.getArray === "function"
                    ? step.path.getArray()
                    : step.path || [];

                return pathArray.map((p: any) => ({
                  lat: typeof p.lat === "function" ? p.lat() : p.lat,
                  lng: typeof p.lng === "function" ? p.lng() : p.lng,
                }));
              });
            });

            setRoutePath(legPaths);
          } catch (e) {
            // 🎯 만약 데이터를 뜯어내다 예상치 못한 에러가 나면, 크래시를 내지 않고 직선 좌표로 안전하게 후퇴합니다.
            console.error("경로 데이터 가공 중 에러 발생, 직선으로 대체:", e);
            setRoutePath(
              places.map((p) => ({
                lat: Number(p.latitude),
                lng: Number(p.longitude),
              })),
            );
          }
        } else {
          // 구글 맵 통신 실패(예: 키 차단) 시 안전하게 마커 간 직선 연결로 대체하여 화면 붕괴 방지
          setRoutePath(
            places.map((p) => ({
              lat: Number(p.latitude),
              lng: Number(p.longitude),
            })),
          );
        }
      },
    );
  }, [map, places, routesLibrary]);

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
