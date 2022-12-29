import { configureStore } from "@reduxjs/toolkit";
import awsReducer from "./Apps/awsStore";

export default configureStore({
  reducer: {
    aws: awsReducer,
  },
});
