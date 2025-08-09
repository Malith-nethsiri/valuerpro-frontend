/// <reference types="@types/google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapProps {
    center?: { lat: number; lng: number };
    zoom?: number;
    height?: string;
    onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
    marker?: { lat: number; lng: number };
    className?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
    center = { lat: 7.8731, lng: 80.7718 }, // Sri Lanka center
    zoom = 7,
    height = '400px',
    onLocationSelect,
    marker,
    className = '',
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [mapMarker, setMapMarker] = useState<google.maps.Marker | null>(null);
    const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);

    useEffect(() => {
        const initMap = async () => {
            const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

            if (!apiKey) {
                console.warn('Google Maps API key not found. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file');
                return;
            }

            try {
                const loader = new Loader({
                    apiKey,
                    version: 'weekly',
                    libraries: ['places'],
                });

                const google = await loader.load();

                if (mapRef.current) {
                    const mapInstance = new google.maps.Map(mapRef.current, {
                        center,
                        zoom,
                        mapTypeControl: true,
                        streetViewControl: true,
                        fullscreenControl: true,
                    });

                    const geocoderInstance = new google.maps.Geocoder();
                    setGeocoder(geocoderInstance);
                    setMap(mapInstance);

                    // Add click listener for location selection
                    if (onLocationSelect) {
                        mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
                            const lat = e.latLng?.lat();
                            const lng = e.latLng?.lng();

                            if (lat && lng) {
                                geocoderInstance.geocode(
                                    { location: { lat, lng } },
                                    (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
                                        if (status === 'OK' && results?.[0]) {
                                            onLocationSelect({
                                                lat,
                                                lng,
                                                address: results[0].formatted_address,
                                            });
                                        } else {
                                            onLocationSelect({
                                                lat,
                                                lng,
                                                address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                                            });
                                        }
                                    }
                                );
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('Error loading Google Maps:', error);
            }
        };

        initMap();
    }, [center.lat, center.lng, zoom, onLocationSelect]);

    // Update marker when marker prop changes
    useEffect(() => {
        if (map && marker) {
            if (mapMarker) {
                mapMarker.setMap(null);
            }

            const newMarker = new google.maps.Marker({
                position: marker,
                map,
                draggable: !!onLocationSelect,
            });

            if (onLocationSelect) {
                newMarker.addListener('dragend', () => {
                    const position = newMarker.getPosition();
                    if (position && geocoder) {
                        const lat = position.lat();
                        const lng = position.lng();

                        geocoder.geocode(
                            { location: { lat, lng } },
                            (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
                                if (status === 'OK' && results?.[0]) {
                                    onLocationSelect({
                                        lat,
                                        lng,
                                        address: results[0].formatted_address,
                                    });
                                } else {
                                    onLocationSelect({
                                        lat,
                                        lng,
                                        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                                    });
                                }
                            }
                        );
                    }
                });
            }

            setMapMarker(newMarker);
            map.setCenter(marker);
        }
    }, [map, marker, onLocationSelect, geocoder]);

    return (
        <div className={`relative ${className}`}>
            <div
                ref={mapRef}
                style={{ height }}
                className="w-full rounded-lg border border-gray-300"
            />
            {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
                <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                        <div className="text-lg font-medium">Google Maps</div>
                        <div className="text-sm">API key required</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoogleMap;
