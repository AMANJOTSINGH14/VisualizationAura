import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchCards,
  createCard,
  updateCard,
  deleteCard,
  duplicateCard,
  reportCard,
} from "../apis/cardApi";

interface Card {
  _id: string;
  id: string;
  subject: string;
  text: string;
  author: string;
  imageUrl?: string;
  caption?: string;
  tags?: string[];
}

interface UserState {
  cards: Card[];
  loading: boolean;
  error: string | null;
  reportedCards: string[]; // ✅ Add reportedCards array
}

const initialState: UserState = {
  cards: [],
  reportedCards: [],
  loading: false,
  error: null,
};

export const getAllCards = createAsyncThunk("user/getAllCards", async () => {
  console.log("jdisjdiss");
  const response = await fetchCards();
  if (response == null) return null;
  console.log(response.data);
  return response.data;
});

export const addCard = createAsyncThunk("user/addCard", async (data: any) => {
  const response = await createCard(data);
  if (response == null) return null;
  return response.data;
});

export const editCard = createAsyncThunk(
  "user/editCard",
  async ({ id, data }: { id: string; data: any }) => {
    const response = await updateCard(id, data);
    if (response == null) return null;
    return response.data;
  }
);

export const removeCard = createAsyncThunk(
  "user/removeCard",
  async (id: string) => {
    await deleteCard(id);
    return id;
  }
);
export const duplicateExistingCard = createAsyncThunk(
  "user/duplicateCard",
  async (id: string) => {
    const response = await duplicateCard(id);
    if (response == null) return null;
    return response.data;
  }
);

export const reportCardAsync = createAsyncThunk<
  { id: string; reportType: string; additionalInfo: string }, // ✅ Return type
  { id: string; email: string; reportType: string; additionalInfo: string }, // ✅ Payload type
  {} // ✅ Redux Thunk Config
>(
  'user/reportCard',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await reportCard(
        payload.id,
        payload.email,
        payload.reportType,
        payload.additionalInfo
      );
      if (!response || !response.data) {
        return rejectWithValue('Failed to report card');
      }
      return payload; // Return payload correctly
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to report card');
    }
  }
);


const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllCards.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllCards.fulfilled, (state, action) => {
        state.loading = false;
        state.cards = action.payload;
      })
      .addCase(getAllCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch cards";
      })
      .addCase(addCard.fulfilled, (state, action) => {
        state.cards.push(action.payload);
      })
      .addCase(editCard.fulfilled, (state, action) => {
        const index = state.cards.findIndex(
          (card) => card.id === action.payload.id
        );
        if (index !== -1) state.cards[index] = action.payload;
      })
      .addCase(removeCard.fulfilled, (state, action) => {
        state.cards = state.cards.filter((card) => card.id !== action.payload);
      })
      .addCase(duplicateExistingCard.fulfilled, (state, action) => {
        if (action.payload) {
          state.cards.push(action.payload);
        }
      })
      .addCase(reportCardAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(reportCardAsync.fulfilled, (state, action) => {
        console.log(`✅ Card ${action.payload.id} reported successfully.`);
      })
      .addCase(reportCardAsync.rejected, (state, action) => {
        state.error = action.error.message || "Failed to report card";
      });
  },
});

export default userSlice.reducer;
