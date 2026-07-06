import axios from "axios"


// configuring the axios 
const axiosClient =  axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',  //base url of backend
    withCredentials: true,  // it means attach cookies with request
    headers: {
        'Content-Type': 'application/json'  // data ka format json hai
    }
});


export default axiosClient;

