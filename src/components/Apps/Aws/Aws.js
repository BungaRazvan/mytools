import { stat } from "original-fs";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { actions, getAwsInstances } from "./awsStore";

const Aws = (props) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAwsInstances(null));
  }, []);

  const state = useSelector((state) => state.aws);

  const updateCredentials = (e) => {
    dispatch(actions.updateCredentials({ [e.target.name]: e.target.value }));
  };

  return (
    <div>
      <label htmlFor="accessKeyId">Aceess Key</label>
      <input
        type="text"
        name="accessKeyId"
        defaultValue={state.creds.accessKeyId}
        onChange={updateCredentials}
      />
      <label htmlFor="secretAccessKey">Secret Key</label>
      <input
        type="text"
        defaultValue={state.creds.secretAccessKey}
        name="secretAccessKey"
        onChange={updateCredentials}
      />
      <p>{state.creds.accessKeyId}</p>
      {state.loading && <h1>Loading</h1>}
    </div>
  );
};

export default Aws;
