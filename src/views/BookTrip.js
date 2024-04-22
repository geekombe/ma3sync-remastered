import React, { useState, useEffect } from "react";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Loading from "../components/Loading";
import { Form, FormGroup, Label, Input,Button } from 'reactstrap';

const BookTrip = () => {
  const { user } = useAuth0();
  const [userid, setUserId] = useState("");
  const [routes, setRoutes] = useState({});
  // const [bus, setBus] = useState();

  // useEffect(() => {
  //   const busesFetch = async () => {
  //     <Loading />
  //       try {
  //           const response = await fetch('http://localhost:6060/buses');
  //           const bus = await response.json();
  //           if (response.ok) {
  //               setBus(bus)
  //               // console.log(bus);
  //               // buses = data
  //           } else {
  //               console.error('Failed to fetch routes:', bus.message);
  //           }
  //       } catch (error) {
  //           console.error('Network error:', error);
  //       }
  //   };
  //   busesFetch();
  //   // console.log(bus);
  // }, [userid]);

 const bus = [
    {
        "id": 2,
        "bus_number": "56789",
        "capacity": 14,
        "make": "Toyota",
        "model": "2021"
    },
    {
        "id": 3,
        "bus_number": "9906",
        "capacity": 3,
        "make": "Benz",
        "model": "2012"
    }
]

  const [tripDetails, setTripDetails] = useState({
    route_id: '',
    date: '',
    seats: 1,
    type: 'Express',
    bus_id: 2
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTripDetails(prevDetails => ({
      ...prevDetails,
      [name]: value,
      // bus_id: name === 'type' ? (value === 'Express' ? 2 : 3) : prevDetails.bus_id
    }));
    console.log(tripDetails);
  };

  useEffect(() => {
    if (user) {
      const authenticate = async () => {
        try {
          const response = await fetch('http://localhost:6060/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user.nickname, password: user.nickname })
          });
          const data = await response.json();
          if (response.ok) {
            setUserId(data.user.id);
            console.log(userid);
          } else {
            console.error('Login failed:', data.message);
          }
        } catch (error) {
          console.error('Network error:', error);
        }
      };
      authenticate();
    }
  }, [user]);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await fetch('http://localhost:6060/routes');
        const data = await response.json();
        if (response.ok) {
          setRoutes(data.routes.reduce((map, route) => ({
            ...map,
            [route.id]: route
          }), {}));
        } else {
          console.error('Failed to fetch routes:', data.message);
        }
      } catch (error) {
        console.error('Network error:', error);
      }
    };
    fetchRoutes();
  }, []);

  const handleBooking = async () => {

    const bookingDetails = {
        bus_id: tripDetails.bus_id,
        user_id: userid,
        route_id: tripDetails.route_id
    };

    console.log('Booking details:', bookingDetails);
    const requestOptions = {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(bookingDetails)
    };

    try {
        const response = await fetch('http://localhost:6060/trips', requestOptions);
        const data = await response.json();
        if (response.ok) {
            alert(`Trip booked successfully:`)
        } else {
            console.error('Failed to book trip:', data.message);
            alert(`Failed to book trip: ${data.message}`) 
        }
    } catch (error) {
        console.error('Error booking trip:', error);
    }
};




  return (
    <>
      <div className="lead">Hello, <i>{user ? user.nickname : "there"}</i>! Book Your Trip Here:</div>
      <p></p>
      <form>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="formType" style={{ display: 'block', marginBottom: '10px', fontWeight: 1000}}>Trip Type</label>
        <select
          id="formType"
          name="type"
          value={tripDetails.type}
          onChange={handleChange}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="Express">Express</option>
          <option value="Regular">Regular</option>
        </select>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="formRouteID" style={{ display: 'block', marginBottom: '10px', fontWeight: 1000 }}>Route</label>
        <select
          id="formRouteID"
          name="route_id"
          value={tripDetails.route_id}
          onChange={handleChange}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="">Select route</option>
          {Object.values(routes).map(route => (
            <option key={route.id} value={route.id}>
              {`${route.start} to ${route.destination} - ${route.distance} km`}
            </option>
          ))}
        </select>
      </div>
      {tripDetails.type !== 'Express' && (
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="formDate" style={{ display: 'block', marginBottom: '10px', fontWeight: 1000 }}>Date</label>
          <input
            type="date"
            id="formDate"
            name="date"
            value={tripDetails.date}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
      )}
            <div style={{ marginBottom: '20px' }}>
        <label htmlFor="formBus" style={{ display: 'block', marginBottom: '10px', fontWeight: 1000 }}>Select Bus</label>
        <select
          id="formBus"
          name="bus_id"
          value={tripDetails.bus_id}
          onChange={handleChange}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          {bus.map(bus => (
            <option key={bus.id} value={bus.id}>
              {`${bus.make} ${bus.model} (${bus.bus_number}) `}
            </option>
          ))}
        </select>
      </div>
    </form>
    <Button variant="primary" onClick={handleBooking}>Book Now</Button>
    </>
  );
};

export default withAuthenticationRequired(BookTrip, {
  onRedirecting: () => <Loading />,
});
