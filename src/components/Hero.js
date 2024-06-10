import React from "react";
import { Button } from "reactstrap";
import { NavLink } from "react-router-dom";

function handleBookClick(){
  console.log("Book clicked");
}

const Hero = () => (
  <>
  <div className="text-center hero my-5">
    <h1 className="mb-4">MA3SYNC</h1>
    <p className="lead">
            Efficiently handle your daily 
            commutes or occasional travels with ease.
    </p>
  </div>
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
  <NavLink to="/bookTrip" style={{ textDecoration: 'none' }}>
  <Button
    color="primary"
    size="3g"
    // className="mt-0"
    onClick={handleBookClick}
  >
    Book Trip
  </Button>
</NavLink>
</div>
</>
);

export default Hero;
