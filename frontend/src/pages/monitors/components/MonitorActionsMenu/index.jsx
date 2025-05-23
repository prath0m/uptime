import React from "react";
import { useDispatch, useSelector } from "react-redux";

import styles from "./MonitorActionsMenu.module.scss";
import {
  AiOutlinePauseCircle,
  AiOutlineSetting,
  AiOutlineDelete,
  AiOutlineWarning,
} from "react-icons/ai";

import { deleteMonitor } from "@/features/monitors/monitorSlice";
import Spinner from "@/components/Spinner";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const MonitorActionsMenu = ({ monitorId, setShowActions }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  //Handle deleting the monitor
  const handleDelete = async (monitorId) => {
    setIsLoading(true);
    await dispatch(deleteMonitor(monitorId))
      .unwrap()
      .then(() => {
        setIsLoading(false);
        setShowActions(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  const navigateToIncident = () =>{
    navigate('/team/incidents');
  }

  return (
    <div className={styles.monitorActionsMenu}>
      <div className={styles.menuItem} onClick={navigateToIncident}>
        <AiOutlineWarning /> Incident
      </div>
      <div className={styles.menuItem} onClick={() => handleDelete(monitorId)}>
        {!isLoading ? <AiOutlineDelete /> : <Spinner />} Remove
      </div>
    </div>
  );
};

export default MonitorActionsMenu;
