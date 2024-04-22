import React from "react";
import { Button } from "reactstrap";
import { NavLink } from "react-router-dom";

function handleBookClick(){
  console.log("Book clicked");
}

const Hero = () => (
  <>
  <div className="text-center hero my-5">
    <img className="mb-0 app-logo" src="https://scontent-mba1-1.xx.fbcdn.net/v/t39.30808-1/326104067_497230292554324_1049822699101610345_n.jpg?stp=dst-jpg_p200x200&_nc_cat=108&ccb=1-7&_nc_sid=5f2048&_nc_ohc=G-K5Q4vCZ4AAb6FsYp5&_nc_ht=scontent-mba1-1.xx&oh=00_AfB3MUQ9N_RaIF893qL7ajdRbeUfINHltXWsyH_ee3LLaQ&oe=6629E3DB" alt="logo" width="100000" />
    {/* <h1 className="mb-4">MA3SYNC</h1> */}
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
