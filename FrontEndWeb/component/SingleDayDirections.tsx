import React, { useEffect, useState } from "react";
import { Polyline, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Place } from "@/types/Place";

interface Location {
  lat: number;
  lng: number;
}

export function SingleDayDirections({
  places,
  color,
}: {
  places: Place[];
  color: string;
}) {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");

  const [routePath, setRoutePath] = useState<Location[]>([]);

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
        travelMode: "DRIVING",
        optimizeWaypoints: true,
      },
      (result, status) => {
        if (status === "OK" && result && result.routes && result.routes[0]) {
          try {
            const legs = result.routes[0].legs || [];
            const legPaths = legs.flatMap((leg: google.maps.DirectionsLeg) => {
              const steps = leg.steps || [];
              return steps.flatMap((step: google.maps.DirectionsStep) => {
                const pathArray = step.path || [];
                return pathArray.map((p: google.maps.LatLng) => ({
                  lat: p.lat(),
                  lng: p.lng(),
                }));
              });
            });
            setRoutePath(legPaths);
          } catch (e) {
            console.error("경로 데이터 가공 중 에러 발생, 직선으로 대체:", e);
            setRoutePath(
              places.map((p) => ({
                lat: Number(p.latitude),
                lng: Number(p.longitude),
              })),
            );
          }
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
