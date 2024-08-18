import { useEffect, useRef, useState } from 'react';
import { GoogleMap, LoadScript, DirectionsRenderer } from '@react-google-maps/api';
import DatePicker from 'react-datepicker';
import axios from 'axios'; // Import Axios
import 'react-datepicker/dist/react-datepicker.css';
import '../css/Hero.css';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 59.3293,
  lng: 18.0686
};

const BASE_FEE = 90;
const COST_PER_KM = 19;
const COST_PER_HOUR = 730;

const Hero = () => {
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [price, setPrice] = useState(null);
  const [priceDetailsVisible, setPriceDetailsVisible] = useState(false);
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [optionalAddress, setOptionalAddress] = useState(''); // New state for the optional destination
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  
  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);
  const optionalRef = useRef(null); // New ref for the optional destination

  const calculateDistanceAndDuration = () => {
    const google = window.google;
    if (google && pickupRef.current && dropoffRef.current) {
      const service = new google.maps.DistanceMatrixService();
      const destinations = [dropoffRef.current.value];
      if (optionalRef.current.value) {
        destinations.unshift(optionalRef.current.value);
      }
      service.getDistanceMatrix({
        origins: [pickupRef.current.value],
        destinations,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC
      }, (response, status) => {
        if (status === google.maps.DistanceMatrixStatus.OK) {
          const result = response.rows[0].elements.reduce((acc, element) => {
            acc.distanceValue += element.distance.value;
            acc.durationValue += element.duration.value;
            return acc;
          }, { distanceValue: 0, durationValue: 0 });

          const distanceValue = result.distanceValue / 1000;
          const durationValue = result.durationValue / 3600;

          setDistance(`${distanceValue.toFixed(2)} km`);
          setDuration(`${durationValue.toFixed(2)} hours`);

          const totalPrice = BASE_FEE + (COST_PER_KM * distanceValue) + (COST_PER_HOUR * durationValue);
          setPrice(totalPrice.toFixed(2));

          const directionsService = new google.maps.DirectionsService();
          directionsService.route({
            origin: pickupRef.current.value,
            destination: dropoffRef.current.value,
            waypoints: optionalRef.current.value ? [{ location: optionalRef.current.value }] : [],
            travelMode: google.maps.TravelMode.DRIVING
          }, (response, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
              setDirectionsResponse(response);
            } else {
              console.error("Error fetching directions:", status);
            }
          });
        } else {
          console.error("Error fetching distance and duration:", status);
        }
      });
    } else {
      console.error("Google Maps API or input refs not loaded");
    }
  };

  const handlePlaceChanged = (autocomplete, field) => {
    const place = autocomplete.getPlace();
    if (place && place.formatted_address) {
      switch (field) {
        case 'pickup':
          setPickupAddress(place.formatted_address);
          break;
        case 'dropoff':
          setDropoffAddress(place.formatted_address);
          break;
        case 'optional':
          setOptionalAddress(place.formatted_address);
          break;
        default:
          break;
      }
      calculateDistanceAndDuration();
    }
  };

  useEffect(() => {
    const google = window.google;
    if (google && pickupRef.current && dropoffRef.current) {
      const pickupAutocomplete = new google.maps.places.Autocomplete(pickupRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'se' }
      });

      const dropoffAutocomplete = new google.maps.places.Autocomplete(dropoffRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'se' }
      });

      const optionalAutocomplete = new google.maps.places.Autocomplete(optionalRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'se' }
      });

      pickupAutocomplete.addListener('place_changed', () => handlePlaceChanged(pickupAutocomplete, 'pickup'));
      dropoffAutocomplete.addListener('place_changed', () => handlePlaceChanged(dropoffAutocomplete, 'dropoff'));
      optionalAutocomplete.addListener('place_changed', () => handlePlaceChanged(optionalAutocomplete, 'optional'));
    } else {
      console.error("Google Maps API or input refs not loaded");
    }
  }, []);

  const togglePriceDetails = () => {
    setPriceDetailsVisible(!priceDetailsVisible);
  };

  const handleBookNowClick = async () => {
    if (!name || !mobile) {
      setBookingMessage('Name and Mobile number are required.');
      return;
    }
    
    try {
      const bookingData = {
        name,
        mobile,
        pickupAddress,
        dropoffAddress,
        optionalAddress, // Include the optional destination in the booking data
        date: startDate.toISOString(),
        price
      };

      const response = await axios.post('http://localhost:5009/api/bookings', bookingData);

      setBookingMessage('Booking is being processed. We will get back to you soon for confirmation.');

      setName('');
      setMobile('');
      setPickupAddress('');
      setDropoffAddress('');
      setOptionalAddress(''); // Reset the optional destination field
      setStartDate(new Date());
      setDistance(null);
      setDuration(null);
      setPrice(null);
      setDirectionsResponse(null);
    } catch (error) {
      console.error("Error booking:", error);
      setBookingMessage("Failed to book. Please try again.");
    }
  };

  return (
    <div id='booking' className="hero-container">
      <div className="booking-container">
        <h2>Book a Taxi</h2>
        <form>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label>
            Mobile:
            <input
              type="text"
              name="mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </label>
          <label>
            Pickup Location:
            <input type="text" name="pickup" ref={pickupRef} />
          </label>
          <label>
            Optional Stop:  {/* New input for the optional destination */}
            <input type="text" name="optional" ref={optionalRef} />
          </label>
          <label>
            Dropoff Location:
            <input type="text" name="dropoff" ref={dropoffRef} />
          </label>
          <label>
            Booking Date and Time:
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              showTimeSelect
              timeFormat="HH:mm"
              dateFormat="MMMM d, yyyy h:mm aa"
            />
          </label>
          <button type="button" onClick={calculateDistanceAndDuration}>Calculate</button>
          {distance && duration && (
            <div className="results">
              <p><strong>Distance:</strong> {distance}</p>
              <p><strong>Duration:</strong> {duration}</p>
              {price && (
                <div>
                  <p><strong>Price:</strong> {price} SEK</p>
                  <button type="button" onClick={togglePriceDetails}>
                    {priceDetailsVisible ? 'Less Details' : 'More Details'}
                  </button>
                  {priceDetailsVisible && (
                    <div className="price-details">
                      <p><strong>Base Fee:</strong> {BASE_FEE} SEK</p>
                      <p><strong>Cost per km:</strong> {COST_PER_KM} SEK</p>
                      <p><strong>Cost per hour:</strong> {COST_PER_HOUR} SEK</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="address-details">
            {pickupAddress && <p><strong>Pickup Address:</strong> {pickupAddress}</p>}
            {optionalAddress && <p><strong>Optional Stop:</strong> {optionalAddress}</p>} {/* Display optional destination */}
            {dropoffAddress && <p><strong>Dropoff Address:</strong> {dropoffAddress}</p>}
          </div>
          <img src="../../public/images/logo_2.png" alt="logo_2" />
          <h2 className='motto'>Prioritize quality over price!</h2>
          <button type="button" onClick={handleBookNowClick} className="book-now-button">
            Book Now
          </button>
          {bookingMessage && <p className="booking-message">{bookingMessage}</p>}
        </form>
      </div>
      <div className="map-container">
        <LoadScript
          googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          libraries={['places']}
        >
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={12}
          >
            {directionsResponse && (
              <>
                <DirectionsRenderer directions={directionsResponse} />
              </>
            )}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
}; 

export default Hero;
