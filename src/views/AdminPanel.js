import React, { useState, useEffect } from 'react';
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react';
import Loading from '../components/Loading';
import { Redirect } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Table,
  Alert,
} from 'reactstrap';



const AdminPanel = () => {
  const { user } = useAuth0();
  const [open, setOpen] = useState('');
  const [bus, setBus] = useState([]);
  const [users, setUsers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [trips, setTrips] = useState([]);

  const toggle = (id) => {
    if (open === id) {
      setOpen();
    } else {
      setOpen(id);
    }};

    useEffect(() => {
      const usersFetch = async () => {
          try {
              const response = await fetch('http://localhost:6060/users');
              const userData = await response.json();
              if (response.ok) {
                  setUsers(userData);
              } else {
                  console.error('Failed to fetch routes:', userData.message);
              }
          } catch (error) {
              console.error('Network error:', error);
          }
      };
      usersFetch();
    }, []);
  useEffect(() => {
    // console.log("Users updated:", users);
}, [users]);

    useEffect(() => {
      const routesFetch = async () => {
          try {
              const response = await fetch('http://localhost:6060/routes');
              const userData = await response.json();
              if (response.ok) {
                  setRoutes(userData.routes);
              } else {
                  console.error('Failed to fetch routes:', userData.message);
              }
          } catch (error) {
              console.error('Network error:', error);
          }
      };
      routesFetch();
    }, []);
    useEffect(() => {
      // console.log("Routes updated:", routes);
  }, [routes]);


    useEffect(() => {
      const buses = async () => {
        <Loading />
          try {
              const response = await fetch('http://localhost:6060/buses');
              const bus = await response.json();
              if (response.ok) {
                  setBus(bus)
              } else {
                  console.error('Failed to fetch routes:', bus.message);
              }
          } catch (error) {
              console.error('Network error:', error);
          }
      };
      buses();
    }, []);
  
    useEffect(() => {
      // console.log("Buses updated:", bus);
  }, [bus]);

  useEffect(() => {
    const trips = async () => {
      <Loading />
        try {
            const response = await fetch('http://localhost:6060/trips');
            const trips = await response.json();
            if (response.ok) {
                setTrips(trips)
            } else {
                console.error('Failed to fetch routes:', trips.message);
            }
        } catch (error) {
            console.error('Network error:', error);
        }
    };
    trips();
  }, []);

  useEffect(() => {
    // console.log("Trips updated:", trips);
}, [trips]);

const handleCompleteTrip = async (tripId) => {
  const requestOptions = {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` // Assuming you're using token-based auth
      },
      body: JSON.stringify({ status: "COMPLETED" })
  };
  try {
      const response = await fetch(`http://localhost:6060/trips/${tripId}`, requestOptions);
      const data = await response.json();
      if (response.ok) {
          console.log('Trip status updated successfully:', data);          
      } else {
          console.error('Failed to update trip status:', data.message);
      }
  } catch (error) {
      console.error('Error updating trip status:', error);
  }
  window.location.reload();
};


// function handleCompleteTrip (tripId){
//   // // console.log(tripId);
//   // toggle();
//   // fetchTrips(); 
//   console.log("handleCompleteTrip Clicked");
// }


const handleCancelTrip = async (tripId) => {
  const requestOptions = {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}` // Assuming you're using token-based auth
    },
    body: JSON.stringify({ status: "CANCELLED" })
};
try {
    const response = await fetch(`http://localhost:6060/trips/${tripId}`, requestOptions);
    const data = await response.json();
    if (response.ok) {
        console.log('Trip status updated successfully:', data);          
    } else {
        console.error('Failed to update trip status:', data.message);
    }
} catch (error) {
    console.error('Error updating trip status:', error);
}
window.location.reload();
};



const handleReview = async (tripId) => {
  console.log("handleReview Clicked", tripId);
  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:6060/trips/${tripId}/reviews`);
      const data = await response.json();
      if (response.ok) {
        // Formatting reviews data into a readable string
        let reviewsString = data.reviews.map(review => {
          return `Review: ${review.content}\nRating: ${review.rating}\nDate: ${review.created_at}`;
        }).join('\n\n');
        
        console.log(reviewsString);
        alert(reviewsString); // Alerting formatted string
      } else {
        console.error('Failed to fetch reviews:', data.message);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };
  fetchReviews();
};

const [busNumber, setBusNumber] = useState('');
const [capacity, setCapacity] = useState('');
const [make, setMake] = useState('');
const [model, setModel] = useState('');

const handleSubmit = async (event) => {
  // event.preventDefault(); // Prevents the default form submission behavior

  const busData = {
    bus_number: busNumber,
    capacity: parseInt(capacity, 10),
    make: make,
    model: model
  };

  try {
    const response = await fetch('http://localhost:6060/buses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(busData)
    });

    if (response.ok) {
      const result = await response.json();
      alert('Bus added successfully!');
      console.log('Success:', result);
    } else {
      throw new Error('Failed to add bus');
    }
  } catch (error) {
    alert('Error: ' + error.message);
    console.error('Error:', error);
  }
};

const [start, setStart] = useState('');
const [destination, setDestination] = useState('');
const [distance, setDistance] = useState('');

  // Handle form submission
  const handleSubmitRoute = async (event) => {
    // event.preventDefault(); // Prevents the default form submission behavior

    const routeData = {
      start: start,
      destination: destination,
      distance: parseFloat(distance)
    };

    try {
      const response = await fetch('http://localhost:6060/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(routeData)
      });

      if (response.ok) {
        const result = await response.json();
        alert('Route added successfully!');
        console.log('Success:', result);
      } else {
        throw new Error('Failed to add route');
      }
    } catch (error) {
      alert('Error: ' + error.message);
      console.error('Error:', error);
    }
  };

return (
    <>
    <div style={{ display: 'flex', justifyContent: 'center' }}> {/* This centers the Accordion horizontally */}
      <Accordion open={open} toggle={toggle} style={{ width: '80%' }}> {/* Adjust width as needed */}
        <AccordionItem>
        <AccordionHeader targetId="1"><b>List Users</b></AccordionHeader>
          <AccordionBody accordionId="1">
          <Table striped>
          <thead>
        <tr>
          <th>#</th>
          <th>Username</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.id}</td>
            <td>{user.username}</td>
            <td>{user.email}</td>
          </tr>
        ))}
      </tbody>
        </Table>         

        </AccordionBody>
        </AccordionItem>
        <p></p>
        <AccordionItem>
          <AccordionHeader targetId="2"><b>List & Add Routes</b></AccordionHeader>
          <AccordionBody accordionId="2">

          <div>
            <form onSubmit={handleSubmitRoute}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 1000}}>
                Start:
                <input
                  type="text"
                  value={start}
                  onChange={e => setStart(e.target.value)}
                />
              </label>
              <br />
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 1000}}>
                Destination:
                <input
                  type="text"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                />
              </label>
              <br />
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 1000}}>
                Distance (km):
                <input
                  type="number"
                  step="0.1"
                  value={distance}
                  onChange={e => setDistance(e.target.value)}
                />
              </label>
              <br />
              <button type="submit">Add Route</button>
            </form>
           </div>

          <Table striped>
          <thead>
        <tr>
          <th>#</th>
          <th>Route</th>
          <th>Distance</th>
        </tr>
      </thead>
      <tbody>
        {routes.map((routes) => (
          <tr key={routes.id}>
            <td>{routes.id}</td>
            <td>{routes.start} - {routes.destination}</td>
            <td>{routes.distance}</td>
          </tr>
        ))}
      </tbody>
        </Table>   
          </AccordionBody>
        </AccordionItem>
        <p></p>
        <AccordionItem>
          <AccordionHeader targetId="3"><b>List & Add Buses</b></AccordionHeader>
          <AccordionBody accordionId="3">
          <div>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 1000}}>
          Bus Number:
          <input
            type="text"
            value={busNumber}
            onChange={e => setBusNumber(e.target.value)}
          />
        </label>
        <br />
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 1000}}>
          Capacity:
          <input
            type="number"
            value={capacity}
            onChange={e => setCapacity(e.target.value)}
          />
        </label>
        <br />
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 1000}} >
          Make:
          <input
            type="text"
            value={make}
            onChange={e => setMake(e.target.value)}
          />
        </label>
        <br />
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 1000}}>
          Model:
          <input
            type="text"
            value={model}
            onChange={e => setModel(e.target.value)}
          />
        </label>
        <br />
        <button type="submit">Add Bus</button>
      </form>
    </div>
          <Table striped>
          <thead>
        <tr>
          <th>#</th>
          <th>Model</th>
          <th>Make</th>
          <th>Bus Number</th>
          <th>Capacity</th>
        </tr>
      </thead>
      <tbody>
        {bus.map((bus) => (
          <tr key={bus.id}>
            <td>{bus.id}</td>
            <td>{bus.model}</td>
            <td>{bus.make}</td>
            <td>{bus.bus_number}</td>
            <td>{bus.capacity}</td>
          </tr>
        ))}
      </tbody>
        </Table>  
          </AccordionBody>
        </AccordionItem>
        <p></p>
        <AccordionItem>
          <AccordionHeader targetId="4"><b>Trips & Reviews</b></AccordionHeader>
          <AccordionBody accordionId="4">
          <Table striped>
      <thead>
        <tr>
          <th>#</th>
          <th>Route</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {trips.sort((a, b) => {
          const statusPriority = {
            'PENDING': 1,
            'COMPLETED': 2,
            'CANCELLED': 3
          };
          return statusPriority[a.status] - statusPriority[b.status];
        }).map((trip, index) => {
          const user = users.find(u => u.id === trip.user_id);
          const route = routes.find(r => r.id === trip.route_id);
          return (
            <tr key={index}>
              <b><td>{index + 1}. {user ? user.username : 'No matching user'}</td></b>
              <td>{route ? `${route.start} to ${route.destination}` : 'Route details not available'}</td>
              <td><b>{trip.status}</b></td>
              <td>
                {trip.status !== 'COMPLETED' && trip.status !== 'CANCELLED' ? (
                  <>
                    <button style={{ color: 'black', backgroundColor: '#cfe2ff', padding: '10px 20px', border: 'none', borderRadius: '5px' }} onClick={() => handleCancelTrip(trip.id)}>
                      <b>⛔ Cancel ⛔</b>
                    </button>
                    <p></p>
                    <button style={{ color: 'black', backgroundColor: '#cfe2ff', padding: '10px 20px', border: 'none', borderRadius: '5px' }} onClick={() => handleCompleteTrip(trip.id)}>
                      <b>✅ Complete</b>
                    </button>
                  </>
                ) : (
                  <button style={{ color: 'black', backgroundColor: '#cfe2ff', padding: '10px 20px', border: 'none', borderRadius: '5px' }} onClick={() => handleReview(trip.id)}>
                    <b>Feedback 📚</b>
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
          </AccordionBody>
        </AccordionItem>

      </Accordion>
    </div>
    </>
  );
};

const withAdminAccess = (Component, options) => {
  return function AdminAccess(props) {
    const { user, isLoading, isAuthenticated } = useAuth0();

    if (isLoading) {
      return <Loading />;
    }

    if (!isAuthenticated) {
      return withAuthenticationRequired(() => null, options)();
    }

    if (user.name !== "xanaji9685@rartg.com") {
      // Redirect or show an error message if not admin
    //   return <Redirect to="/" />;
        return <div>Access denied. You are not authorized to view this page.</div>;
    }

    return <Component {...props} />;
  };

};

export default withAdminAccess(AdminPanel, {
  onRedirecting: () => <Loading />,
});
