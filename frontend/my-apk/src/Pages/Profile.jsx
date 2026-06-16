import React from "react";
import Navbar from "../Components/Navbar.jsx";
const Profile = () => {
    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <>
        <Navbar/>
            <h1>Profile Page</h1>
            <h1>Welcome {user?.name}</h1>
            <p>Email: {user?.email}</p>
        </>
    );
};

export default Profile;