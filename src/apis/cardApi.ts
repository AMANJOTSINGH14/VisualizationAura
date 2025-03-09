

// const API_URL = 'http://localhost:5000/api/cards'; // Update with your backend URL

// export const fetchCards = () => axios.get(API_URL);
// export const createCard = (data: any) => axios.post(API_URL, data);
// export const updateCard = (id: string, data: any) => axios.put(`${API_URL}/${id}`, data);
// export const deleteCard = (id: string) => axios.delete(`${API_URL}/${id}`);
import axios from 'axios';
import { auth } from '../config/firebaseConfig';
import { getIdToken } from 'firebase/auth';
import { isConstructorDeclaration } from 'typescript';
const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://visualization-8p47.onrender.com' 
    : 'http://localhost:5000'; 

const API_LOGIN = `${BASE_URL}/api/user/login`;
const API_URL = `${BASE_URL}/api/cards`;
let curToken :any=null;
const authHeader = () => {
    console.log(curToken)
    return { Authorization: `Bearer ${curToken}`}
   
 };
 export const getAuthHeaders = (data:any) => {
     curToken=data;
    return null
    
  };
export const getUser = async ()=> {
    console.log("cdfd")
    const headers = await authHeader();
    if(headers==null) return null;
    return axios.post(API_LOGIN, {},{ headers });
};
export const fetchCards = async () => {
    console.log("cdfd")
     return axios.get(API_URL);
};

export const createCard = async (data: any) => {
    const headers = await authHeader();
    if(headers==null) return null;

    return axios.post(API_URL, data, { headers });
};

export const updateCard = async (id: string, data: any) => {
    const headers = await authHeader();
    if(headers==null) return null;

    return axios.put(`${API_URL}/${id}`, data, { headers });
};

export const deleteCard = async (id: string) => {
    const headers = await authHeader();
    if(headers==null) return null;

    return axios.delete(`${API_URL}/${id}`, { headers });

};

export const duplicateCard = async (id: string) => {
    const headers = await authHeader();
    if (headers == null) return null;

    return axios.post(`${API_URL}/duplicate/${id}`, {}, { headers });
};

export const reportCard = async (
    id: string,
    email: string,
    reportType: string,
    additionalInfo: string
  ) => {
    const headers = await authHeader();
    if (!headers) return null;
    console.log(id,email,reportType,additionalInfo)
    return axios.put(
      `${API_URL}/report/${id}`,
      {  email, reportType, additionalInfo },
      { headers }
    );
  };
