import axios from 'axios';

export default axios.create({
  baseURL: "http://YOUR_IP:5000/api"
});
``