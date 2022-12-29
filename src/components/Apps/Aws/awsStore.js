import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";

import { initialState } from "./initialState";

export const getAwsInstances = createAsyncThunk(
  "getAwsInstances",
  async (_, thunkAPI) => {
    const state = thunkAPI.getState().aws;

    const client = new EC2Client({
      region: state.region.value,
      credentials: {
        accessKeyId: state.creds.accessKeyId,
        secretAccessKey: state.creds.secretAccessKey,
      },
    });
    let instances = [];

    const describeInstances = await client.send(
      new DescribeInstancesCommand({})
    );

    describeInstances.Reservations.map((instance) => {
      instances = [...instances, instance.Instances];
    });

    return instances;
  }
);

export const awsSlice = createSlice({
  name: "aws",
  initialState: initialState,
  reducers: {
    updateCredentials: (state, action) => {
      state.creds = {
        ...state.creds,
        ...action.payload,
      };
    },
  },
  extraReducers: {
    [getAwsInstances.pending]: (state, action) => {},
    [getAwsInstances.fulfilled]: (state, action) => {
      state.instances = action.payload;
      state.loading = false;
    },
    [getAwsInstances.rejected]: (state, action) => {
      state.loading = false;
      state.response = action.error.messege;
    },
  },
});

// Action creators are generated for each case reducer function
export const actions = awsSlice.actions;

export default awsSlice.reducer;
