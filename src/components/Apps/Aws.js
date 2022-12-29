import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { actions, getAwsInstances } from "./awsStore";

const Aws = (props) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAwsInstances(null));
  }, []);

  const state = useSelector((state) => state);

  return <h1></h1>;
};

export default Aws;
