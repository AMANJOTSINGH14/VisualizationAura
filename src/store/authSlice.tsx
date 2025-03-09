// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
// import { auth } from '../config/firebaseConfig';

// interface User {
//   name: string | null;
//   email: string | null;
// }

// interface AuthState {
//   user: User | null;
//   loading: boolean;
//   error: string | null;
// }

// const initialState: AuthState = {
//   user: null,
//   loading: false,
//   error: null,
// };

// export const googleLogin = createAsyncThunk('auth/googleLogin', async () => {
//   const provider = new GoogleAuthProvider();
//   const result = await signInWithPopup(auth, provider);
//   return {
//     name: result.user?.displayName || null,
//     email: result.user?.email || null,
//   };
// });

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     logout: (state) => {
//       state.user = null;
//       state.loading = false;
//       state.error = null;
//       localStorage.removeItem('user');
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(googleLogin.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(googleLogin.fulfilled, (state, action) => {
//         state.loading = false;
//         state.user = action.payload;
//         localStorage.setItem('user', JSON.stringify(action.payload));
//       })
//       .addCase(googleLogin.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.error.message || 'Google login failed';
//       });
//   },
// });

// export const { logout } = authSlice.actions;
// export default authSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { signInWithPopup, GoogleAuthProvider, getIdToken } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { getUser,getAuthHeaders } from '../apis/cardApi';
interface User {
  name: string | null;
  email: string | null;
  token: string | null; // Add token to the state
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

// Google login function (gets ID token)
export const googleLogin = createAsyncThunk('auth/googleLogin', async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  // Get Firebase ID Token
  const token = await result.user?.getIdToken();
  const t= await getAuthHeaders(token) 
  const res=await getUser();
  console.log(res)
  console.log(result.user?.displayName)
  return {
    name: result.user?.displayName || null,
    email: result.user?.email || null,
    token, // Add token to the payload
  };
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        // localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Google login failed';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;




// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
// import { auth } from '../config/firebaseConfig';

// interface User {
//   name: string | null;
//   email: string | null;
// }

// interface AuthState {
//   user: User | null;
//   loading: boolean;
//   error: string | null;
// }

// const initialState: AuthState = {
//   user: null,
//   loading: false,
//   error: null,
// };

// export const googleLogin = createAsyncThunk('auth/googleLogin', async () => {
//   const provider = new GoogleAuthProvider();
//   const result = await signInWithPopup(auth, provider);
//   return {
//     name: result.user?.displayName || null,
//     email: result.user?.email || null,
//   };
// });

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     logout: (state) => {
//       state.user = null;
//       state.loading = false;
//       state.error = null;
//       localStorage.removeItem('user');
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(googleLogin.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(googleLogin.fulfilled, (state, action) => {
//         state.loading = false;
//         state.user = action.payload;
//         localStorage.setItem('user', JSON.stringify(action.payload));
//       })
//       .addCase(googleLogin.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.error.message || 'Google login failed';
//       });
//   },
// });

// export const { logout } = authSlice.actions;
// export default authSlice.reducer;


