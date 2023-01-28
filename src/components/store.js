import { configureStore } from "@reduxjs/toolkit";
import awsReducer from "./Apps/Aws/awsStore";

export default configureStore({
  reducer: {
    aws: awsReducer,
  },
});
