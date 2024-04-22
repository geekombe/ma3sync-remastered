import React, { useState, useEffect } from "react";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Loading from "../components/Loading";
import { Table } from "reactstrap";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  Form,
  FormGroup,
} from 'reactstrap';
import { NavLink as RouterNavLink, useHistory } from "react-router-dom";


const MyTrips = (props) => {
  // You can use useAuth0 here if you need authentication tokens or user info
  // const [userid, setUserId] = useState("");
  const history = useHistory();
  const [showTrips, setShowTrips] = useState(false);
  const [routes, setRoutes] = useState({});
  const { user } = useAuth0();
  const [bus, setBus] = useState();
  const [allTrips, setAllTrips] = useState([]);
  const [trips, setTrips] = useState(allTrips);
  const busCapacity = 14;
  const busUsage = {};
  // const ctrips = fetchTrips();



  let userid;

  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);

  
useEffect(() => {
  const busesFetch = async () => {
    <Loading />
      try {
          const response = await fetch('http://localhost:6060/buses');
          const bus = await response.json();
          if (response.ok) {
              setBus(bus)
              // console.log(bus);
              // buses = data
          } else {
              console.error('Failed to fetch routes:', bus.message);
          }
      } catch (error) {
          console.error('Network error:', error);
      }
  };
  busesFetch();
  // console.log(bus);
}, [userid]);


  useEffect(() => {
        async function authenticate(username, password) {
          try {
            const response = await fetch('http://localhost:6060/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (response.ok) {
              // setUserId(data.user.id);
              userid = data.user.id
              // console.log(userid);
              // console.log(trips);
              // console.log(ctrips);

              // console.log(bus);
              // fetchTrips()
            } else {
              // console.error('Login failed:', data.message);
            }
          } catch (error) {
            console.error('Network error:', error);
          }
        }
        authenticate(user.nickname, user.nickname);
});





const fetchTrips = async () => {
try {
      const response = await fetch('http://localhost:6060/trips', {
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}` // Assuming you're using token-based auth
          }
      });
      const allTrips = await response.json();
      setAllTrips(allTrips);
      if (response.ok) {
          const userTrips = allTrips.filter(trip => trip.user_id === userid); // userid 
          setTrips(userTrips);
          setShowTrips(true);
          // console.log(userTrips);
          // console.log(userid);
        
      } else {
          console.error('Failed to fetch trips:', allTrips.message);
          setShowTrips(false);
      }
  } catch (error) {
      console.error('Network error:', error);
  }
  // console.log(allTrips);

  return allTrips;
};


useEffect(() => {
  fetchTrips();
}, [userid]);

useEffect(() => {
  const fetchRoutes = async () => {
    <Loading />
      try {
          const response = await fetch('http://localhost:6060/routes');
          const data = await response.json();
          if (response.ok) {
              const routesMapping = {};
              data.routes.forEach(route => {
                  routesMapping[route.id] = route;
                  // console.log(data);
              });
              setRoutes(routesMapping);
          } else {
              console.error('Failed to fetch routes:', data.message);
          }
      } catch (error) {
          console.error('Network error:', error);
      }
  };
  fetchRoutes();
});

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
          fetchTrips();  // Refresh the list of trips to show updated status
          
      } else {
          console.error('Failed to update trip status:', data.message);
      }
  } catch (error) {
      console.error('Error updating trip status:', error);
  }
  fetchTrips(); 
};

function handleReviewTrip (tripId){
  // console.log(tripId);
  toggle();
  fetchTrips(); 
}

// Process each trip in the data
allTrips.forEach(trip => {
  if (trip.status === "PENDING") {
      if (!busUsage[trip.bus_id]) {
          busUsage[trip.bus_id] = 1;  // Initialize if not already present
      } else {
          busUsage[trip.bus_id]++;  // Increment pending seat count
      }
  }
});

function getRemainingSeats(busId) {
 return busCapacity - (busUsage[busId] || 0);
}





// useEffect(() => {
//     window.location.reload();
// }, [user]); 

// const [reload, setReload] = useState(false); // State to trigger data reload
function toggleReload () {
  window.location.reload();
}

// setReload(!reload); // Toggle the reload state

const sendReview = () => {

  console.log("Sending Review");

} 


  return (
    <>
      <div className="lead" >My Trips <Button onClick={toggleReload}>Refresh Trips</Button>  </div>

      <Table striped>
    <thead>
        <tr>
            <th>#</th>
            <th>Route</th>
            <th>Status</th>
            <th>Actions</th>
            <th>Remaining Seats</th>
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
    }).map((trip, index) => (
        <tr key={index}>
            <td>{index + 1}</td>
            <td>{routes[trip.route_id] ? `${routes[trip.route_id].start} to ${routes[trip.route_id].destination}` : 'Route details not available'}</td>
            <td>{trip.status}</td>
            <td>
                {/* Only show the cancel button if the status is neither COMPLETED nor CANCELLED */}
                {trip.status !== 'COMPLETED' && trip.status !== 'CANCELLED' ? (
                    <button style={{ color: 'white', backgroundColor: 'red', padding: '10px 20px', border: 'none', borderRadius: '5px' }} onClick={() => handleCancelTrip(trip.id)}>
                        Cancel Trip
                    </button>
                ) : (
                    <button style={{ color: 'white', backgroundColor: 'blue', padding: '10px 20px', border: 'none', borderRadius: '5px' }} onClick={() => handleReviewTrip(trip.id)}>
                        Review/Comment
                    </button>
                )}
            </td>
            <td>
            {trip.status === 'PENDING' ? (
              getRemainingSeats(trip.bus_id) === 0 ? (
                <div>
                  No seats available. Leaving in 10 minutes.
                </div>
              ) : (
                getRemainingSeats(trip.bus_id)
              )
            ) : (
              'N/A'
            )}
          </td>
        </tr>
    ))}
</tbody>
</Table>
<div>
      <Form >
        <FormGroup>
        </FormGroup>{' '}
      </Form>
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Review/Comment On Trip </ModalHeader>
        <ModalBody>
          <Input
            type="textarea"
            placeholder="Write your review here..."
            rows={5}
          />
          <Input
            type="number"
            placeholder="Rating...(0-5)"
          />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={toggle}>
            Submit
          </Button>{' '}
          <Button color="secondary" onClick={toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>      
    </>
  );
};

export default withAuthenticationRequired(MyTrips, {
  onRedirecting: () => <Loading />,
});
