'use client';

import { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
// import { type InputProps } from '@/components/ui/input'; // Import InputProps for better typing

interface GoogleMapsAddressInputProps {
  value?: string;
  onChange: (value: string) => void;
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void;
}

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

export function GoogleMapsAddressInput({
  value,
  onChange,
  onPlaceSelected,
  ...props
}: GoogleMapsAddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;

  useEffect(() => {
    const initializeAutocomplete = () => {
      if (!inputRef.current || !window.google || !window.google.maps.places) {
        return;
      }

      const autocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['address'],
          componentRestrictions: { country: 'us' },
          fields: ['address_components', 'formatted_address', 'geometry'],
        }
      );

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place?.formatted_address) {
          onChange(place.formatted_address);
          onPlaceSelected(place);
        }
      });
    };

    // If script is already on the page, just initialize
    if (window.google && window.google.maps && window.google.maps.places) {
      initializeAutocomplete();
      return;
    }

    // Otherwise, load the script
    const scriptId = 'google-maps-script';
    if (!document.getElementById(scriptId)) {
      window.initGoogleMaps = initializeAutocomplete;
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        if ('initGoogleMaps' in window) {
          // @ts-expect-error: dynamic property cleanup
          delete window.initGoogleMaps;
        }
      };
    }
  }, [apiKey, onChange, onPlaceSelected]);

  return (
    <Input
      ref={inputRef}
      defaultValue={value}
      onChange={e => onChange(e.target.value)}
      {...props}
    />
  );
}
